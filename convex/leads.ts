import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

export const create = mutation({
  args: {
    type: v.union(
      v.literal("contact"),
      v.literal("service_quote"),
      v.literal("maintenance"),
    ),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    message: v.optional(v.string()),
    serviceCategory: v.optional(v.string()),
    serviceName: v.optional(v.string()),
    planKey: v.optional(v.string()),
    complexity: v.optional(v.string()),
    addons: v.optional(v.array(v.string())),
    budget: v.optional(v.number()),
    quoteDetails: v.optional(v.string()),
    gclid: v.optional(v.string()),
    gbraid: v.optional(v.string()),
    wbraid: v.optional(v.string()),
  },
  returns: v.id("leads"),
  handler: async (ctx, args) => {
    const { gclid, gbraid, wbraid, ...rest } = args;

    const settings = await ctx.db
      .query("googleAdsSettings")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .unique();
    const syncReady = Boolean(
      settings?.enabled &&
        settings.refreshToken &&
        settings.customerId &&
        settings.conversionActionId,
    );

    const id = await ctx.db.insert("leads", {
      ...rest,
      gclid: gclid || undefined,
      gbraid: gbraid || undefined,
      wbraid: wbraid || undefined,
      googleAdsStatus: syncReady ? "pending" : undefined,
      status: "new",
      createdAt: Date.now(),
    });

    // Service quotes stay in admin only — no email notification.
    if (args.type !== "service_quote") {
      await ctx.scheduler.runAfter(0, internal.leadsActions.notifyLeadEmail, {
        type: args.type,
        name: args.name,
        email: args.email,
        phone: args.phone,
        company: args.company,
        message: args.message,
        serviceCategory: args.serviceCategory,
        serviceName: args.serviceName,
        planKey: args.planKey,
        complexity: args.complexity,
        addons: args.addons,
        budget: args.budget,
        quoteDetails: args.quoteDetails,
      });
    }

    if (syncReady) {
      await ctx.scheduler.runAfter(
        0,
        internal.googleAdsActions.uploadLeadConversion,
        { leadId: id },
      );
    }

    return id;
  },
});

export const list = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    return await ctx.db.query("leads").order("desc").take(200);
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("leads"),
    status: v.union(
      v.literal("new"),
      v.literal("contacted"),
      v.literal("won"),
      v.literal("lost"),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
    return null;
  },
});
