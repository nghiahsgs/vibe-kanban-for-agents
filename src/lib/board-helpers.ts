import { db } from "@/db";
import { boards } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import type { AuthUser } from "./auth-helpers";

/** Resolve which board the authenticated user is operating on.
 *
 *  - board_key auth: boardId is already known, load by id
 *  - session/api_key + slug provided: lookup by slug + userId
 *  - session/api_key + no slug: fallback to user's first (oldest) board
 */
export async function resolveBoard(authUser: AuthUser, slug?: string) {
  if (authUser.boardId) {
    const [board] = await db
      .select()
      .from(boards)
      .where(eq(boards.id, authUser.boardId))
      .limit(1);
    return board || null;
  }

  if (slug) {
    const [board] = await db
      .select()
      .from(boards)
      .where(and(eq(boards.slug, slug), eq(boards.userId, authUser.userId)))
      .limit(1);
    return board || null;
  }

  // Fallback: user's first board
  const [board] = await db
    .select()
    .from(boards)
    .where(eq(boards.userId, authUser.userId))
    .orderBy(asc(boards.createdAt))
    .limit(1);
  return board || null;
}
