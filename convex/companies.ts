import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("companies"),
      _creationTime: v.number(),
      name: v.string(),
      cui: v.optional(v.string()),
      regCom: v.optional(v.string()),
      address: v.optional(v.string()),
      email: v.string(),
      phone: v.optional(v.string()),
      notes: v.optional(v.string()),
      status: v.union(v.literal("active"), v.literal("suspended")),
      stripeCustomerId: v.optional(v.string()),
      createdAt: v.number(),
    }),
  ),
  handler: async (ctx) => {
    return await ctx.db.query("companies").order("desc").take(200);
  },
});

export const get = query({
  args: { id: v.id("companies") },
  returns: v.union(
    v.object({
      _id: v.id("companies"),
      _creationTime: v.number(),
      name: v.string(),
      cui: v.optional(v.string()),
      regCom: v.optional(v.string()),
      address: v.optional(v.string()),
      email: v.string(),
      phone: v.optional(v.string()),
      notes: v.optional(v.string()),
      status: v.union(v.literal("active"), v.literal("suspended")),
      stripeCustomerId: v.optional(v.string()),
      createdAt: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    cui: v.optional(v.string()),
    regCom: v.optional(v.string()),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("suspended"))),
  },
  returns: v.id("companies"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("companies", {
      name: args.name,
      email: args.email,
      cui: args.cui,
      regCom: args.regCom,
      address: args.address,
      phone: args.phone,
      notes: args.notes,
      status: args.status ?? "active",
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("companies"),
    name: v.string(),
    email: v.string(),
    cui: v.optional(v.string()),
    regCom: v.optional(v.string()),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("suspended")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    await ctx.db.patch(id, rest);
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("companies") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return null;
  },
});
