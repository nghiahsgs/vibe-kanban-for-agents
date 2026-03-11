# Vibe Kanban for Agents - Implementation Plan

## Summary
Kanban board web app where humans manage tasks via drag-and-drop UI, AI agents interact via REST API. Local dev tool, no auth, SQLite-backed.

## Tech Stack
- **Framework:** Next.js 15 (App Router) + TypeScript
- **Database:** SQLite (better-sqlite3) + Drizzle ORM
- **UI:** Tailwind CSS v4 + shadcn/ui
- **Drag & Drop:** @hello-pangea/dnd
- **Server State:** TanStack Query (5s polling)

## Phases

| # | Phase | Status | File |
|---|-------|--------|------|
| 1 | Project Setup & Configuration | TODO | [phase-01-project-setup.md](./phase-01-project-setup.md) |
| 2 | Database & API Layer | TODO | [phase-02-database-api.md](./phase-02-database-api.md) |
| 3 | Kanban Board UI | TODO | [phase-03-kanban-board-ui.md](./phase-03-kanban-board-ui.md) |
| 4 | Task Management UI | TODO | [phase-04-task-management-ui.md](./phase-04-task-management-ui.md) |
| 5 | Polish & Documentation | TODO | [phase-05-polish-docs.md](./phase-05-polish-docs.md) |

## Key Decisions
- Fractional indexing (float) for task position/ordering
- Polling at 5s interval via TanStack Query (no WebSocket/SSE)
- RFC 9457 error format for API responses
- `drizzle-kit push` for dev migrations
- No auth, no multi-board, no file attachments
- Each file under 200 lines, kebab-case naming

## Project Structure (Target)
```
src/
├── app/
│   ├── api/tasks/          # Task CRUD routes
│   ├── api/tasks/[id]/     # Single task routes
│   ├── api/tasks/[id]/comments/  # Comment routes
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── board/              # Kanban board components
│   └── task/               # Task-related components
├── db/
│   ├── index.ts            # DB connection
│   └── schema.ts           # Drizzle schema
├── lib/
│   ├── utils.ts            # Shared utilities
│   ├── api-helpers.ts      # API response/error helpers
│   └── position.ts         # Fractional indexing logic
├── hooks/
│   └── use-tasks.ts        # TanStack Query hooks
└── types/
    └── index.ts            # Shared TypeScript types
```
