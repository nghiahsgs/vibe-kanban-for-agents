# Phase 01: UI/UX Redesign - Board & Cards

## Context
- [Research: Kanban UI/UX](./research/researcher-01-kanban-ui-ux.md)
- [Plan overview](./plan.md)

## Overview
Visual overhaul of the board layout, column design, task cards, header, and drag interactions. Goal: Linear/Notion-quality polish while keeping @hello-pangea/dnd and existing data flow.

## Key Insights (from research)
- Cards should show minimal info: title, priority dot, assignee badge
- Drag feedback: lift + shadow + slight rotation on drag-start
- Drop zones: subtle highlight on drag-over
- Column headers: status dot + label + count badge
- Empty states matter ("No tasks" with add CTA)
- Dark mode support via `next-themes` + shadcn dark variants

## Requirements
1. Install `next-themes` for dark mode toggle
2. Redesign task cards with left-border priority accent
3. Improve column styling with cleaner headers
4. Add dark mode toggle in header
5. Enhance drag feedback (shadow, opacity, scale)
6. Responsive: horizontal scroll on mobile, min-width columns
7. Better empty state per column

## Architecture
No structural changes. Pure visual layer updates to existing components.

```
src/app/layout.tsx          -- wrap with ThemeProvider
src/app/globals.css         -- keep existing, add utility classes if needed
src/components/board/
  board-header.tsx          -- add dark mode toggle, refine layout
  board-column.tsx          -- cleaner header, better drop zone styling
  task-card.tsx             -- priority left-border, tighter layout
  kanban-board.tsx          -- no logic changes, minor wrapper class tweaks
  board-skeleton.tsx        -- match new visual style
```

## Related Code Files
- `src/components/board/task-card.tsx` - current card with priority badges
- `src/components/board/board-column.tsx` - current column with color-coded bg
- `src/components/board/board-header.tsx` - title + filter + new task button
- `src/components/board/kanban-board.tsx` - DragDropContext wrapper
- `src/app/layout.tsx` - root layout, needs ThemeProvider
- `src/app/globals.css` - CSS variables and theme tokens

## Implementation Steps

### 1. Install next-themes
```bash
npm install next-themes
```

### 2. Add ThemeProvider to layout
- Edit `src/app/layout.tsx`: wrap `<body>` children with `<ThemeProvider attribute="class" defaultTheme="system" enableSystem>`
- Add `suppressHydrationWarning` to `<html>` tag

### 3. Redesign task-card.tsx
- Replace priority badge with **left border accent** (4px colored left border)
  - high: `border-l-red-500`, medium: `border-l-amber-500`, low: `border-l-emerald-500`
- Title: `text-sm font-medium leading-snug`, max 2 lines with `line-clamp-2`
- Assignee: small muted text below title (not badge)
- Card padding: `p-3`, rounded-lg, subtle border
- Drag state: `shadow-lg scale-[1.02] opacity-90 rotate-[1deg]`
- Hover state: `hover:shadow-md hover:border-border/80 transition-all duration-150`

### 4. Redesign board-column.tsx
- Remove colored backgrounds; use neutral `bg-muted/40 dark:bg-muted/20`
- Column header: clean horizontal layout with status dot + bold label + count
- Add "+" icon button in column header (triggers new task with pre-set status)
- Drop zone highlight: `bg-primary/5 border-2 border-dashed border-primary/20`
- Empty state: centered muted text with subtle icon
- Min-height: `min-h-[400px]` for better drop targets

### 5. Redesign board-header.tsx
- Left: app title "Vibe Kanban" with subtle icon/logo
- Right: filter select + dark mode toggle button + "+ New Task" button
- Dark mode toggle: use `useTheme()` from next-themes, Sun/Moon icon toggle
- Add shadcn `Tooltip` on dark mode button
- Install lucide-react icons if not present (Sun, Moon, Plus, Filter)

### 6. Update kanban-board.tsx wrapper
- Board container: `flex gap-5 overflow-x-auto pb-4 px-1` (slightly more gap)
- Scrollbar styling: thin scrollbar via CSS (`scrollbar-thin` or custom CSS)

### 7. Update board-skeleton.tsx
- Match new column/card visual style in skeleton placeholders

### 8. Add custom scrollbar CSS
- In `globals.css`, add thin scrollbar styles for `.overflow-x-auto`

## Todo
- [ ] Install next-themes
- [ ] Add ThemeProvider to layout.tsx
- [ ] Redesign task-card.tsx (left border, cleaner layout)
- [ ] Redesign board-column.tsx (neutral bg, better header, drop zone)
- [ ] Redesign board-header.tsx (dark mode toggle, layout polish)
- [ ] Update kanban-board.tsx wrapper classes
- [ ] Update board-skeleton.tsx
- [ ] Add scrollbar CSS
- [ ] Test light/dark mode toggle
- [ ] Test drag & drop still works correctly
- [ ] Test responsive behavior (mobile horizontal scroll)

## Success Criteria
- Board looks polished and modern in both light and dark mode
- Drag & drop works identically to current behavior
- Cards are scannable: title + priority + assignee visible at glance
- Dark mode toggles cleanly with no flash
- No regressions in task CRUD or filtering

## Risk Assessment
- **Low:** ThemeProvider hydration mismatch - mitigate with `suppressHydrationWarning`
- **Low:** @hello-pangea/dnd styling conflicts - test drag states thoroughly
- **Low:** Tailwind v4 dark mode syntax differences - use `dark:` prefix per existing pattern

## Security Considerations
None (pure UI changes).

## Next Steps
Proceed to Phase 02 (Dialogs & Forms) after board visual is complete.
