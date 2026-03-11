# Phase 04 - Task Management UI

## Context
- [Phase 03](./phase-03-kanban-board-ui.md) — board renders with drag-and-drop
- [Plan Overview](./plan.md)

## Overview
Build task detail dialog, create/edit forms, delete confirmation, comments section, and assignee filter. Complete the human interaction layer.

## Key Insights
- shadcn `Dialog` for task detail/edit; `AlertDialog` for delete confirmation
- Comments displayed as activity log within task detail
- Filter by assignee using URL search params or local state (local state simpler, YAGNI)
- Form validation client-side with basic checks; server validates too
- Keep create form minimal: title required, rest optional with defaults

## Requirements
- Click task card → open detail dialog with full info + comments
- "New Task" button → create dialog with form
- Edit task inline in detail dialog
- Delete task with confirmation
- Add comment from detail dialog
- Filter tasks by assignee (dropdown in header)

## Architecture

### Component Tree (additions)
```
kanban-board.tsx
├── board-header.tsx          # Title + New Task button + assignee filter
├── board-column.tsx
│   └── task-card.tsx (onClick → open detail)
├── task-detail-dialog.tsx    # View/edit task + comments
├── task-form-dialog.tsx      # Create new task
└── delete-task-dialog.tsx    # Delete confirmation
```

### State Flow
```
Selected task ID (useState) → open detail dialog
Filter assignee (useState) → filter tasks before grouping
Create/Edit → mutation → invalidate queries → dialog closes
```

## Related Code Files
- `src/components/task/task-detail-dialog.tsx` — View task + comments + edit
- `src/components/task/task-form-dialog.tsx` — Create/edit task form
- `src/components/task/delete-task-dialog.tsx` — Delete confirmation
- `src/components/task/comment-list.tsx` — Comments display
- `src/components/task/comment-form.tsx` — Add comment form
- `src/components/board/board-header.tsx` — Header with actions + filter
- `src/hooks/use-comments.ts` — TanStack Query hooks for comments
- `src/hooks/use-tasks.ts` — Add `useCreateTask`, `useDeleteTask` if not done

## Implementation Steps

### Step 1: Create comments hooks
**File: `src/hooks/use-comments.ts`** (~40 lines)

```typescript
'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Comment } from '@/types';

export function useComments(taskId: string | null) {
  return useQuery({
    queryKey: ['comments', taskId],
    queryFn: async () => {
      const res = await fetch(`/api/tasks/${taskId}/comments`);
      if (!res.ok) throw new Error('Failed to fetch comments');
      const data = await res.json();
      return data.comments as Comment[];
    },
    enabled: !!taskId,
  });
}

export function useCreateComment(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { author: string; content: string }) => {
      const res = await fetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to create comment');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', taskId] }),
  });
}
```

### Step 2: Create board header
**File: `src/components/board/board-header.tsx`** (~50 lines)

- "Vibe Kanban" title (h1)
- "New Task" button (shadcn `Button`) — triggers create dialog
- Assignee filter: shadcn `Select` with "All" + unique assignee names extracted from tasks
- Pass `onNewTask` and `onFilterChange` as props, or lift state up to `kanban-board.tsx`

### Step 3: Create task form dialog
**File: `src/components/task/task-form-dialog.tsx`** (~90 lines)

- shadcn `Dialog` with form inside
- Fields:
  - Title (Input, required)
  - Description (Textarea, optional)
  - Status (Select: todo/in_progress/review/done, default todo)
  - Assignee (Input, optional)
  - Priority (Select: low/medium/high, default medium)
- Submit → `useCreateTask()` mutation
- On success: close dialog, show nothing (query auto-invalidates)
- Reuse for edit mode: accept optional `task` prop to pre-fill; use `useUpdateTask()` instead

### Step 4: Create comment list
**File: `src/components/task/comment-list.tsx`** (~40 lines)

- Receive `taskId` prop
- Use `useComments(taskId)` hook
- Render list of comments: author name (bold), timestamp (relative or formatted), content
- Show "No comments yet" if empty
- Scroll container for long lists

