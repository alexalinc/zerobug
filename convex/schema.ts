import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  companies: defineTable({
    name: v.string(),
    cui: v.optional(v.string()),
    regCom: v.optional(v.string()),
    address: v.optional(v.string()),
    email: v.string(),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
    /** Monthly billing amount entered by admin */
    monthlyAmount: v.optional(v.number()),
    /** excluded = amount is net (+TVA); included = amount is gross (extract TVA) */
    vatMode: v.optional(
      v.union(v.literal("excluded"), v.literal("included")),
    ),
    /** Line text printed on every invoice for this company */
    invoiceDescription: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("suspended")),
    stripeCustomerId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"])
    .index("by_stripe_customer", ["stripeCustomerId"]),

  maintenancePlans: defineTable({
    planKey: v.string(),
    name: v.string(),
    priceNet: v.number(),
    sites: v.number(),
    description: v.string(),
    features: v.array(v.string()),
    stripePriceId: v.optional(v.string()),
    active: v.boolean(),
  })
    .index("by_plan_key", ["planKey"])
    .index("by_active", ["active"]),

  subscriptions: defineTable({
    companyId: v.id("companies"),
    planId: v.id("maintenancePlans"),
    status: v.union(
      v.literal("active"),
      v.literal("past_due"),
      v.literal("canceled"),
      v.literal("trialing"),
      v.literal("manual"),
    ),
    stripeSubscriptionId: v.optional(v.string()),
    billingMode: v.union(v.literal("stripe"), v.literal("manual")),
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_company", ["companyId"])
    .index("by_status", ["status"])
    .index("by_stripe_subscription", ["stripeSubscriptionId"]),

  invoices: defineTable({
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
    currency: v.string(),
    lines: v.array(
      v.object({
        description: v.string(),
        quantity: v.number(),
        unitNet: v.number(),
        vatRate: v.number(),
      }),
    ),
    pdfStorageId: v.optional(v.id("_storage")),
    emailStatus: v.union(
      v.literal("pending"),
      v.literal("sent"),
      v.literal("failed"),
    ),
    emailError: v.optional(v.string()),
    stripeInvoiceId: v.optional(v.string()),
    status: v.union(
      v.literal("draft"),
      v.literal("issued"),
      v.literal("sent"),
      v.literal("void"),
    ),
  })
    .index("by_company", ["companyId"])
    .index("by_period", ["periodKey"])
    .index("by_number", ["number"])
    .index("by_company_period", ["companyId", "periodKey"])
    .index("by_stripe_invoice", ["stripeInvoiceId"]),

  invoiceCounters: defineTable({
    year: v.number(),
    lastNumber: v.number(),
  }).index("by_year", ["year"]),

  leads: defineTable({
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
    status: v.union(
      v.literal("new"),
      v.literal("contacted"),
      v.literal("won"),
      v.literal("lost"),
    ),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_type", ["type"])
    .index("by_created", ["createdAt"]),

  settings: defineTable({
    key: v.literal("issuer"),
    companyName: v.string(),
    cui: v.string(),
    regCom: v.string(),
    address: v.string(),
    phone: v.string(),
    email: v.string(),
    bank: v.string(),
    iban: v.string(),
    invoiceSeries: v.string(),
    brandName: v.string(),
    /** Receives a BCC copy of every invoice email (monthly + manual) */
    accountingEmail: v.optional(v.string()),
    githubRepoUrl: v.optional(v.string()),
    vercelDashboardUrl: v.optional(v.string()),
  }).index("by_key", ["key"]),
});
