import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { requireAdminSession } from "./lib/adminGate";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LEADS_PER_EMAIL_PER_HOUR = 5;

function clampStr(value: string, max: number) {
  return value.trim().slice(0, max);
}

export const create = mutation({
  args: {
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
    gclid: v.optional(v.string()),
    gbraid: v.optional(v.string()),
    wbraid: v.optional(v.string()),
    marketingConsent: v.optional(v.boolean()),
  },
  returns: v.id("leads"),
  handler: async (ctx, args) => {
    const name = clampStr(args.name, 120);
    const email = clampStr(args.email, 254).toLowerCase();
    if (name.length < 2) throw new Error("Nume invalid");
    if (!EMAIL_RE.test(email)) throw new Error("Email invalid");
    if (args.phone && args.phone.length > 40) {
      throw new Error("Telefon invalid");
    }
    if (args.message && args.message.length > 5000) {
      throw new Error("Mesaj prea lung");
    }
    if (args.addons && args.addons.length > 30) {
      throw new Error("Prea multe add-on-uri");
    }
    if (args.budget != null && (args.budget < 0 || args.budget > 1_000_000)) {
      throw new Error("Budget invalid");
    }

    // Soft rate-limit by email (last hour) — uses by_email index
    const hourAgo = Date.now() - 60 * 60 * 1000;
    const recentSameEmail = await ctx.db
      .query("leads")
      .withIndex("by_email", (q) => q.eq("email", email))
      .order("desc")
      .take(MAX_LEADS_PER_EMAIL_PER_HOUR + 1);
    const recentCount = recentSameEmail.filter(
      (l) => l.createdAt >= hourAgo,
    ).length;
    if (recentCount >= MAX_LEADS_PER_EMAIL_PER_HOUR) {
      throw new Error("Prea multe cereri. Încearcă din nou mai târziu.");
    }

    const {
      gclid,
      gbraid,
      wbraid,
      marketingConsent,
      ...rest
    } = args;

    const consented = Boolean(marketingConsent);
    // Never persist click IDs without marketing consent
    const safeGclid = consented ? clampStr(gclid || "", 200) || undefined : undefined;
    const safeGbraid = consented
      ? clampStr(gbraid || "", 200) || undefined
      : undefined;
    const safeWbraid = consented
      ? clampStr(wbraid || "", 200) || undefined
      : undefined;

    const settings = await ctx.db
      .query("googleAdsSettings")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .unique();
    const syncReady = Boolean(
      settings?.enabled &&
        settings.refreshToken &&
        settings.customerId &&
        settings.conversionActionId,
    );

    let googleAdsStatus: "pending" | "skipped" | undefined;
    if (syncReady) {
      googleAdsStatus = consented ? "pending" : "skipped";
    }

    const id = await ctx.db.insert("leads", {
      ...rest,
      name,
      email,
      phone: args.phone ? clampStr(args.phone, 40) : undefined,
      company: args.company ? clampStr(args.company, 200) : undefined,
      message: args.message ? clampStr(args.message, 5000) : undefined,
      serviceCategory: args.serviceCategory
        ? clampStr(args.serviceCategory, 120)
        : undefined,
      serviceName: args.serviceName
        ? clampStr(args.serviceName, 200)
        : undefined,
      planKey: args.planKey ? clampStr(args.planKey, 64) : undefined,
      complexity: args.complexity
        ? clampStr(args.complexity, 64)
        : undefined,
      addons: args.addons?.map((a) => clampStr(a, 80)).slice(0, 30),
      quoteDetails: args.quoteDetails
        ? clampStr(args.quoteDetails, 5000)
        : undefined,
      gclid: safeGclid,
      gbraid: safeGbraid,
      wbraid: safeWbraid,
      marketingConsent: consented,
      googleAdsStatus,
      googleAdsError:
        syncReady && !consented
          ? "Fără consimțământ marketing (cookie banner)"
          : undefined,
      status: "new",
      createdAt: Date.now(),
    });

    if (args.type !== "service_quote") {
      await ctx.scheduler.runAfter(0, internal.leadsActions.notifyLeadEmail, {
        type: args.type,
        name,
        email,
        phone: args.phone,
        company: args.company,
        message: args.message,
        serviceCategory: args.serviceCategory,
        serviceName: args.serviceName,
        planKey: args.planKey,
        complexity: args.complexity,
        addons: args.addons,
        budget: args.budget,
        quoteDetails: args.quoteDetails,
      });
    }

    if (syncReady && consented) {
      await ctx.scheduler.runAfter(
        0,
        internal.googleAdsActions.uploadLeadConversion,
        { leadId: id },
      );
    }

    return id;
  },
});

export const list = query({
  args: { sessionToken: v.string() },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    await requireAdminSession(args.sessionToken);
    return await ctx.db.query("leads").order("desc").take(200);
  },
});

export const updateStatus = mutation({
  args: {
    sessionToken: v.string(),
    id: v.id("leads"),
    status: v.union(
      v.literal("new"),
      v.literal("contacted"),
      v.literal("won"),
      v.literal("lost"),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdminSession(args.sessionToken);
    await ctx.db.patch(args.id, { status: args.status });
    return null;
  },
});
