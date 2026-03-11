# Phase 4: Board-Scoped Tasks API

## Context Links
- Tasks routes: `src/app/api/tasks/route.ts`, `src/app/api/tasks/[id]/route.ts`
- Comments route: `src/app/api/tasks/[id]/comments/route.ts`
- Position util: `src/lib/position.ts`

## Overview
Add board-scoped task endpoints under `/api/boards/[slug]/tasks`. Update existing `/api/tasks` endpoints to require board context. Agent with board key auto-scoped; session users specify via URL.

## Key Insights
- Current tasks API has no board filtering — all tasks returned for auth'd user
- `getNextPosition()` in `src/lib/position.ts` queries by status only — needs boardId filter
- Comments are scoped to taskId (already correct, no change needed if task access is board-scoped)
- Agent scripts in `skills/vibe-kanban/scripts/check-tasks.sh` use `/api/tasks` directly — need backward compat

## Requirements
1. New routes: `GET/POST /api/boards/[slug]/tasks`, `GET/PATCH/DELETE /api/boards/[slug]/tasks/[id]`
2. Update existing `/api/tasks` routes: if board key auth, auto-scope; if session, require boardId param or use default board
3. Update `getNextPosition()` to filter by boardId
4. Task creation requires boardId
5. Backward compat: `/api/tasks` with user API key works (uses default board)

## Architecture

### New route structure
```
src/app/api/boards/[slug]/tasks/
  route.ts                — GET (list), POST (create)
  [id]/
    route.ts              — GET, PATCH, DELETE
    comments/
      route.ts            — GET, POST
```

### Board resolution logic
```ts
async function resolveBoard(authUser: AuthUser, slug?: string): Promise<Board | null> {
  // Board key auth: boardId already known, verify slug matches if provided
  if (authUser.boardId) {
    return db.select().from(boards).where(eq(boards.id, authUser.boardId)).limit(1)[0];
  }
  // Session/user key: lookup by slug + userId
  if (slug) {
    return db.select().from(boards).where(
      and(eq(boards.slug, slug), eq(boards.userId, authUser.userId))
    ).limit(1)[0];
  }
  // Fallback: user's first board (for backward compat)
  return db.select().from(boards).where(eq(boards.userId, authUser.userId))
    .orderBy(asc(boards.createdAt)).limit(1)[0];
}
```

### Task query scoping
All task queries add: `eq(tasks.boardId, board.id)` to WHERE clause.

### Updated getNextPosition
```ts
export async function getNextPosition(status: TaskStatus, boardId: string): Promise<number> {
  const [last] = await db
    .select({ position: tasks.position })
    .from(tasks)
    .where(and(eq(tasks.status, status), eq(tasks.boardId, boardId)))
    .orderBy(desc(tasks.position))
    .limit(1);
  return last ? last.position + POSITION_GAP : POSITION_GAP;
}
```

## Related Code Files
- `src/app/api/tasks/route.ts` — modify GET/POST
- `src/app/api/tasks/[id]/route.ts` — modify GET/PATCH/DELETE
- `src/app/api/tasks/[id]/comments/route.ts` — add board validation
- `src/lib/position.ts` — add boardId param
- `src/lib/auth-helpers.ts` — use AuthUser.boardId

## Implementation Steps

- [ ] 1. Create shared `resolveBoard()` helper in `src/lib/board-helpers.ts`
- [ ] 2. Update `src/lib/position.ts` — `getNextPosition(status, boardId)`
- [ ] 3. Create `/api/boards/[slug]/tasks/route.ts` (GET, POST)
- [ ] 4. Create `/api/boards/[slug]/tasks/[id]/route.ts` (GET, PATCH, DELETE)
- [ ] 5. Create `/api/boards/[slug]/tasks/[id]/comments/route.ts` (GET, POST)
- [ ] 6. Update existing `/api/tasks/route.ts` — add board scoping (default board fallback for backward compat)
- [ ] 7. Update existing `/api/tasks/[id]/route.ts` — verify task belongs to resolved board
- [ ] 8. Update existing `/api/tasks/[id]/comments/route.ts` — verify task belongs to resolved board
- [ ] 9. Add `workingDirectory` to allowed PATCH fields in task update

## Success Criteria
- `/api/boards/:slug/tasks` returns only tasks for that board
- Agent with board key calling `/api/tasks` gets only their board's tasks
- Session user can access tasks via board slug URL
- Creating task auto-assigns boardId
- `workingDirectory` settable on task create/update
- Backward compat: existing `/api/tasks` calls still work

## Risk Assessment
- **Breaking change for agents**: Existing agent scripts use `/api/tasks` — backward compat via default board prevents breakage
- **Cross-board task access**: Must verify task.boardId matches resolved board on GET/PATCH/DELETE
- **Position conflicts**: Unlikely since positions are per-board now

## Security Considerations
- Board key agents cannot access other boards' tasks
- Task ownership verified: task.boardId must match resolved board
- Cannot move tasks between boards via PATCH (boardId not in allowed update fields)

## Next Steps
Phase 5: Board Management UI
