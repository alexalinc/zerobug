import { v } from "convex/values";
import { mutation, query, internalQuery } from "./_generated/server";

const issuerDefaults = {
  key: "issuer" as const,
  companyName: "SC AXP GLOBAL RETAIL SRL",
  cui: "RO48715417",
  regCom: "J2023001304021",
  address: "Str. Principala nr. 1290",
  phone: "0773319554",
  email: "contact@zerobug.ro",
  bank: "TRANSILVANIA",
  iban: "RO21BTRLRONCRT0CN2566601",
  invoiceSeries: "ZB",
  invoiceNextNumber: 1,
  brandName: "ZeroBug",
  accountingEmail: "exactexpert@yahoo.com",
  githubRepoUrl: "https://github.com/alexalinc/zerobug",
  vercelDashboardUrl: "",
};

const issuerReturn = v.object({
  _id: v.optional(v.id("settings")),
  companyName: v.string(),
  cui: v.string(),
  regCom: v.string(),
  address: v.string(),
  phone: v.string(),
  email: v.string(),
  bank: v.string(),
  iban: v.string(),
  invoiceSeries: v.string(),
  invoiceNextNumber: v.number(),
  brandName: v.string(),
  accountingEmail: v.optional(v.string()),
  githubRepoUrl: v.optional(v.string()),
  vercelDashboardUrl: v.optional(v.string()),
});

export const getIssuer = query({
  args: { year: v.optional(v.number()) },
  returns: issuerReturn,
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "issuer"))
      .unique();

    // Prefer counter when year is provided by the client
    let nextFromCounter: number | undefined;
    if (typeof args.year === "number") {
      const fromCounter = await ctx.db
        .query("invoiceCounters")
        .withIndex("by_year", (q) => q.eq("year", args.year!))
        .unique();
      if (fromCounter) nextFromCounter = fromCounter.lastNumber + 1;
    }

    if (!existing) {
      return {
        companyName: issuerDefaults.companyName,
        cui: issuerDefaults.cui,
        regCom: issuerDefaults.regCom,
        address: issuerDefaults.address,
        phone: issuerDefaults.phone,
        email: issuerDefaults.email,
        bank: issuerDefaults.bank,
        iban: issuerDefaults.iban,
        invoiceSeries: issuerDefaults.invoiceSeries,
        invoiceNextNumber:
          nextFromCounter ?? issuerDefaults.invoiceNextNumber,
        brandName: issuerDefaults.brandName,
        accountingEmail: issuerDefaults.accountingEmail,
        githubRepoUrl: issuerDefaults.githubRepoUrl,
        vercelDashboardUrl: issuerDefaults.vercelDashboardUrl,
        _id: undefined,
      };
    }

    return {
      _id: existing._id,
      companyName: existing.companyName,
      cui: existing.cui,
      regCom: existing.regCom,
      address: existing.address,
      phone: existing.phone,
      email: existing.email,
      bank: existing.bank,
      iban: existing.iban,
      invoiceSeries: existing.invoiceSeries,
      invoiceNextNumber:
        nextFromCounter ??
        existing.invoiceNextNumber ??
        issuerDefaults.invoiceNextNumber,
      brandName: existing.brandName,
      accountingEmail:
        existing.accountingEmail ?? issuerDefaults.accountingEmail,
      githubRepoUrl: existing.githubRepoUrl,
      vercelDashboardUrl: existing.vercelDashboardUrl,
    };
  },
});