### Step 5: Create comment form
**File: `src/components/task/comment-form.tsx`** (~45 lines)

- Inline form at bottom of comments section
- Fields: author (Input), content (Textarea)
- Submit → `useCreateComment(taskId)` mutation
- Clear form on success
- Disable submit while `isPending`

### Step 6: Create task detail dialog
**File: `src/components/task/task-detail-dialog.tsx`** (~100 lines)

- shadcn `Dialog`, controlled by parent (selectedTaskId state)
- Header: task title + priority badge + status badge
- Body:
  - Description (or "No description")
  - Assignee (or "Unassigned")
  - Created/Updated timestamps
- Actions row:
  - "Edit" button → opens task-form-dialog in edit mode
  - "Delete" button → opens delete confirmation
- Comments section below:
  - `<CommentList taskId={task.id} />`
  - `<CommentForm taskId={task.id} />`

### Step 7: Create delete confirmation dialog
**File: `src/components/task/delete-task-dialog.tsx`** (~35 lines)

- shadcn `AlertDialog`
- "Are you sure? This will delete the task and all comments."
- Cancel + Delete buttons
- Delete → `useDeleteTask()` mutation
- On success: close both detail + delete dialogs

### Step 8: Wire everything together in kanban-board.tsx
Update `src/components/board/kanban-board.tsx`:

Add state:
```typescript
const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
const [isCreateOpen, setIsCreateOpen] = useState(false);
const [filterAssignee, setFilterAssignee] = useState<string>('all');
```

Add filtering:
```typescript
const filteredTasks = filterAssignee === 'all'
  ? tasks
  : tasks.filter(t => t.assignee === filterAssignee);
```

Add components:
```tsx
<BoardHeader
  onNewTask={() => setIsCreateOpen(true)}
  filterAssignee={filterAssignee}
  onFilterChange={setFilterAssignee}
  assignees={uniqueAssignees}
/>
{/* ... columns ... */}
<TaskFormDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
<TaskDetailDialog
  taskId={selectedTaskId}
  onClose={() => setSelectedTaskId(null)}
/>
```

Pass `onTaskClick={setSelectedTaskId}` down to task cards.

### Step 9: Update task-card.tsx
Add `onClick` prop:
```typescript
interface TaskCardProps {
  task: Task;
  index: number;
  onClick: (taskId: string) => void;
}
```
Wire click on card container (not conflicting with drag handle).

## Todo
- [ ] Create `src/hooks/use-comments.ts` — comment query hooks
- [ ] Create `src/components/board/board-header.tsx` — header + filter + new task button
- [ ] Create `src/components/task/task-form-dialog.tsx` — create/edit form
- [ ] Create `src/components/task/comment-list.tsx` — comments display
- [ ] Create `src/components/task/comment-form.tsx` — add comment form
- [ ] Create `src/components/task/task-detail-dialog.tsx` — task detail view
- [ ] Create `src/components/task/delete-task-dialog.tsx` — delete confirmation
- [ ] Update `kanban-board.tsx` — state, filtering, dialog wiring
- [ ] Update `task-card.tsx` — add onClick prop
- [ ] Test create task flow
- [ ] Test edit task flow
- [ ] Test delete task flow
- [ ] Test add comment flow
- [ ] Test assignee filter

## Success Criteria
- Click card → detail dialog opens with all info + comments
- "New Task" → form dialog → submit → card appears in correct column
- Edit from detail → form pre-filled → save → card updates
- Delete → confirmation → card removed
- Add comment → appears in list immediately
- Filter by assignee shows only matching tasks
- All component files under 100 lines

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Click vs drag conflict on cards | Medium | Use drag handle area; click on card body only |
| Dialog z-index over dnd overlay | Low | shadcn Dialog has high z-index by default |
| Stale data in detail dialog | Low | Query invalidation on mutations covers this |
| Form validation UX | Low | Show inline errors; disable submit if invalid |

## Security Considerations
- User input in title/description sanitized by React (no XSS via JSX)
- Comment content rendered as text, not HTML

## Next Steps
Phase 05: Polish & Documentation — loading/empty/error states, README, API docs
