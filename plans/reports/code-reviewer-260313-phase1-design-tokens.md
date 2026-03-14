# Code Review: Phase 1 — Design Foundation (globals.css)

## Scope
- File: `src/app/globals.css`
- Lines: 269
- Base commit: `b65eb5c` (HEAD)
- Focus: New semantic design tokens, typography base, scrollbar refactor

---

## Overall Assessment

Changes are clean, additive, and non-breaking. Token set is well-structured with consistent naming. Two WCAG contrast issues exist for light-mode text tokens used at normal text size — not critical for badge/large-text use, but notable.

---

## Critical Issues

None.

---

## High Priority Findings

### 1. WCAG AA failure at normal text size — light mode (4 tokens)

These light-mode `-text` tokens fall below 4.5:1 on `#fafafa` background:

| Token | Hex | Ratio | Status |
|---|---|---|---|
| `--status-review-text` | `#d97706` | 3.05:1 | FAIL AA normal |
| `--status-done-text` | `#059669` | 3.61:1 | FAIL AA normal |
| `--priority-medium-text` | `#d97706` | 3.05:1 | FAIL AA normal |
| `--priority-low-text` | `#059669` | 3.61:1 | FAIL AA normal |

All pass AA-large (3:1) so they're acceptable for **badge chips at 14px bold or larger**. If used for body-weight text at 14px, they fail. Dark mode all pass AA comfortably.

**Risk:** Low if tokens are only used for badge labels (they appear to be). High if misused for body text.

**Recommendation:** Add a comment near each token noting minimum usage context, e.g.:
```css
--status-review-text: #d97706; /* AA-large only — use for badge labels ≥14px bold */
```
Or darken to AA: `#b45309` (amber-700, 4.62:1 on white).

---

## Medium Priority Improvements

### 2. `--surface` duplicates `--background` in both modes

Light: `--surface: #fafafa` = `--background: #fafafa`
Dark: `--surface: #0f0f0f` = `--background: #0f0f0f`

This is YAGNI-borderline — if the intent is strict semantic separation (surface vs page background), it's justified. If components will always use `--background` for page and `--surface` for panels, the distinction is useful. But as-is, they are identical values — any divergence later requires a coordinated update to both.

**Verdict:** Acceptable if the semantic distinction is intentional and documented. No action required unless token values are expected to always stay in sync.

### 3. `--duration-*` tokens not registered in `@theme inline`

`--duration-fast/normal/slow` are defined in `:root` but absent from `@theme inline`, so `duration-fast` Tailwind utilities won't be generated. The `@theme inline` block only maps `--color-*` and `--radius-*`.

**Fix:**
```css
/* in @theme inline */
--transition-duration-fast: var(--duration-fast);
--transition-duration-normal: var(--duration-normal);
--transition-duration-slow: var(--duration-slow);
```
Or, if Tailwind v4 maps `--duration-*` natively via a different namespace, this may be intentional. Verify if any component plans to use `duration-fast` as a Tailwind class.

### 4. `--duration-*` not defined in `.dark`

Transition tokens are defined only in `:root`. CSS custom properties inherit, so `.dark` will inherit them — this is fine. No issue if values are mode-agnostic (they are). No action required.

---

## Low Priority Suggestions

### 5. Scrollbar `scrollbar-color` uses raw `--border` (light mode = `#e4e4e7`, dark = `rgba(255,255,255,0.08)`)

Prior code used hardcoded `rgba(255,255,255,0.08)` — dark-only. New code uses `var(--border)` which is theme-aware. This is a clear improvement. Light mode scrollbar thumb (`#e4e4e7` on white track) will be nearly invisible — but that matches the minimal aesthetic intentionally. Acceptable.

### 6. `--surface-sunken` light value `#f0f0f0` is not a Zinc palette color

All other light tokens use Zinc scale (`#fafafa`, `#f4f4f5`, etc.). `#f0f0f0` is an off-palette value. Consider `#f4f4f5` (zinc-100) or `#e4e4e7` (zinc-200) for palette consistency. Minor aesthetic concern only.

---

## Positive Observations

- Consistent `dot / badge-bg / badge-text` trio naming per status/priority — clear intent, easy to consume
- Dark mode uses lighter variants of same hues (e.g., indigo-400 not indigo-600) — correct approach for dark bg contrast
- `rgba(r,g,b, 0.1)` badge-bg values use the same base as their dot color — maintains color coherence
- `@custom-variant dark` + `.dark` class approach is correct for Tailwind v4
- `prefers-reduced-motion` block preserved and correct
- Scrollbar refactor to semantic tokens is a genuine improvement

---

## Recommended Actions

1. **Medium** — Either darken `--status-review-text`, `--status-done-text`, `--priority-medium-text`, `--priority-low-text` to AA-passing values, or add inline comments restricting to badge-label-only usage
2. **Low** — Add `--transition-duration-*` mappings to `@theme inline` if Tailwind `duration-fast` utilities are needed
3. **Low** — Replace `#f0f0f0` with `#f4f4f5` for Zinc palette consistency

---

## Metrics

- Linting issues: 0 (CSS-only, no TS)
- WCAG AA failures (normal text): 4 light-mode text tokens
- WCAG AA-large pass: all tokens pass at large/bold size
- Dark mode parity: complete
- Token naming conflicts: none found

---

## Unresolved Questions

- Are `--duration-*` tokens intended to generate Tailwind utilities? If yes, `@theme inline` mapping is missing.
- Is `--surface` intentionally identical to `--background`, or will they diverge in a later phase?
