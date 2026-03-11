---
name: vibe-kanban
description: Check and manage tasks from Vibe Kanban board. Use when starting work, checking assigned tasks, updating task progress, or completing tasks.
---

# Vibe Kanban - Agent Task Management

You are an AI agent connected to a Kanban board. Check for assigned tasks, pick them up, report progress, and mark them done.

## When to Use

- **Session start**: Check if you have tasks assigned
- **Before starting work**: Pick up a task from Todo
- **During work**: Post progress comments
- **After completing work**: Move task to Done

## Configuration

- **KANBAN_URL**: Base URL of Kanban board (default: `http://localhost:3001`)
- **AGENT_NAME**: Your agent identifier (default: from env or `claude-agent`)

Read these from environment or use defaults.

## Workflow

### 1. Check Assigned Tasks
```bash
curl -s "${KANBAN_URL:-http://localhost:3001}/api/tasks?assignee=${AGENT_NAME}&status=todo"
```
If tasks found → notify user and offer to start working on one.

### 2. Pick Up a Task (move to In Progress)
```bash
curl -s -X PATCH "${KANBAN_URL:-http://localhost:3001}/api/tasks/${TASK_ID}" \
  -H "Content-Type: application/json" \
  -d '{"status": "in_progress"}'
```
Then read task details (title, description) and begin working.

### 3. Post Progress Comment
```bash
curl -s -X POST "${KANBAN_URL:-http://localhost:3001}/api/tasks/${TASK_ID}/comments" \
  -H "Content-Type: application/json" \
  -d "{\"author\": \"${AGENT_NAME}\", \"content\": \"<progress update>\"}"
```
Post comments at key milestones: started, halfway, blocked, completed.

### 4. Move to Review
```bash
curl -s -X PATCH "${KANBAN_URL:-http://localhost:3001}/api/tasks/${TASK_ID}" \
  -H "Content-Type: application/json" \
  -d '{"status": "review"}'
```

### 5. Mark Done (after approval)
```bash
curl -s -X PATCH "${KANBAN_URL:-http://localhost:3001}/api/tasks/${TASK_ID}" \
  -H "Content-Type: application/json" \
  -d '{"status": "done"}'
```

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks?assignee=X&status=todo` | List assigned tasks |
| GET | `/api/tasks/:id` | Get task details |
| PATCH | `/api/tasks/:id` | Update task (status, etc.) |
| POST | `/api/tasks/:id/comments` | Add progress comment |
| GET | `/api/tasks/:id/comments` | Read task comments |

## Behavior Rules

1. **Auto-pickup**: When you find todo tasks, immediately pick up the highest priority one. Do NOT ask user which task — just start working
2. **One task at a time** — Pick up one task, finish it, then pick next
3. **Post progress** — Comment when: starting, hitting milestones, blocked, done
4. **Move to Review (not Done)** — Let human verify before marking Done
5. **Read task description carefully** — It contains the requirements
6. **If blocked, comment and ask** — Don't silently fail
7. **Auto-continue** — After finishing one task, check for next task and start immediately

## Slash Commands

- `/kanban` or `/kanban check` — Check assigned tasks
- `/kanban pickup <task-id>` — Pick up a specific task
- `/kanban done <task-id>` — Move task to review
- `/kanban comment <task-id> <message>` — Post a comment
