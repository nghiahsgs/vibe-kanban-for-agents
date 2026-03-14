import { db } from "@/db";
import { epics } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { getAuthUser } from "@/lib/auth-helpers";
import { resolveBoard } from "@/lib/board-helpers";

type RouteParams = { params: Promise<{ slug: string; epicId: string }> };

/** GET /api/boards/:slug/epics/:epicId — get single epic */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return errorResponse(401, "Unauthorized", "Valid session or API key required");

    const { slug, epicId } = await params;
    const board = await resolveBoard(authUser, slug);
    if (!board) return errorResponse(404, "Not Found", `Board '${slug}' not found`);

    const [epic] = await db
      .select()
      .from(epics)
      .where(and(eq(epics.id, epicId), eq(epics.boardId, board.id)))
      .limit(1);

    if (!epic) return errorResponse(404, "Not Found", `Epic ${epicId} not found`);
    return jsonResponse(epic);
  } catch (error) {
    return errorResponse(500, "Internal Error", String(error));
  }
}

/** PATCH /api/boards/:slug/epics/:epicId — update epic */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return errorResponse(401, "Unauthorized", "Valid session or API key required");

    const { slug, epicId } = await params;
    const board = await resolveBoard(authUser, slug);
    if (!board) return errorResponse(404, "Not Found", `Board '${slug}' not found`);

    const [existing] = await db
      .select()
      .from(epics)
      .where(and(eq(epics.id, epicId), eq(epics.boardId, board.id)))
      .limit(1);

    if (!existing) return errorResponse(404, "Not Found", `Epic ${epicId} not found`);

    const body = await request.json();
    const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    const allowedFields = ["name", "description", "color"];
    for (const field of allowedFields) {
      if (body[field] !== undefined) updates[field] = body[field];
    }

    await db.update(epics).set(updates).where(eq(epics.id, epicId));
    const [updated] = await db.select().from(epics).where(eq(epics.id, epicId)).limit(1);
    return jsonResponse(updated);
  } catch (error) {
    return errorResponse(500, "Internal Error", String(error));
  }
}

/** DELETE /api/boards/:slug/epics/:epicId — delete epic */
export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return errorResponse(401, "Unauthorized", "Valid session or API key required");

    const { slug, epicId } = await params;
    const board = await resolveBoard(authUser, slug);
    if (!board) return errorResponse(404, "Not Found", `Board '${slug}' not found`);

    const [existing] = await db
      .select()
      .from(epics)
      .where(and(eq(epics.id, epicId), eq(epics.boardId, board.id)))
      .limit(1);

    if (!existing) return errorResponse(404, "Not Found", `Epic ${epicId} not found`);

    await db.delete(epics).where(eq(epics.id, epicId));
    return new Response(null, { status: 204 });
  } catch (error) {
    return errorResponse(500, "Internal Error", String(error));
  }
}
