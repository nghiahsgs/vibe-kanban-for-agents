# Brainstorm: PM Features for AI Agent + Human Collaboration

**Date:** 2026-03-14 | **Status:** Agreed

## Problem Statement

Vibe Kanban currently has: boards, tasks (4 statuses), comments, agents, API keys. Need PM features to manage projects better where AI agents are primary workers, humans supervise.

## Key Insight

Traditional PM tools (sprints, story points, velocity) are for **human coordination**. AI agents work 24/7, don't have capacity limits. Need features that help **humans track AI work** and **give AI clear context**.

## Agreed Features

### Tier 1 — Quick Wins

| Feature | Description | Schema Change |
|---------|-------------|---------------|
| **Labels** | Colored tags (FRONTEND, BACKEND, BUG, etc.) — free-text + custom color | `labels` table or JSON field on task |
| **Due dates** | Date field on tasks, agents prioritize by deadline | `dueDate` column on tasks |
| **Checklist** | AI self-creates breakdown steps, checks off via API | `checklist` JSONB on tasks |

### Tier 2 — Core PM

| Feature | Description | Schema Change |
|---------|-------------|---------------|
| **Epics** | Group related tasks under one goal, track progress | `epics` table + `epicId` on tasks |
| **Task dependencies** | "Blocked by" relationships, agents skip blocked tasks | `taskDependencies` junction table |
| **Parent-child tasks** | Big subtasks as independent board cards with `parentId` | `parentId` on tasks |

### Tier 3 — Later

| Feature | Description |
|---------|-------------|
| **Board docs** | Markdown notes per board for shared project context |

### Skipped (YAGNI)

- Sprints — AI works continuously, use labels instead
- Story points — AI doesn't estimate
- Milestones — Epics cover this
- Custom fields — Labels are flexible enough
- Gantt/Timeline — Over-engineering

## Checklist Feature — Detailed Design

### Flow

```
1. Human creates task with description
2. Agent picks up task (GET /tasks?assignee=me&status=todo)
3. Agent analyzes description, creates checklist (PATCH /tasks/:id)
4. Agent works through items, checks off each via API
5. Human sees "3/7 ✓" progress on board card in real-time
```

### Data Model

```sql
-- tasks table additions
parentId       UUID REFERENCES tasks(id)  -- nullable, for child tasks
checklist      JSONB                       -- [{id, title, done}]
dueDate        TIMESTAMP                   -- nullable
epicId         UUID REFERENCES epics(id)   -- nullable
```

### API (agent-facing)

```
PATCH /api/boards/:slug/tasks/:id
{
  "checklist": [
    { "id": "1", "title": "Analyze requirements", "done": false },
    { "id": "2", "title": "Write migration", "done": true },
    ...
  ]
}
```

Agent creates + updates checklist via same PATCH endpoint. No separate endpoint needed.

### Board UI

- Task card shows mini progress bar: `☐ 3/7`
- Click → detail dialog shows full checklist with checkboxes
- Board default: show only top-level tasks (parentId = null)
- Child tasks badge: "2 subtasks" on parent card

### Board Setting: Auto-breakdown

Board-level toggle (not per-task):
> **"Agents should break down tasks before starting"**

When enabled → agent prompt includes instruction to create checklist first. One setting, not per-task noise.

## Implementation Order

1. **Labels + Due dates** — quick schema additions, card UI update
2. **Checklist** — JSONB field, PATCH API, card progress bar, detail dialog
3. **Epics** — new table, optional grouping, filter by epic
4. **Dependencies** — blocked-by relationships, agent prompt awareness
5. **Parent-child** — parentId field, board filtering, child count

## Success Metrics

- AI agents successfully self-create checklists via API
- Human can see task breakdown progress without opening task
- Labels visible on board cards (like reference design)
- Blocked tasks automatically skipped by agents
- Epics provide progress overview across related tasks

## Unresolved Questions

1. Labels: separate table (many-to-many) or JSON array on task? → Recommend JSON array for simplicity
2. Dependencies: should agents auto-detect dependencies from task descriptions? → V2
3. Epic progress: percentage bar or just count? → Count is simpler
