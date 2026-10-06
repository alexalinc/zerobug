import { v } from "convex/values";
import {
  mutation,
  query,
  internalQuery,
  internalMutation,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { requireAdminSession } from "./lib/adminGate";

const googleAdsStatusValidator = v.union(
  v.literal("pending"),
  v.literal("sent"),
  v.literal("skipped"),
  v.literal("failed"),
);

/** Connection status for admin UI (no tokens). */
export const getConnection = query({
  args: { sessionToken: v.string() },
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
  handler: async (ctx, args) => {
    await requireAdminSession(args.sessionToken);
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
    sessionToken: v.string(),
    refreshToken: v.string(),
    accessToken: v.optional(v.string()),
    tokenExpiresAt: v.optional(v.number()),
    email: v.optional(v.string()),
  },
  returns: v.id("googleAdsSettings"),
  handler: async (ctx, args) => {
    await requireAdminSession(args.sessionToken);
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
    sessionToken: v.string(),
    customerId: v.string(),
    conversionActionId: v.string(),
    conversionActionName: v.optional(v.string()),
    conversionValueRon: v.optional(v.number()),
    loginCustomerId: v.optional(v.string()),
    enabled: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdminSession(args.sessionToken);
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
  args: { sessionToken: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdminSession(args.sessionToken);
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
  args: { sessionToken: v.string(), leadId: v.id("leads") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdminSession(args.sessionToken);
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
      googleAdsRequestId: undefined,
      googleAdsHttpStatus: undefined,
      googleAdsApiResponse: undefined,
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
    googleAdsHttpStatus: v.optional(v.number()),
    googleAdsApiResponse: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const synced =
      args.googleAdsStatus === "sent" ||
      args.googleAdsStatus === "skipped" ||
      args.googleAdsStatus === "failed";
    await ctx.db.patch(args.leadId, {
      googleAdsStatus: args.googleAdsStatus,
      googleAdsError: args.googleAdsError,
      googleAdsRequestId: args.googleAdsRequestId,
      googleAdsHttpStatus: args.googleAdsHttpStatus,
      googleAdsApiResponse: args.googleAdsApiResponse,
      ...(synced ? { googleAdsSyncedAt: Date.now() } : {}),
    });
    return null;
  },
});

const syncRecentItem = v.object({
  leadId: v.id("leads"),
  name: v.string(),
  email: v.string(),
  createdAt: v.number(),
  gclid: v.optional(v.string()),
  gbraid: v.optional(v.string()),
  wbraid: v.optional(v.string()),
  marketingConsent: v.optional(v.boolean()),
  googleAdsStatus: v.optional(googleAdsStatusValidator),
  googleAdsSyncedAt: v.optional(v.number()),
  googleAdsError: v.optional(v.string()),
  googleAdsRequestId: v.optional(v.string()),
  googleAdsHttpStatus: v.optional(v.number()),
  googleAdsApiResponse: v.optional(v.string()),
});

/** Aggregates + recent Data Manager API responses for admin UI. */
export const getSyncStats = query({
  args: {
    sessionToken: v.string(),
    days: v.optional(v.number()),
    now: v.number(),
  },
  returns: v.object({
    days: v.number(),
    from: v.number(),
    to: v.number(),
    totals: v.object({
      leads: v.number(),
      withGclid: v.number(),
      withGbraid: v.number(),
      withWbraid: v.number(),
      withAnyClickId: v.number(),
      withMarketingConsent: v.number(),
      pending: v.number(),
      sent: v.number(),
      skipped: v.number(),
      failed: v.number(),
      noSync: v.number(),
    }),
    recent: v.array(syncRecentItem),
  }),
  handler: async (ctx, args) => {
    await requireAdminSession(args.sessionToken);
    const days = Math.min(90, Math.max(1, Math.floor(args.days ?? 30)));
    const to =
      typeof args.now === "number" &&
      args.now > 0 &&
      args.now < 4102444800000
        ? args.now
        : 0;
    if (!to) throw new Error("Invalid now");
    const from = to - days * 24 * 60 * 60 * 1000;

    const leads = await ctx.db
      .query("leads")
      .withIndex("by_created", (q) => q.gte("createdAt", from))
      .take(500);

    const totals = {
      leads: 0,
      withGclid: 0,
      withGbraid: 0,
      withWbraid: 0,
      withAnyClickId: 0,
      withMarketingConsent: 0,
      pending: 0,
      sent: 0,
      skipped: 0,
      failed: 0,
      noSync: 0,
    };

    for (const lead of leads) {
      totals.leads += 1;
      if (lead.gclid) totals.withGclid += 1;
      if (lead.gbraid) totals.withGbraid += 1;
      if (lead.wbraid) totals.withWbraid += 1;
      if (lead.gclid || lead.gbraid || lead.wbraid) totals.withAnyClickId += 1;
      if (lead.marketingConsent) totals.withMarketingConsent += 1;
      const st = lead.googleAdsStatus;
      if (st === "pending") totals.pending += 1;
      else if (st === "sent") totals.sent += 1;
      else if (st === "skipped") totals.skipped += 1;
      else if (st === "failed") totals.failed += 1;
      else totals.noSync += 1;
    }

    const withSyncAttempt = leads
      .filter((l) => l.googleAdsStatus != null)
      .sort((a, b) => {
        const ta = a.googleAdsSyncedAt ?? a.createdAt;
        const tb = b.googleAdsSyncedAt ?? b.createdAt;
        return tb - ta;
      })
      .slice(0, 15)
      .map((l) => ({
        leadId: l._id,
        name: l.name,
        email: l.email,
        createdAt: l.createdAt,
        gclid: l.gclid,
        gbraid: l.gbraid,
        wbraid: l.wbraid,
        marketingConsent: l.marketingConsent,
        googleAdsStatus: l.googleAdsStatus,
        googleAdsSyncedAt: l.googleAdsSyncedAt,
        googleAdsError: l.googleAdsError,
        googleAdsRequestId: l.googleAdsRequestId,
        googleAdsHttpStatus: l.googleAdsHttpStatus,
        googleAdsApiResponse: l.googleAdsApiResponse,
      }));

    return { days, from, to, totals, recent: withSyncAttempt };
  },
});
