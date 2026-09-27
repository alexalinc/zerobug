import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

const COOKIE = "zb_admin_session";

const DEV_FALLBACK_SECRET = "zerobug-dev-secret-change-me";
const WEAK_SECRETS = new Set([
  DEV_FALLBACK_SECRET,
  "zerobug-admin",
  "changeme",
  "password",
  "admin",
  "changeme-use-12plus-chars-in-prod",
  "change-this-long-random-secret",
  "change-this-long-random-cron-secret",
]);

function isProductionLike() {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL === "1" ||
    Boolean(process.env.VERCEL_ENV)
  );
}

function getSecret() {
  const secret =
    process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (isProductionLike()) {
    if (!secret || WEAK_SECRETS.has(secret) || secret.length < 24) {
      throw new Error(
        "ADMIN_SESSION_SECRET must be set to a strong value (24+ chars) in production",
      );
    }
    return new TextEncoder().encode(secret);
  }
  if (secret && (WEAK_SECRETS.has(secret) || secret.length < 16)) {
    // Still allow local fallback, but never use an explicitly weak custom secret
    return new TextEncoder().encode(DEV_FALLBACK_SECRET);
  }
  return new TextEncoder().encode(secret || DEV_FALLBACK_SECRET);
}

async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.role !== "admin") return false;
    const minIat = Number(process.env.ADMIN_SESSION_MIN_IAT || "0");
    if (minIat > 0 && typeof payload.iat === "number" && payload.iat < minIat) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Still compare to avoid early return timing leak length
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

export async function createAdminSession(rememberMe = false) {
  // Short-lived by default; rememberMe still capped (stolen JWT window)
  const hours = rememberMe ? 24 * 7 : 8;
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${hours}h`)
    .setJti(crypto.randomUUID())
    .sign(getSecret());
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" || process.env.VERCEL === "1",
    path: "/",
    maxAge: 60 * 60 * hours,
  });
}

export async function destroyAdminSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function isAdminAuthenticated() {
  const jar = await cookies();
  return verifySessionToken(jar.get(COOKIE)?.value);
}

/** Prefer this in Route Handlers — reads cookies from the incoming request. */
export async function isAdminAuthenticatedRequest(req: NextRequest) {
  return verifySessionToken(req.cookies.get(COOKIE)?.value);
}

export function getAdminCredentials() {
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD;
  if (isProductionLike()) {
    if (!password || WEAK_SECRETS.has(password) || password.length < 12) {
      throw new Error(
        "ADMIN_PASSWORD must be set to a strong value (12+ chars) in production",
      );
    }
    return { username, password };
  }
  return {
    username,
    password: password || "zerobug-admin",
  };
}

export function verifyAdminCredentials(username: string, password: string) {
  const expected = getAdminCredentials();
  const userOk = safeEqual(username.trim(), expected.username);
  const passOk = safeEqual(password, expected.password);
  return userOk && passOk;
}

/** @deprecated use verifyAdminCredentials */
export function verifyAdminPassword(password: string) {
  const expected = getAdminCredentials();
  return safeEqual(password, expected.password);
}

type RateBucket = {
  count: number;
  resetAt: number;
  blockedUntil: number;
};

const loginAttempts = new Map<string, RateBucket>();

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const BLOCK_MS = 15 * 60 * 1000;

export function getClientIp(req: {
  headers: Headers;
}): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip") || "unknown";
}

export function checkLoginRateLimit(ip: string): {
  ok: boolean;
  retryAfterSec?: number;
} {
  const now = Date.now();
  const bucket = loginAttempts.get(ip);

  if (bucket?.blockedUntil && bucket.blockedUntil > now) {
    return {
      ok: false,
      retryAfterSec: Math.ceil((bucket.blockedUntil - now) / 1000),
    };
  }

  if (!bucket || bucket.resetAt <= now) {
    loginAttempts.set(ip, {
      count: 0,
      resetAt: now + WINDOW_MS,
      blockedUntil: 0,
    });
    return { ok: true };
  }

  if (bucket.count >= MAX_ATTEMPTS) {
    bucket.blockedUntil = now + BLOCK_MS;
    return {
      ok: false,
      retryAfterSec: Math.ceil(BLOCK_MS / 1000),
    };
  }

  return { ok: true };
}

export function recordLoginFailure(ip: string) {
  const now = Date.now();
  const bucket = loginAttempts.get(ip);
  if (!bucket || bucket.resetAt <= now) {
    loginAttempts.set(ip, {
      count: 1,
      resetAt: now + WINDOW_MS,
      blockedUntil: 0,
    });
    return;
  }
  bucket.count += 1;
  if (bucket.count >= MAX_ATTEMPTS) {
    bucket.blockedUntil = now + BLOCK_MS;
  }
}

export function clearLoginRateLimit(ip: string) {
  loginAttempts.delete(ip);
}

export { COOKIE as ADMIN_SESSION_COOKIE };
