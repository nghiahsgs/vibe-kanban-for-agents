# Kanban Board UI/UX Design Patterns Research
**Research Date:** 2026-03-11
**Status:** Synthesis of 5 targeted searches | OSS & commercial inspiration

---

## 1. Top Open Source Kanban Projects

### Key Players
- **Planka** - React/Redux, Trello-like real-time updates, smooth modern feel
- **Focalboard** - Multi-view (Kanban, calendar, table, gallery), Mattermost-integrated, robust assignment system
- **WeKan** - Meteor-based, privacy-focused, highly customizable API/plugins, Trello familiar UX
- **Kanboard** - Lightweight, extensive plugin ecosystem, automation workflows
- **Ticky** - Modern, free, lean architecture (GitHub: dkorecko/Ticky)

**Design Pattern Takeaway:** Successful OSS Kanban boards balance **familiarity** (Trello-like) with **feature richness** (multi-view support). Real-time collaboration is table stakes. Self-hosted, customizable architectures win with enterprises.

---

## 2. Modern Kanban UX Patterns

### What Makes Premium Kanban (Linear, Notion, Trello)
1. **Visual Feedback** - Draggable elements signal affordance: subtle shadow/lift on hover, drag handles, cursor changes
2. **Drop Zone Clarity** - Live highlighting/animation when dragging over drop zones
3. **Card Design** - Minimal info density: title, assignee avatar, priority color, due date, 1-2 labels max
4. **Smooth Animations** - Items don't teleport; momentum-respecting transitions create physicality
5. **Touch-Friendly** - Enlarged drag handles, bigger tap targets on mobile/crowded boards
6. **Column Context** - Column headers clean and visual; count badges optional but helpful

### Card Information Hierarchy
- **Must-show:** Title, assignee avatar, due date badge
- **Nice-to-have:** Priority indicator (color dot or icon), label tags, subtask count
- **Avoid:** Metadata overload; use detail panels for secondary info

### Animations & Micro-interactions
- View Transitions API enables smooth state-to-state animations in modern browsers
- Dragover: items shift/create space (margin growth) for incoming card
- Drop: items settle into place with easing function
- Opacity change on drag (30% for dragged element) signals active state

---

## 3. Design Stack: shadcn/ui + Tailwind v4 + dnd-kit

