"use node";

import { v } from "convex/values";
import { internalAction, action } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

const VAT_RATE = 0.21;

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

type BillingItem = {
  subscription: { _id: Id<"subscriptions"> };
  company: { _id: Id<"companies"> };
  plan: { name: string; priceNet: number };
};

export const generateForSubscription = internalAction({
  args: {
    companyId: v.id("companies"),
    subscriptionId: v.id("subscriptions"),
    planName: v.string(),
    priceNet: v.number(),
    periodKey: v.optional(v.string()),
    stripeInvoiceId: v.optional(v.string()),
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

    const net = args.priceNet;
    const vat = Math.round(net * VAT_RATE * 100) / 100;
    const gross = Math.round((net + vat) * 100) / 100;
    const periodLabel = periodLabelFromKey(key);
    const issuedAt = Date.now();
    const dueAt = issuedAt + 14 * 24 * 60 * 60 * 1000;

    const lines = [
      {
        description: `Mentenanță ZeroBug — ${args.planName} (${periodLabel})`,
        quantity: 1,
        unitNet: net,
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
        netAmount: net,
        vatAmount: vat,
        grossAmount: gross,
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

export const runMonthlyBilling = internalAction({
  args: {},
  returns: v.object({ generated: v.number() }),
  handler: async (ctx): Promise<{ generated: number }> => {
    const items: BillingItem[] = await ctx.runQuery(
      internal.subscriptions.getActiveForBilling,
      {},
    );
    const key = periodKeyFromDate(new Date());
    let generated = 0;
    for (const item of items) {
      const id = await ctx.runAction(
        internal.invoicesBilling.generateForSubscription,
        {
          companyId: item.company._id,
          subscriptionId: item.subscription._id,
          planName: item.plan.name,
          priceNet: item.plan.priceNet,
          periodKey: key,
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
    return await ctx.runAction(
      internal.invoicesBilling.generateForSubscription,
      {
        companyId: item.company._id,
        subscriptionId: item.subscription._id,
        planName: item.plan.name,
        priceNet: item.plan.priceNet,
      },
    );
  },
});
