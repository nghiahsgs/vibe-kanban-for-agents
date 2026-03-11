# UI/UX Redesign + Authentication System
**Date:** 2026-03-11 | **Status:** Planning

## Objective
Transform Vibe Kanban from functional-but-plain to polished modern UI, and add dual auth (session + API key) without breaking agent REST API.

## Phases

| # | Phase | Status | File |
|---|-------|--------|------|
| 01 | UI/UX - Board & Cards | Planned | [phase-01-board-cards.md](./phase-01-board-cards.md) |
| 02 | UI/UX - Dialogs & Forms | Planned | [phase-02-dialogs-forms.md](./phase-02-dialogs-forms.md) |
| 03 | Auth Schema & Core | Planned | [phase-03-auth-core.md](./phase-03-auth-core.md) |
| 04 | Auth UI | Planned | [phase-04-auth-ui.md](./phase-04-auth-ui.md) |
| 05 | API Key Auth for Agents | Planned | [phase-05-api-key-auth.md](./phase-05-api-key-auth.md) |

## Tech Decisions
- **Auth library:** Better Auth (native App Router, SQLite, plugin ecosystem, Auth.js team backing)
- **Password hashing:** argon2 (Better Auth default, strongest modern option)
- **UI stack:** Keep existing shadcn/ui + Tailwind v4 + @hello-pangea/dnd
- **Dark mode:** System preference detection via `next-themes`
- **No new DnD lib:** Keep @hello-pangea/dnd per constraints

## Research
- [Kanban UI/UX Patterns](./research/researcher-01-kanban-ui-ux.md)
- [Auth Solutions Comparison](./research/researcher-02-auth-solutions.md)

## Constraints
- DO NOT modify: `skills/`, `.claude/`, `CLAUDE.md`
- Keep SQLite, preserve API contract, preserve fractional indexing
- Keep @hello-pangea/dnd

## Dependency Order
```
Phase 01 ──> Phase 02 (UI phases independent of auth)
Phase 03 ──> Phase 04 ──> Phase 05 (auth phases sequential)
Phase 01+02 can run parallel with Phase 03
```
