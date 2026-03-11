# Phase 1: Schema Migration

## Context Links
- Current schema: `src/db/schema.ts`
- Auth schema: `src/db/auth-schema.ts`
- Drizzle config: `drizzle.config.ts`
- DB connection: `src/db/index.ts`

## Overview
Add `boards` table, add `boardId` + `workingDirectory` columns to `tasks`, create data migration for existing tasks.

## Key Insights
- Current `tasks` table has no board concept — all tasks are global per user
- Using PostgreSQL via Supabase (Drizzle ORM with `drizzle-kit`)
- `apiKeys` table exists in auth-schema — board keys will live in `boards` table instead
- Position system uses fractional indexing per status column

## Requirements
1. `boards` table with: id, userId, name, slug, description, keyHash, keyPrefix, createdAt, updatedAt
2. `tasks.boardId` FK to boards.id (NOT NULL after migration)
3. `tasks.workingDirectory` optional text field
4. Data migration: create default board per user, assign existing tasks

## Architecture

### boards table
```sql
CREATE TABLE boards (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  key_hash TEXT UNIQUE,       -- SHA-256 hash of board API key
  key_prefix TEXT,            -- first 8 chars for display
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(user_id, slug)       -- slug unique per user
);
```

### tasks table changes
```
+ board_id TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE
+ working_directory TEXT
```

### Drizzle schema addition (src/db/schema.ts)
```ts
export const boards = pgTable("boards", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  keyHash: text("key_hash").unique(),
  keyPrefix: text("key_prefix"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
}, (table) => ({
  uniqueUserSlug: unique().on(table.userId, table.slug),
}));
```

## Related Code Files
- `src/db/schema.ts` — tasks, comments tables
- `src/db/auth-schema.ts` — users, apiKeys tables
- `src/db/index.ts` — db connection with schema import
- `drizzle.config.ts` — migration config

## Implementation Steps

- [ ] 1. Add `boards` table to `src/db/schema.ts`
- [ ] 2. Add `boardId` (text, FK to boards.id, cascade delete) to `tasks` table
- [ ] 3. Add `workingDirectory` (text, nullable) to `tasks` table
- [ ] 4. Update `src/db/index.ts` schema import if needed
- [ ] 5. Run `npx drizzle-kit generate` to create migration
- [ ] 6. Write data migration script: for each user with existing tasks, create a "Default Board" and update tasks.boardId
- [ ] 7. Run `npx drizzle-kit push` or apply migration
- [ ] 8. Update `src/types/index.ts` with Board type and updated Task type

### Board type addition
```ts
export interface Board {
  id: string;
  userId: string;
  name: string;
  slug: string;
  description: string | null;
  keyPrefix: string | null;
  createdAt: string;
  updatedAt: string;
}

// Update Task interface:
export interface Task {
  // ...existing fields...
  boardId: string;
  workingDirectory: string | null;
}
```

## Success Criteria
- `boards` table created in PostgreSQL
- `tasks` has `board_id` and `working_directory` columns
- Existing tasks migrated to a default board per user
- Drizzle schema matches DB state
- TypeScript types updated

## Risk Assessment
- **Data migration**: Must handle users with tasks but no board — create default board first, then update
- **Foreign key ordering**: boards depends on users; tasks depends on boards — migration order matters
- **Null boardId during transition**: Add column as nullable first, migrate data, then set NOT NULL

## Security Considerations
- Board keyHash stored as SHA-256 (same pattern as apiKeys)
- CASCADE delete: deleting a board deletes all its tasks + comments
- Slug uniqueness scoped to user (different users can have same slug)

## Next Steps
Phase 2: Board CRUD API
