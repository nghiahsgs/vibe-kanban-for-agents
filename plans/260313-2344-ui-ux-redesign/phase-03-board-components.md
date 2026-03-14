# Phase 3: Board Components

## Context

- **Parent plan:** [plan.md](./plan.md)
- **Dependencies:** [Phase 1](./phase-01-design-foundation.md), [Phase 2](./phase-02-base-ui-components.md)
- **Docs:** [UI Audit](../reports/260313-2344-ui-ux-redesign/scout/scout-01-current-ui-audit.md), [Kanban UI Research](./research/researcher-01-kanban-ui-design.md)

## Overview

- **Date:** 2026-03-13
- **Description:** Redesign the core kanban UI — board header, columns, task cards, board switcher, and skeleton loader
- **Priority:** High (most visible user-facing components)
- **Implementation Status:** Complete
- **Review Status:** Passed

## Key Insights

- Board column uses `bg-white/[0.02]` and `border-white/[0.06]` — barely visible, needs stronger surface differentiation
- Task card uses `bg-white/[0.03]` — nearly invisible against column bg
- Status/priority colors are hardcoded in 3 separate components — must use Phase 1 tokens
- Column header spacing (`gap-2.5`, `px-4`, `py-2.5`) doesn't follow 8px grid
- Card spacing (`px-3.5`, `py-3`, `mt-2.5`, `gap-1.5`) is inconsistent

## Requirements

1. Replace all `white/[0.XX]` patterns with semantic surface tokens
2. Replace all hardcoded status colors (zinc-400, blue-400, amber-400, emerald-400) with `--status-*` tokens
3. Replace all hardcoded priority colors (red-400, amber-400, emerald-400) with `--priority-*` tokens
4. Standardize spacing to 8px grid (4px half-step allowed)
5. Improve card visibility — use `bg-surface-elevated` not transparent overlays
6. Add proper hover states with smooth transitions
7. Improve drag state visual feedback

## Architecture

Components consume tokens from Phase 1 via Tailwind utilities:
- `bg-surface-elevated` instead of `bg-white/[0.03]`
- `bg-status-todo-bg` instead of `bg-white/[0.05]`
- `border-priority-high` instead of `border-l-red-400`

## Related Code Files

- `src/components/board/board-header.tsx`
- `src/components/board/board-column.tsx`
- `src/components/board/task-card.tsx`
- `src/components/board/board-switcher.tsx`
- `src/components/board/board-skeleton.tsx`

## Implementation Steps

### Step 1: board-column.tsx — Surface tokens + status colors

**Column wrapper:**
- Replace: `border-white/[0.06] bg-white/[0.02]`
- With: `border-border bg-surface-sunken`

**Column header:**
- Replace: `gap-2.5 px-4 py-2.5 border-b-white/[0.06]`
- With: `gap-2 px-4 py-3 border-b border-border`
- Status label: Keep `text-xs uppercase tracking-widest` but use `text-muted-foreground`

**Status dot colors — replace hardcoded with token classes:**
```tsx
const statusColors: Record<string, string> = {
  todo: "bg-status-todo",
  in_progress: "bg-status-in-progress",
  review: "bg-status-review",
  done: "bg-status-done",
};
```

**Count badge — replace hardcoded with token classes:**
```tsx
const countBgColors: Record<string, string> = {
  todo: "bg-status-todo-bg text-status-todo-text",
  in_progress: "bg-status-in-progress-bg text-status-in-progress-text",
  review: "bg-status-review-bg text-status-review-text",
  done: "bg-status-done-bg text-status-done-text",
};
```

**Droppable area:**
- Replace: `bg-indigo-500/[0.04]` (drag-over state)
- With: `bg-accent/50` or `bg-primary/5`

**Empty state text:** Keep `text-muted-foreground text-sm`

### Step 2: task-card.tsx — Card redesign

**Card wrapper:**
- Replace: `bg-white/[0.03] dark:bg-white/[0.03] border-white/[0.06]`
- With: `bg-card border-border`

**Hover state:**
- Replace: `hover:bg-white/[0.06] hover:border-white/[0.1]`
- With: `hover:bg-accent/50 hover:border-border`
- Add: `transition-colors duration-[var(--duration-normal)]`

