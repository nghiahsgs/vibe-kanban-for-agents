# Tech Stack Research Report: Kanban Board Web App
**Date:** 2026-03-11 | **Researcher:** Claude Agent

---

## 1. Next.js 15 App Router + better-sqlite3

### Setup Overview
Next.js 15 with App Router supports server-side database operations. better-sqlite3 is a native Node.js SQLite driver providing synchronous access to the SQLite C library.

### Key Points
- **Server-Side Only**: better-sqlite3 must run server-side; never bundle it client-side
- **API Routes**: Use route handlers in `app/api` directory for database operations
- **Native Module**: Requires native compilation; ensure build tools handle this
- **Connection**: Initialize database connection once at module level, reuse across requests

### Gotchas
1. Native modules don't work in browser context (serverless edge functions have issues)
2. File path must be absolute or relative to Node process, not web root
3. Synchronous nature can block event loop if not used in proper async context
4. Zero-downtime deployments require careful connection handling

### Example Pattern
```typescript
// lib/db.ts - Server-side only
import Database from 'better-sqlite3';
const db = new Database(':memory:'); // or './data.db'
export default db;

// app/api/tasks/route.ts
import db from '@/lib/db';
export async function GET(request: Request) {
  const tasks = db.prepare('SELECT * FROM tasks').all();
  return Response.json(tasks);
}
```

