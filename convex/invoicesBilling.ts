"use node";

import { v } from "convex/values";
import { internalAction, action } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { VAT_RATE, computeVatAmounts, type VatMode } from "./lib/vat";
import { requireAdminSession } from "./lib/adminGate";

function periodKeyFromDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/** Next calendar month as YYYY-MM. */
function nextPeriodKeyFromDate(d: Date) {
  return periodKeyFromDate(new Date(d.getFullYear(), d.getMonth() + 1, 1));
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

/** Admin may only issue for the current or next calendar month. */
function assertAllowedBillingPeriod(periodKey: string) {
  const now = new Date();
  const allowed = new Set([
    periodKeyFromDate(now),
    nextPeriodKeyFromDate(now),
  ]);
  if (!allowed.has(periodKey)) {
    throw new Error(
      "Poți genera doar pentru luna curentă sau luna următoare",
    );
  }
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

/**
 * Creates one monthly invoice per (company, periodKey).
 * Early generation for next month is safe: runMonthlyBilling on the 1st
 * finds the existing row by company+period and skips creating a duplicate.
 */
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

    const existing: {
      _id: Id<"invoices">;
      pdfStorageId?: Id<"_storage">;
    } | null = await ctx.runQuery(internal.invoices.findByCompanyPeriod, {
      companyId: args.companyId,
      periodKey: key,
    });
    if (existing) {
      // Already billed for this period (e.g. early next-month invoice) —
      // do not create another. Retry PDF/email only if the previous run
      // created the row but failed mid-send.
      if (!existing.pdfStorageId) {
        try {
          await ctx.runAction(internal.invoicesActions.generateAndSend, {
            invoiceId: existing._id,
          });
        } catch (error) {
          console.error(
            `Retry generateAndSend failed for ${existing._id}:`,
            error,
          );
        }
      }
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

/**
 * Generate invoice for a company using its monthlyAmount (no subscription required).
 * Pass next month's periodKey to bill early; automatic billing on the 1st will
 * skip that company for that period, then resume the month after.
 */
export const generateForCompany = action({
  args: {
    sessionToken: v.string(),
    companyId: v.id("companies"),
    periodKey: v.optional(v.string()),
  },
  returns: v.union(v.id("invoices"), v.null()),
  handler: async (ctx, args): Promise<Id<"invoices"> | null> => {
    await requireAdminSession(args.sessionToken);
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

    const periodKey = args.periodKey ?? periodKeyFromDate(new Date());
    assertAllowedBillingPeriod(periodKey);

    return await ctx.runAction(
      internal.invoicesBilling.generateForSubscription,
      {
        companyId: args.companyId,
        planName: "Mentenanță",
        priceNet: company.monthlyAmount,
        periodKey,
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
      try {
        // Skip companies already invoiced for this period (e.g. billed early
        // last month for this month). generateForSubscription is also
        // idempotent; this keeps the generated count accurate.
        const existing = await ctx.runQuery(
          internal.invoices.findByCompanyPeriod,
          { companyId: company._id, periodKey: key },
        );
        if (existing?.pdfStorageId) {
          billed.add(company._id);
          continue;
        }

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
      } catch (error) {
        console.error(
          `Monthly billing failed for company ${company._id}:`,
          error,
        );
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
      try {
        const existing = await ctx.runQuery(
          internal.invoices.findByCompanyPeriod,
          { companyId: item.company._id, periodKey: key },
        );
        if (existing?.pdfStorageId) {
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
      } catch (error) {
        console.error(
          `Monthly billing failed for subscription ${item.subscription._id}:`,
          error,
        );
      }
    }
    return { generated };
  },
});

export const generateManual = action({
  args: {
    sessionToken: v.string(),
    subscriptionId: v.id("subscriptions"),
  },
  returns: v.union(v.id("invoices"), v.null()),
  handler: async (ctx, args): Promise<Id<"invoices"> | null> => {
    await requireAdminSession(args.sessionToken);
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

const oneOffClientArg = v.object({
  name: v.string(),
  email: v.string(),
  cui: v.optional(v.string()),
  regCom: v.optional(v.string()),
  address: v.optional(v.string()),
  phone: v.optional(v.string()),
});

/**
 * One-off invoice: existing client or new firm details.
 * Does not use monthly billing / period uniqueness.
 * Optional saveClient stores the new firm without monthlyAmount.
 */
export const generateOneOff = action({
  args: {
    sessionToken: v.string(),
    companyId: v.optional(v.id("companies")),
    client: v.optional(oneOffClientArg),
    saveClient: v.optional(v.boolean()),
    amount: v.number(),
    vatMode: v.union(v.literal("excluded"), v.literal("included")),
    description: v.string(),
  },
  returns: v.id("invoices"),
  handler: async (ctx, args): Promise<Id<"invoices">> => {
    await requireAdminSession(args.sessionToken);

    if (!Number.isFinite(args.amount) || args.amount <= 0) {
      throw new Error("Sumă invalidă");
    }
    const description = args.description.trim();
    if (!description) {
      throw new Error("Adaugă descrierea serviciului");
    }

    let companyId = args.companyId;
    if (companyId) {
      const company = await ctx.runQuery(internal.companies.getInternal, {
        id: companyId,
      });
      if (!company) throw new Error("Clientul nu a fost găsit");
      if (company.status !== "active") {
        throw new Error("Clientul este suspendat");
      }
    } else if (args.client) {
      const name = args.client.name.trim();
      const email = args.client.email.trim();
      if (!name) throw new Error("Numele firmei este obligatoriu");
      if (!email || !email.includes("@")) {
        throw new Error("Email invalid");
      }
      companyId = await ctx.runMutation(
        internal.companies.createForOneOffInternal,
        {
          name,
          email,
          cui: args.client.cui,
          regCom: args.client.regCom,
          address: args.client.address,
          phone: args.client.phone,
          vatMode: args.vatMode,
          invoiceDescription: description,
          listedAsClient: args.saveClient === true,
        },
      );
    } else {
      throw new Error("Selectează un client sau completează datele firmei");
    }

    const now = new Date();
    const baseKey = periodKeyFromDate(now);
    // Unique key so one-offs never collide with monthly invoices
    const periodKey = `${baseKey}-o-${Date.now().toString(36)}`;
    const issuedAt = Date.now();
    const dueAt = issuedAt + 14 * 24 * 60 * 60 * 1000;
    const periodLabel = `Factură unică · ${now.toLocaleDateString("ro-RO")}`;

    const amounts = computeVatAmounts(args.amount, args.vatMode);

    const issuer: { invoiceSeries?: string } = await ctx.runQuery(
      internal.settings.getIssuerInternal,
      {},
    );
    const series: string = issuer.invoiceSeries ?? "ZB";
    const year = now.getFullYear();
    const number: string = await ctx.runMutation(
      internal.invoices.allocateNumber,
      { year, series },
    );

    const invoiceId: Id<"invoices"> = await ctx.runMutation(
      internal.invoices.createRecord,
      {
        companyId,
        number,
        series,
        periodKey,
        periodLabel,
        issuedAt,
        dueAt,
        netAmount: amounts.net,
        vatAmount: amounts.vat,
        grossAmount: amounts.gross,
        lines: [
          {
            description,
            quantity: 1,
            unitNet: amounts.net,
            vatRate: VAT_RATE,
          },
        ],
      },
    );

    await ctx.runAction(internal.invoicesActions.generateAndSend, {
      invoiceId,
    });

    return invoiceId;
  },
});
