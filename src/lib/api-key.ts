import crypto from "crypto";

/** Generate a new API key with vk_ prefix, its SHA-256 hash, and display prefix */
export function generateApiKey(): { raw: string; hash: string; prefix: string } {
  const raw = `vk_${crypto.randomBytes(16).toString("hex")}`;
  const hash = crypto.createHash("sha256").update(raw).digest("hex");
  const prefix = raw.slice(0, 8);
  return { raw, hash, prefix };
}

/** Hash an API key with SHA-256 for database lookup */
export function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}
