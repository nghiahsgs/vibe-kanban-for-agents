import { db } from "@/db";
import { boards } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { getSession } from "@/lib/auth-helpers";
import { slugify } from "@/lib/slug";

type RouteParams = { params: Promise<{ slug: string }> };

/** GET /api/boards/:slug — get a single board */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session?.user) return errorResponse(401, "Unauthorized", "Session required");

    const { slug } = await params;
    const [board] = await db
      .select({
        id: boards.id,
        userId: boards.userId,
        name: boards.name,
        slug: boards.slug,
        description: boards.description,
        keyPrefix: boards.keyPrefix,
        createdAt: boards.createdAt,
        updatedAt: boards.updatedAt,
      })
      .from(boards)
      .where(and(eq(boards.slug, slug), eq(boards.userId, session.user.id)))
      .limit(1);

    if (!board) return errorResponse(404, "Not Found", `Board '${slug}' not found`);
    return jsonResponse(board);
  } catch (error) {
    return errorResponse(500, "Internal Error", String(error));
  }
}

/** PATCH /api/boards/:slug — update board name/description */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session?.user) return errorResponse(401, "Unauthorized", "Session required");

    const { slug } = await params;
    const userId = session.user.id;

    const [existing] = await db
      .select()
      .from(boards)
      .where(and(eq(boards.slug, slug), eq(boards.userId, userId)))
      .limit(1);

    if (!existing) return errorResponse(404, "Not Found", `Board '${slug}' not found`);

    const body = await request.json();
    const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };

    if (body.description !== undefined) updates.description = body.description;

    if (body.name !== undefined) {
      const name = (body.name as string).trim();
      if (!name) return errorResponse(400, "Validation Failed", "Name cannot be empty");
      updates.name = name;

      // Re-slugify on name change
      const baseSlug = slugify(name);
      let newSlug = baseSlug;
      let suffix = 2;
      while (true) {
        // Skip collision check if slug is unchanged
        if (newSlug === existing.slug) break;
        const [collision] = await db
          .select({ id: boards.id })
          .from(boards)
          .where(and(eq(boards.userId, userId), eq(boards.slug, newSlug)))
          .limit(1);
        if (!collision) break;
        newSlug = `${baseSlug}-${suffix}`;
        suffix++;
      }
      updates.slug = newSlug;
    }

    await db.update(boards).set(updates).where(eq(boards.id, existing.id));

    const [updated] = await db
      .select({
        id: boards.id,
        userId: boards.userId,
        name: boards.name,
        slug: boards.slug,
        description: boards.description,
        keyPrefix: boards.keyPrefix,
        createdAt: boards.createdAt,
        updatedAt: boards.updatedAt,
      })
      .from(boards)
      .where(eq(boards.id, existing.id))
      .limit(1);

    return jsonResponse(updated);
  } catch (error) {
    return errorResponse(500, "Internal Error", String(error));
  }
}

/** DELETE /api/boards/:slug — delete board (cascade tasks) */
export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session?.user) return errorResponse(401, "Unauthorized", "Session required");

    const { slug } = await params;
    const userId = session.user.id;

    const [existing] = await db
      .select()
      .from(boards)
      .where(and(eq(boards.slug, slug), eq(boards.userId, userId)))
      .limit(1);

    if (!existing) return errorResponse(404, "Not Found", `Board '${slug}' not found`);

    // Prevent deleting the last board
    const userBoards = await db
      .select({ id: boards.id })
      .from(boards)
      .where(eq(boards.userId, userId));

    if (userBoards.length <= 1) {
      return errorResponse(409, "Conflict", "Cannot delete the last board");
    }

    await db.delete(boards).where(eq(boards.id, existing.id));
    return new Response(null, { status: 204 });
  } catch (error) {
    return errorResponse(500, "Internal Error", String(error));
  }
}
