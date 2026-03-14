# Design System Patterns: Tailwind v4 + shadcn/ui + Dark Mode

## Current State Analysis

Your app already has good foundations:
- **Tailwind v4** with `@theme` inline block (globals.css L7-48)
- **Dark mode** implemented via class strategy (#0f0f0f bg, #e4e4e7 foreground)
- **Semantic colors** defined (primary, secondary, muted, destructive, etc.)
- **Border radius scale** (sm/md/lg/xl/2xl/3xl/4xl via calc multipliers)
- **Components** using data-slot pattern + CVA for variants

### Current Gaps
- Semantic token naming missing intermediary layer (e.g., --color-surface vs --card)
- No semantic typography tokens (--type-body-md, --type-heading-lg)
- Spacing scale incomplete (only implicit via Tailwind defaults)
- Dialog/form treatments lack documented constraints

---

## 1. CSS Variable Architecture — Semantic Token Layering

**Strategy:** Three-layer token system (base → semantic → component).

### Base Layer (Never use directly in components)
```css
/* Primitives — raw values */
--base-color-slate-50: #fafafa;
--base-color-slate-900: #18181b;
--base-color-indigo-500: #6366f1;
--base-space-4: 4px;
--base-space-8: 8px;
--base-radius-none: 0;
--base-radius-sm: 2px;
```

### Semantic Layer (Use in components)
```css
/* Light mode */
:root {
  /* Surfaces */
  --color-surface: #fafafa;
  --color-surface-elevated: #ffffff;
  --color-surface-sunken: #f4f4f5;

  /* Foreground (text) */
  --color-text-primary: #18181b;
  --color-text-secondary: #71717a;
  --color-text-tertiary: #a1a1aa;

  /* Interactive */
  --color-interactive-primary: #18181b;
  --color-interactive-secondary: #f4f4f5;
  --color-interactive-danger: #ef4444;

  /* Borders & Dividers */
  --color-border-default: #e4e4e7;
  --color-border-subtle: #f4f4f5;

  /* Focus ring */
  --color-focus-ring: #6366f1;
}

/* Dark mode */
.dark {
  --color-surface: #0f0f0f;
  --color-surface-elevated: #171717;
  --color-surface-sunken: #1f1f1f;
  --color-text-primary: #e4e4e7;
  --color-text-secondary: #71717a;
  --color-text-tertiary: #52525b;
  --color-interactive-primary: #e4e4e7;
  --color-interactive-secondary: #1f1f1f;
  --color-interactive-danger: #ef4444;
  --color-border-default: rgba(255, 255, 255, 0.08);
  --color-border-subtle: rgba(255, 255, 255, 0.04);
  --color-focus-ring: #6366f1;
}
```

### Component Layer (In component-specific CSS)
```css
.button--primary {
  background-color: var(--color-interactive-primary);
  color: var(--color-surface);
}

.input {
  border-color: var(--color-border-default);
  background-color: var(--color-surface-elevated);
  color: var(--color-text-primary);
}

.input:focus {
  border-color: var(--color-focus-ring);
  outline: 3px solid var(--color-focus-ring) / 0.5;
}

.input:invalid {
  border-color: var(--color-interactive-danger);
}
```

**Action:** Update globals.css to add semantic layer before component layer.

---

## 2. Typography System — Inter Scale

### Type Scale with Inter

Inter works best at 14–18px body text. Recommended scale:

| Token | Size | Weight | Line-height | Usage |
|-------|------|--------|-------------|-------|
| `--type-display-lg` | 32px | 600 | 1.25 (40px) | Page titles |
| `--type-display-md` | 28px | 600 | 1.25 (35px) | Section headers |
| `--type-heading-lg` | 24px | 600 | 1.25 (30px) | Card titles |
| `--type-heading-md` | 20px | 600 | 1.25 (25px) | Subsection titles |
| `--type-heading-sm` | 16px | 600 | 1.25 (20px) | Input labels |
| `--type-body-md` | 14px | 400 | 1.5 (21px) | Body text (light: #18181b, dark: #e4e4e7) |
| `--type-body-sm` | 12px | 400 | 1.5 (18px) | Secondary text, hints |
| `--type-button` | 14px | 500 | 1.25 (18px) | Button labels |
| `--type-caption` | 12px | 400 | 1.25 (15px) | Timestamps, badges |
| `--type-code` | 13px | 400 | 1.5 (19.5px) | Code blocks (monospace) |

### CSS Implementation
```css
@theme inline {
  --font-sans: var(--font-inter);
  --font-mono: var(--font-fira-code);
}

@layer base {
  body {
    font-size: var(--type-body-md);
    line-height: 1.5;
    font-weight: 400;
    color: var(--color-text-primary);
  }

  h1 { font-size: var(--type-display-lg); font-weight: 600; line-height: 1.25; }
  h2 { font-size: var(--type-heading-lg); font-weight: 600; line-height: 1.25; }
  h3 { font-size: var(--type-heading-md); font-weight: 600; line-height: 1.25; }

  label { font-size: var(--type-heading-sm); font-weight: 600; }
  small { font-size: var(--type-body-sm); }
}
```

**Rationale:** Inter's metrics work best at 14–16px; larger jumps use 1.25 line-height for headings (tighter), 1.5 for body (breathier).

---

## 3. Spacing System — 4px + 8px Hybrid

Use **8px as primary grid**, 4px as half-step for tight relationships.

```css
@theme inline {
  /* Primary 8px scale */
  --space-4: 4px;    /* half-step only */
  --space-8: 8px;    /* tight */
  --space-12: 12px;  /* compact */
  --space-16: 16px;  /* standard (2×8) */
  --space-20: 20px;  /* relaxed (2.5×8) */
  --space-24: 24px;  /* comfortable (3×8) */
  --space-32: 32px;  /* loose (4×8) */
  --space-40: 40px;  /* very loose (5×8) */
  --space-48: 48px;  /* spacious (6×8) */
  --space-64: 64px;  /* very spacious (8×8) */
}
```

### Semantic Spacing Tokens
```css
:root {
  /* Insets (padding inside containers) */
  --inset-xs: var(--space-8);     /* Tight: badges, small chips */
  --inset-sm: var(--space-12);    /* Compact: form inputs */
  --inset-md: var(--space-16);    /* Standard: cards, buttons */
  --inset-lg: var(--space-24);    /* Comfortable: dialogs */
  --inset-xl: var(--space-32);    /* Spacious: page containers */

  /* Gaps (between elements) */
  --gap-xs: var(--space-4);       /* Tight items */
  --gap-sm: var(--space-8);       /* Compact list */
  --gap-md: var(--space-16);      /* Standard spacing */
  --gap-lg: var(--space-24);      /* Section spacing */
  --gap-xl: var(--space-32);      /* Major section spacing */
}
```

### Usage Examples
```css
.card {
  padding: var(--inset-md);       /* 16px */
  gap: var(--gap-md);             /* 16px between items */
}

.dialog {
  padding: var(--inset-lg);       /* 24px */
  gap: var(--gap-md);             /* 16px between sections */
}

.button-group {
  gap: var(--gap-sm);             /* 8px between buttons */
}
```

---

## 4. Component Consistency — Data Slots + CVA Pattern

Current approach (data-slot + class-variance-authority) is **solid**. Enforce:

### Button Consistency
```tsx
// Size preset → fixed height + padding rule
const buttonVariants = cva("...", {
  variants: {
    size: {
      xs: "h-6 gap-1 px-2 text-xs",
      sm: "h-7 gap-1 px-2.5 text-sm",
      default: "h-8 gap-1.5 px-2.5 text-sm",
      lg: "h-9 gap-1.5 px-3 text-base",
    }
  }
})

// Apply: h-* is touch target (48px min for mobile), px-* from spacing scale
```

### Card Consistency
```tsx
// Enforce padding via inset semantic tokens
<Card className="p-[var(--inset-md)]">
  <CardHeader className="pb-[var(--gap-md)]">
    {/* h3 + optional description */}
  </CardHeader>
  <CardContent className="gap-[var(--gap-sm)]">
    {/* content */}
  </CardContent>
</Card>
```

**Pattern:** Data-slot identifies component part; semantic spacing token applied via `className="p-[var(--inset-md)]"`.

---

## 5. Dialog/Modal Best Practices

### Sizing Strategy
```css
/* Responsive clamp */
.dialog {
  width: clamp(300px, 90vw, 600px);  /* Mobile: 90vw, desktop: max 600px */
  max-height: 90vh;
  overflow-y: auto;
}

/* Or fixed breakpoints */
@media (max-width: 640px) {
  .dialog { width: 100%; max-width: 100%; }
}
@media (min-width: 641px) {
  .dialog { width: 600px; }
}
```

### Padding & Spacing
```css
.dialog {
  padding: var(--inset-lg);        /* 24px */
}

.dialog-header {
  padding-bottom: var(--gap-md);   /* 16px from body */
  border-bottom: 1px solid var(--color-border-default);
}

.dialog-body {
  padding: var(--gap-md) 0;        /* 16px top/bottom */
}

.dialog-footer {
  padding-top: var(--gap-md);      /* 16px from body */
  border-top: 1px solid var(--color-border-default);
  display: flex;
  gap: var(--gap-sm);              /* 8px between buttons */
  justify-content: flex-end;
}
```

### Animation
```css
@keyframes dialogEnter {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.dialog[open] {
  animation: dialogEnter 150ms cubic-bezier(0.16, 1, 0.3, 1);
}

@media (prefers-reduced-motion: reduce) {
  .dialog[open] {
    animation: none;
    opacity: 1;
  }
}
```

### Overlay
```css
.dialog-overlay {
  background: rgba(0, 0, 0, 0.5);        /* Light mode */
  backdrop-filter: blur(4px);
}

.dark .dialog-overlay {
  background: rgba(0, 0, 0, 0.7);        /* Darker in dark mode */
  backdrop-filter: blur(6px);
}
```

---

## 6. Form Design Patterns

### Input Styling
```css
.input {
  /* Base */
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  padding: var(--inset-sm);                /* 12px vertical/horizontal */
  background-color: var(--color-surface-elevated);
  color: var(--color-text-primary);
  font-size: var(--type-body-md);
  line-height: 1.5;

  /* Focus */
  transition: border-color 150ms, box-shadow 150ms;
}

.input:focus {
  border-color: var(--color-focus-ring);
  box-shadow: 0 0 0 3px var(--color-focus-ring) / 0.15;
}

.input:disabled {
  background-color: var(--color-surface-sunken);
  opacity: 0.6;
  cursor: not-allowed;
}

.input:invalid {
  border-color: var(--color-interactive-danger);
}

.input:invalid:focus {
  box-shadow: 0 0 0 3px var(--color-interactive-danger) / 0.15;
}
```

### Label + Input Grouping
```css
.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--gap-xs);              /* 4px between label and input */
}

label {
  font-size: var(--type-heading-sm); /* 16px, weight 600 */
  color: var(--color-text-primary);
}

.form-group > .input {
  margin-top: var(--gap-xs);       /* 4px extra breathing room */
}

.error-message {
  font-size: var(--type-body-sm);
  color: var(--color-interactive-danger);
  margin-top: var(--gap-xs);
}

.help-text {
  font-size: var(--type-body-sm);
  color: var(--color-text-tertiary);
  margin-top: var(--gap-xs);
}
```

### Validation States
```css
/* Aria attributes for state */
.input[aria-invalid="true"] {
  border-color: var(--color-interactive-danger);
}

.input[aria-invalid="true"]:focus {
  box-shadow: 0 0 0 3px var(--color-interactive-danger) / 0.15;
}

.input[aria-describedby] + .error-message {
  display: block;
  animation: slideDown 150ms ease-out;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
```

---

## Implementation Checklist

- [ ] **Globals.css**: Add semantic token layer (color-surface, color-text-*, inset-*, gap-*)
- [ ] **Typography**: Define `--type-*` tokens for 9 scale levels; apply via `@layer base`
- [ ] **Spacing**: Export spacing scale as `--space-*` + semantic `--inset-*`, `--gap-*`
- [ ] **Colors**: Rename current tokens to semantic naming (e.g., --card → --color-surface-elevated)
- [ ] **Dialog**: Document sizing (clamp rules), padding (--inset-lg), animation (150ms fade+translate)
- [ ] **Form**: Standardize input padding (--inset-sm), focus ring (0 0 0 3px), validation via aria-invalid
- [ ] **Button**: Ensure size presets map to 8px-aligned heights (h-6, h-7, h-8, h-9)
- [ ] **Card**: Enforce `p-[var(--inset-md)]`, gaps via `gap-[var(--gap-sm)] etc.`
- [ ] **Dark mode**: Test all semantic tokens in .dark context; validate contrast ratios

---

## References & Sources

- [Tailwind CSS v4.0 - Official Blog](https://tailwindcss.com/blog/tailwindcss-v4)
- [Tailwind CSS 4 @theme: Design Tokens for 2025](https://medium.com/@sureshdotariya/tailwind-css-4-theme-the-future-of-design-tokens-at-2025-guide-48305a26af06)
- [Building a Production Design System with Tailwind CSS v4](https://dev.to/saswatapal/building-a-production-design-system-with-tailwind-css-v4-1d9e)
- [The Developer's Guide to Design Tokens and CSS Variables](https://penpot.app/blog/the-developers-guide-to-design-tokens-and-css-variables/)
- [Best Practices For Naming Design Tokens — Smashing Magazine](https://www.smashingmagazine.com/2024/05/naming-best-practices/)
- [Typography in Design Systems — EightShapes](https://medium.com/eightshapes-llc/typography-in-design-systems-6ed771432f1e)
- [The 8pt Grid: Consistent Spacing in UI Design](https://blog.prototypr.io/the-8pt-grid-consistent-spacing-in-ui-design-with-sketch-577e4f0fd520)
- [Building a Dialog Component — web.dev](https://web.dev/articles/building/a-dialog-component)
- [Mastering Modal UX: Best Practices & Real Product Examples](https://www.eleken.co/blog-posts/modal-ux)
- [Material Design 3 — Typography](https://m3.material.io/styles/typography/type-scale-tokens)
- [Carbon Design System — Modal](https://carbondesignsystem.com/components/modal/usage/)
- [Spacing Systems & Scales in UI Design](https://blog.designary.com/p/spacing-systems-and-scales-ui-design/)

---

## Unresolved Questions

1. **Color contrast ratios**: Should we audit current palette (e.g., #18181b text on #fafafa bg) against WCAG AA/AAA?
2. **Radius consistency**: Should all components use `--radius-md` or maintain current per-component radius variants?
3. **Animation duration**: Current code uses mix of 150ms and 220ms; should we standardize to 150ms for all fast transitions?
4. **Shadow tokens**: Not defined; should we add `--shadow-sm`, `--shadow-md` for elevation on cards/dialogs?
5. **Responsive type scale**: Should Inter sizes scale on mobile vs. desktop, or fixed across breakpoints?
