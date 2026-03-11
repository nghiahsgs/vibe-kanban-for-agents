import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq, asc, and, type SQL } from "drizzle-orm";
import { getNextPosition } from "@/lib/position";
import {
  jsonResponse,
  errorResponse,
  validateRequired,
  validateTaskFields,
} from "@/lib/api-helpers";
import type { TaskStatus, TaskPriority } from "@/types";

/** GET /api/tasks — list tasks with optional filters */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as TaskStatus | null;
    const assignee = searchParams.get("assignee");
    const priority = searchParams.get("priority") as TaskPriority | null;

    const conditions: SQL[] = [];
    if (status) conditions.push(eq(tasks.status, status));
    if (assignee) conditions.push(eq(tasks.assignee, assignee));
    if (priority) conditions.push(eq(tasks.priority, priority));

    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const result = db
      .select()
      .from(tasks)
      .where(where)
      .orderBy(asc(tasks.position))
      .all();

    return jsonResponse({ tasks: result });
  } catch (error) {
    return errorResponse(500, "Internal Error", String(error));
  }
}

/** POST /api/tasks — create a new task */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const missingField = validateRequired(body, ["title"]);
    if (missingField) return errorResponse(400, "Validation Failed", missingField);

    const fieldError = validateTaskFields(body);
    if (fieldError) return errorResponse(400, "Validation Failed", fieldError);

    const status = (body.status as TaskStatus) || "todo";
    const now = new Date().toISOString();
    const newTask = {
      id: crypto.randomUUID(),
      title: body.title as string,
      description: (body.description as string) || null,
      status,
      assignee: (body.assignee as string) || null,
      priority: (body.priority as TaskPriority) || "medium",
      position: typeof body.position === "number" ? body.position : getNextPosition(status),
      createdAt: now,
      updatedAt: now,
    };

    db.insert(tasks).values(newTask).run();
    return jsonResponse(newTask, 201);
  } catch (error) {
    return errorResponse(500, "Internal Error", String(error));
  }
}
