# Vibe Kanban for Agents

## Project Overview
Kanban board web app — humans assign tasks, AI agents pick up and execute via REST API.
Supports **multi-board** with per-board API keys for agent auth.

**Tech:** Next.js 15, PostgreSQL (Supabase), Drizzle ORM, Tailwind v4, shadcn/ui, @hello-pangea/dnd

## Quick Start
```bash
npm install && npm run db:push && npm run dev
```

## Agent Setup
1. Open board in browser → click **"Agent Setup"** button
2. Click 🔄 to generate API key → prompt auto-fills
3. Copy the generated prompt → paste into Claude Code (or any AI agent)
4. Agent will auto-poll for tasks, pick up highest priority, execute, and report progress

## Project Structure
```
src/
  app/api/boards/        — Board CRUD + board-scoped task APIs
  app/api/tasks/         — Legacy task API (backward compat)
  app/boards/[slug]/     — Board page (URL routing)
  components/board/      — Kanban UI, board switcher, agent onboarding
  components/task/       — Task form, detail, comments
  db/                    — PostgreSQL + Drizzle schema
  hooks/                 — TanStack Query hooks (boards + tasks)
  lib/                   — Auth, API helpers, prompt templates
  types/                 — TypeScript types
```

## API Endpoints

### Board Management (session auth)
- `GET /api/boards` — List user's boards
- `POST /api/boards` — Create board
- `GET /api/boards/:slug` — Get board
- `PATCH /api/boards/:slug` — Update board
- `DELETE /api/boards/:slug` — Delete board
- `POST /api/boards/:slug/regenerate-key` — Regenerate board API key

### Board-Scoped Tasks (session or board API key auth)
- `GET /api/boards/:slug/tasks` — List tasks (filter: ?assignee=, ?status=, ?priority=)
- `POST /api/boards/:slug/tasks` — Create task
- `GET /api/boards/:slug/tasks/:id` — Get task
- `PATCH /api/boards/:slug/tasks/:id` — Update task
- `DELETE /api/boards/:slug/tasks/:id` — Delete task
- `GET /api/boards/:slug/tasks/:id/comments` — List comments
- `POST /api/boards/:slug/tasks/:id/comments` — Add comment

### Legacy (backward compat — resolves to default board)
- `GET /api/tasks` — List tasks
- `POST /api/tasks` — Create task
- `GET/PATCH/DELETE /api/tasks/:id` — Task CRUD
- `GET/POST /api/tasks/:id/comments` — Comments

### Auth
- Board API key: `Authorization: Bearer vk_xxx`
- Session: automatic via cookies
