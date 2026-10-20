import { v } from "convex/values";
import {
  mutation,
  query,
  internalQuery,
  internalMutation,
} from "./_generated/server";
import { requireAdminSession } from "./lib/adminGate";

const companyDoc = v.object({
  _id: v.id("companies"),
  _creationTime: v.number(),
  name: v.string(),
  cui: v.optional(v.string()),
  regCom: v.optional(v.string()),
  address: v.optional(v.string()),
  email: v.string(),
  phone: v.optional(v.string()),
  notes: v.optional(v.string()),
  monthlyAmount: v.optional(v.number()),
  vatMode: v.optional(
    v.union(v.literal("excluded"), v.literal("included")),
  ),
  invoiceDescription: v.optional(v.string()),
  listedAsClient: v.optional(v.boolean()),
  status: v.union(v.literal("active"), v.literal("suspended")),
  stripeCustomerId: v.optional(v.string()),
  createdAt: v.number(),
});

const clientPickerDoc = v.object({
  _id: v.id("companies"),
  name: v.string(),
  email: v.string(),
  cui: v.optional(v.string()),
  regCom: v.optional(v.string()),
  address: v.optional(v.string()),
  phone: v.optional(v.string()),
  vatMode: v.optional(
    v.union(v.literal("excluded"), v.literal("included")),
  ),
  invoiceDescription: v.optional(v.string()),
  hasMonthlyBilling: v.boolean(),
});

const vatModeArg = v.optional(
  v.union(v.literal("excluded"), v.literal("included")),
);

export const list = query({
  args: { sessionToken: v.string() },
  returns: v.array(companyDoc),
  handler: async (ctx, args) => {
    await requireAdminSession(args.sessionToken);
    const all = await ctx.db.query("companies").order("desc").take(300);
    return all.filter((c) => c.listedAsClient !== false);
  },
});

/** Active listed clients for one-off invoice picker (includes monthly firms). */
export const listForInvoicing = query({
  args: { sessionToken: v.string() },
  returns: v.array(clientPickerDoc),
  handler: async (ctx, args) => {
    await requireAdminSession(args.sessionToken);
    const companies = await ctx.db
      .query("companies")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .take(500);
    return companies
      .filter((c) => c.listedAsClient !== false)
      .map((c) => ({
        _id: c._id,
        name: c.name,
        email: c.email,
        cui: c.cui,
        regCom: c.regCom,
        address: c.address,
        phone: c.phone,
        vatMode: c.vatMode,
        invoiceDescription: c.invoiceDescription,
        hasMonthlyBilling:
          typeof c.monthlyAmount === "number" && c.monthlyAmount > 0,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "ro"));
  },
});

export const get = query({
  args: { sessionToken: v.string(), id: v.id("companies") },
  returns: v.union(companyDoc, v.null()),
  handler: async (ctx, args) => {
    await requireAdminSession(args.sessionToken);
    return await ctx.db.get(args.id);
  },
});

export const getInternal = internalQuery({
  args: { id: v.id("companies") },
  returns: v.union(companyDoc, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const listActiveInternal = internalQuery({
  args: {},
  returns: v.array(companyDoc),
  handler: async (ctx) => {
    return await ctx.db
      .query("companies")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .take(500);
  },
});

export const create = mutation({
  args: {
    sessionToken: v.string(),
    name: v.string(),
    email: v.string(),
    cui: v.optional(v.string()),
    regCom: v.optional(v.string()),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
    monthlyAmount: v.optional(v.number()),
    vatMode: vatModeArg,
    invoiceDescription: v.optional(v.string()),
    listedAsClient: v.optional(v.boolean()),
    status: v.optional(v.union(v.literal("active"), v.literal("suspended"))),
  },
  returns: v.id("companies"),
  handler: async (ctx, args) => {
    await requireAdminSession(args.sessionToken);
    const { sessionToken: _, ...rest } = args;
    return await ctx.db.insert("companies", {
      name: rest.name,
      email: rest.email,
      cui: rest.cui,
      regCom: rest.regCom,
      address: rest.address,
      phone: rest.phone,
      notes: rest.notes,
      monthlyAmount: rest.monthlyAmount,
      vatMode: rest.vatMode ?? "excluded",
      invoiceDescription: rest.invoiceDescription,
      listedAsClient: rest.listedAsClient ?? true,
      status: rest.status ?? "active",
      createdAt: Date.now(),
    });
  },
});

/** Create company from one-off invoice flow (internal). No monthly amount. */
export const createForOneOffInternal = internalMutation({
  args: {
    name: v.string(),
    email: v.string(),
    cui: v.optional(v.string()),
    regCom: v.optional(v.string()),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    vatMode: vatModeArg,
    invoiceDescription: v.optional(v.string()),
    listedAsClient: v.boolean(),
  },
  returns: v.id("companies"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("companies", {
      name: args.name.trim(),
      email: args.email.trim(),
      cui: args.cui?.trim() || undefined,
      regCom: args.regCom?.trim() || undefined,
      address: args.address?.trim() || undefined,
      phone: args.phone?.trim() || undefined,
      vatMode: args.vatMode ?? "excluded",
      invoiceDescription: args.invoiceDescription?.trim() || undefined,
      listedAsClient: args.listedAsClient,
      status: "active",
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    sessionToken: v.string(),
    id: v.id("companies"),
    name: v.string(),
    email: v.string(),
    cui: v.optional(v.string()),
    regCom: v.optional(v.string()),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
    monthlyAmount: v.optional(v.number()),
    vatMode: vatModeArg,
    invoiceDescription: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("suspended")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdminSession(args.sessionToken);
    const { sessionToken: _, id, ...rest } = args;
    await ctx.db.patch(id, rest);
    return null;
  },
});

export const remove = mutation({
  args: { sessionToken: v.string(), id: v.id("companies") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdminSession(args.sessionToken);
    await ctx.db.delete(args.id);
    return null;
  },
});
