import { db } from "@/db";
import { agents } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { getAuthUser } from "@/lib/auth-helpers";
import { resolveBoard } from "@/lib/board-helpers";

type RouteParams = { params: Promise<{ slug: string; agentId: string }> };

/** DELETE /api/boards/:slug/agents/:agentId — remove an agent */
export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return errorResponse(401, "Unauthorized", "Valid session or API key required");

    const { slug, agentId } = await params;
    const board = await resolveBoard(authUser, slug);
    if (!board) return errorResponse(404, "Not Found", `Board '${slug}' not found`);

    const deleted = await db
      .delete(agents)
      .where(and(eq(agents.id, agentId), eq(agents.boardId, board.id)))
      .returning();

    if (deleted.length === 0) {
      return errorResponse(404, "Not Found", "Agent not found");
    }

    return jsonResponse({ success: true });
  } catch (error) {
    return errorResponse(500, "Internal Error", String(error));
  }
}
