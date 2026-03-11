import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

const dbDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const sqlite = new Database(path.join(dbDir, "kanban.db"));
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

const db = drizzle(sqlite, { schema });

const sampleTasks = [
  { id: crypto.randomUUID(), title: "Set up CI/CD pipeline", description: "Configure GitHub Actions for automated testing and deployment", status: "todo" as const, priority: "high" as const, assignee: "agent-1", position: 1000, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: crypto.randomUUID(), title: "Write API integration tests", description: "Cover all 7 REST endpoints with test cases", status: "todo" as const, priority: "medium" as const, assignee: "agent-2", position: 2000, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: crypto.randomUUID(), title: "Design landing page", description: "Create a modern landing page for the project", status: "in_progress" as const, priority: "medium" as const, assignee: "agent-1", position: 1000, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: crypto.randomUUID(), title: "Fix login validation bug", description: "Email validation fails for addresses with + character", status: "review" as const, priority: "high" as const, assignee: "agent-3", position: 1000, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: crypto.randomUUID(), title: "Update project dependencies", description: "Bump all packages to latest stable versions", status: "done" as const, priority: "low" as const, assignee: null, position: 1000, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

// Clear existing data
db.delete(schema.comments).run();
db.delete(schema.tasks).run();

// Insert sample tasks
for (const task of sampleTasks) {
  db.insert(schema.tasks).values(task).run();
}

// Add sample comments
const firstTaskId = sampleTasks[0].id;
db.insert(schema.comments).values([
  { id: crypto.randomUUID(), taskId: firstTaskId, author: "agent-1", content: "Picked up this task. Will start with GitHub Actions setup.", createdAt: new Date().toISOString() },
  { id: crypto.randomUUID(), taskId: firstTaskId, author: "human", content: "Make sure to include both test and deploy stages.", createdAt: new Date().toISOString() },
]).run();

console.log(`Seeded ${sampleTasks.length} tasks and 2 comments.`);
sqlite.close();
