# Phase 5: Supporting Components

## Context

- **Parent plan:** [plan.md](./plan.md)
- **Dependencies:** [Phase 1](./phase-01-design-foundation.md), [Phase 2](./phase-02-base-ui-components.md)
- **Docs:** [UI Audit](../reports/260313-2344-ui-ux-redesign/scout/scout-01-current-ui-audit.md)

## Overview

- **Date:** 2026-03-13
- **Description:** Update comment list/form, auth forms, user menu, and API key manager to use semantic tokens
- **Priority:** Medium
- **Implementation Status:** Complete
- **Review Status:** Passed

## Key Insights

- Comment avatars use 8 hardcoded color values — acceptable as decorative (not semantic)
- Login form card uses `border-0 shadow-lg` — broken in dark mode, invisible in light mode
- API key manager has hardcoded `bg-white dark:bg-black` and `bg-amber-50 dark:bg-amber-950/20`
- Auth forms well-structured but need token alignment

## Requirements

1. Update comment components to use semantic tokens where applicable
2. Fix auth form card styling for both themes
3. Replace API key manager hardcoded colors with tokens
4. Ensure user menu dropdown uses semantic tokens

## Related Code Files

- `src/components/task/comment-list.tsx`
- `src/components/task/comment-form.tsx`
- `src/components/auth/login-form.tsx`
- `src/components/auth/signup-form.tsx`
- `src/components/auth/user-menu.tsx`
- `src/components/settings/api-key-manager.tsx`

## Implementation Steps

### Step 1: comment-list.tsx — Minimal changes

**Avatar colors:** Keep the 8-color palette (blue-500, violet-500, etc.) — these are decorative, not semantic. No change needed.

**Content text:**
- Replace: `text-foreground/80`
- With: `text-foreground` (no partial opacity on text)

**Container:**
- Keep: `space-y-4 max-h-64 overflow-y-auto`
- Scrollbar will auto-use semantic tokens from Phase 1

**Empty state:** Keep `py-6 text-center text-sm text-muted-foreground`

### Step 2: comment-form.tsx — Token alignment

- Ensure textarea uses `bg-surface-elevated border-border` (Phase 2 input styling)
- Button: use standard `variant="default" size="sm"`
- Spacing: `gap-2` between textarea and button

### Step 3: login-form.tsx — Card fix + token alignment

**Card wrapper:**
- Replace: `border-0 shadow-lg`
- With: `border border-border shadow-none` (elevation via border, not shadow)

**Title:**
- Keep: `mb-6 text-center text-lg font-semibold`

**Form layout:**
- Replace: `gap-5`
- With: `gap-4` (standardize to 16px)

**Error box:**
- Keep: `bg-destructive/10 text-destructive` (already semantic)
- Ensure: `rounded-lg px-3 py-2 text-sm`

**Inputs:**
- Keep: `h-10` (acceptable, slightly taller for auth forms)
- Ensure: Uses Phase 2 input styling

**Loading spinner:**
- Keep existing custom spinner (functional)

**Link styling:**
- Replace: `text-primary` (keep)
- Ensure: `underline-offset-4 hover:underline`

### Step 4: signup-form.tsx — Same pattern as login

Apply same changes as login-form:
- Card: `border border-border shadow-none`
- Form gap: `gap-4`
- Input/button: Phase 2 base component styling

### Step 5: user-menu.tsx — Dropdown token alignment

- Trigger: Ensure uses `variant="ghost"` button styling
- Dropdown content: `bg-popover border-border rounded-lg`
- Menu items: `text-sm px-3 py-1.5 rounded-md hover:bg-accent`
- Avatar/initials: Keep existing pattern
- Sign out item: `text-destructive hover:bg-destructive/10`

### Step 6: api-key-manager.tsx — Replace hardcoded colors

**Error banner:**
- Replace: `border-destructive/50 bg-destructive/10`
- With: `border-destructive/30 bg-destructive/10` (keep semantic, slight opacity adjust)

**New key alert box:**
- Replace: `border-amber-500/50 bg-amber-50 dark:bg-amber-950/20`
- With: `border-status-review/40 bg-status-review-bg`
- Replace: `text-amber-800 dark:text-amber-300`
- With: `text-status-review-text`
- Replace: `text-amber-600 dark:text-amber-400`
- With: `text-status-review-text`

**Code block (API key display):**
- Replace: `bg-white dark:bg-black`
- With: `bg-surface-sunken`
- Keep: `px-3 py-2 font-mono text-sm rounded`

**Expired badge:** Keep `variant="destructive"` (already semantic)

**Key list items:**
- Keep: `divide-y` on list, `px-4 py-3` on items
- Ensure: `divide-border` not `divide-border/40`

## Todo List

- [ ] Update comment-list text opacity
- [ ] Update comment-form textarea styling
- [ ] Fix login-form card (border not shadow)
- [ ] Fix signup-form card (same as login)
- [ ] Verify user-menu uses semantic tokens
- [ ] Replace api-key-manager hardcoded amber/black/white colors
- [ ] Test auth flow (login + signup) visually
- [ ] Test API key generation UI
- [ ] Test comment submission
- [ ] Verify all components in dark mode
- [ ] Verify all components in light mode

## Success Criteria

1. No hardcoded color names in any supporting component (no amber-*, white, black)
2. Auth form cards visible with clear border in both themes
3. API key manager warning boxes use semantic status tokens
4. Code blocks use `bg-surface-sunken` consistently
5. All forms use standardized spacing

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Auth card too subtle with just border | Low | Add `bg-card` for slight elevation if needed |
| API key alert loses visual urgency without amber | Low | Status-review token maps to amber/yellow — similar visual weight |

## Security Considerations

- API key display already uses `select-all` for copy — no change
- Ensure API key is never exposed in DOM longer than necessary (existing behavior, no change)

## Next Steps

After Phase 5 (and Phases 3+4), proceed to [Phase 6: Polish & Responsive](./phase-06-polish-responsive.md).
