import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  jsonResponse,
  errorResponse,
  validateTaskFields,
} from "@/lib/api-helpers";

type RouteParams = { params: Promise<{ id: string }> };

/** GET /api/tasks/:id — get single task */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const task = db.select().from(tasks).where(eq(tasks.id, id)).get();
    if (!task) return errorResponse(404, "Not Found", `Task ${id} not found`, `/api/tasks/${id}`);
    return jsonResponse(task);
  } catch (error) {
    return errorResponse(500, "Internal Error", String(error));
  }
}

/** PATCH /api/tasks/:id — partial update */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const existing = db.select().from(tasks).where(eq(tasks.id, id)).get();
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

    db.update(tasks).set(updates).where(eq(tasks.id, id)).run();
    const updated = db.select().from(tasks).where(eq(tasks.id, id)).get();
    return jsonResponse(updated);
  } catch (error) {
    return errorResponse(500, "Internal Error", String(error));
  }
}

/** DELETE /api/tasks/:id — delete task (cascades comments) */
export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const existing = db.select().from(tasks).where(eq(tasks.id, id)).get();
    if (!existing) return errorResponse(404, "Not Found", `Task ${id} not found`, `/api/tasks/${id}`);

    db.delete(tasks).where(eq(tasks.id, id)).run();
    return new Response(null, { status: 204 });
  } catch (error) {
    return errorResponse(500, "Internal Error", String(error));
  }
}
