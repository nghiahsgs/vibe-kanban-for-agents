# Vibe Kanban for Agents

A simple Kanban board where humans assign tasks and AI agents pick them up via REST API.

## Quick Start

```bash
npm install
npm run db:push
npm run db:seed   # optional: seed sample data
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Next.js 15** (App Router) + TypeScript
- **SQLite** (better-sqlite3) + **Drizzle ORM**
- **Tailwind CSS v4** + **shadcn/ui**
- **@hello-pangea/dnd** (drag & drop)
- **TanStack Query** (5s polling)

## How It Works

1. **Humans** create tasks via the web UI, assign them to agents
2. **AI Agents** poll the REST API, pick up tasks, update status, and post activity logs
3. Board auto-refreshes every 5 seconds

## API Reference

Base URL: `http://localhost:3000`

### List Tasks
```
GET /api/tasks?status=todo&assignee=agent-1&priority=high
```
All query params optional. Response: `{ "tasks": [Task] }`

### Get Task
```
GET /api/tasks/:id
```
Response: `Task`

### Create Task
```
POST /api/tasks
Content-Type: application/json

{ "title": "Task name", "description?": "...", "status?": "todo", "assignee?": "agent-1", "priority?": "medium" }
```
Response: `201 Task`

### Update Task
```
PATCH /api/tasks/:id
Content-Type: application/json

{ "title?": "...", "status?": "in_progress", "position?": 1500, "assignee?": "...", "priority?": "..." }
```
Response: `Task`

### Delete Task
```
DELETE /api/tasks/:id
```
Response: `204`

### List Comments
```
GET /api/tasks/:id/comments
```
Response: `{ "comments": [Comment] }`

### Add Comment
```
POST /api/tasks/:id/comments
Content-Type: application/json

{ "author": "agent-1", "content": "Started working on this task" }
```
Response: `201 Comment`

## For AI Agents

Example workflow:
```bash
# 1. Check for assigned tasks
curl http://localhost:3000/api/tasks?assignee=my-agent&status=todo

# 2. Pick up a task (change status)
curl -X PATCH http://localhost:3000/api/tasks/<id> \
  -H "Content-Type: application/json" \
  -d '{"status": "in_progress"}'

# 3. Log progress
curl -X POST http://localhost:3000/api/tasks/<id>/comments \
  -H "Content-Type: application/json" \
  -d '{"author": "my-agent", "content": "Completed step 1 of 3"}'

# 4. Mark done
curl -X PATCH http://localhost:3000/api/tasks/<id> \
  -H "Content-Type: application/json" \
  -d '{"status": "done"}'
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run db:push` | Push schema to SQLite |
| `npm run db:seed` | Seed sample data |
| `npm run db:studio` | Open Drizzle Studio |

## Data Models

**Task:** `id`, `title`, `description`, `status` (todo/in_progress/review/done), `assignee`, `priority` (low/medium/high), `position`, `createdAt`, `updatedAt`

**Comment:** `id`, `taskId`, `author`, `content`, `createdAt`
