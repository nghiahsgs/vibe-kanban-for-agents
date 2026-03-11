# Phase 2: Board CRUD API

## Context Links
- API helpers: `src/lib/api-helpers.ts`
- Auth helpers: `src/lib/auth-helpers.ts`
- API key generation: `src/lib/api-key.ts`
- Keys route pattern: `src/app/api/keys/route.ts`

## Overview
Create REST endpoints for board management. Session-authenticated only (no API key auth for board CRUD).

## Key Insights
- Follow existing API patterns: `jsonResponse`, `errorResponse`, `validateRequired`
- Board API key uses same `generateApiKey()` from `src/lib/api-key.ts`
- Slug auto-generated from name (slugify), must be unique per user
- Only board owner can manage their boards

## Requirements
1. `GET /api/boards` — list user's boards
2. `POST /api/boards` — create board (auto-generate slug, optionally generate API key)
3. `GET /api/boards/[slug]` — get board by slug
4. `PATCH /api/boards/[slug]` — update board (name, description, slug)
5. `DELETE /api/boards/[slug]` — delete board (cascades tasks)
6. `POST /api/boards/[slug]/regenerate-key` — regenerate board API key

## Architecture

### Route structure
```
src/app/api/boards/
  route.ts                    — GET (list), POST (create)
  [slug]/
    route.ts                  — GET, PATCH, DELETE
    regenerate-key/
      route.ts                — POST
```

### Slug generation
```ts
function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50);
}
```
If slug conflict, append `-2`, `-3`, etc.

## Related Code Files
- `src/lib/api-helpers.ts` — reuse jsonResponse, errorResponse, validateRequired
- `src/lib/api-key.ts` — reuse generateApiKey for board keys
- `src/lib/auth-helpers.ts` — getAuthUser (session only for board CRUD)
- `src/app/api/keys/route.ts` — reference pattern for key generation

## Implementation Steps

- [ ] 1. Add `slugify` utility to `src/lib/utils.ts` or new `src/lib/slug.ts`
- [ ] 2. Create `src/app/api/boards/route.ts`
  - GET: list boards where userId = session user, return `{ boards: [...] }`
  - POST: validate name, generate slug, optionally generate API key, insert board
- [ ] 3. Create `src/app/api/boards/[slug]/route.ts`
  - GET: find board by slug + userId
  - PATCH: update name/description/slug (re-slugify if name changed)
  - DELETE: delete board (cascade)
- [ ] 4. Create `src/app/api/boards/[slug]/regenerate-key/route.ts`
  - POST: generate new key, update board keyHash/keyPrefix, return raw key (once)
- [ ] 5. Add board validation: prevent deleting last board (user must have at least 1)

### POST /api/boards request body
```json
{
  "name": "My Project",
  "description": "Optional description",
  "generateKey": true
}
```

### POST /api/boards response
```json
{
  "id": "uuid",
  "name": "My Project",
  "slug": "my-project",
  "description": "Optional description",
  "apiKey": "vk_abc123...",  // only if generateKey=true, shown once
  "keyPrefix": "vk_abc12",
  "createdAt": "...",
  "updatedAt": "..."
}
```

## Success Criteria
- All 6 endpoints working with session auth
- Slug auto-generation + uniqueness enforcement
- API key generation/regeneration works
- Cannot delete last board
- Proper error responses for 400/401/404/409

## Risk Assessment
- **Slug collision**: Handle by appending numeric suffix
- **Race condition on slug creation**: Use DB unique constraint as safety net
- **Deleting board with tasks**: CASCADE delete — warn user in UI (Phase 5)

## Security Considerations
- Session auth only — agents cannot create/modify boards
- Raw API key returned only on create/regenerate, never stored
- Board ownership enforced: all queries filter by userId

## Next Steps
Phase 3: Agent Auth Middleware
