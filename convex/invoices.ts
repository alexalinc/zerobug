import { v } from "convex/values";
import {
  mutation,
  query,
  internalMutation,
  internalQuery,
  action,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { computeVatAmounts } from "./lib/vat";

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
    // Also bump settings.invoiceNextNumber so Setări stays in sync
    const issuer = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "issuer"))
      .unique();
    if (issuer) {
      await ctx.db.patch(issuer._id, { invoiceNextNumber: next + 1 });
    }

    // Format: SERIE + padded seq → e.g. DEV0010
    return `${args.series}${String(next).padStart(4, "0")}`;
  },
});

/** Preview next number without allocating (client passes year). */
export const peekNextNumber = query({
  args: { year: v.number() },
  returns: v.object({
    series: v.string(),
    year: v.number(),
    nextSeq: v.number(),
    formatted: v.string(),
  }),
  handler: async (ctx, args) => {
    const issuer = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "issuer"))
      .unique();
    const series = issuer?.invoiceSeries ?? "ZB";
    const counter = await ctx.db
      .query("invoiceCounters")
      .withIndex("by_year", (q) => q.eq("year", args.year))
      .unique();
    const nextSeq = (counter?.lastNumber ?? 0) + 1;
    return {
      series,
      year: args.year,
      nextSeq,
      formatted: `${series}${String(nextSeq).padStart(4, "0")}`,
    };
  },
});

/** Companies ready for manual invoice generation this period. */
export const manualGenerationList = query({
  args: { periodKey: v.string() },
  returns: v.array(
    v.object({
      companyId: v.id("companies"),
      name: v.string(),
      email: v.string(),
      monthlyAmount: v.optional(v.number()),
      vatMode: v.optional(
        v.union(v.literal("excluded"), v.literal("included")),
      ),
      invoiceDescription: v.optional(v.string()),
      net: v.number(),
      vat: v.number(),
      gross: v.number(),
      alreadyGenerated: v.boolean(),
      existingInvoiceId: v.union(v.id("invoices"), v.null()),
    }),
  ),
  handler: async (ctx, args) => {
    const companies = await ctx.db
      .query("companies")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .take(200);

    const result = [];
    for (const c of companies) {
      if (!c.monthlyAmount || c.monthlyAmount <= 0) continue;
      const amounts = computeVatAmounts(
        c.monthlyAmount,
        c.vatMode ?? "excluded",
      );
      const existing = await ctx.db
        .query("invoices")
        .withIndex("by_company_period", (q) =>
          q.eq("companyId", c._id).eq("periodKey", args.periodKey),
        )
        .unique();
      result.push({
        companyId: c._id,
        name: c.name,
        email: c.email,
        monthlyAmount: c.monthlyAmount,
        vatMode: c.vatMode,
        invoiceDescription: c.invoiceDescription,
        net: amounts.net,
        vat: amounts.vat,
        gross: amounts.gross,
        alreadyGenerated: !!existing,
        existingInvoiceId: existing?._id ?? null,
      });
    }
    return result;
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
      currency: "RON",
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
    activeCompanies: v.number(),
    activeSubscriptions: v.number(),
    invoices: v.number(),
    newLeads: v.number(),
    totalNet: v.number(),
    totalVat: v.number(),
    totalGross: v.number(),
    monthlyRecurringGross: v.number(),
    monthlyRecurringNet: v.number(),
    monthlyRecurringVat: v.number(),
    byMonth: v.array(
      v.object({
        periodKey: v.string(),
        label: v.string(),
        net: v.number(),
        vat: v.number(),
        gross: v.number(),
        count: v.number(),
      }),
    ),
  }),
  handler: async (ctx) => {
    const companies = await ctx.db.query("companies").take(500);
    const subs = await ctx.db.query("subscriptions").take(500);
    const invoices = await ctx.db.query("invoices").take(500);
    const leads = await ctx.db
      .query("leads")
      .withIndex("by_status", (q) => q.eq("status", "new"))
      .take(500);

    const issued = invoices.filter((i) => i.status !== "void");
    const totalNet = issued.reduce((s, i) => s + i.netAmount, 0);
    const totalVat = issued.reduce((s, i) => s + i.vatAmount, 0);
    const totalGross = issued.reduce((s, i) => s + i.grossAmount, 0);

    // MRR from active companies with monthlyAmount
    let monthlyRecurringNet = 0;
    let monthlyRecurringVat = 0;
    let monthlyRecurringGross = 0;
    for (const c of companies) {
      if (c.status !== "active" || !c.monthlyAmount || c.monthlyAmount <= 0) {
        continue;
      }
      const amounts = computeVatAmounts(
        c.monthlyAmount,
        c.vatMode ?? "excluded",
      );
      monthlyRecurringGross += amounts.gross;
      monthlyRecurringNet += amounts.net;
      monthlyRecurringVat += amounts.vat;
    }

    const monthMap = new Map<
      string,
      { net: number; vat: number; gross: number; count: number }
    >();
    for (const inv of issued) {
      const cur = monthMap.get(inv.periodKey) ?? {
        net: 0,
        vat: 0,
        gross: 0,
        count: 0,
      };
      cur.net += inv.netAmount;
      cur.vat += inv.vatAmount;
      cur.gross += inv.grossAmount;
      cur.count += 1;
      monthMap.set(inv.periodKey, cur);
    }
    const byMonth = [...monthMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([periodKey, vals]) => {
        const [y, m] = periodKey.split("-");
        const months = [
          "Ian",
          "Feb",
          "Mar",
          "Apr",
          "Mai",
          "Iun",
          "Iul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        return {
          periodKey,
          label: `${months[Number(m) - 1]} ${y}`,
          ...vals,
        };
      });

    return {
      companies: companies.length,
      activeCompanies: companies.filter((c) => c.status === "active").length,
      activeSubscriptions: subs.filter(
        (s) => s.status === "active" || s.status === "manual",
      ).length,
      invoices: invoices.length,
      newLeads: leads.length,
      totalNet: Math.round(totalNet * 100) / 100,
      totalVat: Math.round(totalVat * 100) / 100,
      totalGross: Math.round(totalGross * 100) / 100,
      monthlyRecurringGross: Math.round(monthlyRecurringGross * 100) / 100,
      monthlyRecurringNet: Math.round(monthlyRecurringNet * 100) / 100,
      monthlyRecurringVat: Math.round(monthlyRecurringVat * 100) / 100,
      byMonth,
    };
  },
});
