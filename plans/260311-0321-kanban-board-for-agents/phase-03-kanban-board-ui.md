# Phase 03 - Kanban Board UI

## Context
- [Phase 02](./phase-02-database-api.md) — API layer complete
- [Tech Stack Report](./research/researcher-01-tech-stack-report.md) — @hello-pangea/dnd patterns
- [Plan Overview](./plan.md)

## Overview
Build the main Kanban board view with 4 columns, task cards, and drag-and-drop between columns using @hello-pangea/dnd. Wire up TanStack Query for data fetching with 5s polling.

## Key Insights
- @hello-pangea/dnd uses `DragDropContext` > `Droppable` (columns) > `Draggable` (cards) hierarchy
- `onDragEnd` callback handles reorder logic: update position + status via PATCH
- TanStack Query `refetchInterval: 5000` for polling; `queryClient.setQueryData` for optimistic updates
- Board is single page app at root `/`
- Must handle SSR: @hello-pangea/dnd needs client-side only rendering

## Requirements
- 4-column board layout: Todo, In Progress, Review, Done
- Task cards showing title, priority badge, assignee
- Drag cards within column (reorder) and between columns (status change)
- 5s polling for fresh data
- Optimistic UI updates on drag (revert on error)
- Loading skeleton on initial load

## Architecture

### Component Tree
```
page.tsx (server component — shell)
└── board-provider.tsx (client — QueryClientProvider)
    └── kanban-board.tsx (client — DragDropContext)
        └── board-column.tsx (client — Droppable) x4
            └── task-card.tsx (client — Draggable) xN
```

### Data Flow
```
TanStack Query (5s poll) → GET /api/tasks → group by status → render columns
Drag end → optimistic update → PATCH /api/tasks/:id → invalidate query
```

## Related Code Files
- `src/app/page.tsx` — Root page, renders board
- `src/components/board/board-provider.tsx` — QueryClientProvider wrapper
- `src/components/board/kanban-board.tsx` — DragDropContext + columns layout
- `src/components/board/board-column.tsx` — Single column (Droppable)
- `src/components/board/task-card.tsx` — Single task card (Draggable)
- `src/hooks/use-tasks.ts` — TanStack Query hooks for tasks

## Implementation Steps

### Step 1: Create TanStack Query hooks
**File: `src/hooks/use-tasks.ts`** (~80 lines)

```typescript
'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Task, TaskStatus } from '@/types';

async function fetchTasks(): Promise<Task[]> {
  const res = await fetch('/api/tasks');
  if (!res.ok) throw new Error('Failed to fetch tasks');
  const data = await res.json();
  return data.tasks;
}

export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
    refetchInterval: 5000,
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Task> & { id: string }) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update task');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

// Add useCreateTask, useDeleteTask similarly
```

Also include:
- `useCreateTask()` — POST /api/tasks, invalidate on success
- `useDeleteTask()` — DELETE /api/tasks/:id, invalidate on success

### Step 2: Create board provider
**File: `src/components/board/board-provider.tsx`** (~25 lines)

- Client component wrapping `QueryClientProvider`
- Create `queryClient` with `defaultOptions.queries.staleTime = 4000`
- Export as default; used in `page.tsx` or `layout.tsx`

### Step 3: Create task card component
**File: `src/components/board/task-card.tsx`** (~60 lines)

- Client component, receives `task` prop + `index` for Draggable
- Wrap in `<Draggable draggableId={task.id} index={index}>`
- Display: title, priority badge (color-coded), assignee name
- Use shadcn `Card` component
- Priority colors: high=red, medium=yellow, low=green
- Click handler (prop) to open task detail — implemented in Phase 04
- Compact design; no description shown on card

### Step 4: Create board column component
**File: `src/components/board/board-column.tsx`** (~50 lines)

- Client component, receives `status`, `label`, `tasks[]`
- Wrap in `<Droppable droppableId={status}>`
- Render column header with label + task count badge
- Map tasks → `<TaskCard>` components
- Show placeholder when empty ("No tasks")
- Fixed width (~300px), full height, scrollable overflow

