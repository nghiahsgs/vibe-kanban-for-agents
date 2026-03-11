# Phase 05: API Key Auth for Agents

## Context
- [Research: Auth Solutions](./research/researcher-02-auth-solutions.md)
- [Phase 03: Auth Core](./phase-03-auth-core.md) (prerequisite)
- [Phase 04: Auth UI](./phase-04-auth-ui.md) (prerequisite)
- [Plan overview](./plan.md)

## Overview
Add API key CRUD, Bearer token validation in middleware, and dual auth (session OR API key) on all API routes. This is the critical phase for maintaining agent compatibility.

## Key Insights
- Agents currently hit `/api/tasks/*` with no auth - must add Bearer token support
- API keys hashed with SHA-256 in DB; raw key shown once on creation
- Keys tied to user; agent actions attributed to key owner
- Middleware checks: session cookie first, then Bearer header
- Existing API contract preserved - only auth header added

## Requirements
1. API key database table (api_keys)
2. API key generation endpoint (POST /api/keys)
3. API key list/revoke endpoints (GET /api/keys, DELETE /api/keys/:id)
4. Bearer token validation in API route middleware
5. Dual auth: session cookie OR Bearer token accepted on /api/* routes
6. API Keys management page in web UI
7. Update README with auth documentation

## Architecture

### Database Schema Addition
```
src/db/auth-schema.ts  -- add api_keys table
```

```ts
export const apiKeys = sqliteTable("api_keys", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),          // "My Agent Key"
  keyPrefix: text("key_prefix").notNull(), // "vk_abc1" (first 8 chars for identification)
  keyHash: text("key_hash").notNull().unique(), // SHA-256 hash of full key
  lastUsedAt: integer("last_used_at", { mode: "timestamp" }),
  expiresAt: integer("expires_at", { mode: "timestamp" }), // null = never expires
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
```

### API Key Format
```
vk_<32-char-random-hex>
Example: vk_a1b2c3d4e5f6789012345678abcdef01
```
- Prefix `vk_` for "Vibe Kanban" - easily identifiable
- 32 hex chars = 128 bits of entropy

### New Files
```
src/app/api/keys/route.ts           -- GET list, POST create
src/app/api/keys/[id]/route.ts      -- DELETE revoke
src/lib/api-key.ts                  -- key generation, hashing, validation
src/app/settings/page.tsx           -- API keys management UI
src/components/settings/api-key-list.tsx    -- list/revoke keys
src/components/settings/create-key-dialog.tsx  -- create key form
```

### Modified Files
```
src/db/auth-schema.ts               -- add api_keys table
src/middleware.ts                    -- add Bearer token validation
src/app/api/tasks/route.ts          -- use auth context (optional: add userId to queries)
src/app/api/tasks/[id]/route.ts     -- use auth context
src/app/api/tasks/[id]/comments/route.ts -- use auth context
src/components/auth/user-menu.tsx    -- add "API Keys" link
src/lib/api-helpers.ts              -- add auth extraction helpers
```

## Related Code Files
- `src/middleware.ts` - needs Bearer token check
- `src/lib/auth.ts` - Better Auth config
- `src/app/api/tasks/route.ts` - needs auth context
- `src/app/api/tasks/[id]/route.ts` - needs auth context
- `src/lib/api-helpers.ts` - shared API utilities

## Implementation Steps

### 1. Create API key utility (src/lib/api-key.ts)
```ts
import crypto from "crypto";

export function generateApiKey(): { raw: string; hash: string; prefix: string } {
  const raw = `vk_${crypto.randomBytes(16).toString("hex")}`;
  const hash = crypto.createHash("sha256").update(raw).digest("hex");
  const prefix = raw.slice(0, 8);
  return { raw, hash, prefix };
}

export function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}
```

### 2. Add api_keys table to schema
Edit `src/db/auth-schema.ts` - add `apiKeys` table as described in Architecture section above.

### 3. Push schema
```bash
npm run db:push
```

### 4. Create API key endpoints

**POST /api/keys** (src/app/api/keys/route.ts)
- Requires session auth (only web UI creates keys)
- Body: `{ name: string, expiresAt?: string }`
- Generate key, store hash, return raw key ONCE
- Response: `{ id, name, key: "vk_...", prefix: "vk_a1b2", expiresAt, createdAt }`

**GET /api/keys** (same file)
- Requires session auth
- Returns user's keys: `{ keys: [{ id, name, prefix, lastUsedAt, expiresAt, createdAt }] }`
- Never return key hash or raw key

**DELETE /api/keys/:id** (src/app/api/keys/[id]/route.ts)
- Requires session auth
- Verify key belongs to requesting user
- Delete key record
- Response: 204

### 5. Update middleware for Bearer token validation
Edit `src/middleware.ts`:
- For `/api/*` routes (except `/api/auth/*` and `/api/keys`):
  1. Check session cookie first (existing)
  2. If no session, check `Authorization: Bearer vk_...` header
  3. If Bearer present, validate by hashing and looking up in api_keys table
  4. Update `lastUsedAt` on successful API key auth
  5. If neither auth method succeeds, return 401

**Important:** Middleware runs on Edge runtime by default. SQLite (better-sqlite3) requires Node runtime. Solutions:
- Option A: Move API key validation to route-level helper (recommended)
- Option B: Use `export const runtime = "nodejs"` in middleware (if supported)

**Recommended approach:** Keep middleware lightweight (cookie/header presence check only). Move actual validation to a shared `withAuth()` wrapper used in each route handler.

### 6. Create auth wrapper for API routes
Add to `src/lib/auth-helpers.ts`:
```ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { apiKeys } from "@/db/auth-schema";
import { eq } from "drizzle-orm";
import { hashApiKey } from "@/lib/api-key";

export async function getAuthUser(): Promise<{ userId: string; authMethod: "session" | "api_key" } | null> {
  // Try session first
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user) {
    return { userId: session.user.id, authMethod: "session" };
  }

  // Try API key
  const headersList = await headers();
  const authHeader = headersList.get("authorization");
  if (authHeader?.startsWith("Bearer vk_")) {
    const key = authHeader.slice(7); // Remove "Bearer "
    const keyHash = hashApiKey(key);
    const keyRecord = db.select().from(apiKeys).where(eq(apiKeys.keyHash, keyHash)).get();
    if (keyRecord) {
      // Check expiry
      if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) return null;
      // Update lastUsedAt
      db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, keyRecord.id)).run();
      return { userId: keyRecord.userId, authMethod: "api_key" };
    }
  }

  return null;
}

export async function requireAuth() {
  const authUser = await getAuthUser();
  if (!authUser) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  return authUser;
}
```

### 7. Add auth to existing API routes
Edit each route to add auth check at top of handler:

**src/app/api/tasks/route.ts** (GET, POST):
```ts
const authUser = await getAuthUser();
if (!authUser) return errorResponse(401, "Unauthorized", "Valid session or API key required");
```

**src/app/api/tasks/[id]/route.ts** (GET, PATCH, DELETE) - same pattern.

**src/app/api/tasks/[id]/comments/route.ts** (GET, POST) - same pattern.

Note: For now, auth just gates access. Task ownership (filtering by userId) is a future enhancement - current behavior returns all tasks regardless of user, which is correct for shared boards.

### 8. Create API Keys settings page (src/app/settings/page.tsx)
- Protected page (middleware handles redirect)
- Heading: "API Keys"
- Subheading: "Manage keys for programmatic access"
- List existing keys (name, prefix, last used, expiry)
- "Create new key" button opens dialog
- Revoke button per key (with confirmation)
- Copy-to-clipboard for newly created key (shown once)

### 9. Create API key UI components

**src/components/settings/api-key-list.tsx:**
- Table/list of keys: Name | Key Prefix | Last Used | Expires | Actions
- Revoke action per key (destructive button)
- Empty state: "No API keys yet"

**src/components/settings/create-key-dialog.tsx:**
- Dialog with form: Key name (required), Expiration (optional select: never, 30d, 90d, 1y)
- On create: show the raw key in a highlighted box with copy button
- Warning: "This key will only be shown once. Copy it now."
- Close button

### 10. Add "API Keys" link to user menu
Edit `src/components/auth/user-menu.tsx`:
- Add menu item linking to `/settings`

### 11. Update README.md
Add authentication section:
- How to sign up / sign in
- How to create API key via UI
- How agents use Bearer token:
  ```bash
  curl -H "Authorization: Bearer vk_your_key_here" http://localhost:3000/api/tasks
  ```

## Todo
- [ ] Create src/lib/api-key.ts (generation, hashing)
- [ ] Add api_keys table to auth schema
- [ ] Push schema to database
- [ ] Create POST /api/keys endpoint
- [ ] Create GET /api/keys endpoint
- [ ] Create DELETE /api/keys/:id endpoint
- [ ] Create getAuthUser() helper with dual auth
- [ ] Add auth checks to GET /api/tasks
- [ ] Add auth checks to POST /api/tasks
- [ ] Add auth checks to GET/PATCH/DELETE /api/tasks/:id
- [ ] Add auth checks to GET/POST /api/tasks/:id/comments
- [ ] Create settings page
- [ ] Create api-key-list component
- [ ] Create create-key-dialog component
- [ ] Add "API Keys" link to user menu
- [ ] Update README with auth docs
- [ ] Test: API key creation returns raw key
- [ ] Test: Bearer token auth works on /api/tasks
- [ ] Test: Expired keys are rejected
- [ ] Test: Revoked keys no longer work
- [ ] Test: Session auth still works on /api/tasks
- [ ] Test: Agent workflow with API key (create, list, update tasks)

## Success Criteria
- Users can create, list, and revoke API keys from web UI
- Agents can authenticate with `Authorization: Bearer vk_...` header
- All existing API endpoints require auth (session or API key)
- Existing API contract unchanged (same request/response shapes, just auth header added)
- Raw API key shown only once on creation
- Key prefix visible for identification in key list
- lastUsedAt updated on each API key use
- Expired keys rejected with 401

## Risk Assessment
- **High:** Breaking existing agent workflows - mitigate by clear documentation and testing agent flow end-to-end
- **Medium:** Middleware runtime (Edge vs Node) - use route-level auth helpers instead of middleware DB access
- **Low:** API key entropy - 128 bits is sufficient; use crypto.randomBytes
- **Low:** Timing attacks on key comparison - SHA-256 hash comparison + DB lookup makes timing attacks impractical

## Security Considerations
- API keys stored as SHA-256 hashes only (raw key never persisted)
- Raw key displayed once on creation, never retrievable again
- Keys scoped to user; key owner identified for all API actions
- Key expiration enforced server-side
- Rate limiting recommended (future enhancement): per-key rate limits
- Audit logging recommended (future enhancement): log API key usage
- HTTPS required in production (API keys in headers)

## Unresolved Questions
1. Should tasks be scoped to the key owner, or remain globally visible? (Current plan: global - all authenticated users see all tasks, matching current no-auth behavior)
2. Rate limiting per API key? (Defer to future enhancement)
3. Key rotation support? (User can create new key + revoke old one manually)

## Next Steps
All 5 phases complete. Post-implementation:
- E2E testing of full auth + UI flow
- Update agent SKILL.md documentation with auth instructions
- Consider: task ownership, rate limiting, audit logging
