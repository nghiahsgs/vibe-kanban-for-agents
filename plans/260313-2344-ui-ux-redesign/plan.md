# UI/UX Redesign Plan — Vibe Kanban

**Date:** 2026-03-13 | **Status:** Complete | **Approach:** Sequential, 6 phases

## Summary

Complete visual overhaul of 19 custom components + globals.css. Linear-inspired dark-first design: monochrome neutrals, single indigo accent, semantic CSS tokens, 8px spacing grid, Inter 14px base. All functionality preserved — styling/layout only.

## Phases

| # | Phase | Status | Progress | File |
|---|-------|--------|----------|------|
| 1 | Design Foundation | Complete | 100% | [phase-01-design-foundation.md](./phase-01-design-foundation.md) |
| 2 | Base UI Components | Complete | 100% | [phase-02-base-ui-components.md](./phase-02-base-ui-components.md) |
| 3 | Board Components | Complete | 100% | [phase-03-board-components.md](./phase-03-board-components.md) |
| 4 | Dialog Components | Complete | 100% | [phase-04-dialog-components.md](./phase-04-dialog-components.md) |
| 5 | Supporting Components | Complete | 100% | [phase-05-supporting-components.md](./phase-05-supporting-components.md) |
| 6 | Polish & Responsive | Complete | 100% | [phase-06-polish-responsive.md](./phase-06-polish-responsive.md) |

## Dependencies

```
Phase 1 (Foundation) ──> Phase 2 (Base UI) ──> Phase 3 (Board)
                                            ──> Phase 4 (Dialogs)
                                            ──> Phase 5 (Supporting)
                         Phase 3+4+5 ──────> Phase 6 (Polish)
```

- Phase 1 is prerequisite for all others (defines tokens)
- Phase 2 depends on Phase 1 (consumes tokens in base components)
- Phases 3, 4, 5 depend on Phase 2 (use refactored base components)
- Phase 6 depends on 3+4+5 completion (cross-cutting polish)

## Key Design Decisions

- **Dark mode primary** (#0f0f0f base), light mode secondary
- **Single accent**: Indigo (#6366f1) — buttons, focus rings, active states
- **Elevation via borders** not shadows (dark mode shadows invisible)
- **Status colors**: CSS vars with 10% opacity backgrounds
- **Priority indicator**: Left border accent on cards
- **8px spacing grid** with 4px half-step
- **Inter 14px base** typography scale

## Research References

- [Kanban UI Design Patterns](./research/researcher-01-kanban-ui-design.md)
- [Design System Architecture](./research/researcher-02-design-system-patterns.md)
- [Current UI Audit](../reports/260313-2344-ui-ux-redesign/scout/scout-01-current-ui-audit.md)