export const upsertIssuer = mutation({
  args: {
    companyName: v.string(),
    cui: v.string(),
    regCom: v.string(),
    address: v.string(),
    phone: v.string(),
    email: v.string(),
    bank: v.string(),
    iban: v.string(),
    invoiceSeries: v.string(),
    invoiceNextNumber: v.number(),
    brandName: v.string(),
    accountingEmail: v.optional(v.string()),
    githubRepoUrl: v.optional(v.string()),
    vercelDashboardUrl: v.optional(v.string()),
    /** Year whose invoice counter is updated */
    year: v.number(),
  },
  returns: v.id("settings"),
  handler: async (ctx, args) => {
    const next = Math.max(1, Math.floor(args.invoiceNextNumber));
    const year = args.year;

    const payload = {
      companyName: args.companyName,
      cui: args.cui,
      regCom: args.regCom,
      address: args.address,
      phone: args.phone,
      email: args.email,
      bank: args.bank,
      iban: args.iban,
      invoiceSeries: args.invoiceSeries.trim().toUpperCase() || "ZB",
      invoiceNextNumber: next,
      brandName: args.brandName,
      accountingEmail: args.accountingEmail,
      githubRepoUrl: args.githubRepoUrl,
      vercelDashboardUrl: args.vercelDashboardUrl,
    };

    const existing = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "issuer"))
      .unique();

    let settingsId;
    if (existing) {
      await ctx.db.patch(existing._id, payload);
      settingsId = existing._id;
    } else {
      settingsId = await ctx.db.insert("settings", {
        key: "issuer",
        ...payload,
      });
    }

    // Sync counter so next allocateNumber starts at `next`
    const lastNumber = next - 1;
    const counter = await ctx.db
      .query("invoiceCounters")
      .withIndex("by_year", (q) => q.eq("year", year))
      .unique();
    if (counter) {
      await ctx.db.patch(counter._id, { lastNumber });
    } else {
      await ctx.db.insert("invoiceCounters", { year, lastNumber });
    }

    return settingsId;
  },
});

export const seedDefaults = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "issuer"))
      .unique();
    if (!existing) {
      await ctx.db.insert("settings", issuerDefaults);
    } else {
      const patch: {
        accountingEmail?: string;
        invoiceNextNumber?: number;
      } = {};
      if (!existing.accountingEmail) {
        patch.accountingEmail = issuerDefaults.accountingEmail;
      }
      if (existing.invoiceNextNumber == null) {
        patch.invoiceNextNumber = issuerDefaults.invoiceNextNumber;
      }
      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(existing._id, patch);
      }
    }

    const plans = [
      {
        planKey: "starter",
        name: "Starter",
        priceNet: 19.99,
        sites: 1,
        description: "Mentenanță esențială pentru un site simplu.",
        features: [
          "1 website",
          "Update-uri lunare de securitate",
          "Backup săptămânal",
          "Monitorizare uptime",
          "Support pe email (48h)",
        ],
        active: true,
      },
      {
        planKey: "pro",
        name: "Pro",
        priceNet: 49.99,
        sites: 1,
        description: "Pentru site-uri active sau magazine mici.",
        features: [
          "1 website (complexitate medie)",
          "Update-uri + patch-uri de securitate",
          "Backup zilnic",
          "Monitorizare uptime + alertă",
          "Optimizări minore de performanță",
          "Support prioritar (24h)",
        ],
        active: true,
      },
      {
        planKey: "business",
        name: "Business",
        priceNet: 99.99,
        sites: 3,
        description: "Pentru magazine și platforme cu trafic real.",
        features: [
          "Până la 3 website-uri",
          "Securitate avansată + malware cleanup",
          "Backup zilnic offsite",
          "SLA 4h pe incidente critice",
          "Raport lunar de sănătate",
          "Hotfix-uri minore incluse (2h/lună)",
        ],
        active: true,
      },
    ];

    for (const plan of plans) {
      const found = await ctx.db
        .query("maintenancePlans")
        .withIndex("by_plan_key", (q) => q.eq("planKey", plan.planKey))
        .unique();
      if (!found) {
        await ctx.db.insert("maintenancePlans", plan);
      }
    }
    return null;
  },
});

export const getIssuerInternal = internalQuery({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "issuer"))
      .unique();
    if (!existing) return issuerDefaults;
    return {
      ...existing,
      accountingEmail:
        existing.accountingEmail ?? issuerDefaults.accountingEmail,
      invoiceNextNumber:
        existing.invoiceNextNumber ?? issuerDefaults.invoiceNextNumber,
    };
  },
});
