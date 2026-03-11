# Kanban Board REST API for AI Agents: Research Report

**Date:** 2026-03-11
**Scope:** REST API design patterns, data models, real-time updates, open-source references

---

## 1. REST API Design for AI Agent Consumption

### Best Practices for Agent-Friendly APIs

**Core Principles:**
- **Predictable schema & stateless authentication** — Consistent response structure across all endpoints (RFC 9457 Problem Details recommended for errors)
- **Clear error messages** — Every error must include HTTP status code, error code (string), human-readable message, and documentation links
- **Auth-less or bearer token patterns** — For agent consumption, bearer token (JWT) stateless authentication eliminates session state; no server-side session storage needed
- **Scalable design** — Stateless architecture allows horizontal scaling; any server handles any request

**Error Handling Standard (RFC 9457):**
```json
{
  "type": "https://api.example.com/errors/validation-failed",
  "title": "Validation Failed",
  "detail": "The 'position' field must be a number",
  "instance": "/tasks/123"
}
```

**Critical:** Never return HTTP 200 with error codes—undermines caching and monitoring. Status codes must accurately reflect success/failure at HTTP level.

### Tool Use for Agents (Anthropic Best Practices)

Agents work best with **3-5 tools** as optimal range; 10+ tools mark boundary where latency, cost, and accuracy compound.

**Recommended Features:**
1. **Tool Search** — For systems with 10+ tools consuming >10K tokens, enables Claude to access thousands without context window bloat (85% token reduction)
2. **Clear Return Formats** — Document response schemas; agents parse correctly when examples provided
3. **Tool Use Examples** — 1-5 realistic examples showing proper usage patterns beyond JSON schemas

**Implication:** Kanban API should start with minimal, focused endpoints—board operations, task CRUD, column reordering—not comprehensive feature bloat.

---

## 2. Kanban Board Data Model: Position & Reordering

### Problem Statement

Traditional array-based ordering (storing `[id1, id2, id3]` per column) causes performance bottlenecks:
- Large data transfers between server/database
- Only one insert/reorder per transaction (blocking)
- Timeouts with tens of thousands of items

### Recommended Approach: Fractional Indexing

**How It Works:**
```
Initial positions: item1=0, item2=1, item3=2, item4=3

Move item4 between item1 and item2:
  new_position = (0 + 1) / 2 = 0.5
  DB update: only item4.position = 0.5

Move item3 between item1 (0) and item4 (0.5):
  new_position = (0 + 0.5) / 2 = 0.25
  DB update: only item3.position = 0.25
```

**Advantages:**
- Only moved item requires DB update (no renumbering cascade)
- Infinite practical reordering: 16,384+ insertions before precision limits reached
- Single-pass database operations
- Human-readable float values (0.5, 1.25, 3.75)