### Sources
- [Using SQLite with Next.js 13](https://plainenglish.io/nextjs/using-sqlite-with-next-js-13)
- [Getting Started with Native SQLite in Node.js](https://betterstack.com/community/guides/scaling-nodejs/nodejs-sqlite/)

---

## 2. Drizzle ORM + SQLite (better-sqlite3 driver)

### Latest Setup (2025-2026)
Drizzle ORM provides first-class SQLite support via better-sqlite3 driver with prepared statements and type safety.

### Schema Definition Pattern
```typescript
// schema.ts
import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';

export const tasks = sqliteTable('tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  columnId: integer('column_id').notNull(),
  position: integer('position').notNull(),
  createdAt: integer('created_at').notNull().$type<number>(),
});

export const columns = sqliteTable('columns', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
});
```

### Migration Strategy: Push vs Migrate

**Push (`drizzle-kit push`):**
- Best for local development and prototyping
- TypeScript schema = source of truth
- No migration files generated
- Directly syncs schema to database
- Not recommended for production with data

**Migrate (`drizzle-kit migrate`):**
- Generates SQL migration files
- Tracks migration history in database
- Essential for multi-developer teams
- Required for version-controlled schema changes
- Better for production with existing data

### Recommendation for Kanban App
Use **push** for rapid development; switch to **migrate** when sharing codebase or deploying to production.

### Config Example
```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL || './local.db',
  },
});
```

### SQLite-Specific Notes
- Drizzle handles schema changes, but complex migrations (e.g., renaming columns) require manual SQL
- Generated migrations include guidance for data transformation scenarios
- Boolean columns stored as 0/1 integers; Drizzle handles mapping

### Sources
- [Drizzle ORM - SQLite](https://orm.drizzle.team/docs/get-started-sqlite)
- [Drizzle ORM - Push vs Migrate](https://www.oreateai.com/blog/drizzle-push-vs-migrate-navigating-database-management-with-drizzle-kit-c954c74d99e275ff4d3dceb64c18deed)
- [Migrations with Drizzle just got better: push to SQLite is here](https://andriisherman.medium.com/migrations-with-drizzle-just-got-better-push-to-sqlite-is-here-c6c045c5d0fb)

---

## 3. @hello-pangea/dnd (React Drag-and-Drop)

### Maintenance Status ✓ Active
- Fork of react-beautiful-dnd (originally Atlassian)
- Atlassian no longer maintains original project
- Community maintainers actively develop @hello-pangea/dnd
- Full React 18+ support; React 19 compatible

### Kanban Board Suitability ✓ Excellent
Best-in-class library for list-based drag-and-drop UIs:
- Multi-column Kanban boards
- Drag within columns and between columns
- Accessible (keyboard navigation, screen reader support)
- Handles multi-item selection
- Performance optimized for large lists

### Basic Usage Pattern
```typescript
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export function KanbanBoard({ columns, tasks }) {
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      {columns.map(column => (
        <Droppable key={column.id} droppableId={column.id}>
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {tasks[column.id].map((task, idx) => (
                <Draggable key={task.id} draggableId={task.id} index={idx}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps}
                         {...provided.dragHandleProps}>
                      {task.title}
                    </div>
                  )}
                </Draggable>
              ))}
            </div>
          )}
        </Droppable>
      ))}
    </DragDropContext>
  );
}
```

### Alternatives Considered (2025-2026)
- **dnd-kit**: Modern alternative, more lightweight
- **react-grid-layout**: For dashboard-style layouts
- **react-sortable-hoc**: Simpler but less accessible

@hello-pangea/dnd remains gold standard for production Kanban boards.

### Sources
- [GitHub - hello-pangea/dnd](https://github.com/hello-pangea/dnd)
- [@hello-pangea/dnd - npm](https://www.npmjs.com/package/@hello-pangea/dnd)
- [Top 5 Drag-and-Drop Libraries for React in 2026](https://puckeditor.com/blog/top-5-drag-and-drop-libraries-for-react)

---

## 4. shadcn/ui + Next.js 15 + Tailwind CSS v4

### Latest Setup (2025-2026)
Full compatibility. Tailwind v4 introduced significant simplification with inline theme configuration.

### Installation Steps
```bash
# Create Next.js 15 project with Tailwind
npx create-next-app@latest my-app --typescript --tailwind --eslint --app

# Install Tailwind v4 (if not included)
npm install tailwindcss @tailwindcss/postcss postcss

# Initialize shadcn/ui
npx shadcn-ui@latest init
```

### Configuration Changes with Tailwind v4

**globals.css** - Simplified:
```css
@import "tailwindcss";
@import "shadcn/tailwind.css";

@theme {
  --color-primary: #3b82f6;
  --color-secondary: #8b5cf6;
}
```

**postcss.config.mjs**:
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

**No tailwind.config.ts needed** for basic setups; inline @theme directive replaces it.

### Breaking Changes from v3 → v4
1. Color system simplified (no separate theme colors object)
2. CSS variables now declared inline with @theme
3. All shadcn/ui components updated for new system
4. Removed forwardRef dependencies in many components
5. Added data-slot attributes for component styling

### shadcn/ui v2 Updates
- Full React 19 compatibility (removed forwardRef patterns)
- All components support Tailwind v4 inline theming
- No tailwind.config.ts file required (optional)
- Cleaner CSS with @tailwindcss/postcss

### Dark Mode Support
```typescript
// app/layout.tsx
import { ThemeProvider } from '@/components/theme-provider';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Sources
- [How to Set Up Modern Next.js 15 Project with Tailwind CSS v4](https://medium.com/@nurmhm/how-to-set-up-a-modern-next-js-15-project-with-tailwind-css-v4-react-18-shadcn-ui-ec94f33bb651)
- [shadcn/ui - Tailwind v4 Guide](https://ui.shadcn.com/docs/tailwind-v4)
- [2025: Complete Guide for Next.js 15, tailwind v4, react 18, shadcn](https://medium.com/@dilit/building-a-modern-application-2025-a-complete-guide-for-next-js-1b9f278df10c)

---

## Summary & Recommendations

| Stack Component | Choice | Rationale |
|---|---|---|
| Backend | Next.js 15 App Router | Native support, unified stack |
| Database | SQLite + better-sqlite3 | Lightweight, file-based, no DevOps |
| ORM | Drizzle ORM | Type-safe, modern, excellent SQLite support |
| Migration | `drizzle-kit push` (dev), `migrate` (prod) | Fast iteration + production safety |
| Drag-Drop | @hello-pangea/dnd | Most mature, accessible Kanban solution |
| UI Framework | shadcn/ui | Tailwind v4 optimized, accessible components |
| Styling | Tailwind CSS v4 | Simplified config, inline theming |

**No breaking compatibility issues** between these choices. Recommended dev setup:
1. Use `drizzle-kit push` for schema during development
2. Switch to `migrate` before team collaboration/production
3. Isolate database operations in API routes (never client-side)
4. Leverage shadcn/ui Button, Card, Dialog components for Kanban UI

---

## Unresolved Questions

1. Should we implement optimistic updates for drag-and-drop or rely on server-side updates?
2. Deployment strategy: SQLite file location in serverless vs traditional hosting?
3. Concurrency handling: Better-sqlite3 is single-writer; need queuing strategy for high load?
