# Vibe Kanban for Agents

## IMPORTANT: On every session start
You MUST run this command first and report the results to the user:
```bash
bash skills/vibe-kanban/scripts/check-tasks.sh ${AGENT_NAME:-claude-agent} ${KANBAN_URL:-http://localhost:3001}
```
If there are tasks assigned to you, tell the user and ask if they want you to start working on one.

## Project Overview
Kanban board web app — humans assign tasks, AI agents pick up and execute via REST API.

**Tech:** Next.js 15, SQLite (better-sqlite3), Drizzle ORM, Tailwind v4, shadcn/ui, @hello-pangea/dnd

## Quick Start
```bash
npm install && npm run db:push && npm run dev
```

## Agent Workflow
1. Check tasks: `curl -s "${KANBAN_URL:-http://localhost:3001}/api/tasks?assignee=${AGENT_NAME:-claude-agent}&status=todo"`
2. Pick up: `PATCH /api/tasks/:id {"status": "in_progress", "assignee": "claude-agent"}`
3. Post progress: `POST /api/tasks/:id/comments {"author": "claude-agent", "content": "..."}`
4. Complete: `PATCH /api/tasks/:id {"status": "review"}`
5. Read `skills/vibe-kanban/SKILL.md` for full instructions

## Project Structure
```
src/
  app/api/tasks/         — REST API (7 endpoints)
  components/board/      — Kanban UI components
  components/task/       — Task management dialogs
  db/                    — SQLite + Drizzle schema
  hooks/                 — TanStack Query hooks
  lib/                   — Utilities, API helpers
  types/                 — TypeScript types
skills/vibe-kanban/      — Agent skill definition + scripts
```

## API Endpoints
- `GET /api/tasks` — List (filter: ?assignee=, ?status=, ?priority=)
- `GET /api/tasks/:id` — Get task
- `POST /api/tasks` — Create task
- `PATCH /api/tasks/:id` — Update task
- `DELETE /api/tasks/:id` — Delete task
- `GET /api/tasks/:id/comments` — List comments
- `POST /api/tasks/:id/comments` — Add comment
