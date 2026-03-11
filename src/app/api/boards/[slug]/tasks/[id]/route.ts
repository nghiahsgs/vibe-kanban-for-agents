import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import {
  jsonResponse,
  errorResponse,
  validateTaskFields,
} from "@/lib/api-helpers";
import { getAuthUser } from "@/lib/auth-helpers";
import { resolveBoard } from "@/lib/board-helpers";

type RouteParams = { params: Promise<{ slug: string; id: string }> };

/** GET /api/boards/:slug/tasks/:id — get single task (board-scoped) */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return errorResponse(401, "Unauthorized", "Valid session or API key required");

    const { slug, id } = await params;
    const board = await resolveBoard(authUser, slug);
    if (!board) return errorResponse(404, "Not Found", `Board '${slug}' not found`);

    const [task] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.boardId, board.id)))
      .limit(1);

    if (!task) return errorResponse(404, "Not Found", `Task ${id} not found`, `/api/boards/${slug}/tasks/${id}`);
    return jsonResponse(task);
  } catch (error) {
    return errorResponse(500, "Internal Error", String(error));
  }
}

/** PATCH /api/boards/:slug/tasks/:id — partial update (board-scoped) */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return errorResponse(401, "Unauthorized", "Valid session or API key required");

    const { slug, id } = await params;
    const board = await resolveBoard(authUser, slug);
    if (!board) return errorResponse(404, "Not Found", `Board '${slug}' not found`);

    const [existing] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.boardId, board.id)))
      .limit(1);

    if (!existing) return errorResponse(404, "Not Found", `Task ${id} not found`, `/api/boards/${slug}/tasks/${id}`);

    const body = await request.json();
    const fieldError = validateTaskFields(body);
    if (fieldError) return errorResponse(400, "Validation Failed", fieldError);

    const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    const allowedFields = ["title", "description", "status", "assignee", "priority", "position", "workingDirectory"];
    for (const field of allowedFields) {
      if (body[field] !== undefined) updates[field] = body[field];
    }

    await db.update(tasks).set(updates).where(eq(tasks.id, id));
    const [updated] = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
    return jsonResponse(updated);
  } catch (error) {
    return errorResponse(500, "Internal Error", String(error));
  }
}

/** DELETE /api/boards/:slug/tasks/:id — delete task (board-scoped) */
export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return errorResponse(401, "Unauthorized", "Valid session or API key required");

    const { slug, id } = await params;
    const board = await resolveBoard(authUser, slug);
    if (!board) return errorResponse(404, "Not Found", `Board '${slug}' not found`);

    const [existing] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.boardId, board.id)))
      .limit(1);

    if (!existing) return errorResponse(404, "Not Found", `Task ${id} not found`, `/api/boards/${slug}/tasks/${id}`);

    await db.delete(tasks).where(eq(tasks.id, id));
    return new Response(null, { status: 204 });
  } catch (error) {
    return errorResponse(500, "Internal Error", String(error));
  }
}
