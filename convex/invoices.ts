import { v } from "convex/values";
import {
  mutation,
  query,
  internalMutation,
  internalQuery,
  action,
} from "./_generated/server";
import { internal } from "./_generated/api";

export const list = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const invoices = await ctx.db.query("invoices").order("desc").take(200);
    const result = [];
    for (const inv of invoices) {
      const company = await ctx.db.get(inv.companyId);
      result.push({ ...inv, company });
    }
    return result;
  },
});

export const get = query({
  args: { id: v.id("invoices") },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, args) => {
    const inv = await ctx.db.get(args.id);
    if (!inv) return null;
    const company = await ctx.db.get(inv.companyId);
    return { ...inv, company };
  },
});

export const getPdfUrl = query({
  args: { id: v.id("invoices") },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    const inv = await ctx.db.get(args.id);
    if (!inv?.pdfStorageId) return null;
    return await ctx.storage.getUrl(inv.pdfStorageId);
  },
});

export const allocateNumber = internalMutation({
  args: { year: v.number(), series: v.string() },
  returns: v.string(),
  handler: async (ctx, args) => {
    const counter = await ctx.db
      .query("invoiceCounters")
      .withIndex("by_year", (q) => q.eq("year", args.year))
      .unique();
    let next = 1;
    if (counter) {
      next = counter.lastNumber + 1;
      await ctx.db.patch(counter._id, { lastNumber: next });
    } else {
      await ctx.db.insert("invoiceCounters", {
        year: args.year,
        lastNumber: next,
      });
    }
    return `${args.series}-${args.year}-${String(next).padStart(4, "0")}`;
  },
});

export const findByCompanyPeriod = internalQuery({
  args: {
    companyId: v.id("companies"),
    periodKey: v.string(),
  },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("invoices")
      .withIndex("by_company_period", (q) =>
        q.eq("companyId", args.companyId).eq("periodKey", args.periodKey),
      )
      .unique();
  },
});

export const createRecord = internalMutation({
  args: {
    companyId: v.id("companies"),
    subscriptionId: v.optional(v.id("subscriptions")),
    number: v.string(),
    series: v.string(),
    periodKey: v.string(),
    periodLabel: v.string(),
    issuedAt: v.number(),
    dueAt: v.number(),
    netAmount: v.number(),
    vatAmount: v.number(),
    grossAmount: v.number(),
    lines: v.array(
      v.object({
        description: v.string(),
        quantity: v.number(),
        unitNet: v.number(),
        vatRate: v.number(),
      }),
    ),
    stripeInvoiceId: v.optional(v.string()),
  },
  returns: v.id("invoices"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("invoices", {
      ...args,
      currency: "EUR",
      emailStatus: "pending",
      status: "issued",
    });
  },
});

export const attachPdf = internalMutation({
  args: {
    invoiceId: v.id("invoices"),
    pdfStorageId: v.id("_storage"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.invoiceId, { pdfStorageId: args.pdfStorageId });
    return null;
  },
});

export const markEmail = internalMutation({
  args: {
    invoiceId: v.id("invoices"),
    emailStatus: v.union(
      v.literal("pending"),
      v.literal("sent"),
      v.literal("failed"),
    ),
    emailError: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.invoiceId, {
      emailStatus: args.emailStatus,
      emailError: args.emailError,
      status: args.emailStatus === "sent" ? "sent" : "issued",
    });
    return null;
  },
});

export const getInternal = internalQuery({
  args: { id: v.id("invoices") },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, args) => {
    const inv = await ctx.db.get(args.id);
    if (!inv) return null;
    const company = await ctx.db.get(inv.companyId);
    return { ...inv, company };
  },
});

export const resendEmail = action({
  args: { invoiceId: v.id("invoices") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.runAction(internal.invoicesActions.sendEmailOnly, {
      invoiceId: args.invoiceId,
    });
    return null;
  },
});

export const overviewStats = query({
  args: {},
  returns: v.object({
    companies: v.number(),
    activeSubscriptions: v.number(),
    invoices: v.number(),
    newLeads: v.number(),
  }),
  handler: async (ctx) => {
    const companies = await ctx.db.query("companies").take(500);
    const subs = await ctx.db.query("subscriptions").take(500);
    const invoices = await ctx.db.query("invoices").take(500);
    const leads = await ctx.db
      .query("leads")
      .withIndex("by_status", (q) => q.eq("status", "new"))
      .take(500);
    return {
      companies: companies.length,
      activeSubscriptions: subs.filter(
        (s) => s.status === "active" || s.status === "manual",
      ).length,
      invoices: invoices.length,
      newLeads: leads.length,
    };
  },
});
