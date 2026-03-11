import { db } from "@/db";
import { boards } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { jsonResponse, errorResponse, validateRequired } from "@/lib/api-helpers";
import { getSession } from "@/lib/auth-helpers";
import { slugify } from "@/lib/slug";
import { generateApiKey } from "@/lib/api-key";

/** GET /api/boards — list user's boards */
export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) return errorResponse(401, "Unauthorized", "Session required");

    const result = await db
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
      .where(eq(boards.userId, session.user.id))
      .orderBy(asc(boards.createdAt));

    return jsonResponse({ boards: result });
  } catch (error) {
    return errorResponse(500, "Internal Error", String(error));
  }
}

/** POST /api/boards — create a new board */
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) return errorResponse(401, "Unauthorized", "Session required");

    const body = await request.json();
    const missingField = validateRequired(body, ["name"]);
    if (missingField) return errorResponse(400, "Validation Failed", missingField);

    const name = (body.name as string).trim();
    if (!name) return errorResponse(400, "Validation Failed", "Name cannot be empty");

    const userId = session.user.id;
    const baseSlug = slugify(name);

    // Handle slug collision by appending -2, -3, etc.
    let slug = baseSlug;
    let suffix = 2;
    while (true) {
      const [existing] = await db
        .select({ id: boards.id })
        .from(boards)
        .where(and(eq(boards.userId, userId), eq(boards.slug, slug)))
        .limit(1);
      if (!existing) break;
      slug = `${baseSlug}-${suffix}`;
      suffix++;
    }

    let keyHash: string | null = null;
    let keyPrefix: string | null = null;
    let rawKey: string | undefined;

    if (body.generateKey) {
      const generated = generateApiKey();
      keyHash = generated.hash;
      keyPrefix = generated.prefix;
      rawKey = generated.raw;
    }

    const now = new Date().toISOString();
    const newBoard = {
      id: crypto.randomUUID(),
      userId,
      name,
      slug,
      description: (body.description as string) || null,
      keyHash,
      keyPrefix,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(boards).values(newBoard);

    const response = {
      id: newBoard.id,
      userId: newBoard.userId,
      name: newBoard.name,
      slug: newBoard.slug,
      description: newBoard.description,
      keyPrefix: newBoard.keyPrefix,
      createdAt: newBoard.createdAt,
      updatedAt: newBoard.updatedAt,
      ...(rawKey ? { apiKey: rawKey } : {}),
    };

    return jsonResponse(response, 201);
  } catch (error) {
    return errorResponse(500, "Internal Error", String(error));
  }
}
