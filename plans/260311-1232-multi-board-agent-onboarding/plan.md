# Multi-Board Support + Agent Onboarding Prompt Generator

## Summary
Add multi-board support so users can organize tasks across separate projects, each with its own board-scoped API key. Add agent onboarding prompt generator UI so users can copy-paste a ready-made prompt to configure AI agents for a specific board.

## Phases

| # | Phase | Status | File |
|---|-------|--------|------|
| 1 | Schema Migration | todo | [phase-01-schema-migration.md](./phase-01-schema-migration.md) |
| 2 | Board CRUD API | todo | [phase-02-board-crud-api.md](./phase-02-board-crud-api.md) |
| 3 | Agent Auth Middleware | todo | [phase-03-agent-auth-middleware.md](./phase-03-agent-auth-middleware.md) |
| 4 | Board-Scoped Tasks API | todo | [phase-04-board-scoped-tasks-api.md](./phase-04-board-scoped-tasks-api.md) |
| 5 | Board Management UI | todo | [phase-05-board-management-ui.md](./phase-05-board-management-ui.md) |
| 6 | Task Form Updates | todo | [phase-06-task-form-updates.md](./phase-06-task-form-updates.md) |
| 7 | Agent Onboarding Generator | todo | [phase-07-agent-onboarding-generator.md](./phase-07-agent-onboarding-generator.md) |

## Architecture Decisions

- **Board slug**: URL-friendly identifier, auto-generated from name, unique per user
- **Board API key**: Stored as hash in `boards` table (reuse `generateApiKey` from `src/lib/api-key.ts`)
- **Task ownership**: Every task belongs to a board via `boardId` FK
- **Data migration**: Create "Default Board" for each user's existing tasks
- **Agent auth flow**: `Authorization: Bearer vk_...` -> hash -> lookup board by `keyHash` -> scope all queries to that board
- **Web UI auth**: Unchanged session auth; board selected via URL `/boards/:slug`
- **Backward compat**: Keep `/api/tasks` endpoints working (scoped to user's default board)

## Key Files to Modify
- `src/db/schema.ts` — add `boards` table, update `tasks` table
- `src/db/auth-schema.ts` — no change (apiKeys table stays for user-level keys)
- `src/lib/auth-helpers.ts` — extend `getAuthUser` to return boardId for board API keys
- `src/app/api/` — add boards routes, update tasks routes
- `src/components/board/` — add board switcher, update header
- `src/hooks/use-tasks.ts` — scope queries to active board
- `src/types/index.ts` — add Board type

## Constraints
- YAGNI/KISS/DRY
- Supabase PostgreSQL (Drizzle ORM, `drizzle-kit` migrations)
- Next.js 15 App Router conventions
- Existing auth patterns (better-auth sessions + API keys)
