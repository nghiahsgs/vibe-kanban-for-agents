import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq, asc, and, isNull, type SQL } from "drizzle-orm";
import { getNextPosition } from "@/lib/position";
import {
  jsonResponse,
  errorResponse,
  validateRequired,
  validateTaskFields,
} from "@/lib/api-helpers";
import { getAuthUser } from "@/lib/auth-helpers";
import { resolveBoard } from "@/lib/board-helpers";
import type { TaskStatus, TaskPriority } from "@/types";

type RouteParams = { params: Promise<{ slug: string }> };

/** GET /api/boards/:slug/tasks — list board-scoped tasks */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return errorResponse(401, "Unauthorized", "Valid session or API key required");

    const { slug } = await params;
    const board = await resolveBoard(authUser, slug);
    if (!board) return errorResponse(404, "Not Found", `Board '${slug}' not found`);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as TaskStatus | null;
    const assignee = searchParams.get("assignee");
    const priority = searchParams.get("priority") as TaskPriority | null;
    const parentIdParam = searchParams.get("parentId");
    const epicId = searchParams.get("epicId");

    const conditions: SQL[] = [eq(tasks.boardId, board.id)];
    if (status) conditions.push(eq(tasks.status, status));
    if (assignee) conditions.push(eq(tasks.assignee, assignee));
    if (priority) conditions.push(eq(tasks.priority, priority));
    if (parentIdParam === "null") conditions.push(isNull(tasks.parentId));
    else if (parentIdParam) conditions.push(eq(tasks.parentId, parentIdParam));
    if (epicId) conditions.push(eq(tasks.epicId, epicId));

    const result = await db
      .select()
      .from(tasks)
      .where(and(...conditions))
      .orderBy(asc(tasks.position));

    return jsonResponse({ tasks: result });
  } catch (error) {
    return errorResponse(500, "Internal Error", String(error));
  }
}

/** POST /api/boards/:slug/tasks — create a task on this board */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return errorResponse(401, "Unauthorized", "Valid session or API key required");

    const { slug } = await params;
    const board = await resolveBoard(authUser, slug);
    if (!board) return errorResponse(404, "Not Found", `Board '${slug}' not found`);

    const body = await request.json();
    const missingField = validateRequired(body, ["title"]);
    if (missingField) return errorResponse(400, "Validation Failed", missingField);

    const fieldError = validateTaskFields(body);
    if (fieldError) return errorResponse(400, "Validation Failed", fieldError);

    const status = (body.status as TaskStatus) || "todo";
    const now = new Date().toISOString();
    const newTask = {
      id: crypto.randomUUID(),
      boardId: board.id,
      title: body.title as string,
      description: (body.description as string) || null,
      status,
      assignee: (body.assignee as string) || null,
      priority: (body.priority as TaskPriority) || "medium",
      position: typeof body.position === "number" ? body.position : await getNextPosition(status, board.id),
      workingDirectory: (body.workingDirectory as string) || null,
      labels: (body.labels as string) || null,
      dueDate: (body.dueDate as string) || null,
      checklist: (body.checklist as string) || null,
      parentId: (body.parentId as string) || null,
      epicId: (body.epicId as string) || null,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(tasks).values(newTask);
    return jsonResponse(newTask, 201);
  } catch (error) {
    return errorResponse(500, "Internal Error", String(error));
  }
}
