# Phase 02 - Database & API Layer

## Context
- [Phase 01](./phase-01-project-setup.md) — project bootstrapped, schema defined
- [API Design Report](./research/researcher-260311-api-design-patterns-report.md)
- [Plan Overview](./plan.md)

## Overview
Implement all REST API route handlers for tasks CRUD and comments. Build shared API helpers for validation, error responses (RFC 9457), and fractional indexing.

## Key Insights
- RFC 9457 Problem Details for all error responses
- Fractional indexing: new position = midpoint between neighbors; default spacing = 1000
- All DB operations server-side only via Next.js route handlers
- UUID v4 for all IDs (use `crypto.randomUUID()`)
- `updatedAt` must update on every PATCH

## Requirements
- Task CRUD: GET list, GET by id, POST create, PATCH update, DELETE
- Comment CRUD: GET by task, POST to task
- Query filters: `?status=`, `?assignee=`, `?priority=`
- Proper HTTP status codes (200, 201, 400, 404, 500)
- RFC 9457 error format
- Position auto-calculated on create (append to end of column)

## Architecture

### API Routes
```
src/app/api/
├── tasks/
│   ├── route.ts           # GET /api/tasks, POST /api/tasks
│   └── [id]/
│       ├── route.ts       # GET, PATCH, DELETE /api/tasks/:id
│       └── comments/
│           └── route.ts   # GET, POST /api/tasks/:id/comments
```

### Helper Modules
```
src/lib/
├── api-helpers.ts         # jsonResponse(), errorResponse(), validate()
└── position.ts            # calculatePosition(), getNextPosition()
```

## Related Code Files
- `src/app/api/tasks/route.ts` — List + Create tasks
- `src/app/api/tasks/[id]/route.ts` — Get, Update, Delete single task
- `src/app/api/tasks/[id]/comments/route.ts` — List + Create comments
- `src/lib/api-helpers.ts` — Response helpers, validation
- `src/lib/position.ts` — Fractional indexing utilities

## Implementation Steps

### Step 1: Create API helper utilities
**File: `src/lib/api-helpers.ts`** (~60 lines)

```typescript
import { NextResponse } from 'next/server';
import type { ApiError } from '@/types';

export function jsonResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(
  status: number,
  title: string,
  detail: string,
  instance?: string
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      type: `https://kanban.local/errors/${title.toLowerCase().replace(/\s+/g, '-')}`,
      title,
      detail,
      instance,
    },
    { status }
  );
}

// Validate required fields; returns error string or null
export function validateRequired(
  body: Record<string, unknown>,
  fields: string[]
): string | null {
  for (const field of fields) {
    if (!body[field] && body[field] !== 0) {
      return `Missing required field: ${field}`;
    }
  }
  return null;
}

const VALID_STATUSES = ['todo', 'in_progress', 'review', 'done'];
const VALID_PRIORITIES = ['low', 'medium', 'high'];

export function validateTaskFields(body: Record<string, unknown>): string | null {
  if (body.status && !VALID_STATUSES.includes(body.status as string)) {
    return `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`;
  }
  if (body.priority && !VALID_PRIORITIES.includes(body.priority as string)) {
    return `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}`;
  }
  if (body.title !== undefined && typeof body.title === 'string' && body.title.trim() === '') {
    return 'Title cannot be empty';
  }
  return null;
}
```

### Step 2: Create fractional indexing utility
**File: `src/lib/position.ts`** (~30 lines)

```typescript
import { db } from '@/db';
import { tasks } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { TaskStatus } from '@/types';

const POSITION_GAP = 1000;

// Get next position for appending to end of a column
export function getNextPosition(status: TaskStatus): number {
  const last = db
    .select({ position: tasks.position })
    .from(tasks)
    .where(eq(tasks.status, status))
    .orderBy(desc(tasks.position))
    .limit(1)
    .get();

  return last ? last.position + POSITION_GAP : POSITION_GAP;
}

