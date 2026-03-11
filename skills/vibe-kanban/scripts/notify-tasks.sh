#!/bin/bash
# Notify when new tasks are assigned on Kanban board
# Add to crontab: */5 * * * * bash /path/to/notify-tasks.sh

AGENT_NAME="${1:-${AGENT_NAME:-claude-agent}}"
KANBAN_URL="${2:-${KANBAN_URL:-http://localhost:3001}}"

# Check if server is reachable
if ! curl -s --max-time 2 "${KANBAN_URL}/api/tasks" > /dev/null 2>&1; then
  exit 0
fi

COUNT=$(curl -s "${KANBAN_URL}/api/tasks?assignee=${AGENT_NAME}&status=todo" | \
  python3 -c "import sys,json; print(len(json.load(sys.stdin).get('tasks',[])))" 2>/dev/null || echo "0")

if [ "$COUNT" != "0" ] && [ "$COUNT" != "" ]; then
  # macOS notification
  osascript -e "display notification \"${COUNT} task(s) waiting for ${AGENT_NAME}\" with title \"Vibe Kanban\" sound name \"default\"" 2>/dev/null
fi