### Production-Ready Examples
- **[React DnD Kit + Tailwind + shadcn/ui](https://github.com/Georgegriff/react-dnd-kit-tailwind-shadcn-ui)** - GitHub reference impl, MIT license, accessible, themeable
- **[Shadcn Kanban Board](https://github.com/janhesters/shadcn-kanban-board)** - Pure React, zero external deps, keyboard controls + screen reader, theming adapts to shadcn color scheme
- **[Shadcnuikit Kanban](https://shadcnuikit.com/dashboard/apps/kanban)** - Next.js template, full-featured dashboard integration
- **[Awesome shadcn/ui](https://github.com/birobirobiro/awesome-shadcn-ui)** - Curated collection with Kanban patterns

**Tech Stack Recommendation:**
- **Components:** shadcn/ui (Button, Card, Badge, Avatar, Popover for task details)
- **Styling:** Tailwind CSS v4 (utility-first, dark mode support built-in)
- **Drag/Drop:** @dnd-kit (modern, modular, accessible—successor to react-beautiful-dnd)
- **Animation:** Framer Motion or CSS View Transitions API

---

## 4. Drag & Drop UX Best Practices

### @hello-pangea/dnd (fork of react-beautiful-dnd)
- **Status:** Community-maintained, Atlassian original now EOL
- **Why Use:** Physics-based movement (respects momentum), multi-item drag, cross-list support
- **Accessibility:** Keyboard + screen reader support baked in, no extra work needed

### dnd-kit (Modern Alternative)
- **Status:** Active, lightweight, modular
- **Wins:** Sensors (pointer, keyboard, touch), collision detection, accessibility plugins
- **Best For:** Custom behavior, mobile/touch-first designs

### UX Dos & Don'ts
✓ **Do:** Provide visual feedback immediately on mousedown/touchstart
✓ **Do:** Highlight drop zones while dragging
✓ **Do:** Use handles for clarity (vs. drag entire card)
✓ **Do:** Support keyboard (arrow keys to move, Enter to drop)
✗ **Don't:** Animate rapidly; use easing (ease-out-cubic ~200-350ms for smooth feel)
✗ **Don't:** Hide drop zones until drag begins
✗ **Don't:** Force users to drag; allow keyboard/click alternatives

---

## 5. Actionable Design Recommendations for Vibe Kanban

### Card Layout (160px-280px width)
```
┌────────────────────┐
│ [Title] [Priority] │
│ ~2 lines max       │
├────────────────────┤
│ Label | Label      │
├────────────────────┤
│ [Avatar] Due: 3/15 │
└────────────────────┘
```
- Clean sans-serif title (truncate overflow)
- Single-color priority dot (top-right) or left border accent
- Colored labels (subtle background)
- Assignee avatar bottom-left, due date bottom-right

### Board Layout
- **Full-width columns** or **sidebar-togglable** for task details
- **Column header:** Bold title + task count badge (gray), optional: "+" button
- **Empty state:** "No tasks yet" messaging with subtle add button
- **Dark mode:** Support system preference; shadcn cards adapt naturally

### Drag Interaction
- **Visual:** Card lifts ~8px on drag-start, shadow darkens, opacity 0.8
- **Drop zone:** Subtle border highlight or background tint on hover
- **Animation:** 250ms cubic-bezier(0.4, 0, 0.2, 1) for settle (Tailwind's `ease-out`)
- **Mobile:** Show drag handle icon or larger tap target (48px min)

### Priority Indicators
- Use color-coded dots (left border of card or top-right corner)
  - Red: Urgent
  - Orange: High
  - Blue: Normal
  - Gray: Low
- Optional: 1-character badge ("U", "H", "N", "L") if more explicit needed

### Assignee & Metadata
- **Avatar:** 24px circular image, display on hover-over for full name
- **Due date:** Show only if set; use relative dates ("Due in 2d") or short format
- **Subtasks:** Badge showing "2/5" or progress bar (if not cluttering card)

### Dark Mode & Color Scheme
- Leverage shadcn's `dark:` variant support
- Card background: `bg-white dark:bg-slate-900`
- Priority colors should maintain contrast in both modes
- Use CSS custom properties or Tailwind config for consistent theming

---

## Key Takeaways

1. **Familiarity + Polish = Win** - Trello-like layouts work; differentiate via smooth micro-interactions and thoughtful affordances
2. **Information Scarcity** - Cards should encourage clicks for details; summarize ruthlessly on board view
3. **Accessibility First** - Keyboard nav, screen reader support, sufficient color contrast; not afterthought
4. **Animation Creates Delight** - 200-350ms drag/drop easing, momentum-based movement, visual feedback on every interaction
5. **Mobile-Friendly Drag** - Larger handles, touch-friendly drop targets, avoid hover-only affordances
6. **Stack Choice:** shadcn/ui (components) + Tailwind v4 (utility) + dnd-kit (drag) = production-grade, maintainable, accessible

---

## Sources

- [Multiboard: Top Open-Source Kanban Tools 2025](https://www.multiboard.dev/posts/top-open-source-kanban-tools)
- [TechRepublic: 7 Best Open Source Kanban Boards](https://www.techrepublic.com/article/open-source-kanban-boards/)
- [Eleken: Drag and Drop UI Examples & UX Tips](https://www.eleken.co/blog-posts/drag-and-drop-ui)
- [LogRocket: Designing Drag & Drop UIs](https://blog.logrocket.com/ux-design/drag-and-drop-ui-examples/)
- [Frontend.fyi: Drag & Drop with CSS View Transitions](https://www.frontend.fyi/tutorials/css-view-transitions-with-react)
- [GitHub: react-dnd-kit-tailwind-shadcn-ui](https://github.com/Georgegriff/react-dnd-kit-tailwind-shadcn-ui)
- [GitHub: shadcn-kanban-board](https://github.com/janhesters/shadcn-kanban-board)
- [GitHub: hello-pangea/dnd](https://github.com/hello-pangea/dnd)
- [hello-pangea/dnd Docs](https://dnd.hellopangea.com/)
- [Kanban Tool: Card Support](https://kanbantool.com/support/kanban-card)
- [Wrike: Kanban Cards Guide](https://www.wrike.com/kanban-guide/kanban-cards/)
- [WeKan GitHub](https://github.com/wekan/wekan)

---

**Unresolved Questions:** None—research scope complete. All major design patterns, tooling, and OSS references documented with actionable specs.
