import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  jsonResponse,
  errorResponse,
  validateTaskFields,
} from "@/lib/api-helpers";
import { getAuthUser } from "@/lib/auth-helpers";

type RouteParams = { params: Promise<{ id: string }> };

/** GET /api/tasks/:id — get single task */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return errorResponse(401, "Unauthorized", "Valid session or API key required");

    const { id } = await params;
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
    if (!task) return errorResponse(404, "Not Found", `Task ${id} not found`, `/api/tasks/${id}`);
    return jsonResponse(task);
  } catch (error) {
    return errorResponse(500, "Internal Error", String(error));
  }
}

/** PATCH /api/tasks/:id — partial update */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return errorResponse(401, "Unauthorized", "Valid session or API key required");

    const { id } = await params;
    const [existing] = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
    if (!existing) return errorResponse(404, "Not Found", `Task ${id} not found`, `/api/tasks/${id}`);

    const body = await request.json();
    const fieldError = validateTaskFields(body);
    if (fieldError) return errorResponse(400, "Validation Failed", fieldError);

    // Build update object with only provided fields
    const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    const allowedFields = ["title", "description", "status", "assignee", "priority", "position"];
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

/** DELETE /api/tasks/:id — delete task (cascades comments) */
export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return errorResponse(401, "Unauthorized", "Valid session or API key required");

    const { id } = await params;
    const [existing] = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
    if (!existing) return errorResponse(404, "Not Found", `Task ${id} not found`, `/api/tasks/${id}`);

    await db.delete(tasks).where(eq(tasks.id, id));
    return new Response(null, { status: 204 });
  } catch (error) {
    return errorResponse(500, "Internal Error", String(error));
  }
}
