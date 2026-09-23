import type { MetadataRoute } from "next";
import {
  getSiteUrl,
  getSitemapEntries,
  SITEMAP_REVALIDATE_SECONDS,
} from "@/lib/seo";

/** Regenerated at least weekly (and on-demand from Admin → SEO). */
export const revalidate = SITEMAP_REVALIDATE_SECONDS;

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
