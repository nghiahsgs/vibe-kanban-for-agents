export interface PromptContext {
  boardName: string;
  boardSlug: string;
  kanbanUrl: string;
  agentName: string;
  apiKey: string;
}

export type AgentType = "claude-code" | "cursor" | "generic";

export function generateAgentPrompt(type: AgentType, ctx: PromptContext): string {
  switch (type) {
    case "claude-code":
      return generateClaudeCodePrompt(ctx);
    case "cursor":
      return generateCursorPrompt(ctx);
    case "generic":
      return generateGenericPrompt(ctx);
  }
}

function generateClaudeCodePrompt(ctx: PromptContext): string {
  const { boardName, boardSlug, kanbanUrl, agentName, apiKey } = ctx;
  const tasksUrl = `${kanbanUrl}/api/boards/${boardSlug}/tasks`;
  const authHeader = apiKey ? `-H "Authorization: Bearer ${apiKey}"` : `# (no API key set — add one in board settings)`;

  return `# ${boardName} — Agent Instructions

## Identity
You are **${agentName}**, an AI coding agent assigned to the **${boardName}** Kanban board.

## Board Access
- Board URL: ${kanbanUrl}/boards/${boardSlug}
- API base: ${kanbanUrl}/api/boards/${boardSlug}
- Auth header: \`Authorization: Bearer ${apiKey || "YOUR_API_KEY"}\`

## On Session Start (ALWAYS do this first)
\`\`\`bash
# Check for tasks
curl -s ${tasksUrl}?status=todo ${authHeader} | jq '.tasks | sort_by(.priority == "high") | reverse | .[0]'
curl -s ${tasksUrl}?status=in_progress ${authHeader} | jq '.tasks'
\`\`\`

## Auto-Pilot Workflow (DO NOT ask permission — just execute)

### Priority order: high > medium > low

### 1. Pick up highest-priority todo task
\`\`\`bash
TASK_ID="<task-id>"
curl -s -X PATCH "${tasksUrl}/$TASK_ID" ${authHeader} \\
  -H "Content-Type: application/json" \\
  -d '{"status": "in_progress"}'
\`\`\`

### 2. Comment that you're starting
\`\`\`bash
curl -s -X POST "${tasksUrl}/$TASK_ID/comments" ${authHeader} \\
  -H "Content-Type: application/json" \\
  -d '{"author": "${agentName}", "content": "Starting work on this task"}'
\`\`\`

### 3. Do the work
- Read the task title and description carefully
- If \`workingDirectory\` is set: \`cd <workingDirectory>\` before coding
- Implement the changes, run tests, fix issues

### 4. Post progress comments at milestones
\`\`\`bash
curl -s -X POST "${tasksUrl}/$TASK_ID/comments" ${authHeader} \\
  -H "Content-Type: application/json" \\
  -d '{"author": "${agentName}", "content": "Progress update: <what you did>"}'
\`\`\`

### 5. Move to review when complete
\`\`\`bash
curl -s -X PATCH "${tasksUrl}/$TASK_ID" ${authHeader} \\
  -H "Content-Type: application/json" \\
  -d '{"status": "review"}'
\`\`\`

### 6. Post completion summary
\`\`\`bash
curl -s -X POST "${tasksUrl}/$TASK_ID/comments" ${authHeader} \\
  -H "Content-Type: application/json" \\
  -d '{"author": "${agentName}", "content": "Completed: <summary of changes>"}'
\`\`\`

### 7. Pick up next task — repeat from step 1

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/boards/${boardSlug}/tasks | List tasks (filter: ?status=, ?assignee=, ?priority=) |
| POST | /api/boards/${boardSlug}/tasks | Create task |
| PATCH | /api/boards/${boardSlug}/tasks/:id | Update task |
| GET | /api/boards/${boardSlug}/tasks/:id/comments | List comments |
| POST | /api/boards/${boardSlug}/tasks/:id/comments | Add comment |

## Polling
Check for new tasks every 5 minutes when idle.

## Rules
- NEVER ask "which task should I do?" — just pick the highest priority todo
- ALWAYS post a comment when starting and finishing
- ALWAYS move in_progress tasks you find back to review if you finished them
- If a task has a \`workingDirectory\`, always cd there before working
`;
}

function generateCursorPrompt(ctx: PromptContext): string {
  const { boardName, boardSlug, kanbanUrl, agentName, apiKey } = ctx;
  const tasksUrl = `${kanbanUrl}/api/boards/${boardSlug}/tasks`;
  const authFlag = apiKey ? `-H "Authorization: Bearer ${apiKey}"` : "";

  return `# Agent Instructions: ${boardName}

You are **${agentName}** working on the **${boardName}** board at ${kanbanUrl}/boards/${boardSlug}.

## Getting Tasks
\`\`\`bash
# List todo tasks
curl -s "${tasksUrl}?status=todo" ${authFlag}

# List in-progress tasks
curl -s "${tasksUrl}?status=in_progress" ${authFlag}
\`\`\`

## Workflow
1. **Get tasks** → pick highest priority (high > medium > low)
2. **Claim it**: PATCH \`${tasksUrl}/<id>\` with \`{"status":"in_progress"}\`
3. **Comment start**: POST \`${tasksUrl}/<id>/comments\` with \`{"author":"${agentName}","content":"Starting..."}\`
4. **Do the work** (cd to workingDirectory if set)
5. **Move to review**: PATCH with \`{"status":"review"}\`
6. **Comment done**: POST comments with summary
7. **Repeat**

Auth: \`Authorization: Bearer ${apiKey || "YOUR_API_KEY"}\`
`;
}

function generateGenericPrompt(ctx: PromptContext): string {
  const { boardName, boardSlug, kanbanUrl, agentName, apiKey } = ctx;
  const base = `${kanbanUrl}/api/boards/${boardSlug}`;

  return `# Task Agent: ${agentName}

Board: ${boardName}
Base URL: ${base}
Auth: Authorization: Bearer ${apiKey || "YOUR_API_KEY"}

## Workflow
1. GET ${base}/tasks?status=todo — find highest priority task (high > medium > low)
2. PATCH ${base}/tasks/<id> body: {"status":"in_progress"}
3. POST ${base}/tasks/<id>/comments body: {"author":"${agentName}","content":"Starting work"}
4. Execute the task (use workingDirectory field if set)
5. PATCH ${base}/tasks/<id> body: {"status":"review"}
6. POST ${base}/tasks/<id>/comments body: {"author":"${agentName}","content":"Done: <summary>"}
7. Repeat for next task

Poll every 5 minutes when idle.
`;
}
