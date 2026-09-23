import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

const DEFAULT_ROBOTS = `User-agent: *
Allow: /

Disallow: /admin
Disallow: /api/
Disallow: /mentenanta/success

Sitemap: {{SITE_URL}}/sitemap.xml
`;

const DEFAULT_LLMS = `# ZeroBug

> Agenție IT din România: web development, e-commerce, API & integrări, mobile, AI (OpenAI / Claude), Google Ads tracking și mentenanță WordPress / WooCommerce.

ZeroBug construiește și întreține produse digitale pentru companii — de la site-uri și magazine online la automatizări, tracking și abonamente de mentenanță cu facturare lunară.

## Site

- Home: {{SITE_URL}}/
- Servicii: {{SITE_URL}}/servicii
- Mentenanță: {{SITE_URL}}/mentenanta
- Portofoliu: {{SITE_URL}}/portofoliu
- Despre: {{SITE_URL}}/despre
- Contact: {{SITE_URL}}/contact

## Categorii servicii

{{SERVICE_LINKS}}

## Contact

- Email: contact@zerobug.ro
- Site: {{SITE_URL}}

## Optional

- Sitemap: {{SITE_URL}}/sitemap.xml
- Robots: {{SITE_URL}}/robots.txt
`;

const seoDoc = v.object({
  _id: v.optional(v.id("seoSettings")),
  robotsTxt: v.string(),
  llmsTxt: v.string(),
  sitemapLastGeneratedAt: v.optional(v.number()),
  updatedAt: v.number(),
});

export const get = query({
  args: {},
  returns: seoDoc,
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("seoSettings")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .unique();
    if (!existing) {
      return {
        robotsTxt: DEFAULT_ROBOTS,
        llmsTxt: DEFAULT_LLMS,
        sitemapLastGeneratedAt: undefined,
        updatedAt: 0,
      };
    }
    return {
      _id: existing._id,
      robotsTxt: existing.robotsTxt,
      llmsTxt: existing.llmsTxt,
      sitemapLastGeneratedAt: existing.sitemapLastGeneratedAt,
      updatedAt: existing.updatedAt,
    };
  },
});

export const upsert = mutation({
  args: {
    robotsTxt: v.string(),
    llmsTxt: v.string(),
  },
  returns: v.id("seoSettings"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("seoSettings")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .unique();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        robotsTxt: args.robotsTxt,
        llmsTxt: args.llmsTxt,
        updatedAt: now,
      });
      return existing._id;
    }
    return await ctx.db.insert("seoSettings", {
      key: "main",
      robotsTxt: args.robotsTxt,
      llmsTxt: args.llmsTxt,
      updatedAt: now,
    });
  },
});

export const markSitemapGenerated = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("seoSettings")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .unique();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        sitemapLastGeneratedAt: now,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("seoSettings", {
        key: "main",
        robotsTxt: DEFAULT_ROBOTS,
        llmsTxt: DEFAULT_LLMS,
        sitemapLastGeneratedAt: now,
        updatedAt: now,
      });
    }
    return null;
  },
});

export const markSitemapGeneratedInternal = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("seoSettings")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .unique();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        sitemapLastGeneratedAt: now,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("seoSettings", {
        key: "main",
        robotsTxt: DEFAULT_ROBOTS,
        llmsTxt: DEFAULT_LLMS,
        sitemapLastGeneratedAt: now,
        updatedAt: now,
      });
    }
    return null;
  },
});

export const seedDefaults = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("seoSettings")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .unique();
    if (!existing) {
      await ctx.db.insert("seoSettings", {
        key: "main",
        robotsTxt: DEFAULT_ROBOTS,
        llmsTxt: DEFAULT_LLMS,
        updatedAt: Date.now(),
      });
    }
    return null;
  },
});
