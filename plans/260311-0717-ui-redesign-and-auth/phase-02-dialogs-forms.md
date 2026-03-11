# Phase 02: UI/UX Redesign - Dialogs & Forms

## Context
- [Research: Kanban UI/UX](./research/researcher-01-kanban-ui-ux.md)
- [Phase 01: Board & Cards](./phase-01-board-cards.md)
- [Plan overview](./plan.md)

## Overview
Redesign task detail dialog, create/edit form, delete confirmation, and comment section. Goal: clean, spacious dialogs that feel premium.

## Key Insights
- Detail dialog should feel like a "task page" not a cramped popup
- Comments section needs visual hierarchy (author, timestamp, content)
- Forms should use labeled inputs, not just placeholders
- Wider dialog (max-w-2xl) for detail view

## Requirements
1. Redesign task detail dialog with better layout and typography
2. Improve task form dialog with proper labels and spacing
3. Polish comment list with author avatars/initials and timestamps
4. Better delete confirmation dialog
5. All dialogs respect dark mode

## Architecture
Pure component updates. No data flow or API changes.

```
src/components/task/
  task-detail-dialog.tsx    -- wider, better layout, metadata grid
  task-form-dialog.tsx      -- labeled fields, better grid layout
  delete-task-dialog.tsx    -- cleaner confirmation UI
  comment-list.tsx          -- author initials, relative timestamps
  comment-form.tsx          -- cleaner input area
```

## Related Code Files
- `src/components/task/task-detail-dialog.tsx` - current detail view
- `src/components/task/task-form-dialog.tsx` - create/edit form
- `src/components/task/delete-task-dialog.tsx` - confirm delete
- `src/components/task/comment-list.tsx` - comment display
- `src/components/task/comment-form.tsx` - comment input

## Implementation Steps

### 1. Redesign task-detail-dialog.tsx
- Widen: `sm:max-w-2xl`
- **Header area:** Title as `text-xl font-semibold`, status + priority badges inline
- **Metadata section:** 2-col grid with labeled fields (Assignee, Status, Priority, Created, Updated)
  - Use muted labels (`text-xs uppercase tracking-wide text-muted-foreground`)
  - Values in regular weight
- **Description section:** Bordered area with `prose` styling or at least `text-sm leading-relaxed`
- **Action buttons:** Move Edit/Delete to top-right of dialog header (icon buttons, not bottom)
  - Edit: pencil icon button
  - Delete: trash icon button (destructive variant)
- **Comments section:** Below a divider, with "Activity" heading

### 2. Redesign task-form-dialog.tsx
- Add proper `<label>` elements above each field (not just placeholders)
- Title field: `<label>Title *</label>` + Input
- Description: `<label>Description</label>` + Textarea (4 rows)
- Grid layout for Status + Priority selects (keep 2-col)
- Assignee field with label
- Submit button area: right-aligned, Cancel + Submit
- Loading state: spinner in submit button

### 3. Redesign comment-list.tsx
- Each comment: avatar/initials circle (32px) + author name (bold) + relative timestamp (muted)
- Content below author line
- Use `Intl.RelativeTimeFormat` or simple "2h ago" / "Mar 10" logic
- Empty state: "No activity yet" centered muted text

### 4. Redesign comment-form.tsx
- Textarea with "Add a comment..." placeholder
- Submit button right-aligned below textarea
- Optional: Cmd+Enter to submit

### 5. Redesign delete-task-dialog.tsx
- AlertDialog with warning icon
- Title: "Delete task?"
- Description: "This will permanently delete '{task title}' and all its comments."
- Destructive confirm button: "Delete"

### 6. Add relative time utility
- Create `src/lib/format-time.ts` with `formatRelativeTime(dateString: string): string`
- Returns: "just now", "5m ago", "2h ago", "Mar 10", etc.

## Todo
- [ ] Create `src/lib/format-time.ts` utility
- [ ] Redesign task-detail-dialog.tsx (wider, metadata grid, icon actions)
- [ ] Redesign task-form-dialog.tsx (labeled fields, better layout)
- [ ] Redesign comment-list.tsx (initials, relative time)
- [ ] Redesign comment-form.tsx (cleaner input)
- [ ] Redesign delete-task-dialog.tsx (warning icon, task title in message)
- [ ] Test all dialogs in light and dark mode
- [ ] Test create, edit, delete flows still work
- [ ] Test comment create flow

## Success Criteria
- Dialogs feel spacious and well-organized
- Form labels are clear; fields have proper accessibility labels
- Comments show author identity and relative timestamps
- All dialogs render correctly in dark mode
- No regressions in CRUD operations

## Risk Assessment
- **Low:** Dialog width change may need responsive testing on small screens
- **Low:** Relative time formatting edge cases (future dates, very old dates)

## Security Considerations
None (pure UI changes).

## Next Steps
Phase 01 + 02 complete the UI overhaul. Proceed to Phase 03 (Auth Core).