**Drag state:**
- Replace: `ring-1 ring-indigo-500/40 shadow-lg shadow-indigo-500/10`
- With: `ring-2 ring-ring/50 shadow-lg shadow-ring/10`

**Priority left border — replace hardcoded:**
```tsx
const priorityBorderColors: Record<string, string> = {
  high: "border-l-priority-high",
  medium: "border-l-priority-medium",
  low: "border-l-priority-low",
};
```

**Priority badge — replace hardcoded:**
```tsx
const priorityBadgeColors: Record<string, string> = {
  high: "bg-priority-high-bg text-priority-high-text",
  medium: "bg-priority-medium-bg text-priority-medium-text",
  low: "bg-priority-low-bg text-priority-low-text",
};
```

**Card padding:**
- Replace: `px-3.5 py-3`
- With: `px-3 py-3` (12px horizontal, 12px vertical — on grid)

**Metadata spacing:**
- Replace: `gap-1.5`, `mt-2.5`
- With: `gap-2`, `mt-2` (8px grid)

**Title:** Keep `text-[13px] font-medium leading-snug line-clamp-2`, add `text-foreground`

**Icon sizes:** Standardize to `size-3.5` (14px) for all metadata icons

### Step 3: board-header.tsx — Spacing alignment

**Wrapper:**
- Replace: `gap-1.5 mb-6 pb-4`
- With: `gap-2 mb-6 pb-4` (8px gap)

**Filter select:** Keep `h-8 text-xs w-[160px]` (acceptable)

**Dividers:**
- Replace: `bg-border` (keep semantics, just ensure visibility)
- Ensure: `w-px h-5 bg-border` remains

**Buttons:** Ensure all use `size="sm"` (h-8 after Phase 2 changes)

**New Task button:**
- Replace: `h-8 px-3 text-xs font-semibold`
- With: Just use `size="sm"` — Phase 2 handles sizing

### Step 4: board-switcher.tsx — Token alignment

**Trigger button:**
- Keep: `gap-2 h-9 px-2 rounded-lg font-bold text-xl tracking-tight`
- Ensure icon uses `text-foreground` (not hardcoded)

**Board name:**
- Keep: `max-w-[240px] truncate` (acceptable, prevents overflow)
- Ensure: `text-foreground`

**Chevron:** Keep `text-muted-foreground/70`

**Dropdown content:** Ensure uses `bg-popover border-border`

**Settings button:** Keep `opacity-0 group-hover:opacity-100` pattern (good UX)

### Step 5: board-skeleton.tsx — Match new column/card styles

Update skeleton elements to match new styling:
- Column skeleton: `bg-surface-sunken border-border rounded-xl`
- Card skeleton: `bg-card border-border rounded-xl`
- Skeleton pulse elements: `bg-muted animate-pulse rounded`

## Todo List

- [ ] Replace column `white/[0.XX]` patterns with surface tokens
- [ ] Replace status dot/badge hardcoded colors with `--status-*` tokens
- [ ] Replace card `white/[0.XX]` with `bg-card`
- [ ] Replace priority border/badge hardcoded colors with `--priority-*` tokens
- [ ] Standardize card spacing to 8px grid
- [ ] Update drag state to use `ring` token
- [ ] Update board header gap to 8px grid
- [ ] Update board switcher to use semantic tokens
- [ ] Update board skeleton to match new styles
- [ ] Test drag-and-drop still works visually
- [ ] Test all 4 columns render with correct status colors
- [ ] Test all 3 priority levels render correctly on cards

## Success Criteria

1. No `white/[0.XX]` patterns remain in any board component
2. No hardcoded color names (blue-400, amber-400, etc.) in board components
3. Columns have visible surface differentiation from background
4. Cards are clearly visible against column background
5. Status dots and count badges use semantic tokens
6. Priority left borders use semantic tokens
7. Drag state is clearly visible
8. All spacing follows 8px grid (4px half-step allowed)

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Card bg-card too similar to column bg-surface-sunken | High | Test contrast; adjust --surface-sunken if needed (make darker) |
| Drag state less visible with token colors | Medium | Use ring-2 (thicker) + higher opacity |
| Status color map key mismatch | Low | Verify status strings match DB enum values exactly |

## Security Considerations

None.

## Next Steps

After Phase 3, proceed to [Phase 6: Polish & Responsive](./phase-06-polish-responsive.md) (after Phases 4+5 also complete).
