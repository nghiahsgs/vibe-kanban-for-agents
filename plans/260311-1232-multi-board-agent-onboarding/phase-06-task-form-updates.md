# Phase 6: Task Form Updates

## Context Links
- Task form: `src/components/task/task-form-dialog.tsx`
- Task detail: `src/components/task/task-detail-dialog.tsx`
- Types: `src/types/index.ts`

## Overview
Add `workingDirectory` field to task form. Ensure task creation passes boardId. Minor UI updates to reflect board context.

## Key Insights
- `TaskFormDialog` handles both create and edit modes
- Form fields: title, description, status, priority, assignee
- `workingDirectory` helps agents know where to execute — optional text field
- boardId not shown in form — inferred from active board context

## Requirements
1. Add `workingDirectory` input to task form (create + edit)
2. Task creation passes boardSlug via API URL
3. Task detail dialog shows workingDirectory if set
4. Update Task type with new fields

## Architecture

### Form field
Add after assignee field:
```tsx
<div className="space-y-1.5">
  <label htmlFor="task-working-dir" className="text-sm font-medium">Working Directory</label>
  <Input
    id="task-working-dir"
    placeholder="/path/to/project (optional)"
    value={workingDirectory}
    onChange={(e) => setWorkingDirectory(e.target.value)}
  />
</div>
```

## Related Code Files
- `src/components/task/task-form-dialog.tsx` — add field
- `src/components/task/task-detail-dialog.tsx` — display field
- `src/hooks/use-tasks.ts` — already updated in Phase 5
- `src/types/index.ts` — already updated in Phase 1

## Implementation Steps

- [ ] 1. Add `workingDirectory` state to `TaskFormDialog`
- [ ] 2. Add input field to form (after assignee)
- [ ] 3. Include `workingDirectory` in create/update body
- [ ] 4. Pre-fill workingDirectory in edit mode
- [ ] 5. Show workingDirectory in `TaskDetailDialog` (if set)
- [ ] 6. Update create task mutation to use board-scoped endpoint

## Success Criteria
- workingDirectory visible in task form
- Value persisted on create/update
- Displayed in task detail view
- Optional — empty value treated as null

## Risk Assessment
- Low risk — additive change to existing form

## Security Considerations
- workingDirectory is user-provided path — no server-side path validation needed (it's a hint for agents)

## Next Steps
Phase 7: Agent Onboarding Generator
