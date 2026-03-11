#!/bin/bash
# Check Kanban board for tasks assigned to this agent
# Usage: check-tasks.sh [agent-name] [kanban-url]

AGENT_NAME="${1:-${AGENT_NAME:-claude-agent}}"
KANBAN_URL="${2:-${KANBAN_URL:-http://localhost:3001}}"

# Check if kanban server is reachable
if ! curl -s --max-time 2 "${KANBAN_URL}/api/tasks" > /dev/null 2>&1; then
  echo "Kanban board not reachable at ${KANBAN_URL}"
  exit 0
fi

# Fetch tasks assigned to this agent with status=todo
TASKS=$(curl -s "${KANBAN_URL}/api/tasks?assignee=${AGENT_NAME}&status=todo")
COUNT=$(echo "$TASKS" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('tasks',[])))" 2>/dev/null || echo "0")

if [ "$COUNT" = "0" ]; then
  echo "No pending tasks for ${AGENT_NAME}."
else
  echo "=== Kanban: ${COUNT} task(s) assigned to ${AGENT_NAME} ==="
  echo "$TASKS" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for t in data.get('tasks', []):
    priority = t.get('priority', '?').upper()
    title = t.get('title', 'Untitled')
    tid = t.get('id', '')[:8]
    desc = (t.get('description') or 'No description')[:80]
    print(f'  [{priority}] {title} (id: {tid}...)')
    print(f'        {desc}')
" 2>/dev/null
  echo ""
  echo "Use: /kanban pickup <task-id> to start working on a task"
fi

# Also check in_progress tasks
IN_PROGRESS=$(curl -s "${KANBAN_URL}/api/tasks?assignee=${AGENT_NAME}&status=in_progress")
IP_COUNT=$(echo "$IN_PROGRESS" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('tasks',[])))" 2>/dev/null || echo "0")

if [ "$IP_COUNT" != "0" ]; then
  echo "=== Currently In Progress (${IP_COUNT}) ==="
  echo "$IN_PROGRESS" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for t in data.get('tasks', []):
    title = t.get('title', 'Untitled')
    tid = t.get('id', '')[:8]
    print(f'  [WIP] {title} (id: {tid}...)')
" 2>/dev/null
fi
