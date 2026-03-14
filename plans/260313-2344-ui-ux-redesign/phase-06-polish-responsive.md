# Phase 6: Polish & Responsive

## Context

- **Parent plan:** [plan.md](./plan.md)
- **Dependencies:** [Phase 3](./phase-03-board-components.md), [Phase 4](./phase-04-dialog-components.md), [Phase 5](./phase-05-supporting-components.md)
- **Docs:** [Kanban UI Research](./research/researcher-01-kanban-ui-design.md) (accessibility, responsive patterns)

## Overview

- **Date:** 2026-03-13
- **Description:** Light mode validation, responsive testing, animation consistency, accessibility audit, final QA
- **Priority:** Medium
- **Implementation Status:** Complete
- **Review Status:** Passed

## Key Insights

- Light mode is currently broken — `white/[0.XX]` patterns only work on dark backgrounds
- After Phases 1-5 replace all `white/[0.XX]` with semantic tokens, light mode should auto-fix
- Transitions vary: `transition-all duration-200` (cards), `transition-colors` (buttons) — standardize
- Missing accessibility: loading state announcements, comment list role, some ARIA labels
- Mobile kanban typically uses horizontal scroll for columns

## Requirements

1. Validate light mode renders correctly with all new tokens
2. Ensure responsive behavior on mobile (< 640px)
3. Standardize transition durations to `--duration-normal` (150ms)
4. Add missing accessibility attributes
5. Final visual QA across all components

## Architecture

This phase is cross-cutting — touches all files modified in Phases 1-5 for polish passes. No new architecture, just refinement.

## Related Code Files

All files from Phases 1-5, plus:
- `src/app/globals.css` — Light mode token validation
- `src/app/layout.tsx` — Meta tags, viewport
- `src/components/board/kanban-board.tsx` — Main board layout (responsive)
- `src/components/board/board-provider.tsx` — Context provider (no styling)

## Implementation Steps

### Step 1: Light Mode Validation

**Test each token pair for WCAG AA contrast (4.5:1):**

| Token | Light Value | On Background | Contrast |
|-------|-------------|---------------|----------|
| `--foreground` | #18181b | #fafafa | ~15.4:1 (pass) |
| `--muted-foreground` | #71717a | #fafafa | ~5.0:1 (pass) |
| `--status-todo` | #71717a | #fafafa | ~5.0:1 (pass) |
| `--status-in-progress-text` | #6366f1 | #fafafa | ~4.6:1 (borderline) |
| `--status-review-text` | #d97706 | #fafafa | ~4.2:1 (may need darker) |
| `--status-done-text` | #059669 | #fafafa | ~4.5:1 (borderline) |
| `--priority-high-text` | #dc2626 | #fafafa | ~5.6:1 (pass) |

**Adjustments needed:**
- If `--status-review-text` fails: darken to `#b45309` (~5.5:1)
- If `--status-done-text` fails: darken to `#047857` (~5.3:1)
- If `--status-in-progress-text` fails: darken to `#4f46e5` (~5.9:1)

Test by toggling theme and visually inspecting:
1. Board columns visible against background
2. Cards visible against columns
3. All text readable
4. Badges legible
5. Inputs have visible borders

### Step 2: Responsive Layout

**kanban-board.tsx — Column layout:**
- Current: Horizontal flex with `overflow-x-auto`
- Mobile (< 640px): Keep horizontal scroll (standard kanban mobile pattern)
- Ensure: `min-w-[280px]` on columns (prevents squishing)
- Add: `snap-x snap-mandatory` for horizontal scroll snapping on mobile
- Column: Add `snap-start` class

**Dialogs — Mobile fullscreen:**
- Dialogs already have `max-w-[calc(100%-2rem)]` from shadcn (good)
- Large dialogs (`sm:max-w-2xl`): Ensure `max-h-[90vh] overflow-y-auto`
- Test: Agent onboarding and task detail scroll properly on mobile

**Board header — Responsive wrapping:**
- Add: `flex-wrap` to header wrapper for small screens
- Filter selects: Ensure they don't overflow on narrow viewports

**Board switcher:**
- Replace: `max-w-[240px]`
- With: `max-w-[min(240px,50vw)]` (responsive truncation)

### Step 3: Animation Consistency

