# UI/UX Audit Report — Vibe Kanban

**Date:** 2026-03-13 | **Scope:** Full UI component catalog & styling analysis  
**Objective:** Document current styling patterns for complete UI redesign

---

## Executive Summary

Vibe Kanban uses a modern dark-first design with semantic Tailwind tokens, but suffers from **hardcoded color classes scattered throughout components**. The design is relatively clean but lacks consistency in:
- Spacing standardization (mix of `gap-1.5`, `gap-2.5`, `gap-3`, etc.)
- Color naming (inline color strings vs. semantic tokens)
- Border/shadow patterns (inconsistent transparency use)
- Dialog/modal styling (spacing varies per component)

**Key Findings:**
- **Design System:** Mostly token-based (good), but hardcoded colors break consistency
- **Spacing:** Inconsistent gap/padding patterns across similar components
- **Colors:** Heavy use of `white/[0.XX]` and `blue-400`, `amber-400`, `emerald-400` hardcoded
- **Typography:** Consistent (Inter + Fira Code), sizing varies (`text-xs`, `text-sm`, `text-base`)
- **Animations:** Minimal, only drag interactions and theme toggle
- **Accessibility:** Basic focus states but some missing ARIA labels

---

## Theme Configuration

### File: `src/app/globals.css`

**Current State:**
- Light mode: `#fafafa` bg, `#18181b` text (light gray + dark text)
- Dark mode: `#0f0f0f` bg, `#e4e4e7` text (pure black + light gray) — inspired by vibe-mind-map/Cursor
- Radius: Base `0.625rem` with calculated variants (`sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `4xl`)
- All color tokens exported via `@theme` for Tailwind v4

**Issues Found:**
1. Dark theme has very high contrast (`#0f0f0f` + `#e4e4e7`) — readability OK but harsh
2. Border color in dark mode uses `rgba(255, 255, 255, 0.08)` — very subtle, sometimes invisible
3. Input colors use `rgba(255, 255, 255, 0.06)` — extremely subtle background
4. Scrollbar styling hardcoded to dark aesthetic (`rgba(255, 255, 255, 0.1)`) — not respect light mode

**Styling Patterns:**
- Semantic tokens: `--background`, `--foreground`, `--card`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`
- Chart colors (5 variants): Indigo → Purple gradient
- Sidebar tokens: Duplicate light/dark modes
- Border layer: `* { @apply border-border outline-ring/50 }`
- Base: `body { @apply bg-background text-foreground }`

**Spacing:**
- No explicit spacing scale defined in CSS
- Tailwind defaults used throughout (no custom scale)

---

## Root Layout & Fonts

### File: `src/app/layout.tsx`

**Current State:**
- Fonts: `Inter` (main), `Fira_Code` (mono) from Google Fonts
- ThemeProvider: `next-themes` with system detection
- HTML lang: `en`, suppress hydration warnings enabled

**Issues:**
- No `<meta name="theme-color">` tag for mobile UI theming
- No description meta tags for social sharing

---

## Board Header Component

### File: `src/components/board/board-header.tsx`

**Current State:**
```tsx
Wrapper: flex, gap-1.5, mb-6 pb-4 border-b
Filter Select: w-[160px] h-8 text-xs
Divider: w-px h-5 bg-border (2x)
Agent Button: variant="outline" size="sm" h-8 text-xs
Theme Toggle: variant="ghost" size="icon" h-8 w-8
New Task Button: size="sm" h-8 px-3 text-xs font-semibold
```

**Issues Found:**
1. Gap inconsistency: `gap-1.5` between items (should be semantic)
2. Divider color: `bg-border` — very subtle in dark mode
3. Icon sizes: `h-3.5 w-3.5` — hardcoded, not scaled
4. No visual feedback for active filter selection

**Styling Patterns:**
- Flex-based layout with inline gaps
- Small text/buttons (`text-xs`, `h-8`)
- Outline variant buttons for secondary actions
- Ghost variant for icon-only buttons

---

## Board Column Component

### File: `src/components/board/board-column.tsx`

**Current State:**
```tsx
Column Wrapper: min-w-[280px] flex-1 rounded-xl border-white/[0.06] bg-white/[0.02]
Header: gap-2.5 px-4 py-2.5 border-b-white/[0.06]
Status Dot: w-2 h-2 rounded-full
Status Label: text-xs uppercase tracking-widest text-zinc-500
Count Badge: text-[10px] font-semibold px-1.5 py-0.5 rounded
```

**Issues Found:**
1. **Hardcoded colors per status:**
   - `todo`: `bg-zinc-400` (gray dot), `bg-white/[0.05]` count
   - `in_progress`: `bg-blue-400` (blue dot), `bg-blue-500/10` count
   - `review`: `bg-amber-400` (amber dot), `bg-amber-500/10` count
   - `done`: `bg-emerald-400` (green dot), `bg-emerald-500/10` count
2. Border/bg use white transparency (`white/[0.06]`, `white/[0.02]`) instead of semantic tokens
3. No hover states for drag interaction indication
4. Droppable area has `bg-indigo-500/[0.04]` on drag — not consistent with theme

**Spacing Patterns:**
- Column header: `px-4 py-2.5`
- Gap between label/count: `gap-2.5`
- Droppable min-height: `min-h-[200px]`
- Empty state: `min-h-[160px]`

---

## Task Card Component

### File: `src/components/board/task-card.tsx`

**Current State:**
```tsx
Card Wrapper: rounded-xl border-white/[0.06] border-l-[3px] px-3.5 py-3
Card BG: bg-white/[0.03] dark:bg-white/[0.03]
Hover State: hover:bg-white/[0.06] hover:border-white/[0.1]
Drag State: ring-1 ring-indigo-500/40 shadow-lg shadow-indigo-500/10
```

**Issues Found:**
1. **Hardcoded priority border colors:**
   - `high`: `border-l-red-400`
   - `medium`: `border-l-amber-400`
   - `low`: `border-l-emerald-400`
2. **Hardcoded priority badges:**
   - `high`: `bg-red-500/10 text-red-400`
   - `medium`: `bg-amber-500/10 text-amber-400`
   - `low`: `bg-emerald-500/10 text-emerald-400`
3. Card background uses `bg-white/[0.03]` (0.03 opacity) — very dark, barely distinguishable
4. Hover state only slightly lighter (`bg-white/[0.06]`) — subtle transition
5. Drag state uses hardcoded indigo (`ring-indigo-500/40`, `shadow-indigo-500/10`)
6. Title truncation: `line-clamp-2` — no configurable limit
7. Icon sizes hardcoded: `h-3 w-3` for user icon, not scaled

**Spacing Patterns:**
- Card padding: `px-3.5 py-3`
- Metadata row gap: `gap-1.5`
- Bottom spacing: `mt-2.5`

---

## Board Switcher Component

### File: `src/components/board/board-switcher.tsx`

**Current State:**
```tsx
Trigger: gap-2 h-9 px-2 rounded-lg font-bold text-xl tracking-tight
Kanban Icon: h-5 w-5 shrink-0
Display Name: max-w-[240px] truncate
Chevron: h-4 w-4 text-muted-foreground/70
```

**Issues Found:**
1. Trigger button has no explicit `variant` — uses default (primary button)
2. Icon color: hardcoded `text-foreground` — should use token
3. Chevron color: `text-muted-foreground/70` — good, but inconsistent with other icons
4. Max-width hardcoded: `max-w-[240px]` — not responsive
5. No loading state styling visible
6. Settings button: `opacity-0 group-hover:opacity-100` — only visible on hover (good UX)

**Spacing Patterns:**
- Gap between icon/name: `gap-2`
- Dropdown content width: `w-56`
- Settings button padding: `p-1`

---

## Agent Onboarding Dialog

### File: `src/components/board/agent-onboarding-dialog.tsx`

**Current State:**
```tsx
Dialog: sm:max-w-2xl max-h-[90vh] overflow-y-auto
Tabs: gap-1 p-1 rounded-lg bg-muted/50
Tab Button: flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
Active Tab: bg-background shadow-sm
```

**Issues Found:**
1. **Complex nested spacing:**
   - Section headers: `gap-2 text-sm font-semibold`
   - Section content: `space-y-3 pl-6` (inset for visual hierarchy)
   - Subsections: `space-y-1.5`
2. **Form input styling:**
   - Labels: `text-xs font-medium text-muted-foreground`
   - Inputs use base component (no custom styling)
3. **Agent list styling:**
   - Avatar: `h-8 w-8 rounded-full bg-primary/10`
   - Dividers: `divide-y divide-border/40` (40% opacity)
4. **Textarea styling:**
   - `w-full min-h-[280px] rounded-lg border-border/60 bg-muted/40 dark:bg-black/20`
   - Very dark background in dark mode (`bg-black/20`)
   - Padding: `p-3`
5. **Color indicators:**
   - Status dot: `Circle` icon `h-2 w-2 fill-emerald-500 text-emerald-500`
   - Hardcoded emerald color

**Spacing Patterns:**
- Dialog main gap: `space-y-6`
- Section gap: `space-y-3`
- Label gap: `space-y-1.5`
- Grid layout: `grid-cols-2 gap-3`

---

## Board Create/Settings Dialogs

### File: `src/components/board/board-create-dialog.tsx` & `board-settings-dialog.tsx`

**Current State:**
```tsx
Dialog: sm:max-w-md
Form: space-y-4 mt-2
Labels: text-sm font-medium
Inputs: standard Input component
Checkboxes: h-4 w-4 rounded border-border accent-primary
API Key Display: rounded border-amber-500/40 bg-amber-500/10
```

**Issues Found:**
1. **Warning/alert styling:**
   - Border: `border-amber-500/40`
   - Background: `bg-amber-500/10`
   - Text: `text-amber-600 dark:text-amber-400`
   - Consistent amber theme for warnings
2. **Code blocks:**
   - Background: `bg-muted`
   - Font: `font-mono`
   - Size: `text-xs`
   - Class: `select-all` for easy copy
3. **Confirmation state:**
   - Delete button changes variant: `variant={confirmDelete ? "destructive" : "ghost"}`
4. **Required field indicator:**
   - Asterisk: `<span className="text-destructive">*</span>`

**Spacing Patterns:**
- Form gap: `space-y-4`
- Label/input: `space-y-1.5`
- Button group: `flex justify-end gap-2`
- Alert padding: `p-4` or `p-3`

---

## Task Form & Detail Dialogs

### File: `src/components/task/task-form-dialog.tsx` & `task-detail-dialog.tsx`

**Task Form:**
```tsx
Dialog: sm:max-w-md
Form: space-y-5 mt-3
Labels: text-sm font-medium
Textarea: rows={4} resize-none
Inputs: standard Input component
```

**Task Detail:**
```tsx
Dialog: sm:max-w-2xl max-h-[85vh] overflow-y-auto
Title: text-xl font-semibold
Header Actions: gap-1 shrink-0 mt-0.5
Metadata Grid: grid-cols-2 gap-x-6 gap-y-4
Badge Styling:
  - Status: variant="secondary"
  - Priority: custom CSS per priority
Description Box: border bg-muted/30 px-4 py-3
```

**Issues Found:**
1. **Priority colors in detail view:**
   ```
   high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
   medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
   low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
   ```
   - Hardcoded color values, doesn't match card priority colors
   - Inconsistent with card styling (different shades/opacity)
2. **Metadata labels:**
   - Style: `text-xs uppercase tracking-wide text-muted-foreground font-medium`
   - Consistent across all metadata rows
3. **Comments section:**
   - Border separator: `border-t`
   - Max-height with scroll: `max-h-64 overflow-y-auto`
4. **Form field spacing:**
   - Top-level: `space-y-5`
   - Label sections: `space-y-1.5`
   - Form end: `flex justify-end gap-2 pt-2`

---

## Comment List Component

### File: `src/components/task/comment-list.tsx`

**Current State:**
```tsx
Comment Container: flex gap-3
Avatar: h-8 w-8 rounded-full text-white text-xs font-semibold shrink-0
Avatar Colors: 8-color palette (blue-500, violet-500, emerald-500, amber-500, rose-500, cyan-500, pink-500, indigo-500)
Author: text-sm font-medium leading-none
Timestamp: text-xs text-muted-foreground
Content: text-sm text-foreground/80 leading-relaxed
Container: space-y-4 max-h-64 overflow-y-auto
Empty State: py-6 text-center text-sm text-muted-foreground
```

**Issues Found:**
1. **Avatar colors hardcoded:**
   - 8 fixed colors in array
   - No semantic mapping to user/status
2. **Content rendering:**
   - Uses `renderMarkdown()` utility
   - No syntax highlighting for code blocks
3. **Spacing:** Generous `gap-3` and `space-y-4` but small container (`max-h-64`)

---

## Login Form Component

### File: `src/components/auth/login-form.tsx`

**Current State:**
```tsx
Card: border-0 shadow-lg
Title: mb-6 text-center text-lg font-semibold
Form: flex flex-col gap-5
Labels: text-sm font-medium
Inputs: h-10
Error Box: rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive
Button: h-10 w-full font-medium
Link: font-medium text-primary underline-offset-4 hover:underline
Loading Spinner: h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent
```

**Issues Found:**
1. **Card styling:**
   - `border-0` removes any visual separation in light mode
   - `shadow-lg` may not be visible in dark mode
2. **Error display:**
   - Background: `bg-destructive/10`
   - Text: `text-destructive`
   - Good contrast but no icon
3. **Form layout:**
   - Vertical flex with `gap-5` — good spacing
   - Labels placed above inputs
4. **Loading state:**
   - Spinner + text "Signing in..."
   - Custom spinner CSS with border animation

---

## API Key Manager Component

### File: `src/components/settings/api-key-manager.tsx`

**Current State:**
```tsx
Error Banner: border-destructive/50 bg-destructive/10 px-4 py-3
Alert Box (New Key): border-amber-500/50 bg-amber-50 dark:bg-amber-950/20 p-4
  - Text: text-amber-800 dark:text-amber-300
  - Icon: text-amber-600 dark:text-amber-400
Code Block: bg-white dark:bg-black px-3 py-2 font-mono
Expired Badge: variant="destructive"
Keys List: divide-y
Key Item: flex gap-3 px-4 py-3
```

**Issues Found:**
1. **Light mode alert background:**
   - `bg-amber-50` — very light, may have contrast issues
   - Should use semantic token instead
2. **Code styling:**
   - Light: `bg-white`
   - Dark: `bg-black`
   - Hardcoded colors instead of tokens
3. **List dividers:**
   - `divide-y` on ul, `py-3` on items
   - Standard list pattern
4. **Expiry indicators:**
   - Badge variant: `destructive` (red background)
   - Text labels: `text-xs text-muted-foreground`

---

## Base UI Components

### Files: `src/components/ui/button.tsx`, `dialog.tsx`, `card.tsx`

**Button Component:**
```tsx
Base: inline-flex shrink-0 items-center justify-center rounded-lg border transition-all
Focus: focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50
Active: active:translate-y-px (click feedback)
Disabled: disabled:pointer-events-none disabled:opacity-50
Variants:
  - default: bg-primary text-primary-foreground shadow-sm hover:bg-primary/90
  - outline: border-border bg-background hover:bg-muted
  - secondary: bg-secondary text-secondary-foreground hover:bg-secondary/80
  - ghost: hover:bg-muted
  - destructive: bg-destructive/10 text-destructive hover:bg-destructive/20
  - link: text-primary underline-offset-4 hover:underline
Sizes: xs, sm, default, lg, icon variants with data attributes
```

**Issues Found:**
1. Outline variant uses dark-specific CSS: `dark:border-input dark:bg-input/30`
2. No native button disabled styles respected
3. Icon size defaults: `[&_svg:not([class*='size-'])]:size-4` — good fallback

**Dialog Component:**
```tsx
Overlay: bg-black/10 backdrop-blur-xs duration-100
Content: max-w-[calc(100%-2rem)] rounded-xl bg-background ring-1 ring-foreground/10
Header: flex flex-col gap-2
Footer: flex-col-reverse sm:flex-row bg-muted/50 border-t rounded-b-xl
Close Button: position absolute top-2 right-2
```

**Issues Found:**
1. Overlay blur: `backdrop-blur-xs` — extremely subtle, barely visible
2. Content gap: `gap-4` — generous spacing
3. Footer has conditional reverse layout (mobile vs desktop)

**Card Component:**
```tsx
Wrapper: rounded-xl bg-card ring-1 ring-foreground/10
Padding: py-4 px-4 (or py-3 px-3 for sm size)
Header: grid with auto-rows-min
Footer: flex border-t bg-muted/50 rounded-b-xl
```

**Issues Found:**
1. Ring color: `ring-foreground/10` — very subtle border
2. Card backgrounds use semantic `--card` token (good)
3. Footer styling mirrors dialog footer

---

## Consistency Issues Summary

### Spacing Inconsistencies
| Component | Gap Pattern | Gap Size |
|-----------|------------|----------|
| Header | gap-1.5 | 6px |
| Column | gap-2.5 | 10px |
| Dialog | space-y-4, space-y-6 | 16px, 24px |
| Form | space-y-5 | 20px |
| Agent | space-y-3 | 12px |

**Recommendation:** Standardize to 3-tier spacing scale: `gap-2` (8px), `gap-3` (12px), `gap-4` (16px)

### Color Naming Issues
| Component | Color Use | Pattern |
|-----------|-----------|---------|
| Column | `bg-white/[0.06]`, `bg-white/[0.02]` | Transparency |
| Card | `bg-white/[0.03]` | Transparency |
| Priority | `border-l-red-400`, `text-red-400` | Hardcoded names |
| Status | `bg-zinc-400`, `bg-blue-400` | Mixed naming |
| Dialog | `border-ring`, `ring-foreground/10` | Semantic + token mix |

**Recommendation:** Create semantic color tokens for status/priority instead of hardcoding

### Border/Shadow Patterns
- Subtle borders: `ring-1 ring-foreground/10` (used everywhere)
- Subtle borders (alt): `border border-white/[0.06]` (used in columns)
- Shadows: `shadow-sm`, `shadow-lg`, `shadow-indigo-500/10` (mixed)
- Card dividers: `divide-y`, `divide-border/40` or plain `border-t`

**Recommendation:** Unify border pattern across all components

---

## Typography Summary

| Element | Font | Size | Weight | Line Height |
|---------|------|------|--------|-------------|
| Page title | Inter | text-xl | font-bold | - |
| Section header | Inter | text-sm | font-semibold | - |
| Label | Inter | text-xs | font-medium | - |
| Body text | Inter | text-sm | normal | leading-relaxed |
| Code/mono | Fira Code | text-xs | varies | - |
| Task title | Inter | text-[13px] | font-medium | leading-snug |
| Metadata | Inter | text-xs | varies | - |

**Consistency:** Good — limited set of sizes, consistent weight mapping

---

## Animation & Interaction Patterns

**Found:**
1. Drag animations: Handled by `@hello-pangea/dnd` library
2. Theme toggle: No transition, instant switch
3. Hover states: `transition-all duration-200` (cards), `transition-colors` (buttons)
4. Focus states: Focus ring on all interactive elements
5. Loading states: Spinner animation `animate-spin`
6. Dialog open/close: `data-open:animate-in`, `data-closed:animate-out` (base-ui)

**Issues:**
- Inconsistent transition durations
- No page transition animations
- Modals appear instantly on desktop
- No loading skeleton components

---

## Accessibility Findings

**Good:**
- Semantic HTML (forms, labels with `htmlFor`)
- Focus visible states with ring
- ARIA labels on icon buttons (`aria-label="..."`)
- Role attributes on dropdowns (inherited from base-ui)

**Missing:**
- No `aria-label` on theme toggle (has `aria-label` — good)
- No loading state ARIA announcements
- Comment list has no `role="list"`
- Some hardcoded colors may fail WCAG contrast in light mode

**Recommendation:** Audit color contrast ratios in light mode

---

## File Structure Inventory

### UI Component Files
- `src/components/board/board-header.tsx` — Header bar + filters
- `src/components/board/board-column.tsx` — Kanban column container
- `src/components/board/task-card.tsx` — Individual task card
- `src/components/board/board-switcher.tsx` — Board selector dropdown
- `src/components/board/agent-onboarding-dialog.tsx` — Agent setup modal
- `src/components/board/board-create-dialog.tsx` — Create board modal
- `src/components/board/board-settings-dialog.tsx` — Board settings modal
- `src/components/task/task-form-dialog.tsx` — Task create/edit modal
- `src/components/task/task-detail-dialog.tsx` — Task detail view modal
- `src/components/task/comment-list.tsx` — Comment display
- `src/components/task/comment-form.tsx` — Comment input (not analyzed)
- `src/components/task/delete-task-dialog.tsx` — Delete confirmation (not analyzed)
- `src/components/auth/login-form.tsx` — Login page form
- `src/components/auth/user-menu.tsx` — User account dropdown (not analyzed)
- `src/components/settings/api-key-manager.tsx` — API key management

### Base UI Component Files
- `src/components/ui/button.tsx` — CVA-based button with 6 variants
- `src/components/ui/dialog.tsx` — Base-UI dialog wrapper
- `src/components/ui/card.tsx` — Card container with subcomponents
- `src/components/ui/input.tsx` — Text input (not analyzed)
- `src/components/ui/label.tsx` — Form label (not analyzed)
- `src/components/ui/textarea.tsx` — Textarea input (not analyzed)
- `src/components/ui/select.tsx` — Select dropdown (not analyzed)
- `src/components/ui/dropdown-menu.tsx` — Dropdown menu (not analyzed)
- `src/components/ui/badge.tsx` — Badge component (not analyzed)
- `src/components/ui/separator.tsx` — Divider (not analyzed)

### Style Files
- `src/app/globals.css` — Theme tokens, animations, scrollbar
- `src/app/layout.tsx` — Root HTML setup, fonts

---

## Redesign Constraints & Opportunities

### Constraints
1. **Breaking changes:** Changing hardcoded colors requires updates in 8+ components
2. **Library dependencies:** Button, dialog, card use base-ui React library — style structure locked
3. **Drag library:** @hello-pangea/dnd styling inherited, limited customization
4. **Dark mode first:** Current design assumes dark theme — light mode has issues

### Opportunities
1. **Create semantic color tokens** for status/priority instead of hardcoding
2. **Standardize spacing scale** using 3-4 tier system
3. **Unify border/shadow patterns** globally
4. **Extract spacing to CSS variables** in globals.css
5. **Create reusable dialog layouts** for consistent form styling
6. **Build component variants** for common patterns (alerts, code blocks, etc.)
7. **Improve light mode** — test contrast ratios, adjust backgrounds
8. **Add animations** — page transitions, loading states, skeleton screens

---

## Next Steps

1. **Define new color system** — semantic tokens for status/priority
2. **Create spacing scale** — CSS variables for consistent gaps/padding
3. **Audit light mode** — WCAG contrast testing
4. **Build component library** — variants for alerts, badges, empty states
5. **Update hardcoded colors** — replace with semantic tokens progressively
6. **Test animations** — add smooth transitions, loading states
7. **Create design tokens documentation** — for consistent implementation

---

## Unresolved Questions

1. **Mobile responsiveness:** Some hardcoded widths (`max-w-[160px]`, `max-w-[240px]`) — should these be responsive?
2. **Light mode viability:** Current light mode barely tested — redesign for light or deprecate?
3. **Color semantics:** Should status colors (todo/in-progress/done) match priority colors (low/medium/high)?
4. **Dialog sizing:** Current modals use fixed `max-w-md` or `max-w-2xl` — any responsive needs?
5. **Accessibility:** Should focus states be more prominent? Current ring is subtle.

