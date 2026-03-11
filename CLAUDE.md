# Vibe Kanban for Agents

## IMPORTANT: Agent Behavior Rules

### On session start or when checking tasks:
1. Run: `bash skills/vibe-kanban/scripts/check-tasks.sh ${AGENT_NAME:-claude-agent} ${KANBAN_URL:-http://localhost:3001}`
2. If there are **todo** tasks → **automatically pick up the highest priority one** and start working
3. If there are **in_progress** tasks → **continue working** on them
4. Do NOT ask the user "which task do you want me to do?" — just do it

### Auto-pilot workflow (DO NOT ask permission, just execute):
1. **Pick up**: `curl -s -X PATCH "${KANBAN_URL:-http://localhost:3001}/api/tasks/${TASK_ID}" -H "Content-Type: application/json" -d '{"status": "in_progress"}'`
2. **Comment start**: `curl -s -X POST "${KANBAN_URL:-http://localhost:3001}/api/tasks/${TASK_ID}/comments" -H "Content-Type: application/json" -d '{"author": "${AGENT_NAME:-claude-agent}", "content": "Starting work on this task"}'`
3. **Do the actual work** described in the task title/description
4. **Comment progress** at milestones
5. **Move to review**: `curl -s -X PATCH "${KANBAN_URL:-http://localhost:3001}/api/tasks/${TASK_ID}" -H "Content-Type: application/json" -d '{"status": "review"}'`
6. **Comment completion**: Post summary of what was done
7. **Pick up next task** if there are more

### Priority order: high > medium > low

## Project Overview
Kanban board web app — humans assign tasks, AI agents pick up and execute via REST API.

**Tech:** Next.js 15, SQLite (better-sqlite3), Drizzle ORM, Tailwind v4, shadcn/ui, @hello-pangea/dnd

## Quick Start
```bash
npm install && npm run db:push && npm run dev
```

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
