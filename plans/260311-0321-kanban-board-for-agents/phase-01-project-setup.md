# Phase 01 - Project Setup & Configuration

## Context
- [Tech Stack Report](./research/researcher-01-tech-stack-report.md)
- [API Design Report](./research/researcher-260311-api-design-patterns-report.md)
- [Plan Overview](./plan.md)

## Overview
Bootstrap Next.js 15 project with all dependencies, configure Tailwind v4, shadcn/ui, Drizzle ORM, and establish project structure.

## Key Insights
- Tailwind v4 uses `@import "tailwindcss"` + `@theme` directive; no `tailwind.config.ts` needed for basic setup
- shadcn/ui v2 is React 19 compatible, works with Tailwind v4 out of box
- better-sqlite3 is native module; must be server-side only
- `drizzle-kit push` for rapid dev iteration

## Requirements
- Working Next.js 15 dev server
- All dependencies installed
- shadcn/ui initialized with needed components
- Drizzle config pointing to local SQLite file
- DB schema defined and pushed
- Project folder structure created

## Architecture
```
vibe-kanban-for-agents/
├── src/
│   ├── app/
│   │   ├── api/          # Route handlers
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Main page (board)
│   │   └── globals.css   # Tailwind imports + theme
│   ├── db/
│   │   ├── index.ts      # DB singleton connection
│   │   └── schema.ts     # Drizzle table definitions
│   ├── components/ui/    # shadcn components
│   ├── lib/utils.ts      # cn() helper
│   └── types/index.ts    # Shared types
├── drizzle.config.ts
├── package.json
├── tsconfig.json
└── .env.local            # DATABASE_URL=./data/kanban.db
```

## Related Code Files
- `src/db/schema.ts` — Drizzle table definitions (tasks, comments)
- `src/db/index.ts` — Database connection singleton
- `src/types/index.ts` — TypeScript type definitions
- `drizzle.config.ts` — Drizzle Kit configuration
- `src/app/globals.css` — Tailwind v4 theme
- `src/app/layout.tsx` — Root layout with providers
- `.env.local` — Environment variables

## Implementation Steps

### Step 1: Initialize Next.js project
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```
- Accept defaults for all prompts
- Verify dev server runs with `npm run dev`

### Step 2: Install dependencies
```bash
# Database
npm install better-sqlite3 drizzle-orm
npm install -D drizzle-kit @types/better-sqlite3

# Drag and drop
npm install @hello-pangea/dnd

# Server state
npm install @tanstack/react-query

# UI (shadcn init + components)
npx shadcn@latest init
npx shadcn@latest add button card dialog input textarea select badge dropdown-menu
```

### Step 3: Create environment file
**File: `.env.local`**
```
DATABASE_URL=./data/kanban.db
```

### Step 4: Configure Drizzle
**File: `drizzle.config.ts`**
```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL || './data/kanban.db',
  },
});
```

### Step 5: Define database schema
**File: `src/db/schema.ts`**
```typescript
import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),           // UUID
  title: text('title').notNull(),
  description: text('description'),
  status: text('status', { enum: ['todo', 'in_progress', 'review', 'done'] })
    .notNull()
    .default('todo'),
  assignee: text('assignee'),
  priority: text('priority', { enum: ['low', 'medium', 'high'] })
    .notNull()
    .default('medium'),
  position: real('position').notNull(),   // Fractional indexing
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export const comments = sqliteTable('comments', {
  id: text('id').primaryKey(),           // UUID
  taskId: text('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  author: text('author').notNull(),
  content: text('content').notNull(),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});
```

### Step 6: Create DB connection
**File: `src/db/index.ts`**
```typescript
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import path from 'path';
import fs from 'fs';

const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const dbPath = path.join(dbDir, 'kanban.db');
const sqlite = new Database(dbPath);

// Enable WAL mode for better concurrent read performance
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });
```

### Step 7: Define TypeScript types
**File: `src/types/index.ts`**
```typescript
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  assignee: string | null;
  priority: TaskPriority;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface ApiError {
  type: string;
  title: string;
  detail: string;
  instance?: string;
}

export const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: 'todo', label: 'Todo' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Done' },
];
```

### Step 8: Push schema to database
```bash
npx drizzle-kit push
```

### Step 9: Create project directories
```bash
mkdir -p src/components/board src/components/task src/hooks src/lib
mkdir -p src/app/api/tasks/[id]/comments
mkdir -p data
```

### Step 10: Add `.gitignore` entries
Append to `.gitignore`:
```
data/
*.db
*.db-wal
*.db-shm
```

### Step 11: Add npm scripts
Add to `package.json`:
```json
{
  "scripts": {
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

## Todo
- [ ] Initialize Next.js 15 project
- [ ] Install all dependencies
- [ ] Create `.env.local`
- [ ] Configure Drizzle (`drizzle.config.ts`)
- [ ] Define DB schema (`src/db/schema.ts`)
- [ ] Create DB connection (`src/db/index.ts`)
- [ ] Define TypeScript types (`src/types/index.ts`)
- [ ] Initialize shadcn/ui + add components
- [ ] Push schema to SQLite
- [ ] Create folder structure
- [ ] Update `.gitignore`
- [ ] Add npm scripts
- [ ] Verify dev server runs clean

## Success Criteria
- `npm run dev` starts without errors
- `npx drizzle-kit push` creates SQLite DB with tasks + comments tables
- shadcn/ui components render correctly
- All project directories exist per structure

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| better-sqlite3 native build fails | High | Ensure node-gyp + build tools installed |
| Tailwind v4 + shadcn incompatibility | Medium | Use latest shadcn version; follow v4 guide |
| DB file permissions | Low | Create `data/` dir with proper permissions |

## Security Considerations
- SQLite DB file in `data/` excluded from git
- No secrets in codebase (no auth = no tokens)
- `.env.local` in `.gitignore`

## Next Steps
Phase 02: Database & API Layer — implement all REST API routes
