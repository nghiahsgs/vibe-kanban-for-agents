import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { apiKeys } from "@/db/auth-schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth-helpers";
import { generateApiKey } from "@/lib/api-key";
import { errorResponse } from "@/lib/api-helpers";
import crypto from "crypto";

// GET - list user's API keys
export async function GET() {
  const session = await getSession();
  if (!session?.user) return errorResponse(401, "Unauthorized", "Session required");

  const keys = await db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      keyPrefix: apiKeys.keyPrefix,
      lastUsedAt: apiKeys.lastUsedAt,
      expiresAt: apiKeys.expiresAt,
      createdAt: apiKeys.createdAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.userId, session.user.id));

  return NextResponse.json({ keys });
}

// POST - create new API key
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.user) return errorResponse(401, "Unauthorized", "Session required");

  const body = await request.json();
  const name = body.name?.trim();
  if (!name) return errorResponse(400, "Bad Request", "Key name is required");

  const { raw, hash, prefix } = generateApiKey();

  // Calculate expiry if provided
  let expiresAt: Date | null = null;
  if (body.expiresIn) {
    const days = parseInt(body.expiresIn);
    if (days > 0) {
      expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    }
  }

  const id = crypto.randomUUID();
  await db.insert(apiKeys).values({
    id,
    userId: session.user.id,
    name,
    keyPrefix: prefix,
    keyHash: hash,
    expiresAt,
    createdAt: new Date(),
  });

  return NextResponse.json(
    {
      id,
      name,
      key: raw, // Only returned once!
      prefix,
      expiresAt: expiresAt?.toISOString() || null,
      createdAt: new Date().toISOString(),
    },
    { status: 201 }
  );
}
