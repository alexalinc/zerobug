import { jwtVerify } from "jose";

const WEAK_SECRETS = new Set([
  "zerobug-dev-secret-change-me",
  "zerobug-admin",
  "changeme",
  "password",
  "admin",
  "changeme-use-12plus-chars-in-prod",
  "change-this-long-random-secret",
  "change-this-long-random-cron-secret",
]);

function isProductionLike() {
  // Convex cloud deployments set CONVEX_CLOUD_URL / lack NODE_ENV=development
  return (
    process.env.NODE_ENV === "production" ||
    Boolean(process.env.CONVEX_CLOUD_URL) ||
    Boolean(process.env.VERCEL)
  );
}

function getAdminJwtSecret(): Uint8Array {
  const secret =
    process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret || WEAK_SECRETS.has(secret) || secret.length < 16) {
    throw new Error("Unauthorized");
  }
  if (isProductionLike() && secret.length < 24) {
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
    // Reject tokens minted before an admin-forced epoch bump
    const minIat = Number(process.env.ADMIN_SESSION_MIN_IAT || "0");
    if (minIat > 0 && typeof payload.iat === "number" && payload.iat < minIat) {
      throw new Error("Unauthorized");
    }
  } catch {
    throw new Error("Unauthorized");
  }
}

/** Shared secret for Next.js → Convex bridges (Stripe webhook, cron, etc.). */
export function requireBridgeSecret(
  provided: string,
  envName: string,
): void {
  const expected = process.env[envName];
  if (!expected || expected.length < 24 || WEAK_SECRETS.has(expected)) {
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
