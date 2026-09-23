import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { timingSafeEqual } from "crypto";

const COOKIE = "zb_admin_session";

function getSecret() {
  const secret =
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "zerobug-dev-secret-change-me";
  return new TextEncoder().encode(secret);
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
  const days = rememberMe ? 30 : 1;
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${days}d`)
    .sign(getSecret());
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * days,
  });
}

export async function destroyAdminSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function isAdminAuthenticated() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

export function getAdminCredentials() {
  return {
    username: process.env.ADMIN_USERNAME || "admin",
    password: process.env.ADMIN_PASSWORD || "zerobug-admin",
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
