# Phase 7: Agent Onboarding Prompt Generator

## Context Links
- Agent skill scripts: `skills/vibe-kanban/scripts/check-tasks.sh`
- CLAUDE.md agent instructions: `./CLAUDE.md`
- Board settings: created in Phase 5

## Overview
Add UI page/dialog to generate a copy-pasteable prompt that configures an AI agent (Claude Code, Cursor, etc.) to work with a specific board. Prompt includes board API key, kanban URL, agent name, and workflow instructions.

## Key Insights
- Current `CLAUDE.md` already contains agent behavior rules — reuse that pattern
- Agent needs: KANBAN_URL, API key (Bearer token), agent name, board slug
- `check-tasks.sh` script is the existing agent entry point — reference it in prompt
- Different agents (Claude Code, Cursor, Copilot) may need slightly different prompt formats
- Board API key must already exist (generated in board creation/settings)

## Requirements
1. Agent setup page accessible from board settings or header
2. Form: agent name input, kanban URL (default to current host), agent type selector
3. Generated prompt includes: env vars, auth header, workflow instructions, API endpoints
4. Copy-to-clipboard button
5. Show warning if board has no API key (link to generate one)

## Architecture

### Component structure
```
src/components/board/agent-onboarding-dialog.tsx  — main dialog
src/lib/prompt-templates.ts                       — prompt generation logic
```

### Route (optional — could be dialog-only)
```
src/app/boards/[slug]/agents/page.tsx    — standalone page (alternative to dialog)
```

### Prompt template (Claude Code example)
```markdown
# Agent Configuration for {boardName}

## Environment
KANBAN_URL={kanbanUrl}
AGENT_NAME={agentName}

## Authentication
All API requests must include:
Authorization: Bearer {apiKey}

## Workflow
1. Check tasks: GET {kanbanUrl}/api/boards/{slug}/tasks?assignee={agentName}&status=todo
2. Pick highest priority task
3. Update status: PATCH {kanbanUrl}/api/boards/{slug}/tasks/{taskId} with {"status": "in_progress"}
4. Comment start: POST {kanbanUrl}/api/boards/{slug}/tasks/{taskId}/comments
5. Do the work
6. Move to review: PATCH with {"status": "review"}
7. Comment completion summary
8. Pick next task

## API Endpoints
- GET /api/boards/{slug}/tasks — list tasks (?assignee=, ?status=, ?priority=)
- GET /api/boards/{slug}/tasks/:id — get task
- PATCH /api/boards/{slug}/tasks/:id — update task
- POST /api/boards/{slug}/tasks/:id/comments — add comment

## Priority Order: high > medium > low
```

### Agent type presets
```ts
type AgentType = "claude-code" | "cursor" | "generic";

const AGENT_PRESETS: Record<AgentType, { label: string; formatFn: (ctx: PromptContext) => string }> = {
  "claude-code": { label: "Claude Code", formatFn: formatClaudeCodePrompt },
  "cursor": { label: "Cursor", formatFn: formatCursorPrompt },
  "generic": { label: "Generic Agent", formatFn: formatGenericPrompt },
};
```

## Related Code Files
- `CLAUDE.md` — reference for agent instruction format
- `skills/vibe-kanban/scripts/check-tasks.sh` — existing agent script pattern
- `src/components/board/board-settings-dialog.tsx` — link to agent setup

## Implementation Steps

- [ ] 1. Create `src/lib/prompt-templates.ts` — PromptContext type, template functions per agent type
- [ ] 2. Create `src/components/board/agent-onboarding-dialog.tsx`
  - Agent name input (default: "claude-agent")
  - Agent type selector (Claude Code, Cursor, Generic)
  - Kanban URL (default: `window.location.origin`)
  - Generated prompt textarea (readonly, auto-updates)
  - Copy button with success toast
  - Warning if no board API key
- [ ] 3. Add "Agent Setup" button to board header or settings
- [ ] 4. Style: monospace font for prompt area, syntax highlighting optional (YAGNI)
- [ ] 5. Test: generate prompt, copy, verify all variables populated

### PromptContext type
```ts
interface PromptContext {
  boardName: string;
  boardSlug: string;
  kanbanUrl: string;
  agentName: string;
  apiKey: string;  // only if user provides it (not stored, entered in UI)
}
```

### API key handling in UI
- Board API key is NOT fetched from server (only hash stored)
- User must paste their API key into the dialog (from when they generated it)
- OR: provide a "regenerate key" button that shows key once and pre-fills

## Success Criteria
- User can generate agent prompt for any board
- Prompt includes all necessary config (URL, auth, endpoints, workflow)
- Copy button works
- Multiple agent type formats supported
- Warning shown if board has no API key

## Risk Assessment
- **API key exposure**: Key entered in browser — acceptable since user owns it. Not persisted.
- **Stale prompts**: If API changes, prompt template must be updated manually

## Security Considerations
- API key not fetched from server — user provides it
- Prompt generated client-side only
- No API key stored in browser localStorage

## Next Steps
- Integration testing across all phases
- Update `skills/vibe-kanban/scripts/check-tasks.sh` to support board-scoped endpoints
- Update `CLAUDE.md` with board-aware agent instructions
