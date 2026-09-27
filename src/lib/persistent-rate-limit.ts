import { createHash } from "crypto";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL missing");
  return new ConvexHttpClient(url);
}

function getBridgeSecret() {
  const secret = process.env.CONVEX_BRIDGE_SECRET;
  if (!secret || secret.length < 24) {
    throw new Error("CONVEX_BRIDGE_SECRET not configured");
  }
  return secret;
}

/** Opaque IP fingerprint — never send raw IPs to Convex. */
export function hashClientIp(ip: string): string {
  const salt =
    process.env.ADMIN_SESSION_SECRET ||
    process.env.CONVEX_BRIDGE_SECRET ||
    "local-dev-salt";
  return createHash("sha256").update(`${salt}|${ip}`).digest("hex");
}

export async function persistentCheckLogin(ip: string): Promise<{
  ok: boolean;
  retryAfterSec?: number;
}> {
  try {
    const client = getConvexClient();
    return await client.mutation(api.rateLimit.checkLogin, {
      bridgeSecret: getBridgeSecret(),
      ipHash: hashClientIp(ip),
    });
  } catch (err) {
    // Fail closed in production — do not allow unlimited attempts if Convex is down
    if (process.env.VERCEL || process.env.NODE_ENV === "production") {
      console.error("login rate-limit check failed", err);
      return { ok: false, retryAfterSec: 60 };
    }
    return { ok: true };
  }
}

export async function persistentRecordLoginFailure(ip: string): Promise<{
  ok: boolean;
  retryAfterSec?: number;
}> {
  try {
    const client = getConvexClient();
    return await client.mutation(api.rateLimit.recordLoginFailure, {
      bridgeSecret: getBridgeSecret(),
      ipHash: hashClientIp(ip),
    });
  } catch (err) {
    console.error("login rate-limit record failed", err);
    return { ok: true };
  }
}

export async function persistentClearLogin(ip: string): Promise<void> {
  try {
    const client = getConvexClient();
    await client.mutation(api.rateLimit.clearLogin, {
      bridgeSecret: getBridgeSecret(),
      ipHash: hashClientIp(ip),
    });
  } catch (err) {
    console.error("login rate-limit clear failed", err);
  }
}

export async function persistentConsumeChallenge(ip: string): Promise<{
  ok: boolean;
  retryAfterSec?: number;
}> {
  try {
    const client = getConvexClient();
    return await client.mutation(api.rateLimit.consumeChallenge, {
      bridgeSecret: getBridgeSecret(),
      ipHash: hashClientIp(ip),
    });
  } catch (err) {
    console.error("challenge rate-limit failed", err);
    if (process.env.VERCEL || process.env.NODE_ENV === "production") {
      return { ok: false, retryAfterSec: 60 };
    }
    return { ok: true };
  }
}
