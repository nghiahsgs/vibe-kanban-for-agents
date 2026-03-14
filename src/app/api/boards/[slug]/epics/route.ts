import { db } from "@/db";
import { epics } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { jsonResponse, errorResponse, validateRequired } from "@/lib/api-helpers";
import { getAuthUser } from "@/lib/auth-helpers";
import { resolveBoard } from "@/lib/board-helpers";

type RouteParams = { params: Promise<{ slug: string }> };

/** GET /api/boards/:slug/epics — list epics for board */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return errorResponse(401, "Unauthorized", "Valid session or API key required");

    const { slug } = await params;
    const board = await resolveBoard(authUser, slug);
    if (!board) return errorResponse(404, "Not Found", `Board '${slug}' not found`);

    const result = await db
      .select()
      .from(epics)
      .where(eq(epics.boardId, board.id))
      .orderBy(asc(epics.createdAt));

    return jsonResponse({ epics: result });
  } catch (error) {
    return errorResponse(500, "Internal Error", String(error));
  }
}

/** POST /api/boards/:slug/epics — create epic */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return errorResponse(401, "Unauthorized", "Valid session or API key required");

    const { slug } = await params;
    const board = await resolveBoard(authUser, slug);
    if (!board) return errorResponse(404, "Not Found", `Board '${slug}' not found`);

    const body = await request.json();
    const missingField = validateRequired(body, ["name"]);
    if (missingField) return errorResponse(400, "Validation Failed", missingField);

    const now = new Date().toISOString();
    const newEpic = {
      id: crypto.randomUUID(),
      boardId: board.id,
      name: body.name as string,
      description: (body.description as string) || null,
      color: (body.color as string) || "#3b82f6",
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(epics).values(newEpic);
    return jsonResponse(newEpic, 201);
  } catch (error) {
    return errorResponse(500, "Internal Error", String(error));
  }
}
