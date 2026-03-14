# Phase 2: Base UI Components

## Context

- **Parent plan:** [plan.md](./plan.md)
- **Dependencies:** [Phase 1: Design Foundation](./phase-01-design-foundation.md)
- **Docs:** [Design System Research](./research/researcher-02-design-system-patterns.md)

## Overview

- **Date:** 2026-03-13
- **Description:** Refactor shadcn/ui base components (button, dialog, card, input, badge, select, textarea, label) to use new semantic tokens and enforce consistent sizing
- **Priority:** High
- **Implementation Status:** Complete
- **Review Status:** Passed

## Key Insights

- Button has 6 variants and 5 sizes — reduce to 4 sizes (sm, default, lg, icon)
- Dialog overlay uses barely-visible `bg-black/10 backdrop-blur-xs` — increase to `bg-black/50 backdrop-blur-sm`
- Card uses `ring-1 ring-foreground/10` for border — keep but ensure consistency
- Input background uses `rgba(255,255,255,0.06)` — replace with `--input` token (already exists but poorly defined)

## Requirements

1. Standardize button to 4 sizes, ensure 8px-aligned heights
2. Improve dialog overlay visibility (blur + opacity)
3. Ensure card, dialog footer, and popover share consistent surface tokens
4. Update input/textarea to use `bg-surface-elevated` instead of hardcoded rgba
5. Create consistent badge variants for status and priority
6. All components use `transition-colors duration-[var(--duration-normal)]` pattern

## Architecture

Base UI components are in `src/components/ui/`. They use shadcn's CVA (class-variance-authority) pattern with data-slot attributes. Changes are Tailwind class replacements only — no structural/API changes.

## Related Code Files

- `src/components/ui/button.tsx`
- `src/components/ui/dialog.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/textarea.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/select.tsx`
- `src/components/ui/label.tsx`

## Implementation Steps

### Step 1: Button — Simplify sizes, consistent heights

Current sizes: `xs`(h-6), `sm`(h-7), `default`(h-8), `lg`(h-9), `icon`
Target sizes: `sm`(h-8), `default`(h-9), `lg`(h-10), `icon`(h-9 w-9)

Changes in `button.tsx`:
- Remove `xs` size variant
- Update `sm`: `"h-8 gap-1.5 px-3 text-sm has-[>svg]:px-2"`
- Update `default`: `"h-9 gap-2 px-4 text-sm has-[>svg]:px-3"`
- Update `lg`: `"h-10 gap-2 px-5 text-base has-[>svg]:px-4"`
- Update `icon`: `"h-9 w-9 p-0"`

Variant updates:
- `outline`: Remove dark-specific overrides (`dark:border-input dark:bg-input/30`), use `border-border bg-transparent hover:bg-accent`
- Ensure all variants use `transition-colors` (already present)

### Step 2: Dialog — Better overlay, consistent spacing

In `dialog.tsx`:
- Overlay: Change `bg-black/10 backdrop-blur-xs` to `bg-black/50 backdrop-blur-sm dark:bg-black/70 dark:backdrop-blur-md`
- Content: Keep `bg-background ring-1 ring-foreground/10 rounded-xl`
- Content padding: Ensure `p-6` (24px = `--inset-lg`)
- Header: Change `gap-2` to `gap-1.5`, keep `flex flex-col`
- Footer: Keep `bg-muted/50 border-t rounded-b-xl` pattern
- Add smooth enter animation: Keep existing data-state animations, ensure `duration-150`

### Step 3: Card — Surface token alignment

In `card.tsx`:
- Wrapper: Keep `rounded-xl bg-card ring-1 ring-foreground/10`
- Ensure padding uses consistent `p-4` (16px)
- No structural changes needed — card already uses semantic tokens

### Step 4: Input + Textarea — Semantic backgrounds

In `input.tsx`:
- Replace any hardcoded background with `bg-surface-elevated`
- Ensure border uses `border-border`
- Focus state: `focus:border-ring focus:ring-2 focus:ring-ring/20`
- Height: `h-9` (36px, aligns with button default)
- Padding: `px-3` (12px)
- Font: `text-sm` (14px)

In `textarea.tsx`:
- Same token updates as input
- Padding: `p-3` (12px)
- Remove any hardcoded colors

### Step 5: Badge — Add status and priority variants

In `badge.tsx`, add new variants alongside existing ones:

```tsx
// New variants to add
status_todo: "bg-[var(--status-todo-bg)] text-[var(--status-todo-text)] border-transparent",
status_in_progress: "bg-[var(--status-in-progress-bg)] text-[var(--status-in-progress-text)] border-transparent",
status_review: "bg-[var(--status-review-bg)] text-[var(--status-review-text)] border-transparent",
status_done: "bg-[var(--status-done-bg)] text-[var(--status-done-text)] border-transparent",
priority_high: "bg-[var(--priority-high-bg)] text-[var(--priority-high-text)] border-transparent",
priority_medium: "bg-[var(--priority-medium-bg)] text-[var(--priority-medium-text)] border-transparent",
priority_low: "bg-[var(--priority-low-bg)] text-[var(--priority-low-text)] border-transparent",
```

Badge base: `text-xs font-medium px-2 py-0.5 rounded-md`

### Step 6: Select — Consistent trigger styling

In `select.tsx`:
- Trigger: Match input height (`h-9`), use `bg-surface-elevated border-border`
- Content: Use `bg-popover border border-border rounded-lg`
- Items: `text-sm px-3 py-1.5 rounded-md hover:bg-accent`

### Step 7: Label — Consistent typography

In `label.tsx`:
- Ensure: `text-sm font-medium text-foreground`
- Disabled state: `opacity-50`

## Todo List

- [ ] Refactor button sizes (remove xs, bump all heights +1 step)
- [ ] Update dialog overlay (stronger blur + opacity)
- [ ] Verify card uses semantic tokens
- [ ] Update input to use `bg-surface-elevated`, consistent height
- [ ] Update textarea to use semantic tokens
- [ ] Add status/priority badge variants
- [ ] Update select trigger to match input styling
- [ ] Verify label typography
- [ ] Test all components in dark mode
- [ ] Test all components in light mode
- [ ] Verify no visual regressions in existing pages

## Success Criteria

1. All base components use only semantic tokens — no hardcoded colors
2. Button, input, select triggers share consistent h-9 default height
3. Dialog overlay is clearly visible in both themes
4. Badge has working `status_*` and `priority_*` variants
5. All hover/focus states use consistent transition timing

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Removing `xs` button breaks existing usage | Medium | Search all components for `size="xs"` and update to `size="sm"` before removing |
| Badge variant naming conflicts | Low | Use underscore convention (`status_todo`) to avoid conflicts |
| Input height change affects layout | Medium | Test all forms after height change |

## Security Considerations

None — styling-only changes.

## Next Steps

After Phase 2, proceed to Phases 3-5 in parallel (they depend on Phase 2 but not on each other):
- [Phase 3: Board Components](./phase-03-board-components.md)
- [Phase 4: Dialog Components](./phase-04-dialog-components.md)
- [Phase 5: Supporting Components](./phase-05-supporting-components.md)