**Standardize all transitions to use duration tokens:**

Search and replace across all components:
- `duration-200` -> `duration-150` (standardize)
- `transition-all` -> `transition-colors` where only color changes (performance)

**Card hover:** `transition-colors duration-150`
**Button hover:** Already `transition-colors` (keep)
**Dialog enter:** Keep shadcn data-state animations (150ms)

**Add to globals.css:**
```css
/* Utility classes for consistent transitions */
@layer utilities {
  .transition-theme {
    transition-property: color, background-color, border-color;
    transition-duration: 150ms;
    transition-timing-function: ease-in-out;
  }
}
```

### Step 4: Accessibility Improvements

**Missing attributes to add:**

1. **Comment list:** Add `role="list"` to container, `role="listitem"` to comments
2. **Loading states:** Add `aria-busy="true"` to loading containers
3. **Board columns:** Add `aria-label` with status name (e.g., `aria-label="Todo column, 3 tasks"`)
4. **Drag handle:** Ensure task cards have `aria-roledescription="draggable item"`
5. **Filter selects:** Add `aria-label="Filter by status"` etc.
6. **Dialog close buttons:** Verify `aria-label="Close"` present
7. **Empty states:** Add `role="status"` for dynamic empty messages

**Focus management:**
- Ensure focus ring uses `ring-ring` token (already set up)
- Verify tab order through board header actions
- Verify focus trap works in all dialogs

### Step 5: Meta Tags + PWA Basics

In `layout.tsx`:
```tsx
<meta name="theme-color" content="#0f0f0f" media="(prefers-color-scheme: dark)" />
<meta name="theme-color" content="#fafafa" media="(prefers-color-scheme: light)" />
```

### Step 6: Final Visual QA Checklist

Run through each screen:

1. **Board view (dark mode)**
   - [ ] Columns have visible borders
   - [ ] Cards distinguish from column background
   - [ ] Status dots correct color per column
   - [ ] Priority left borders visible
   - [ ] Drag state clearly visible
   - [ ] Empty column state readable

2. **Board view (light mode)**
   - [ ] Same checks as dark mode
   - [ ] No washed-out text
   - [ ] Borders visible

3. **All 6 dialogs (both modes)**
   - [ ] Overlay visible
   - [ ] Consistent padding
   - [ ] Buttons aligned right
   - [ ] Forms functional

4. **Auth pages (both modes)**
   - [ ] Card has visible boundary
   - [ ] Inputs clearly bordered
   - [ ] Error states visible

5. **Mobile (< 640px)**
   - [ ] Board scrolls horizontally
   - [ ] Dialogs fit viewport
   - [ ] Header wraps gracefully
   - [ ] Text readable at default zoom

## Todo List

- [ ] Validate light mode contrast ratios for all status/priority tokens
- [ ] Adjust any failing contrast values
- [ ] Add snap scroll to mobile board layout
- [ ] Make board header responsive (flex-wrap)
- [ ] Make board switcher truncation responsive
- [ ] Standardize transition durations to 150ms
- [ ] Add `.transition-theme` utility class
- [ ] Add ARIA attributes to comment list
- [ ] Add ARIA attributes to board columns
- [ ] Add aria-busy to loading states
- [ ] Add theme-color meta tags
- [ ] Run full visual QA checklist (dark mode)
- [ ] Run full visual QA checklist (light mode)
- [ ] Run full visual QA checklist (mobile)

## Success Criteria

1. Light mode fully functional — all text passes WCAG AA contrast
2. Mobile board usable with horizontal scroll + snap
3. All transitions use consistent 150ms duration
4. No accessibility warnings from basic audit
5. Theme-color meta tags present
6. Visual QA checklist passes for all 3 contexts (dark/light/mobile)

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Light mode contrast failures | High | Pre-calculate contrast ratios; have fallback darker values ready |
| Snap scroll interferes with drag-drop | Medium | Test; may need to disable snap during drag |
| ARIA changes cause hydration warnings | Low | Use client-only dynamic ARIA values if needed |

## Security Considerations

None.

## Next Steps

Phase 6 is the final phase. After completion:
- Tag release as `v2.0.0-redesign`
- Update screenshots in README if applicable
- Consider future improvements: custom themes, animation presets, component playground
