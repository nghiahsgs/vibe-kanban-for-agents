# Phase 3: Agent Auth Middleware

## Context Links
- Current auth: `src/lib/auth-helpers.ts`
- API key utils: `src/lib/api-key.ts`
- Auth schema: `src/db/auth-schema.ts`

## Overview
Extend auth system so board API keys authenticate agents and automatically scope them to a board. User-level API keys continue working for backward compat.

## Key Insights
- Current `getAuthUser()` checks session first, then user-level API key in `apiKeys` table
- Board API keys stored in `boards.keyHash` (same SHA-256 pattern)
- Need to return `boardId` when authenticated via board key
- User-level API keys (from `apiKeys` table) need a way to select board — default to first board

## Requirements
1. Extend `AuthUser` type with optional `boardId`
2. Update `getAuthUser()`: after user-level key check, also check `boards.keyHash`
3. Board key auth: return `{ userId: board.userId, boardId: board.id, authMethod: "board_key" }`
4. User-level API key: no boardId set (caller must pass boardId or use default)

## Architecture

### Updated AuthUser type
```ts
export type AuthUser = {
  userId: string;
  authMethod: "session" | "api_key" | "board_key";
  boardId?: string;  // set when auth via board API key
};
```

### Auth flow (updated getAuthUser)
```
1. Check session -> return { userId, authMethod: "session" }
2. Check Authorization header for "Bearer vk_..."
   a. Hash key
   b. Look up in apiKeys table -> return { userId, authMethod: "api_key" }
   c. Look up in boards.keyHash -> return { userId: board.userId, boardId: board.id, authMethod: "board_key" }
3. Return null
```

### Helper function
```ts
export function requireBoardId(authUser: AuthUser, requestBoardId?: string): string | null {
  if (authUser.boardId) return authUser.boardId;  // board key auth
  if (requestBoardId) return requestBoardId;       // explicit param
  return null;                                     // caller must handle
}
```

## Related Code Files
- `src/lib/auth-helpers.ts` — main file to modify
- `src/lib/api-key.ts` — hashApiKey function (reused)
- `src/db/schema.ts` — boards table (keyHash column)

## Implementation Steps

- [ ] 1. Update `AuthUser` type: add optional `boardId`, add `"board_key"` to authMethod union
- [ ] 2. Update `getAuthUser()`: after apiKeys lookup fails, check `boards.keyHash`
- [ ] 3. Add `requireBoardId()` helper function
- [ ] 4. Update `lastUsedAt` tracking: for board keys, update boards.updatedAt (or add lastUsedAt to boards)
- [ ] 5. Test: board key returns boardId, user key returns no boardId, session returns no boardId

## Success Criteria
- Board API key authenticates and returns boardId
- User-level API key still works (backward compat)
- Session auth unchanged
- Expired board keys rejected (if expiry added later — skip for now, YAGNI)

## Risk Assessment
- **Key collision between apiKeys and boards**: Both use SHA-256 of same key format — extremely unlikely but check both tables in order
- **Performance**: Two DB lookups on API key miss — acceptable, could optimize with single query using UNION later

## Security Considerations
- Board key scopes agent to specific board — cannot access other boards
- Key hash lookup prevents timing attacks
- No expiry on board keys for now (KISS) — can add later

## Next Steps
Phase 4: Board-Scoped Tasks API
