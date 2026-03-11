import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { apiKeys } from "@/db/auth-schema";
import { boards } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashApiKey } from "@/lib/api-key";
import { errorResponse } from "@/lib/api-helpers";

export type AuthUser = {
  userId: string;
  boardId?: string;
  authMethod: "session" | "api_key" | "board_key";
};

/** Try session auth first, then API key auth (user key or board key) */
export async function getAuthUser(): Promise<AuthUser | null> {
  // Try session first
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user) {
    return { userId: session.user.id, authMethod: "session" };
  }

  // Try API key
  const headersList = await headers();
  const authHeader = headersList.get("authorization");
  if (authHeader?.startsWith("Bearer vk_")) {
    const key = authHeader.slice(7); // Remove "Bearer "
    const keyHash = hashApiKey(key);

    // Check user-level API keys
    const [keyRecord] = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.keyHash, keyHash))
      .limit(1);
    if (keyRecord) {
      // Check expiry
      if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) return null;
      // Update lastUsedAt
      await db
        .update(apiKeys)
        .set({ lastUsedAt: new Date() })
        .where(eq(apiKeys.id, keyRecord.id));
      return { userId: keyRecord.userId, authMethod: "api_key" };
    }

    // Check board-level API keys
    const [board] = await db
      .select()
      .from(boards)
      .where(eq(boards.keyHash, keyHash))
      .limit(1);
    if (board) {
      return { userId: board.userId, boardId: board.id, authMethod: "board_key" };
    }
  }

  return null;
}

/** Validate that the authUser can access the requested board.
 *  - board_key auth: boardId is pre-bound; reject if requestBoardId mismatches
 *  - session/api_key: no board restriction
 *  Returns error response or null (allowed) */
export function requireBoardId(
  authUser: AuthUser,
  requestBoardId?: string
): ReturnType<typeof errorResponse> | null {
  if (authUser.authMethod === "board_key" && authUser.boardId) {
    if (requestBoardId && requestBoardId !== authUser.boardId) {
      return errorResponse(403, "Forbidden", "Board key is not authorized for this board");
    }
  }
  return null;
}

/** Get session (kept for backward compat) */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/** Require session (kept for backward compat) */
export async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}
