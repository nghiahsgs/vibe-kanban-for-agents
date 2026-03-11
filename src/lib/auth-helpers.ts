import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { apiKeys } from "@/db/auth-schema";
import { eq } from "drizzle-orm";
import { hashApiKey } from "@/lib/api-key";

export type AuthUser = {
  userId: string;
  authMethod: "session" | "api_key";
};

/** Try session auth first, then API key auth */
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