**Database Schema:**
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  column_id UUID NOT NULL,
  position FLOAT NOT NULL,  -- Replaces sequential integers
  title TEXT,
  created_at TIMESTAMP,
  UNIQUE(column_id, position)
);
```

### Alternative: Lexicographic Indexing

If float precision concerns exist, use string-based positioning (A-Z characters):
- Generates indices as strings: B, C, CM, D, ...
- Ordered alphabetically
- Scales indefinitely by expanding character count
- Human-readable in databases
- More implementation overhead than fractional indexing

**Recommendation:** Start with fractional indexing; switch to lexicographic only if precision issues emerge in production.

---

## 3. Polling vs. Server-Sent Events (SSE) for Real-Time Updates

### Comparison Matrix

| Aspect | Polling | SSE | WebSocket |
|--------|---------|-----|-----------|
| **Latency** | Up to polling interval | Near real-time | Real-time |
| **Bandwidth** | High (empty responses) | Low (useful data only) | Medium |
| **Complexity** | Simple HTTP | Simple HTTP | Protocol upgrade |
| **Direction** | Client pull | Server push (one-way) | Bidirectional |
| **Use Case** | Infrequent updates | One-way real-time | Interactive apps |

### Polling Interval Recommendations (TanStack Query)

**Best Practices:**
- **Development tools (local)** — 5-10 second intervals adequate for non-critical updates
- **Balance API load vs. freshness** — Adjust based on criticality; longer intervals reduce load
- **Dynamic polling** — Use functions for conditional polling (e.g., stop after task completion)

```typescript
// TanStack Query example
const { data, isRefetching } = useQuery({
  queryKey: ['tasks'],
  queryFn: fetchTasks,
  refetchInterval: 5000, // 5 seconds (local dev)
  // refetchInterval: 30000, // 30 seconds (production)
});
```

**Important:** `refetchInterval` overrides `staleTime` — fetch at specified interval regardless of cache state.

### Recommendation for Local Dev Tool

**Start with polling:**
- Simpler to implement and debug than SSE
- No WebSocket infrastructure needed
- Adequate for local development with small teams
- 5-10 second interval sufficient for non-critical board updates

**Graduate to SSE** when:
- Multiple users editing board simultaneously
- Latency matters (sub-second updates needed)
- Polling becomes bandwidth bottleneck

---

## 4. Open-Source Kanban Implementations: Patterns

### Notable Next.js Projects

**1. Kanban-Next (jonaszb)**
- Stack: Next.js, Supabase, Google/GitHub OAuth, Storybook
- Pattern: User authentication via OAuth; cloud database for board/task storage
- Key learning: Component documentation via Storybook reduces API friction

**2. Multiboard**
- Stack: Next.js, WebSockets, real-time collaboration
- Pattern: `DragDropContext` (react-beautiful-dnd) + socket events for updates
- Key learning: WebSocket pushes updates to all connected users instantly

**3. Standard Tech Stack Patterns**
- **Drag-and-drop:** react-beautiful-dnd (accessible, battle-tested)
- **Styling:** Tailwind CSS (rapid iteration)
- **Animation:** Framer Motion (smooth UX)
- **State management:** TanStack Query (polling/cache management) or Zustand (local state)

### Architecture Pattern for Agent Consumption

Kanban implementations typically:
1. Group tasks by column status
2. Listen for socket/poll events for updates
3. Enable drag-and-drop with position recalculation
4. Send position changes to server via API

**For AI agent consumption**, flatten this:
- Simple REST endpoints for task CRUD
- Clear task-to-column mapping
- Position field exposed directly (no socket abstraction)
- Webhook or polling endpoint for change notifications

---

## Actionable Implementation Summary

### Minimal API Surface (Agent-Friendly)

```
GET    /api/boards/{id}           → Fetch board + columns + tasks
POST   /api/tasks                 → Create task
PATCH  /api/tasks/{id}            → Update task (position, status, etc.)
DELETE /api/tasks/{id}            → Delete task
PATCH  /api/tasks/{id}/position   → Reorder (fractional indexing)
GET    /api/boards/{id}/changes   → Poll for board updates (cursor-based)
```

### Key Decisions

| Decision | Recommendation | Rationale |
|----------|---|---|
| **Position model** | Fractional indexing (float) | Scales infinitely; single DB updates |
| **Real-time** | Polling (5-10s interval) | Adequate for dev tool; simpler than SSE |
| **Auth** | Bearer token (stateless) | Scales horizontally; agent-friendly |
| **Error format** | RFC 9457 (Problem Details) | Standard; agent-parseable |
| **DnD library** | react-beautiful-dnd | Accessible, mature, low maintenance |

---

## Sources

- [Anthropic: Advanced Tool Use](https://www.anthropic.com/engineering/advanced-tool-use)
- [Claude API Overview](https://platform.claude.com/docs/en/api/overview)
- [Nick McCleery: Kanban Board Position Indexing](https://nickmccleery.com/posts/08-kanban-indexing/)
- [Fractional Indexing for Efficient Sorting](https://hollos.dev/blog/fractional-indexing-a-solution-to-sorting/)
- [Speakeasy: REST API Error Handling](https://www.speakeasy.com/api-design/errors)
- [TanStack Query: Polling with refetchInterval](https://tanstack.com/query/v4/docs/framework/react/examples/auto-refetching)
- [RxDB: WebSockets vs SSE vs Polling](https://rxdb.info/articles/websockets-sse-polling-webrtc-webtransport.html)
- [Kanban-Next GitHub](https://github.com/jonaszb/kanban-next)
- [Multiboard: Real-time Kanban](https://next.jqueryscript.net/next-js/kanban-multiboard/)
- [Stateless Authentication with JWT](https://auth0.com/blog/stateless-auth-for-stateful-minds/)

---

## Unresolved Questions

1. **Concurrent edits:** How to handle when multiple agents reorder same column simultaneously? Need optimistic locking or last-write-wins strategy?
2. **Batch operations:** Should API support bulk task operations (move multiple tasks between columns) for efficiency?
3. **Subscription model:** For SSE migration later, should webhooks be event-based (task created/moved/deleted) or state-change based?
4. **Rate limiting:** What reasonable limits for agent polling? (e.g., max 10 reqs/min per board)
