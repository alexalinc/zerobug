import { jwtVerify } from "jose";

function getAdminJwtSecret(): Uint8Array {
  const secret =
    process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error("Unauthorized");
  }
  // Refuse well-known defaults even if somehow set in a deployed env
  if (
    secret === "zerobug-dev-secret-change-me" ||
    secret === "zerobug-admin" ||
    secret === "changeme"
  ) {
    throw new Error("Unauthorized");
  }
  return new TextEncoder().encode(secret);
}

/**
 * Gate for admin-only Convex functions.
 * Callers must pass the `zb_admin_session` JWT (from the httpOnly cookie
 * via /api/admin/session-token, or directly from a trusted Next.js route).
 */
export async function requireAdminSession(sessionToken: string): Promise<void> {
  if (!sessionToken || typeof sessionToken !== "string") {
    throw new Error("Unauthorized");
  }
  try {
    const { payload } = await jwtVerify(sessionToken, getAdminJwtSecret());
    if (payload.role !== "admin") {
      throw new Error("Unauthorized");
    }
  } catch {
    throw new Error("Unauthorized");
  }
}

/** Shared secret for Next.js → Convex bridges (Stripe webhook, etc.). */
export function requireBridgeSecret(
  provided: string,
  envName: string,
): void {
  const expected = process.env[envName];
  if (!expected || expected.length < 16) {
    throw new Error("Unauthorized");
  }
  if (provided.length !== expected.length) {
    throw new Error("Unauthorized");
  }
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  if (mismatch !== 0) {
    throw new Error("Unauthorized");
  }
}
