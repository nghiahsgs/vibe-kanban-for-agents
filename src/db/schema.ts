import { pgTable, text, real, unique, type AnyPgColumn } from "drizzle-orm/pg-core";
import { users } from "./auth-schema";

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
}, (table) => [
  unique("boards_user_slug_unique").on(table.userId, table.slug),
]);

export const epics = pgTable("epics", {
  id: text("id").primaryKey(),
  boardId: text("board_id").notNull().references(() => boards.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").notNull().default("#3b82f6"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const tasks = pgTable("tasks", {
  id: text("id").primaryKey(),
  boardId: text("board_id").notNull().references(() => boards.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status", {
    enum: ["todo", "in_progress", "review", "done"],
  })
    .notNull()
    .default("todo"),
  assignee: text("assignee"),
  priority: text("priority", { enum: ["low", "medium", "high"] })
    .notNull()
    .default("medium"),
  position: real("position").notNull(),
  workingDirectory: text("working_directory"),
  labels: text("labels"),
  dueDate: text("due_date"),
  checklist: text("checklist"),
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  parentId: text("parent_id").references((): AnyPgColumn => tasks.id, { onDelete: "set null" }),
  epicId: text("epic_id").references(() => epics.id, { onDelete: "set null" }),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const agents = pgTable("agents", {
  id: text("id").primaryKey(),
  boardId: text("board_id").notNull().references(() => boards.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type", { enum: ["claude-code", "cursor", "generic"] }).notNull().default("claude-code"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
}, (table) => [
  unique("agents_board_name_unique").on(table.boardId, table.name),
]);

export const comments = pgTable("comments", {
  id: text("id").primaryKey(),
  taskId: text("task_id")
    .notNull()
    .references(() => tasks.id, { onDelete: "cascade" }),
  author: text("author").notNull(),
  content: text("content").notNull(),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const taskDependencies = pgTable("task_dependencies", {
  id: text("id").primaryKey(),
  taskId: text("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  blockedByTaskId: text("blocked_by_task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
}, (table) => [
  unique("task_dep_unique").on(table.taskId, table.blockedByTaskId),
]);

export * from "./auth-schema";
