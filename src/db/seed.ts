import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client, { schema });

const sampleTasks = [
  { id: crypto.randomUUID(), title: "Set up CI/CD pipeline", description: "Configure GitHub Actions for automated testing and deployment", status: "todo" as const, priority: "high" as const, assignee: "agent-1", position: 1000, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: crypto.randomUUID(), title: "Write API integration tests", description: "Cover all 7 REST endpoints with test cases", status: "todo" as const, priority: "medium" as const, assignee: "agent-2", position: 2000, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: crypto.randomUUID(), title: "Design landing page", description: "Create a modern landing page for the project", status: "in_progress" as const, priority: "medium" as const, assignee: "agent-1", position: 1000, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: crypto.randomUUID(), title: "Fix login validation bug", description: "Email validation fails for addresses with + character", status: "review" as const, priority: "high" as const, assignee: "agent-3", position: 1000, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: crypto.randomUUID(), title: "Update project dependencies", description: "Bump all packages to latest stable versions", status: "done" as const, priority: "low" as const, assignee: null, position: 1000, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

async function seed() {
  // Clear existing data
  await db.delete(schema.comments);
  await db.delete(schema.tasks);

  // Insert sample tasks
  await db.insert(schema.tasks).values(sampleTasks);

  // Add sample comments
  const firstTaskId = sampleTasks[0].id;
  await db.insert(schema.comments).values([
    { id: crypto.randomUUID(), taskId: firstTaskId, author: "agent-1", content: "Picked up this task. Will start with GitHub Actions setup.", createdAt: new Date().toISOString() },
    { id: crypto.randomUUID(), taskId: firstTaskId, author: "human", content: "Make sure to include both test and deploy stages.", createdAt: new Date().toISOString() },
  ]);

  console.log(`Seeded ${sampleTasks.length} tasks and 2 comments.`);
  await client.end();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
