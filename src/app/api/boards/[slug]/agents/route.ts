import { db } from "@/db";
import { agents } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { jsonResponse, errorResponse, validateRequired } from "@/lib/api-helpers";
import { getAuthUser } from "@/lib/auth-helpers";
import { resolveBoard } from "@/lib/board-helpers";

type RouteParams = { params: Promise<{ slug: string }> };

const VALID_AGENT_TYPES = ["claude-code", "cursor", "generic"];

/** GET /api/boards/:slug/agents — list agents for this board */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return errorResponse(401, "Unauthorized", "Valid session or API key required");

    const { slug } = await params;
    const board = await resolveBoard(authUser, slug);
    if (!board) return errorResponse(404, "Not Found", `Board '${slug}' not found`);

    const result = await db
      .select()
      .from(agents)
      .where(eq(agents.boardId, board.id))
      .orderBy(asc(agents.name));

    return jsonResponse({ agents: result });
  } catch (error) {
    return errorResponse(500, "Internal Error", String(error));
  }
}

/** POST /api/boards/:slug/agents — create an agent */
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

    const agentType = (body.type as string) || "claude-code";
    if (!VALID_AGENT_TYPES.includes(agentType)) {
      return errorResponse(400, "Validation Failed", `Invalid type. Must be one of: ${VALID_AGENT_TYPES.join(", ")}`);
    }

    const newAgent = {
      id: crypto.randomUUID(),
      boardId: board.id,
      name: (body.name as string).trim(),
      type: agentType as "claude-code" | "cursor" | "generic",
      createdAt: new Date().toISOString(),
    };

    await db.insert(agents).values(newAgent);
    return jsonResponse(newAgent, 201);
  } catch (error) {
    // Handle unique constraint violation
    if (String(error).includes("unique") || String(error).includes("duplicate")) {
      return errorResponse(409, "Conflict", "An agent with that name already exists on this board");
    }
    return errorResponse(500, "Internal Error", String(error));
  }
}
