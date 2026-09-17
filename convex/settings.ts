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
  brandName: "ZeroBug",
  githubRepoUrl: "https://github.com/zerobug-ro/zerobug",
  vercelDashboardUrl: "",
};

export const getIssuer = query({
  args: {},
  returns: v.object({
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
    brandName: v.string(),
    githubRepoUrl: v.optional(v.string()),
    vercelDashboardUrl: v.optional(v.string()),
  }),
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "issuer"))
      .unique();
    if (!existing) {
      return issuerDefaults;
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
      brandName: existing.brandName,
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
    brandName: v.string(),
    githubRepoUrl: v.optional(v.string()),
    vercelDashboardUrl: v.optional(v.string()),
  },
  returns: v.id("settings"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "issuer"))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }
    return await ctx.db.insert("settings", { key: "issuer", ...args });
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
    return existing ?? issuerDefaults;
  },
});
