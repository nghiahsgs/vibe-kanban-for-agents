# Vibe Kanban for Agents

## Project Overview
Kanban board web app — humans assign tasks, AI agents pick up and execute via REST API.

**Tech:** Next.js 15, SQLite (better-sqlite3), Drizzle ORM, Tailwind v4, shadcn/ui, @hello-pangea/dnd

## Quick Start
```bash
npm install && npm run db:push && npm run dev
```

## Agent Integration

### For AI Agents (Claude Code, etc.)
1. Set environment: `KANBAN_URL=http://localhost:3001` and `AGENT_NAME=your-name`
2. On session start, run: `bash skills/vibe-kanban/scripts/check-tasks.sh`
3. Read `skills/vibe-kanban/SKILL.md` for full workflow instructions

### Typical Agent Flow
```
Check tasks → Pick up (todo → in_progress) → Work → Post comments → Move to review → Human approves → Done
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
