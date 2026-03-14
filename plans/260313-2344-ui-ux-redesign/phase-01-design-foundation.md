# Phase 1: Design Foundation

## Context

- **Parent plan:** [plan.md](./plan.md)
- **Dependencies:** None (this is the foundation)
- **Docs:** [Kanban UI Research](./research/researcher-01-kanban-ui-design.md), [Design System Research](./research/researcher-02-design-system-patterns.md)

## Overview

- **Date:** 2026-03-13
- **Description:** Complete overhaul of `globals.css` — semantic color tokens, typography scale, spacing scale, status/priority color system, scrollbar theming
- **Priority:** Critical (all other phases depend on this)
- **Implementation Status:** Complete
- **Review Status:** Passed

## Key Insights

- Current globals.css has good shadcn token structure but missing: semantic surface layers, typography tokens, spacing tokens, status/priority colors
- Hardcoded `rgba(255,255,255,0.XX)` patterns in scrollbar and throughout components — need semantic equivalents
- Light mode tokens exist but untested; dark mode is primary
- Tailwind v4 `@theme inline` block is the right place for design tokens

## Requirements

1. Add semantic surface color tokens (surface, surface-elevated, surface-sunken)
2. Add status color tokens (todo, in-progress, review, done) with dot/bg/text variants
3. Add priority color tokens (low, medium, high) with border/bg/text variants
4. Define typography scale tokens (display, heading, body, caption)
5. Define spacing scale tokens (space-4 through space-64, semantic inset/gap aliases)
6. Fix scrollbar to use semantic tokens (work in both modes)
7. Add transition duration token for consistency

## Architecture

### Token Hierarchy

```
@theme inline {
  // Tailwind color mappings (existing)
  // + New spacing tokens
  // + New font-size tokens
}

:root {
  // Light mode: shadcn tokens (existing)
  // + Surface layers
  // + Status/priority colors
  // + Typography scale
  // + Spacing semantics
}

.dark {
  // Dark mode overrides (existing)
  // + Surface layers
  // + Status/priority colors
}

@layer base {
  // Reset + body styles (existing)
  // + Typography defaults
}
```

### New CSS Variable Names

**Surface layers:**
- `--surface` — main content bg (alias of --background for components)
- `--surface-elevated` — cards, popovers (alias of --card)
- `--surface-sunken` — inset areas, code blocks

**Status colors (dot / badge-bg / badge-text):**
- `--status-todo` / `--status-todo-bg` / `--status-todo-text`
- `--status-in-progress` / `--status-in-progress-bg` / `--status-in-progress-text`
- `--status-review` / `--status-review-bg` / `--status-review-text`
- `--status-done` / `--status-done-bg` / `--status-done-text`

**Priority colors (border / badge-bg / badge-text):**
- `--priority-high` / `--priority-high-bg` / `--priority-high-text`
- `--priority-medium` / `--priority-medium-bg` / `--priority-medium-text`
- `--priority-low` / `--priority-low-bg` / `--priority-low-text`

**Spacing (registered in @theme for Tailwind utilities):**
- `--space-4` through `--space-64` (4px grid)
- Semantic: `--inset-xs`(8px), `--inset-sm`(12px), `--inset-md`(16px), `--inset-lg`(24px), `--inset-xl`(32px)
- Semantic: `--gap-xs`(4px), `--gap-sm`(8px), `--gap-md`(16px), `--gap-lg`(24px)

**Transition:**
- `--duration-fast`: 100ms
- `--duration-normal`: 150ms
- `--duration-slow`: 250ms

## Related Code Files

- `src/app/globals.css` — Primary target
- `src/app/layout.tsx` — Font setup (no changes needed, already correct)

## Implementation Steps

### Step 1: Add spacing tokens to @theme inline

Add after the radius variables (line 47):

```css
/* Spacing scale (8px grid) */
--spacing-1: 4px;
--spacing-2: 8px;
--spacing-3: 12px;
--spacing-4: 16px;
--spacing-5: 20px;
--spacing-6: 24px;
--spacing-8: 32px;
--spacing-10: 40px;
--spacing-12: 48px;
--spacing-16: 64px;
```

Note: Tailwind v4 auto-generates spacing utilities from `--spacing-*` tokens in `@theme`.

### Step 2: Add surface + status + priority tokens to :root (light mode)

After existing light mode variables:

```css
/* Surface layers */
--surface: #fafafa;
--surface-elevated: #ffffff;
--surface-sunken: #f0f0f0;

/* Status colors */
--status-todo: #71717a;
--status-todo-bg: rgba(113, 113, 122, 0.1);
--status-todo-text: #71717a;
--status-in-progress: #6366f1;
--status-in-progress-bg: rgba(99, 102, 241, 0.1);
--status-in-progress-text: #6366f1;
--status-review: #f59e0b;
--status-review-bg: rgba(245, 158, 11, 0.1);
--status-review-text: #d97706;
--status-done: #10b981;
--status-done-bg: rgba(16, 185, 129, 0.1);
--status-done-text: #059669;

/* Priority colors */
--priority-high: #ef4444;
--priority-high-bg: rgba(239, 68, 68, 0.1);
--priority-high-text: #dc2626;
--priority-medium: #f59e0b;
--priority-medium-bg: rgba(245, 158, 11, 0.1);
--priority-medium-text: #d97706;
--priority-low: #10b981;
--priority-low-bg: rgba(16, 185, 129, 0.1);
--priority-low-text: #059669;

/* Transition durations */
--duration-fast: 100ms;
--duration-normal: 150ms;
--duration-slow: 250ms;
```

