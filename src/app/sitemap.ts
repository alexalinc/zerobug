import type { MetadataRoute } from "next";
import { getSiteUrl, getSitemapEntries } from "@/lib/seo";

/** Regenerated at least weekly (and on-demand from Admin → SEO).
 * Must be a numeric literal — Next.js rejects imported segment config values. */
export const revalidate = 604800; // 7 days

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = new Date();

  return getSitemapEntries().map((entry) => ({
    url: `${base}${entry.path === "/" ? "" : entry.path}`,
    lastModified: now,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