// Calculate midpoint between two positions
export function calculateMidPosition(before: number | null, after: number | null): number {
  if (before === null && after === null) return POSITION_GAP;
  if (before === null) return after! / 2;
  if (after === null) return before + POSITION_GAP;
  return (before + after) / 2;
}
```

### Step 3: Tasks list + create route
**File: `src/app/api/tasks/route.ts`** (~80 lines)

Implement:
- `GET /api/tasks` — query all tasks, optional filters: `?status=`, `?assignee=`, `?priority=`
  - Order by `position ASC` within each status group
  - Return `{ tasks: Task[] }`
- `POST /api/tasks` — create new task
  - Required: `title`
  - Optional: `description`, `status` (default `todo`), `assignee`, `priority` (default `medium`), `position`
  - Auto-generate: `id` (UUID), `createdAt`, `updatedAt`
  - If no `position`, auto-calculate using `getNextPosition(status)`
  - Return 201 with created task

### Step 4: Single task routes
**File: `src/app/api/tasks/[id]/route.ts`** (~90 lines)

Implement:
- `GET /api/tasks/:id` — fetch single task, 404 if not found
- `PATCH /api/tasks/:id` — partial update
  - Allowed fields: `title`, `description`, `status`, `assignee`, `priority`, `position`
  - Update `updatedAt` on every patch
  - Validate field values
  - Return updated task
- `DELETE /api/tasks/:id` — delete task + cascade comments
  - Return 204 No Content

### Step 5: Comments routes
**File: `src/app/api/tasks/[id]/comments/route.ts`** (~60 lines)

Implement:
- `GET /api/tasks/:id/comments` — list comments for task, ordered by `createdAt ASC`
  - 404 if task not found
  - Return `{ comments: Comment[] }`
- `POST /api/tasks/:id/comments` — create comment
  - Required: `author`, `content`
  - Auto-generate: `id` (UUID), `createdAt`
  - 404 if task not found
  - Return 201 with created comment

### Step 6: Add npm script for testing API
Add to `package.json`:
```json
{
  "scripts": {
    "test:api": "echo 'Manual curl tests - see API docs'"
  }
}
```

### Step 7: Manual API verification
Test each endpoint with curl:
```bash
# Create task
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Test task", "assignee": "agent-1"}'

# List tasks
curl http://localhost:3000/api/tasks
curl http://localhost:3000/api/tasks?assignee=agent-1

# Update task
curl -X PATCH http://localhost:3000/api/tasks/<id> \
  -H "Content-Type: application/json" \
  -d '{"status": "in_progress"}'

# Add comment
curl -X POST http://localhost:3000/api/tasks/<id>/comments \
  -H "Content-Type: application/json" \
  -d '{"author": "agent-1", "content": "Started working on this"}'

# Get comments
curl http://localhost:3000/api/tasks/<id>/comments

# Delete task
curl -X DELETE http://localhost:3000/api/tasks/<id>
```

## Todo
- [ ] Create `src/lib/api-helpers.ts` — response + validation helpers
- [ ] Create `src/lib/position.ts` — fractional indexing
- [ ] Implement `src/app/api/tasks/route.ts` — GET list + POST create
- [ ] Implement `src/app/api/tasks/[id]/route.ts` — GET, PATCH, DELETE
- [ ] Implement `src/app/api/tasks/[id]/comments/route.ts` — GET + POST
- [ ] Test all endpoints with curl
- [ ] Verify error responses match RFC 9457 format

## Success Criteria
- All 7 API endpoints return correct responses
- Query filters work: `?status=`, `?assignee=`, `?priority=`
- Creating task without position auto-appends to column end
- Updating status moves task; updating position reorders
- Deleting task cascades to comments
- Invalid requests return RFC 9457 error bodies with correct HTTP status codes
- All route files under 100 lines

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| SQLite concurrent writes | Medium | WAL mode enabled; single-writer OK for local tool |
| Float precision on position | Low | 16K+ reorders before issues; rebalance if needed |
| Missing body parsing | Medium | Always try/catch `request.json()` |

## Security Considerations
- No auth = any client can hit API (acceptable for local dev tool)
- Validate all input; never pass raw input to SQL
- Drizzle ORM handles parameterized queries (no SQL injection)

## Next Steps
Phase 03: Kanban Board UI — build the visual board with drag-and-drop
