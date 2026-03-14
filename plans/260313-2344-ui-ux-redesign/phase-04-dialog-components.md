# Phase 4: Dialog Components

## Context

- **Parent plan:** [plan.md](./plan.md)
- **Dependencies:** [Phase 1](./phase-01-design-foundation.md), [Phase 2](./phase-02-base-ui-components.md)
- **Docs:** [Design System Research](./research/researcher-02-design-system-patterns.md) (Section 5: Dialog Best Practices)

## Overview

- **Date:** 2026-03-13
- **Description:** Standardize all 6 dialog components with consistent padding, spacing, sizing, and token usage
- **Priority:** High
- **Implementation Status:** Complete
- **Review Status:** Passed

## Key Insights

- Current dialogs have inconsistent spacing: `space-y-4`, `space-y-5`, `space-y-6` across different dialogs
- Form field gaps vary: `space-y-1.5` (label-input) vs `space-y-3` vs `space-y-4` (between fields)
- Dialog widths inconsistent: `sm:max-w-md` vs `sm:max-w-2xl`
- Warning/alert boxes use hardcoded amber colors — need semantic tokens
- Priority badges in task-detail use different colors than task-card (inconsistent)

## Requirements

1. Standardize dialog internal spacing: `space-y-4` for form fields, `space-y-1.5` for label+input groups
2. Standardize dialog widths: `sm:max-w-md` (forms), `sm:max-w-2xl` (detail views)
3. Replace hardcoded warning colors with semantic tokens
4. Unify priority/status badge rendering across task-detail and task-card
5. Consistent button placement: footer right-aligned, `gap-2`

## Architecture

All dialogs wrap shadcn `Dialog` / `DialogContent` / `DialogHeader` / `DialogFooter`. Internal content uses standard form patterns. Changes are class replacements only.

**Standard dialog layout:**
```
DialogContent (p-6)
  DialogHeader (pb-4 border-b border-border)
    DialogTitle
    DialogDescription (optional)
  Form/Content (py-4 space-y-4)
    Field groups (space-y-1.5)
  DialogFooter (pt-4 border-t border-border, flex justify-end gap-2)
```

## Related Code Files

- `src/components/board/board-create-dialog.tsx`
- `src/components/board/board-settings-dialog.tsx`
- `src/components/board/agent-onboarding-dialog.tsx`
- `src/components/task/task-form-dialog.tsx`
- `src/components/task/task-detail-dialog.tsx`
- `src/components/task/delete-task-dialog.tsx`

## Implementation Steps

### Step 1: board-create-dialog.tsx — Standard form dialog

**Dialog:** Keep `sm:max-w-md`

**Form spacing:**
- Replace: `space-y-4 mt-2`
- With: `space-y-4 pt-4`

**Label+input groups:**
- Ensure: `space-y-1.5` consistently

**Footer buttons:**
- Ensure: `flex justify-end gap-2`
- Cancel: `variant="outline"`
- Submit: `variant="default"`

**Required asterisk:** Keep `<span className="text-destructive">*</span>`

### Step 2: board-settings-dialog.tsx — Token-based warnings

**Dialog:** Keep `sm:max-w-md`

**Warning/alert boxes — replace hardcoded amber:**
- Replace: `border-amber-500/40 bg-amber-500/10`
- With: `border-status-review/40 bg-status-review-bg`
- Replace: `text-amber-600 dark:text-amber-400`
- With: `text-status-review-text`

**API key display — code block:**
- Replace: `bg-muted` (keep) or any hardcoded bg
- Ensure: `font-mono text-xs bg-surface-sunken rounded px-3 py-2`

**Delete confirmation:**
- Keep: `variant={confirmDelete ? "destructive" : "ghost"}` pattern (good UX)

**Form spacing:** Standardize to `space-y-4`

### Step 3: agent-onboarding-dialog.tsx — Complex dialog cleanup

**Dialog:** Keep `sm:max-w-2xl max-h-[90vh] overflow-y-auto`

**Tab styling:**
- Replace: `bg-muted/50`
- With: `bg-muted` (consistent, no partial opacity)
- Active tab: `bg-background shadow-sm` (keep)

