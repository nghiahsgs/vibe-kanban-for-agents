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

/** Build the -H auth flag; returns empty string if no key (commands still work via session) */
function authFlag(apiKey: string): string {
  return apiKey ? `-H "Authorization: Bearer ${apiKey}"` : "";
}

function generateClaudeCodePrompt(ctx: PromptContext): string {
  const { boardName, boardSlug, kanbanUrl, agentName, apiKey } = ctx;
  const tasksUrl = `${kanbanUrl}/api/boards/${boardSlug}/tasks`;
  const auth = authFlag(apiKey);
  const authLine = auth ? `\n${auth} \\` : "";

  return `# ${boardName} — Agent Instructions

## Identity
You are **${agentName}**, an AI coding agent assigned to the **${boardName}** Kanban board.

## Board Access
- Board URL: ${kanbanUrl}/boards/${boardSlug}
- API base: ${kanbanUrl}/api/boards/${boardSlug}
${apiKey ? `- Auth header: \`Authorization: Bearer ${apiKey}\`` : "- Auth: ⚠️ No API key set — generate one in Agent Management"}

## Workflow

Process ALL available todo tasks in one session. After finishing a task, check for more. Only stop when zero todo tasks remain.

For continuous polling, run this prompt with: \`/loop 5m\` (checks every 5 minutes)

## Step 1: Check for tasks
\`\`\`bash
# Get highest priority todo task
curl -s "${tasksUrl}?status=todo"${authLine}
  -H "Content-Type: application/json" | jq '.tasks | sort_by(.priority == "high") | reverse | .[0]'

# Also check if you have in-progress tasks to finish
curl -s "${tasksUrl}?status=in_progress&assignee=${agentName}"${authLine}
  -H "Content-Type: application/json" | jq '.tasks'
\`\`\`

## Step 2: Pick up the task
\`\`\`bash
TASK_ID="<task-id-from-step-1>"
curl -s -X PATCH "${tasksUrl}/$TASK_ID"${authLine}
  -H "Content-Type: application/json" \\
  -d '{"status": "in_progress", "assignee": "${agentName}"}'
\`\`\`

## Step 3: Comment that you're starting
\`\`\`bash
curl -s -X POST "${tasksUrl}/$TASK_ID/comments"${authLine}
  -H "Content-Type: application/json" \\
  -d '{"author": "${agentName}", "content": "Starting work on this task"}'
\`\`\`

## Step 4: Do the work
- Read the task title and description carefully
- If \`workingDirectory\` is set: \`cd <workingDirectory>\` before coding
- Implement the changes, run tests, fix issues
- Post progress comments at milestones:
\`\`\`bash
curl -s -X POST "${tasksUrl}/$TASK_ID/comments"${authLine}
  -H "Content-Type: application/json" \\
  -d '{"author": "${agentName}", "content": "Progress: <what you did>"}'
\`\`\`

## Step 5: Complete — move to review
\`\`\`bash
curl -s -X PATCH "${tasksUrl}/$TASK_ID"${authLine}
  -H "Content-Type: application/json" \\
  -d '{"status": "review"}'

curl -s -X POST "${tasksUrl}/$TASK_ID/comments"${authLine}
  -H "Content-Type: application/json" \\
  -d '{"author": "${agentName}", "content": "✅ Completed: <summary of changes>"}'
\`\`\`

## Step 6: Check for more tasks
Go back to Step 1. If more todo tasks exist, pick up the next one.
If no tasks remain, you're done for this session.

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | ${tasksUrl} | List tasks (?status=, ?assignee=, ?priority=) |
| POST | ${tasksUrl} | Create task |
| PATCH | ${tasksUrl}/:id | Update task |
| GET | ${tasksUrl}/:id/comments | List comments |
| POST | ${tasksUrl}/:id/comments | Add comment |

## Rules
- Process ALL available todo tasks before stopping
- NEVER ask "which task should I do?" — pick highest priority todo
- ALWAYS post a comment when starting and finishing a task
- ALWAYS set assignee to "${agentName}" when picking up a task
- If a task has a \`workingDirectory\`, always cd there before working
- Priority order: high > medium > low
`;
}

function generateCursorPrompt(ctx: PromptContext): string {
  const { boardName, boardSlug, kanbanUrl, agentName, apiKey } = ctx;
  const tasksUrl = `${kanbanUrl}/api/boards/${boardSlug}/tasks`;
  const auth = authFlag(apiKey);
  const authInline = auth ? ` ${auth}` : "";

  return `# Agent Instructions: ${boardName}

You are **${agentName}** working on the **${boardName}** board at ${kanbanUrl}/boards/${boardSlug}.
${apiKey ? `Auth: \`Authorization: Bearer ${apiKey}\`` : "Auth: ⚠️ No API key — generate one in Agent Management"}

## Getting Tasks
\`\`\`bash
curl -s "${tasksUrl}?status=todo"${authInline}
curl -s "${tasksUrl}?status=in_progress&assignee=${agentName}"${authInline}
\`\`\`

## Workflow (process all available tasks, then exit)
1. **Check tasks** → pick highest priority todo (high > medium > low)
2. **Claim it**: PATCH \`${tasksUrl}/<id>\` with \`{"status":"in_progress","assignee":"${agentName}"}\`
3. **Comment start**: POST \`${tasksUrl}/<id>/comments\` with \`{"author":"${agentName}","content":"Starting..."}\`
4. **Do the work** (cd to workingDirectory if set)
5. **Move to review**: PATCH with \`{"status":"review"}\`
6. **Comment done**: POST comments with summary
7. **Check for more tasks** — repeat from step 1 until none remain

For continuous polling: \`/loop 5m\`
`;
}

function generateGenericPrompt(ctx: PromptContext): string {
  const { boardName, boardSlug, kanbanUrl, agentName, apiKey } = ctx;
  const base = `${kanbanUrl}/api/boards/${boardSlug}`;

  return `# Task Agent: ${agentName}

Board: ${boardName}
Base URL: ${base}
${apiKey ? `Auth: Authorization: Bearer ${apiKey}` : "Auth: ⚠️ No API key — generate one in Agent Management"}

## Workflow (process all available tasks, then exit)
1. GET ${base}/tasks?status=todo — find highest priority task (high > medium > low)
2. PATCH ${base}/tasks/<id> body: {"status":"in_progress","assignee":"${agentName}"}
3. POST ${base}/tasks/<id>/comments body: {"author":"${agentName}","content":"Starting work"}
4. Execute the task (use workingDirectory field if set)
5. PATCH ${base}/tasks/<id> body: {"status":"review"}
6. POST ${base}/tasks/<id>/comments body: {"author":"${agentName}","content":"Done: <summary>"}
7. Check for more tasks — repeat until none remain

For continuous polling: /loop 5m
`;
}
