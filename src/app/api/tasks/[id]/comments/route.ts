import { db } from "@/db";
import { tasks, comments } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import {
  jsonResponse,
  errorResponse,
  validateRequired,
} from "@/lib/api-helpers";
import { getAuthUser } from "@/lib/auth-helpers";

type RouteParams = { params: Promise<{ id: string }> };

/** GET /api/tasks/:id/comments — list comments for a task */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return errorResponse(401, "Unauthorized", "Valid session or API key required");

    const { id } = await params;
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
    if (!task) return errorResponse(404, "Not Found", `Task ${id} not found`, `/api/tasks/${id}`);

    const result = await db
      .select()
      .from(comments)
      .where(eq(comments.taskId, id))
      .orderBy(asc(comments.createdAt));

    return jsonResponse({ comments: result });
  } catch (error) {
    return errorResponse(500, "Internal Error", String(error));
  }
}

/** POST /api/tasks/:id/comments — add a comment to a task */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return errorResponse(401, "Unauthorized", "Valid session or API key required");

    const { id } = await params;
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
    if (!task) return errorResponse(404, "Not Found", `Task ${id} not found`, `/api/tasks/${id}`);

    const body = await request.json();
    const missingField = validateRequired(body, ["author", "content"]);
    if (missingField) return errorResponse(400, "Validation Failed", missingField);

    const newComment = {
      id: crypto.randomUUID(),
      taskId: id,
      author: body.author as string,
      content: body.content as string,
      createdAt: new Date().toISOString(),
    };

    await db.insert(comments).values(newComment);
    return jsonResponse(newComment, 201);
  } catch (error) {
    return errorResponse(500, "Internal Error", String(error));
  }
}