**Section spacing:**
- Replace: `space-y-6` + `space-y-3` + `space-y-1.5` (nested)
- With: `space-y-6` (top sections), `space-y-4` (within sections), `space-y-1.5` (label groups)

**Textarea (prompt display):**
- Replace: `border-border/60 bg-muted/40 dark:bg-black/20`
- With: `border-border bg-surface-sunken`
- Keep: `min-h-[280px] rounded-lg p-3 font-mono text-xs`

**Agent avatar:**
- Replace: `bg-primary/10`
- With: `bg-accent`

**Status indicator:**
- Replace: `fill-emerald-500 text-emerald-500`
- With: `fill-status-done text-status-done`

**Dividers:**
- Replace: `divide-border/40`
- With: `divide-border`

### Step 4: task-form-dialog.tsx — Form standardization

**Dialog:** Keep `sm:max-w-md`

**Form spacing:**
- Replace: `space-y-5 mt-3`
- With: `space-y-4 pt-4`

**Textarea:**
- Keep: `rows={4} resize-none`
- Ensure: Uses semantic input styling from Phase 2

**Select dropdowns (status, priority, assignee):**
- Ensure uses Phase 2 select styling
- No hardcoded colors in options

**Footer:**
- Replace: `flex justify-end gap-2 pt-2`
- With: `flex justify-end gap-2 pt-4`

### Step 5: task-detail-dialog.tsx — Priority badge alignment

**Dialog:** Keep `sm:max-w-2xl max-h-[85vh] overflow-y-auto`

**Priority badge colors — replace hardcoded with token classes:**
```tsx
const priorityClasses: Record<string, string> = {
  high: "bg-priority-high-bg text-priority-high-text",
  medium: "bg-priority-medium-bg text-priority-medium-text",
  low: "bg-priority-low-bg text-priority-low-text",
};
```
This replaces:
```
high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
```

**Status badge:** Use `variant="status_todo"` (etc.) from Phase 2 badge variants

**Metadata grid:**
- Keep: `grid-cols-2 gap-x-6 gap-y-4`
- Labels: `text-xs uppercase tracking-wide text-muted-foreground font-medium` (consistent)

**Description box:**
- Replace: `bg-muted/30`
- With: `bg-surface-sunken`
- Keep: `px-4 py-3 border rounded-lg`

**Comments section:**
- Keep: `border-t` separator
- Keep: `max-h-64 overflow-y-auto`

**Header action buttons:**
- Standardize: `gap-2` (not `gap-1`)

### Step 6: delete-task-dialog.tsx — Minimal cleanup

**Dialog:** `sm:max-w-md` (confirm dialog)

**Ensure:**
- Destructive button uses `variant="destructive"`
- Cancel uses `variant="outline"`
- Spacing follows standard dialog layout
- Warning text uses `text-muted-foreground`

## Todo List

- [ ] Standardize board-create-dialog spacing
- [ ] Replace board-settings-dialog hardcoded amber with semantic tokens
- [ ] Clean up agent-onboarding-dialog spacing + opacity patterns
- [ ] Standardize task-form-dialog form spacing
- [ ] Replace task-detail-dialog hardcoded priority colors with tokens
- [ ] Verify delete-task-dialog uses standard layout
- [ ] Test all dialogs open/close smoothly
- [ ] Test all form submissions still work
- [ ] Verify consistent padding across all 6 dialogs
- [ ] Test dialogs on mobile viewport (< 640px)

## Success Criteria

1. All 6 dialogs use same internal spacing pattern (space-y-4 forms, space-y-1.5 label groups)
2. No hardcoded color names in any dialog (no amber-*, red-*, green-*, yellow-*)
3. Priority badges in task-detail match task-card styling
4. Warning/alert boxes use semantic status tokens
5. All textareas/code blocks use `bg-surface-sunken`
6. Footer buttons consistently right-aligned with `gap-2`

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Agent onboarding dialog complex — many nested sections | Medium | Change spacing layer by layer, test after each change |
| Form spacing changes break visual flow | Low | Standard `space-y-4` is well-tested pattern |
| Priority badge token names don't resolve | Medium | Verify Phase 1 tokens are deployed and working first |

## Security Considerations

None.

## Next Steps

After Phase 4 (and Phases 3+5), proceed to [Phase 6: Polish & Responsive](./phase-06-polish-responsive.md).
