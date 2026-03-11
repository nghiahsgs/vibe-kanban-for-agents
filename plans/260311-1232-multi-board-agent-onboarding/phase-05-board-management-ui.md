# Phase 5: Board Management UI

## Context Links
- Current board header: `src/components/board/board-header.tsx`
- Kanban board: `src/components/board/kanban-board.tsx`
- Board provider: `src/components/board/board-provider.tsx`
- Page entry: `src/app/page.tsx`
- Hooks: `src/hooks/use-tasks.ts`

## Overview
Add board switcher to header, board create dialog, board settings page. Restructure routing so boards are URL-addressable via slug.

## Key Insights
- Current app is single-page (`src/app/page.tsx`) with `KanbanBoard` component
- `BoardProvider` wraps QueryClient + Toaster — extend to hold active board context
- `useTasks()` fetches from `/api/tasks` — needs board-scoped fetch
- Header already has filter + theme toggle + user menu — add board switcher left of those

## Requirements
1. Board switcher dropdown in header (show board name, list user's boards, "+ New Board")
2. Board create dialog (name, description, auto-generate key option)
3. Board settings page/dialog (rename, change slug, regenerate API key, delete board)
4. URL routing: `/boards/[slug]` shows kanban for that board
5. Root `/` redirects to default board

## Architecture

### URL structure
```
/                           — redirect to /boards/{default-slug}
/boards/[slug]              — kanban board view
/boards/[slug]/settings     — board settings (could be dialog instead)
```

### New/modified components
```
src/app/boards/[slug]/page.tsx          — board kanban page
src/app/boards/[slug]/layout.tsx        — board layout (optional)
src/components/board/board-switcher.tsx  — dropdown component
src/components/board/board-create-dialog.tsx
src/components/board/board-settings-dialog.tsx
src/hooks/use-boards.ts                 — TanStack Query hooks for boards
```

### Board context
Extend `BoardProvider` or create separate context:
```ts
interface BoardContext {
  activeBoard: Board | null;
  boards: Board[];
  isLoading: boolean;
}
```

### Updated useTasks
```ts
export function useTasks(boardSlug: string) {
  return useQuery({
    queryKey: ["tasks", boardSlug],
    queryFn: () => fetchTasks(boardSlug),
    refetchInterval: 5000,
  });
}

async function fetchTasks(boardSlug: string): Promise<Task[]> {
  const res = await fetch(`/api/boards/${boardSlug}/tasks`);
  // ...
}
```

## Related Code Files
- `src/app/page.tsx` — current entry, will become redirect
- `src/components/board/board-header.tsx` — add board switcher
- `src/components/board/kanban-board.tsx` — pass boardSlug
- `src/components/board/board-provider.tsx` — extend with board context
- `src/hooks/use-tasks.ts` — scope to board

## Implementation Steps

- [ ] 1. Create `src/hooks/use-boards.ts` — useBoards, useCreateBoard, useUpdateBoard, useDeleteBoard
- [ ] 2. Create `src/app/boards/[slug]/page.tsx` — server component, fetch board, render KanbanBoard with slug
- [ ] 3. Update `src/app/page.tsx` — redirect to `/boards/{default-slug}` (fetch user's first board)
- [ ] 4. Create `src/components/board/board-switcher.tsx` — dropdown with board list + create option
- [ ] 5. Create `src/components/board/board-create-dialog.tsx` — name, description, generate key checkbox
- [ ] 6. Create `src/components/board/board-settings-dialog.tsx` — edit name/slug, show API key prefix, regenerate key, delete
- [ ] 7. Update `src/components/board/board-header.tsx` — integrate BoardSwitcher
- [ ] 8. Update `src/components/board/kanban-board.tsx` — accept boardSlug prop, pass to useTasks
- [ ] 9. Update `src/hooks/use-tasks.ts` — accept boardSlug, update fetch URLs
- [ ] 10. Update `useCreateTask`, `useUpdateTask`, `useDeleteTask` — use board-scoped endpoints

### Board Switcher UI
- Dropdown trigger shows current board name
- List of boards with checkmark on active
- Divider
- "+ Create new board" option (opens create dialog)
- Gear icon per board opens settings

## Success Criteria
- User can switch between boards via dropdown
- URL updates when switching boards
- New board creation works with optional API key generation
- Board settings allow rename, key regeneration, deletion
- Tasks displayed are scoped to selected board
- Root `/` redirects to default board

## Risk Assessment
- **Routing change**: Moving from `/` to `/boards/[slug]` — ensure middleware handles redirect
- **Stale query cache**: Different boards have different task data — queryKey includes slug
- **Board deletion**: Warn user about cascade delete of all tasks

## Security Considerations
- Board settings only accessible to board owner (session auth)
- API key shown only on creation/regeneration
- Delete confirmation required

## Next Steps
Phase 6: Task Form Updates
