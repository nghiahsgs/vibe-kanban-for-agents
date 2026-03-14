import { db } from "@/db";
import { tasks, taskDependencies } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { jsonResponse, errorResponse, validateRequired } from "@/lib/api-helpers";
import { getAuthUser } from "@/lib/auth-helpers";
import { resolveBoard } from "@/lib/board-helpers";

type RouteParams = { params: Promise<{ slug: string; id: string }> };

/** GET /api/boards/:slug/tasks/:id/dependencies — list dependencies for task */
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

    if (!task) return errorResponse(404, "Not Found", `Task ${id} not found`);

    const result = await db
      .select()
      .from(taskDependencies)
      .where(eq(taskDependencies.taskId, id));

    return jsonResponse({ dependencies: result });
  } catch (error) {
    return errorResponse(500, "Internal Error", String(error));
  }
}

/** POST /api/boards/:slug/tasks/:id/dependencies — add dependency */
export async function POST(request: Request, { params }: RouteParams) {
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

    if (!task) return errorResponse(404, "Not Found", `Task ${id} not found`);

    const body = await request.json();
    const missingField = validateRequired(body, ["blockedByTaskId"]);
    if (missingField) return errorResponse(400, "Validation Failed", missingField);

    if (body.blockedByTaskId === id) {
      return errorResponse(400, "Validation Failed", "A task cannot depend on itself");
    }

    const [blockedByTask] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, body.blockedByTaskId as string), eq(tasks.boardId, board.id)))
      .limit(1);

    if (!blockedByTask) return errorResponse(404, "Not Found", `Task ${body.blockedByTaskId} not found`);

    const newDep = {
      id: crypto.randomUUID(),
      taskId: id,
      blockedByTaskId: body.blockedByTaskId as string,
      createdAt: new Date().toISOString(),
    };

    await db.insert(taskDependencies).values(newDep);
    return jsonResponse(newDep, 201);
  } catch (error) {
    return errorResponse(500, "Internal Error", String(error));
  }
}

/** DELETE /api/boards/:slug/tasks/:id/dependencies — remove dependency */
export async function DELETE(request: Request, { params }: RouteParams) {
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

    if (!task) return errorResponse(404, "Not Found", `Task ${id} not found`);

    const body = await request.json();
    const missingField = validateRequired(body, ["blockedByTaskId"]);
    if (missingField) return errorResponse(400, "Validation Failed", missingField);

    await db
      .delete(taskDependencies)
      .where(
        and(
          eq(taskDependencies.taskId, id),
          eq(taskDependencies.blockedByTaskId, body.blockedByTaskId as string)
        )
      );

    return new Response(null, { status: 204 });
  } catch (error) {
    return errorResponse(500, "Internal Error", String(error));
  }
}