### Step 5: Create Kanban board component
**File: `src/components/board/kanban-board.tsx`** (~100 lines)

Core logic:
- Client component with `'use client'`
- Use `useTasks()` hook to fetch data
- Group tasks by status: `tasks.filter(t => t.status === column.id).sort((a,b) => a.position - b.position)`
- Wrap in `<DragDropContext onDragEnd={handleDragEnd}>`
- Render 4 `<BoardColumn>` in flex row

**`handleDragEnd` logic:**
```typescript
function handleDragEnd(result: DropResult) {
  const { draggableId, source, destination } = result;
  if (!destination) return; // dropped outside
  if (source.droppableId === destination.droppableId && source.index === destination.index) return;

  const newStatus = destination.droppableId as TaskStatus;
  const destTasks = groupedTasks[newStatus]; // sorted by position

  // Calculate new position using fractional indexing
  const before = destination.index > 0 ? destTasks[destination.index - 1]?.position : null;
  const after = destTasks[destination.index]?.position ?? null;
  // Adjust if moving within same column (item already removed from list)
  const newPosition = calculateMidPosition(before, after);

  // Optimistic update
  updateTask.mutate({ id: draggableId, status: newStatus, position: newPosition });
}
```

**Important:** Handle same-column reorder vs cross-column move. When same column, account for the dragged item being removed from source index before calculating destination neighbors.

### Step 6: Wire up root page
**File: `src/app/page.tsx`** (~15 lines)

```typescript
import { BoardProvider } from '@/components/board/board-provider';
import { KanbanBoard } from '@/components/board/kanban-board';

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-6">
      <h1 className="text-2xl font-bold mb-6">Vibe Kanban</h1>
      <BoardProvider>
        <KanbanBoard />
      </BoardProvider>
    </main>
  );
}
```

### Step 7: Handle SSR compatibility
@hello-pangea/dnd doesn't work server-side. Approaches:
- Use `'use client'` on all board components (already done)
- Add `suppressHydrationWarning` if needed
- Optionally: lazy load board with `dynamic(() => import(...), { ssr: false })` if hydration mismatches occur

### Step 8: Add loading state
In `kanban-board.tsx`, show skeleton columns while `isLoading`:
- Use shadcn `Skeleton` component
- 4 columns with 3 skeleton cards each

## Todo
- [ ] Create `src/hooks/use-tasks.ts` — query hooks with 5s polling
- [ ] Create `src/components/board/board-provider.tsx` — QueryClientProvider
- [ ] Create `src/components/board/task-card.tsx` — Draggable card
- [ ] Create `src/components/board/board-column.tsx` — Droppable column
- [ ] Create `src/components/board/kanban-board.tsx` — DragDropContext + layout
- [ ] Update `src/app/page.tsx` — render board
- [ ] Handle SSR compatibility for dnd
- [ ] Add loading skeletons
- [ ] Test drag within column (reorder)
- [ ] Test drag between columns (status change)
- [ ] Verify 5s polling updates board

## Success Criteria
- Board renders 4 columns with correct labels
- Tasks appear in correct columns sorted by position
- Drag within column reorders (position updates via API)
- Drag between columns changes status + position
- Board auto-refreshes every 5s
- No hydration errors
- All component files under 100 lines

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Hydration mismatch with dnd | Medium | Use `dynamic` import with `ssr: false` if needed |
| Optimistic update flash | Low | Invalidate query on mutation success |
| Position calc edge cases | Medium | Test: empty column, single item, first/last position |
| Polling overrides optimistic state | Medium | Use short mutation + invalidation; staleTime < refetchInterval |

## Security Considerations
- All data fetched client-side via public API (no auth = expected)
- No sensitive data displayed on cards

## Next Steps
Phase 04: Task Management UI — detail modal, create/edit forms, comments, filters
