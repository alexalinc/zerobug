import { v } from "convex/values";
import { mutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { requireBridgeSecret } from "./lib/adminGate";

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_BLOCK_MS = 15 * 60 * 1000;

const CHALLENGE_WINDOW_MS = 10 * 60 * 1000;
const CHALLENGE_MAX = 30;

async function getBucket(ctx: MutationCtx, key: string) {
  return await ctx.db
    .query("rateLimits")
    .withIndex("by_key", (q) => q.eq("key", key))
    .unique();
}

/**
 * Check whether a login IP hash is currently blocked.
 * Called by Next.js `/api/admin/auth` with CONVEX_BRIDGE_SECRET.
 */
export const checkLogin = mutation({
  args: {
    bridgeSecret: v.string(),
    ipHash: v.string(),
  },
  returns: v.object({
    ok: v.boolean(),
    retryAfterSec: v.optional(v.number()),
  }),
  handler: async (ctx, args) => {
    requireBridgeSecret(args.bridgeSecret, "CONVEX_BRIDGE_SECRET");
    if (!/^[a-f0-9]{32,128}$/i.test(args.ipHash)) {
      throw new Error("Unauthorized");
    }
    const key = `login:${args.ipHash}`;
    const now = Date.now();
    const bucket = await getBucket(ctx, key);
    if (bucket?.blockedUntil && bucket.blockedUntil > now) {
      return {
        ok: false,
        retryAfterSec: Math.ceil((bucket.blockedUntil - now) / 1000),
      };
    }
    return { ok: true };
  },
});

/** Record a failed login for this IP hash. */
export const recordLoginFailure = mutation({
  args: {
    bridgeSecret: v.string(),
    ipHash: v.string(),
  },
  returns: v.object({
    ok: v.boolean(),
    retryAfterSec: v.optional(v.number()),
  }),
  handler: async (ctx, args) => {
    requireBridgeSecret(args.bridgeSecret, "CONVEX_BRIDGE_SECRET");
    if (!/^[a-f0-9]{32,128}$/i.test(args.ipHash)) {
      throw new Error("Unauthorized");
    }
    const key = `login:${args.ipHash}`;
    const now = Date.now();
    const existing = await getBucket(ctx, key);

    if (!existing || now - existing.windowStart > LOGIN_WINDOW_MS) {
      if (existing) {
        await ctx.db.patch(existing._id, {
          count: 1,
          windowStart: now,
          blockedUntil: 0,
        });
      } else {
        await ctx.db.insert("rateLimits", {
          key,
          count: 1,
          windowStart: now,
          blockedUntil: 0,
        });
      }
      return { ok: true };
    }

    const nextCount = existing.count + 1;
    if (nextCount >= LOGIN_MAX_ATTEMPTS) {
      const blockedUntil = now + LOGIN_BLOCK_MS;
      await ctx.db.patch(existing._id, {
        count: nextCount,
        blockedUntil,
      });
      return {
        ok: false,
        retryAfterSec: Math.ceil(LOGIN_BLOCK_MS / 1000),
      };
    }

    await ctx.db.patch(existing._id, { count: nextCount });
    return { ok: true };
  },
});

/** Clear login failures after successful auth. */
export const clearLogin = mutation({
  args: {
    bridgeSecret: v.string(),
    ipHash: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    requireBridgeSecret(args.bridgeSecret, "CONVEX_BRIDGE_SECRET");
    if (!/^[a-f0-9]{32,128}$/i.test(args.ipHash)) {
      throw new Error("Unauthorized");
    }
    const key = `login:${args.ipHash}`;
    const existing = await getBucket(ctx, key);
    if (existing) {
      await ctx.db.delete(existing._id);
    }
    return null;
  },
});

/**
 * Rate-limit lead challenge issuance (anti token-farming).
 * Returns ok=false when over the limit.
 */
export const consumeChallenge = mutation({
  args: {
    bridgeSecret: v.string(),
    ipHash: v.string(),
  },
  returns: v.object({
    ok: v.boolean(),
    retryAfterSec: v.optional(v.number()),
  }),
  handler: async (ctx, args) => {
    requireBridgeSecret(args.bridgeSecret, "CONVEX_BRIDGE_SECRET");
    if (!/^[a-f0-9]{32,128}$/i.test(args.ipHash)) {
      throw new Error("Unauthorized");
    }
    const key = `challenge:${args.ipHash}`;
    const now = Date.now();
    const existing = await getBucket(ctx, key);

    if (!existing || now - existing.windowStart > CHALLENGE_WINDOW_MS) {
      if (existing) {
        await ctx.db.patch(existing._id, {
          count: 1,
          windowStart: now,
          blockedUntil: 0,
        });
      } else {
        await ctx.db.insert("rateLimits", {
          key,
          count: 1,
          windowStart: now,
          blockedUntil: 0,
        });
      }
      return { ok: true };
    }

    if (existing.count >= CHALLENGE_MAX) {
      const retryAfterSec = Math.ceil(
        (existing.windowStart + CHALLENGE_WINDOW_MS - now) / 1000,
      );
      return { ok: false, retryAfterSec: Math.max(1, retryAfterSec) };
    }

    await ctx.db.patch(existing._id, { count: existing.count + 1 });
    return { ok: true };
  },
});
