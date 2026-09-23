"use node";

import { v } from "convex/values";
import { internalAction, action } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { VAT_RATE, computeVatAmounts, type VatMode } from "./lib/vat";

function periodKeyFromDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function periodLabelFromKey(key: string) {
  const [y, m] = key.split("-");
  const months = [
    "Ianuarie",
    "Februarie",
    "Martie",
    "Aprilie",
    "Mai",
    "Iunie",
    "Iulie",
    "August",
    "Septembrie",
    "Octombrie",
    "Noiembrie",
    "Decembrie",
  ];
  return `${months[Number(m) - 1]} ${y}`;
}

type BillingCompany = {
  _id: Id<"companies">;
  name: string;
  monthlyAmount?: number;
  vatMode?: VatMode;
  invoiceDescription?: string;
};

type BillingItem = {
  subscription: { _id: Id<"subscriptions"> };
  company: BillingCompany;
  plan: { name: string; priceNet: number };
};

function resolveBillingAmounts(item: BillingItem) {
  if (
    typeof item.company.monthlyAmount === "number" &&
    item.company.monthlyAmount > 0
  ) {
    const mode: VatMode = item.company.vatMode ?? "excluded";
    return {
      ...computeVatAmounts(item.company.monthlyAmount, mode),
      mode,
      planLabel: item.plan.name,
    };
  }
  return {
    ...computeVatAmounts(item.plan.priceNet, "excluded"),
    mode: "excluded" as VatMode,
    planLabel: item.plan.name,
  };
}

export const generateForSubscription = internalAction({
  args: {
    companyId: v.id("companies"),
    subscriptionId: v.optional(v.id("subscriptions")),
    planName: v.string(),
    priceNet: v.number(),
    periodKey: v.optional(v.string()),
    stripeInvoiceId: v.optional(v.string()),
    /** When set, overrides plan pricing with company billing fields */
    monthlyAmount: v.optional(v.number()),
    vatMode: v.optional(
      v.union(v.literal("excluded"), v.literal("included")),
    ),
    invoiceDescription: v.optional(v.string()),
  },
  returns: v.union(v.id("invoices"), v.null()),
  handler: async (ctx, args): Promise<Id<"invoices"> | null> => {
    const now = new Date();
    const key = args.periodKey ?? periodKeyFromDate(now);

    const existing: { _id: Id<"invoices"> } | null = await ctx.runQuery(
      internal.invoices.findByCompanyPeriod,
      {
        companyId: args.companyId,
        periodKey: key,
      },
    );
    if (existing) {
      return existing._id;
    }

    const issuer: { invoiceSeries?: string } = await ctx.runQuery(
      internal.settings.getIssuerInternal,
      {},
    );
    const series: string = issuer.invoiceSeries ?? "ZB";
    const year = Number(key.split("-")[0]);
    const number: string = await ctx.runMutation(
      internal.invoices.allocateNumber,
      {
        year,
        series,
      },
    );

    const amounts =
      typeof args.monthlyAmount === "number" && args.monthlyAmount > 0
        ? computeVatAmounts(
            args.monthlyAmount,
            args.vatMode ?? "excluded",
          )
        : computeVatAmounts(args.priceNet, "excluded");

    const periodLabel = periodLabelFromKey(key);
    const issuedAt = Date.now();
    const dueAt = issuedAt + 14 * 24 * 60 * 60 * 1000;

    const description =
      args.invoiceDescription?.trim()
        ? `${args.invoiceDescription.trim()} (${periodLabel})`
        : `Prestare servicii mentenanță ZeroBug — ${args.planName} (${periodLabel})`;

    const lines = [
      {
        description,
        quantity: 1,
        unitNet: amounts.net,
        vatRate: VAT_RATE,
      },
    ];

    const invoiceId: Id<"invoices"> = await ctx.runMutation(
      internal.invoices.createRecord,
      {
        companyId: args.companyId,
        subscriptionId: args.subscriptionId,
        number,
        series,
        periodKey: key,
        periodLabel,
        issuedAt,
        dueAt,
        netAmount: amounts.net,
        vatAmount: amounts.vat,
        grossAmount: amounts.gross,
        lines,
        stripeInvoiceId: args.stripeInvoiceId,
      },
    );

    await ctx.runAction(internal.invoicesActions.generateAndSend, {
      invoiceId,
    });

    return invoiceId;
  },
});