### Step 3: Add dark mode overrides to .dark

```css
/* Surface layers */
--surface: #0f0f0f;
--surface-elevated: #171717;
--surface-sunken: #0a0a0a;

/* Status colors (brighter text for dark bg contrast) */
--status-todo: #a1a1aa;
--status-todo-bg: rgba(161, 161, 170, 0.1);
--status-todo-text: #a1a1aa;
--status-in-progress: #818cf8;
--status-in-progress-bg: rgba(129, 140, 248, 0.1);
--status-in-progress-text: #818cf8;
--status-review: #fbbf24;
--status-review-bg: rgba(251, 191, 36, 0.1);
--status-review-text: #fbbf24;
--status-done: #34d399;
--status-done-bg: rgba(52, 211, 153, 0.1);
--status-done-text: #34d399;

/* Priority colors */
--priority-high: #f87171;
--priority-high-bg: rgba(248, 113, 113, 0.1);
--priority-high-text: #f87171;
--priority-medium: #fbbf24;
--priority-medium-bg: rgba(251, 191, 36, 0.1);
--priority-medium-text: #fbbf24;
--priority-low: #34d399;
--priority-low-bg: rgba(52, 211, 153, 0.1);
--priority-low-text: #34d399;
```

### Step 4: Register new tokens in @theme inline for Tailwind utility access

```css
/* Surface */
--color-surface: var(--surface);
--color-surface-elevated: var(--surface-elevated);
--color-surface-sunken: var(--surface-sunken);

/* Status */
--color-status-todo: var(--status-todo);
--color-status-todo-bg: var(--status-todo-bg);
--color-status-todo-text: var(--status-todo-text);
--color-status-in-progress: var(--status-in-progress);
--color-status-in-progress-bg: var(--status-in-progress-bg);
--color-status-in-progress-text: var(--status-in-progress-text);
--color-status-review: var(--status-review);
--color-status-review-bg: var(--status-review-bg);
--color-status-review-text: var(--status-review-text);
--color-status-done: var(--status-done);
--color-status-done-bg: var(--status-done-bg);
--color-status-done-text: var(--status-done-text);

/* Priority */
--color-priority-high: var(--priority-high);
--color-priority-high-bg: var(--priority-high-bg);
--color-priority-high-text: var(--priority-high-text);
--color-priority-medium: var(--priority-medium);
--color-priority-medium-bg: var(--priority-medium-bg);
--color-priority-medium-text: var(--priority-medium-text);
--color-priority-low: var(--priority-low);
--color-priority-low-bg: var(--priority-low-bg);
--color-priority-low-text: var(--priority-low-text);
```

### Step 5: Update scrollbar styles to use semantic tokens

Replace hardcoded `rgba(255,255,255,...)` with token references:

```css
.overflow-x-auto,
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}

.overflow-x-auto::-webkit-scrollbar-thumb,
.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: var(--border);
  border-radius: 9999px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover,
.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: var(--muted-foreground);
}
```

### Step 6: Add typography base styles

Extend `@layer base`:

```css
@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
    font-size: 14px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  html {
    @apply font-sans;
  }
}
```

## Todo List

- [ ] Add spacing tokens to `@theme inline`
- [ ] Add surface/status/priority tokens to `:root` (light)
- [ ] Add surface/status/priority tokens to `.dark`
- [ ] Register new tokens in `@theme inline` for Tailwind utilities
- [ ] Update scrollbar styles to semantic tokens
- [ ] Add typography base styles (14px body, antialiasing)
- [ ] Test dark mode renders correctly
- [ ] Test light mode renders correctly
- [ ] Verify Tailwind utility classes generate (`bg-surface`, `text-status-todo`, etc.)

## Success Criteria

1. `bg-surface`, `bg-surface-elevated`, `bg-surface-sunken` work as Tailwind classes
2. `bg-status-todo-bg`, `text-status-todo-text` (and all status variants) work
3. `bg-priority-high-bg`, `border-priority-high` (and all priority variants) work
4. Scrollbar respects theme (no hardcoded rgba)
5. Body text is 14px with antialiasing
6. No visual regression — existing pages look identical (tokens alias existing values)

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Token naming conflicts with existing Tailwind | High | Prefix all new tokens with semantic names; test utility generation |
| Light mode contrast issues | Medium | Test all new token values against WCAG AA (4.5:1) |
| Spacing tokens conflict with Tailwind defaults | Low | Use `--spacing-*` convention that Tailwind v4 expects |

## Security Considerations

None — CSS-only changes.

## Next Steps

After Phase 1 completion, proceed to [Phase 2: Base UI Components](./phase-02-base-ui-components.md) to update button, dialog, card, input, badge, and select components to consume the new tokens.
