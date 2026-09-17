import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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
  },
  returns: v.id("leads"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("leads", {
      ...args,
      status: "new",
      createdAt: Date.now(),
    });
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