/** Generate invoice for a company using its monthlyAmount (no subscription required). */
export const generateForCompany = action({
  args: {
    companyId: v.id("companies"),
    periodKey: v.optional(v.string()),
  },
  returns: v.union(v.id("invoices"), v.null()),
  handler: async (ctx, args): Promise<Id<"invoices"> | null> => {
    const company = await ctx.runQuery(internal.companies.getInternal, {
      id: args.companyId,
    });
    if (!company) throw new Error("Firma nu a fost găsită");
    if (company.status !== "active") {
      throw new Error("Firma este suspendată");
    }
    if (!company.monthlyAmount || company.monthlyAmount <= 0) {
      throw new Error("Setează suma lunară pe firmă înainte de generare");
    }

    return await ctx.runAction(
      internal.invoicesBilling.generateForSubscription,
      {
        companyId: args.companyId,
        planName: "Mentenanță",
        priceNet: company.monthlyAmount,
        periodKey: args.periodKey,
        monthlyAmount: company.monthlyAmount,
        vatMode: company.vatMode ?? "excluded",
        invoiceDescription:
          company.invoiceDescription?.trim() ||
          "Prestare servicii conform contract",
      },
    );
  },
});

export const runMonthlyBilling = internalAction({
  args: {},
  returns: v.object({ generated: v.number() }),
  handler: async (ctx): Promise<{ generated: number }> => {
    const key = periodKeyFromDate(new Date());
    let generated = 0;

    // 1) Companies with explicit monthly amount (primary billing path)
    const companies: Array<{
      _id: Id<"companies">;
      status: string;
      monthlyAmount?: number;
      vatMode?: VatMode;
      invoiceDescription?: string;
    }> = await ctx.runQuery(internal.companies.listActiveInternal, {});

    const billed = new Set<string>();
    for (const company of companies) {
      if (!company.monthlyAmount || company.monthlyAmount <= 0) continue;
      const id = await ctx.runAction(
        internal.invoicesBilling.generateForSubscription,
        {
          companyId: company._id,
          planName: "Mentenanță",
          priceNet: company.monthlyAmount,
          periodKey: key,
          monthlyAmount: company.monthlyAmount,
          vatMode: company.vatMode ?? "excluded",
          invoiceDescription:
            company.invoiceDescription?.trim() ||
            "Prestare servicii conform contract",
        },
      );
      if (id) {
        generated += 1;
        billed.add(company._id);
      }
    }

    // 2) Subscriptions without company monthlyAmount (plan price fallback)
    const items: BillingItem[] = await ctx.runQuery(
      internal.subscriptions.getActiveForBilling,
      {},
    );
    for (const item of items) {
      if (billed.has(item.company._id)) continue;
      if (
        typeof item.company.monthlyAmount === "number" &&
        item.company.monthlyAmount > 0
      ) {
        continue;
      }
      const amounts = resolveBillingAmounts(item);
      const id = await ctx.runAction(
        internal.invoicesBilling.generateForSubscription,
        {
          companyId: item.company._id,
          subscriptionId: item.subscription._id,
          planName: item.plan.name,
          priceNet: amounts.net,
          periodKey: key,
          invoiceDescription:
            item.company.invoiceDescription?.trim() ||
            `Prestare servicii mentenanță ZeroBug — ${item.plan.name}`,
        },
      );
      if (id) generated += 1;
    }
    return { generated };
  },
});

export const generateManual = action({
  args: {
    subscriptionId: v.id("subscriptions"),
  },
  returns: v.union(v.id("invoices"), v.null()),
  handler: async (ctx, args): Promise<Id<"invoices"> | null> => {
    const items: BillingItem[] = await ctx.runQuery(
      internal.subscriptions.getActiveForBilling,
      {},
    );
    const item = items.find((i) => i.subscription._id === args.subscriptionId);
    if (!item) throw new Error("Subscription not found or inactive");
    const amounts = resolveBillingAmounts(item);
    const key = periodKeyFromDate(new Date());
    return await ctx.runAction(
      internal.invoicesBilling.generateForSubscription,
      {
        companyId: item.company._id,
        subscriptionId: item.subscription._id,
        planName: item.plan.name,
        priceNet: amounts.net,
        monthlyAmount: item.company.monthlyAmount,
        vatMode: item.company.vatMode,
        invoiceDescription:
          item.company.invoiceDescription?.trim() ||
          `Prestare servicii mentenanță ZeroBug — ${item.plan.name}`,
        periodKey: key,
      },
    );
  },
});
