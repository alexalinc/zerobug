import { v } from "convex/values";
import {
  mutation,
  query,
  internalQuery,
  internalMutation,
} from "./_generated/server";
import { internal } from "./_generated/api";

const googleAdsStatusValidator = v.union(
  v.literal("pending"),
  v.literal("sent"),
  v.literal("skipped"),
  v.literal("failed"),
);

/** Public connection status for admin UI (no tokens). */
export const getConnection = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      connected: v.boolean(),
      email: v.optional(v.string()),
      customerId: v.optional(v.string()),
      loginCustomerId: v.optional(v.string()),
      conversionActionId: v.optional(v.string()),
      conversionActionName: v.optional(v.string()),
      conversionValueRon: v.number(),
      connectedAt: v.optional(v.number()),
      enabled: v.boolean(),
      ready: v.boolean(),
    }),
  ),
  handler: async (ctx) => {
    const row = await ctx.db
      .query("googleAdsSettings")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .unique();
    if (!row) return null;
    const ready = Boolean(
      row.refreshToken &&
        row.customerId &&
        row.conversionActionId &&
        row.enabled,
    );
    return {
      connected: Boolean(row.refreshToken),
      email: row.email,
      customerId: row.customerId,
      loginCustomerId: row.loginCustomerId,
      conversionActionId: row.conversionActionId,
      conversionActionName: row.conversionActionName,
      conversionValueRon: row.conversionValueRon ?? 20,
      connectedAt: row.connectedAt,
      enabled: row.enabled,
      ready,
    };
  },
});

/** Called from OAuth callback after exchanging the code. */
export const saveOAuthTokens = mutation({
  args: {
    refreshToken: v.string(),
    accessToken: v.optional(v.string()),
    tokenExpiresAt: v.optional(v.number()),
    email: v.optional(v.string()),
  },
  returns: v.id("googleAdsSettings"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("googleAdsSettings")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .unique();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        refreshToken: args.refreshToken,
        accessToken: args.accessToken,
        tokenExpiresAt: args.tokenExpiresAt,
        email: args.email,
        connectedAt: now,
        // Keep existing destination IDs; keep enabled if already configured
        enabled: existing.enabled,
      });
      return existing._id;
    }

    return await ctx.db.insert("googleAdsSettings", {
      key: "main",
      refreshToken: args.refreshToken,
      accessToken: args.accessToken,
      tokenExpiresAt: args.tokenExpiresAt,
      email: args.email,
      connectedAt: now,
      enabled: false,
    });
  },
});

export const updateConfig = mutation({
  args: {
    customerId: v.string(),
    conversionActionId: v.string(),
    conversionActionName: v.optional(v.string()),
    conversionValueRon: v.optional(v.number()),
    loginCustomerId: v.optional(v.string()),
    enabled: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("googleAdsSettings")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .unique();
    if (!existing) {
      throw new Error("Conectează mai întâi contul Google Ads");
    }
    const customerId = args.customerId.replace(/-/g, "").trim();
    const conversionActionId = args.conversionActionId.trim();
    const loginCustomerId = args.loginCustomerId
      ? args.loginCustomerId.replace(/-/g, "").trim()
      : undefined;
    if (!customerId || !conversionActionId) {
      throw new Error("Customer ID și Conversion Action ID sunt obligatorii");
    }
    const value =
      typeof args.conversionValueRon === "number" && args.conversionValueRon > 0
        ? args.conversionValueRon
        : 20;
    await ctx.db.patch(existing._id, {
      customerId,
      conversionActionId,
      conversionActionName: args.conversionActionName || undefined,
      conversionValueRon: value,
      loginCustomerId: loginCustomerId || undefined,
      enabled: args.enabled,
    });
    return null;
  },
});

export const disconnect = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("googleAdsSettings")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .unique();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
    return null;
  },
});

/** Re-queue conversion upload for a lead (admin retry). */
export const retryGoogleAdsSync = mutation({
  args: { leadId: v.id("leads") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.leadId);
    if (!lead) throw new Error("Lead negăsit");

    const settings = await ctx.db
      .query("googleAdsSettings")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .unique();
    if (
      !settings?.refreshToken ||
      !settings.customerId ||
      !settings.conversionActionId ||
      !settings.enabled
    ) {
      throw new Error("Google Ads nu e configurat / activ");
    }

    if (!lead.marketingConsent) {
      throw new Error(
        "Lead fără consimțământ marketing — nu se poate trimite conversia",
      );
    }

    await ctx.db.patch(args.leadId, {
      googleAdsStatus: "pending",
      googleAdsError: undefined,
    });
    await ctx.scheduler.runAfter(
      0,
      internal.googleAdsActions.uploadLeadConversion,
      { leadId: args.leadId },
    );
    return null;
  },
});

export const getConnectionInternal = internalQuery({
  args: {},
  returns: v.union(v.null(), v.any()),
  handler: async (ctx) => {
    return await ctx.db
      .query("googleAdsSettings")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .unique();
  },
});

export const patchTokensInternal = internalMutation({
  args: {
    accessToken: v.string(),
    tokenExpiresAt: v.number(),
    refreshToken: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("googleAdsSettings")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .unique();
    if (!existing) return null;
    await ctx.db.patch(existing._id, {
      accessToken: args.accessToken,
      tokenExpiresAt: args.tokenExpiresAt,
      ...(args.refreshToken ? { refreshToken: args.refreshToken } : {}),
    });
    return null;
  },
});

export const getLeadInternal = internalQuery({
  args: { leadId: v.id("leads") },
  returns: v.union(v.null(), v.any()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.leadId);
  },
});

export const patchLeadSyncInternal = internalMutation({
  args: {
    leadId: v.id("leads"),
    googleAdsStatus: googleAdsStatusValidator,
    googleAdsError: v.optional(v.string()),
    googleAdsRequestId: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const synced =
      args.googleAdsStatus === "sent" || args.googleAdsStatus === "skipped";
    await ctx.db.patch(args.leadId, {
      googleAdsStatus: args.googleAdsStatus,
      googleAdsError: args.googleAdsError,
      googleAdsRequestId: args.googleAdsRequestId,
      ...(synced ? { googleAdsSyncedAt: Date.now() } : {}),
    });
    return null;
  },
});
