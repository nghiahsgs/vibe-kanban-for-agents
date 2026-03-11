import { db } from "@/db";
import { boards } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { getSession } from "@/lib/auth-helpers";
import { generateApiKey } from "@/lib/api-key";

type RouteParams = { params: Promise<{ slug: string }> };

/** POST /api/boards/:slug/regenerate-key — generate or regenerate board API key */
export async function POST(_request: Request, { params }: RouteParams) {
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

    const { raw, hash, prefix } = generateApiKey();

    await db
      .update(boards)
      .set({ keyHash: hash, keyPrefix: prefix, updatedAt: new Date().toISOString() })
      .where(eq(boards.id, existing.id));

    // Return raw key once — caller must store it
    return jsonResponse({ apiKey: raw, keyPrefix: prefix });
  } catch (error) {
    return errorResponse(500, "Internal Error", String(error));
  }
}
