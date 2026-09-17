import { v } from "convex/values";
import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

export const listPlans = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const plans = await ctx.db.query("maintenancePlans").take(50);
    return plans.filter((p) => p.active);
  },
});

export const listAll = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    return await ctx.db.query("subscriptions").order("desc").take(200);
  },
});

export const listWithDetails = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const subs = await ctx.db.query("subscriptions").order("desc").take(200);
    const result = [];
    for (const sub of subs) {
      const company = await ctx.db.get(sub.companyId);
      const plan = await ctx.db.get(sub.planId);
      result.push({ ...sub, company, plan });
    }
    return result;
  },
});

export const createManual = mutation({
  args: {
    companyId: v.id("companies"),
    planId: v.id("maintenancePlans"),
  },
  returns: v.id("subscriptions"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("subscriptions", {
      companyId: args.companyId,
      planId: args.planId,
      status: "manual",
      billingMode: "manual",
      createdAt: Date.now(),
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("subscriptions"),
    status: v.union(
      v.literal("active"),
      v.literal("past_due"),
      v.literal("canceled"),
      v.literal("trialing"),
      v.literal("manual"),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
    return null;
  },
});

export const upsertFromStripe = internalMutation({
  args: {
    companyName: v.string(),
    email: v.string(),
    cui: v.optional(v.string()),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    planKey: v.string(),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("past_due"),
      v.literal("canceled"),
      v.literal("trialing"),
      v.literal("manual"),
    ),
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
  },
  returns: v.object({
    companyId: v.id("companies"),
    subscriptionId: v.id("subscriptions"),
  }),
  handler: async (ctx, args) => {
    let company = await ctx.db
      .query("companies")
      .withIndex("by_stripe_customer", (q) =>
        q.eq("stripeCustomerId", args.stripeCustomerId),
      )
      .unique();

    if (!company) {
      company = await ctx.db
        .query("companies")
        .withIndex("by_email", (q) => q.eq("email", args.email))
        .unique();
    }

    let companyId: Id<"companies">;
    if (company) {
      companyId = company._id;
      await ctx.db.patch(companyId, {
        name: args.companyName || company.name,
        email: args.email,
        cui: args.cui ?? company.cui,
        address: args.address ?? company.address,
        phone: args.phone ?? company.phone,
        stripeCustomerId: args.stripeCustomerId,
        status: "active",
      });
    } else {
      companyId = await ctx.db.insert("companies", {
        name: args.companyName,
        email: args.email,
        cui: args.cui,
        address: args.address,
        phone: args.phone,
        stripeCustomerId: args.stripeCustomerId,
        status: "active",
        createdAt: Date.now(),
      });
    }

    const plan = await ctx.db
      .query("maintenancePlans")
      .withIndex("by_plan_key", (q) => q.eq("planKey", args.planKey))
      .unique();
    if (!plan) {
      throw new Error(`Plan not found: ${args.planKey}`);
    }

    let subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripe_subscription", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId),
      )
      .unique();

    let subscriptionId: Id<"subscriptions">;
    if (subscription) {
      subscriptionId = subscription._id;
      await ctx.db.patch(subscriptionId, {
        status: args.status,
        currentPeriodStart: args.currentPeriodStart,
        currentPeriodEnd: args.currentPeriodEnd,
        planId: plan._id,
        companyId,
      });
    } else {
      subscriptionId = await ctx.db.insert("subscriptions", {
        companyId,
        planId: plan._id,
        status: args.status,
        billingMode: "stripe",
        stripeSubscriptionId: args.stripeSubscriptionId,
        currentPeriodStart: args.currentPeriodStart,
        currentPeriodEnd: args.currentPeriodEnd,
        createdAt: Date.now(),
      });
    }

    return { companyId, subscriptionId };
  },
});

export const getActiveForBilling = internalQuery({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const active = await ctx.db
      .query("subscriptions")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
    const manual = await ctx.db
      .query("subscriptions")
      .withIndex("by_status", (q) => q.eq("status", "manual"))
      .collect();
    const all = [...active, ...manual];
    const result = [];
    for (const sub of all) {
      const company = await ctx.db.get(sub.companyId);
      const plan = await ctx.db.get(sub.planId);
      if (company && plan && company.status === "active") {
        result.push({ subscription: sub, company, plan });
      }
    }
    return result;
  },
});

export const getPlanByKey = internalQuery({
  args: { planKey: v.string() },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("maintenancePlans")
      .withIndex("by_plan_key", (q) => q.eq("planKey", args.planKey))
      .unique();
  },
});

export const setStripePriceId = mutation({
  args: {
    planKey: v.string(),
    stripePriceId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const plan = await ctx.db
      .query("maintenancePlans")
      .withIndex("by_plan_key", (q) => q.eq("planKey", args.planKey))
      .unique();
    if (!plan) throw new Error("Plan not found");
    await ctx.db.patch(plan._id, { stripePriceId: args.stripePriceId });
    return null;
  },
});
