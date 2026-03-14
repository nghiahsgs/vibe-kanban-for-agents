# Kanban Board UI/UX Design Research
**Dark-Mode-First Modern Patterns & Actionable Decisions**

---

## Executive Summary

Modern kanban boards (Linear, Plane, GitHub Projects) converge on: **minimal color use, semantic typography, elevated card designs via borders/overlays (not shadows), and desaturated accent colors**. Linear's 2025 approach—monochrome neutrals with single bold accent—exemplifies the trend. Dark mode requires careful surface layering and contrast management.

---

## 1. Color Palette & Dark Mode Setup

### Background Strategy
- **Base background**: #0f0f0f or #121212 (dark gray, not pure black)
- **Card/Surface variant 1**: #1A1A1A (elevated content)
- **Surface variant 2**: #232323 (additional depth for modals, panels)
- **Text primary**: #FFFFFF or #F5F5F5 (soft white, reduces glare)
- **Text secondary**: #A0A0A0 to #B8B8B8 (readable, not washed)

**Rationale**: Pure black (#000000) causes eye strain. Layered dark grays create visual hierarchy without relying on shadows (less visible in dark UIs).

### Accent Color System (Linear's Approach)
Linear uses **LCH color space** (perceptually uniform) instead of HSL. For dark themes, they define:
- **Primary accent**: Indigo or deep blue (calm authority, minimalist feel)
  - Example: `oklch(0.65 0.25 260)` (indigo region)
- **Base color**: Monochromatic neutrals
- **Contrast modifier**: Auto-scales lighter/darker for accessibility (3:1 to 7:1 ratios)

**Semantic tokens** (CSS variable pattern):
```css
.dark {
  --background: #0f0f0f;
  --foreground: #f5f5f5;
  --card: #1a1a1a;
  --card-foreground: #e0e0e0;
  --primary: #6366f1;           /* Indigo accent */
  --primary-foreground: #0f0f0f;
  --destructive: #ef4444;       /* Red for critical */
  --secondary: #64748b;         /* Slate for muted */
}
```

### Contrast Requirements (WCAG)
- Body text: **4.5:1 minimum** (#F5F5F5 on #0f0f0f = ~16:1 ✓)
- Large text (18px+): 3:1 minimum
- **Avoid**: gray-on-black (washed out)

---

## 2. Card Design Patterns

### Elevation via Borders & Overlays (Not Shadows)
Dark mode shadows are invisible. Instead:

**Card structure:**
```css
/* Elevated card */
.card {
  background: #1a1a1a;
  border: 1px solid #262626;    /* Subtle border conveys elevation */
  border-radius: 8px;
  padding: 12px 14px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05); /* Top light edge */
}

/* Hover state (lift effect) */
.card:hover {
  background: #202020;          /* Slightly lighter */
  border-color: #303030;
}
```

**Key principle**: Use **light overlays** (inset shadows, subtle gradients) and **border color variation** instead of external shadows.

### Spacing & Typography on Cards
- **Card padding**: 12px horizontal, 8px vertical (compact for scanability)
- **Title**: 14px semi-bold (#f5f5f5)
- **Subtitle**: 12px regular (#a0a0a0)
- **Gap between elements**: 6-8px

---

## 3. Column Headers & Board Layout

### Header Styling
```css
.column-header {
  background: #0f0f0f;          /* Matches board bg for seamless look */
  border-bottom: 1px solid #1a1a1a;
  padding: 12px 14px;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #64748b;               /* Muted, not primary */
}
```

### Card Count Badge
```css
.column-count {
  font-size: 12px;
  color: #808080;
  background: transparent;
  margin-left: 4px;
  font-weight: 500;
}
```

**Pattern**: Muted headers reduce visual noise. Indigo accent on active/hover states only.

---

## 4. Status & Priority Color Coding

### Standard Priority Palette
| Priority | Color | Usage |
|----------|-------|-------|
| Critical | #ef4444 (red) | Indicator dot or left border |
| High | #f97316 (orange) | Warm accent |
| Medium | #eab308 (amber) | Neutral/balanced |
| Low | #10b981 (emerald) | Cool, safe |
| Blocked | #8b5cf6 (purple) | Special status |

**Implementation**: Use as **left border accent** (4px) on cards, not full background (too noisy).

```css
.card.priority-critical {
  border-left: 4px solid #ef4444;
}
```

### Status Badges
```css
.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  background: rgba(99, 102, 241, 0.1);   /* Indigo, 10% opacity */
  color: #6366f1;
}

.status-badge.done {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}
```

**Key**: Use **desaturated, low-opacity backgrounds** with matching text color. Avoid saturated colors (cause vibration).

---

## 5. Typography Scale

**Linear's approach**: Inter Display (headings) + Inter (body)

Recommended Tailwind scale for dark kanban:
```
XL:  18px semi-bold   (section titles)
lg:  16px semi-bold   (column headers, modals)
base: 14px regular     (card title, body)
sm:  12px regular      (metadata, timestamps)
xs:  11px regular      (badges, counts)
```

**Dark mode consideration**: Slightly larger (14px base) than light mode (12px) improves low-light readability.

---

## 6. shadcn/ui + Tailwind CSS Dark Mode Setup

### CSS Variable Pattern (Tailwind v4)
```css
/* globals.css */
@theme {
  --color-background: oklch(0.068 0 0);      /* #0f0f0f */
  --color-foreground: oklch(0.96 0 0);       /* #f5f5f5 */
  --color-card: oklch(0.11 0 0);             /* #1a1a1a */
  --color-primary: oklch(0.65 0.25 260);     /* indigo */
  --color-destructive: oklch(0.55 0.28 25);  /* red */
}

.dark {
  /* Values already set above in OKLCH space */
}
```

### Component Usage
```tsx
// Card component
<div className="bg-card text-card-foreground border border-border rounded-lg p-3">
  <h3 className="text-base font-semibold text-foreground">Task Title</h3>
  <p className="text-sm text-muted-foreground">Metadata</p>
</div>
```

**shadcn/ui approach**: All colors are CSS variables, never hardcoded. Enables theme switching without code changes.

---

## 7. Best Practices Summary

| Principle | Implementation |
|-----------|-----------------|
| **No pure black** | Use #0f0f0f, #121212 base |
| **Layer surfaces** | 3+ tonal variants (#0f, #1a, #23) |
| **Elevation ≠ shadow** | Use borders, insets, subtle overlays |
| **Accent restraint** | One bold color (indigo), rest muted |
| **Contrast first** | 4.5:1+ text, use soft white text |
| **Priority as accent** | Left border indicator, not background |
| **Desaturated colors** | Avoid neon-like saturation |
| **Typography**: 14px+ base | Better low-light readability |

---

## 8. Reference Implementations

### Linear 2025
- Monochrome black/white + single indigo accent
- LCH color space for theme generation
- Stripped all unnecessary color

### Plane.so (Open Source)
- Clean, modern dark UI
- Next.js frontend, keyboard-first design
- Customizable views (list, kanban, calendar)

### GitHub Projects
- Minimal styling, focus on content
- CSS variables for theming
- Drag-to-column interaction (auto-status update)

---

## Unresolved Questions

1. **Custom status colors**: Should vibe-kanban allow per-board custom priority colors, or lock to standard palette?
2. **Drag feedback**: What visual style for drag-in-progress state? (glow, opacity, preview card)
3. **Mobile responsiveness**: Single-column scroll, or horizontal scroll for 5+ columns?
