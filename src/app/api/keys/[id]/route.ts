import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { apiKeys } from "@/db/auth-schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth-helpers";
import { errorResponse } from "@/lib/api-helpers";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user) return errorResponse(401, "Unauthorized", "Session required");

  const { id } = await params;

  // Verify key belongs to user
  const [key] = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, session.user.id)))
    .limit(1);

  if (!key) return errorResponse(404, "Not Found", "API key not found");

  await db.delete(apiKeys).where(eq(apiKeys.id, id));
  return new NextResponse(null, { status: 204 });
}
