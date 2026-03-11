# Phase 05 - Polish & Documentation

## Context
- [Phase 04](./phase-04-task-management-ui.md) — all features implemented
- [Plan Overview](./plan.md)

## Overview
Add loading/empty/error states, visual polish, responsive layout considerations, README with API documentation, and final testing pass.

## Key Insights
- Empty states guide users (especially first-time); important for onboarding
- Error boundaries prevent white-screen crashes
- API documentation critical since AI agents are primary API consumers
- Keep README concise; agents need endpoint reference, not prose

## Requirements
- Loading skeletons for board + task detail
- Empty state for columns ("No tasks") and comments ("No comments yet")
- Error boundary for board crashes
- Toast notifications for success/error on mutations
- README with setup instructions + complete API reference
- Seed script for demo data (optional but helpful)

## Related Code Files
- `src/components/board/board-skeleton.tsx` — Loading skeleton
- `src/components/ui/error-boundary.tsx` — React error boundary
- `src/app/layout.tsx` — Add Toaster component
- `src/db/seed.ts` — Optional seed script
- `README.md` — Project documentation
- `API.md` — API reference for agents (or section in README)

## Implementation Steps

### Step 1: Add loading skeleton
**File: `src/components/board/board-skeleton.tsx`** (~30 lines)

- 4 columns, each with 2-3 shadcn `Skeleton` rectangles
- Match board column layout dimensions
- Used in `kanban-board.tsx` when `isLoading === true`

### Step 2: Add error boundary
**File: `src/components/ui/error-boundary.tsx`** (~35 lines)

- Class component (React error boundaries require class)
- Catch rendering errors in board
- Show "Something went wrong" + "Retry" button
- Wrap `<KanbanBoard>` in `<ErrorBoundary>` inside page.tsx

### Step 3: Add toast notifications
- Install: `npx shadcn@latest add sonner` (or `toast`)
- Add `<Toaster />` to `src/app/layout.tsx`
- Add toasts in mutation `onSuccess` / `onError` callbacks:
  - "Task created" / "Task updated" / "Task deleted"
  - "Failed to update task" on error

### Step 4: Polish empty states
Update components:
- `board-column.tsx` — show centered "No tasks" text with subtle icon when column empty
- `comment-list.tsx` — show "No comments yet" when empty
- `board-header.tsx` — show task count in filter label

### Step 5: Add visual polish
- Priority badge colors: `high` = destructive/red, `medium` = warning/yellow, `low` = green
- Status column header colors: subtle background tints per column
- Card hover effect (subtle shadow/border change)
- Drag-in-progress visual (opacity change on source)
- Responsive: horizontal scroll on mobile (board is inherently wide)

### Step 6: Create seed script (optional)
**File: `src/db/seed.ts`** (~60 lines)

```typescript
import { db } from './index';
import { tasks, comments } from './schema';

const sampleTasks = [
  { id: crypto.randomUUID(), title: 'Set up CI/CD pipeline', status: 'todo', priority: 'high', assignee: 'agent-1', position: 1000 },
  { id: crypto.randomUUID(), title: 'Write unit tests', status: 'todo', priority: 'medium', assignee: 'agent-2', position: 2000 },
  { id: crypto.randomUUID(), title: 'Design landing page', status: 'in_progress', priority: 'medium', assignee: 'agent-1', position: 1000 },
  { id: crypto.randomUUID(), title: 'Fix login bug', status: 'review', priority: 'high', assignee: 'agent-3', position: 1000 },
  { id: crypto.randomUUID(), title: 'Update dependencies', status: 'done', priority: 'low', position: 1000 },
];
// Insert tasks + sample comments
```

Add script: `"db:seed": "npx tsx src/db/seed.ts"`

### Step 7: Write README.md
**File: `README.md`** (~120 lines)

Sections:
1. **Overview** — What this is (2 sentences)
2. **Quick Start** — `npm install`, `npm run db:push`, `npm run dev`
3. **Tech Stack** — bullet list
4. **API Reference** — all 7 endpoints with request/response examples
5. **For AI Agents** — how agents should use the API (endpoint list, auth: none, content-type: application/json)
6. **Development** — scripts reference

### Step 8: API reference section
Document each endpoint:

```
## API Reference

### List Tasks
GET /api/tasks?status=todo&assignee=agent-1&priority=high

Response: { "tasks": [Task] }

### Get Task
GET /api/tasks/:id

Response: Task

### Create Task
POST /api/tasks
Body: { "title": "...", "description?": "...", "status?": "todo", "assignee?": "...", "priority?": "medium" }

Response: 201 Task

### Update Task
PATCH /api/tasks/:id
Body: { "title?": "...", "status?": "...", "position?": 1500, ... }

Response: Task

### Delete Task
DELETE /api/tasks/:id

Response: 204

### List Comments
GET /api/tasks/:id/comments

Response: { "comments": [Comment] }

### Add Comment
POST /api/tasks/:id/comments
Body: { "author": "agent-1", "content": "..." }

Response: 201 Comment
```

### Step 9: Final testing pass
Manual test checklist:
- [ ] Fresh install: `npm install` → `npm run db:push` → `npm run dev`
- [ ] Board loads with empty columns
- [ ] Create task → appears in correct column
- [ ] Drag task between columns → status updates
- [ ] Drag task within column → position updates
- [ ] Click task → detail dialog opens
- [ ] Edit task → changes reflected
- [ ] Delete task → removed with confirmation
- [ ] Add comment → appears in list
- [ ] Filter by assignee → board filters correctly
- [ ] API via curl → all 7 endpoints work
- [ ] Refresh page → state persists (SQLite)
- [ ] No console errors

## Todo
- [ ] Create `src/components/board/board-skeleton.tsx`
- [ ] Create `src/components/ui/error-boundary.tsx`
- [ ] Add toast notifications (Sonner)
- [ ] Polish empty states in columns + comments
- [ ] Add visual polish (badges, colors, hover effects)
- [ ] Create seed script `src/db/seed.ts`
- [ ] Write `README.md` with API reference
- [ ] Final testing pass (all checklist items)

## Success Criteria
- Board shows skeleton during initial load
- Empty columns show "No tasks" message
- Errors show toast notification, not crash
- README is complete with API reference for agents
- Fresh clone → 3 commands → working app
- All files under 200 lines

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Toast library conflicts | Low | Use shadcn's recommended sonner |
| Seed script path issues | Low | Use relative imports; test from project root |
| README gets outdated | Low | Keep minimal; link to source for details |

## Security Considerations
- No sensitive data in README or seed script
- Seed script only for development

## Unresolved Questions
1. Dark mode — should we support it? (shadcn supports it easily, but adds scope)
2. Should seed script run automatically on first `npm run dev`, or require explicit `npm run db:seed`?
3. Mobile responsiveness — horizontal scroll sufficient, or collapse columns on small screens?
