import { SERVICE_CATEGORIES } from "@/lib/services";
import { ALL_SERVICE_PAGES, getServiceHref } from "@/lib/service-pages";
import { CITIES, cityHubPath } from "@/lib/cities";
import { ALL_LOCAL_PAGES } from "@/lib/local-pages";
import { INTENT_PAGES } from "@/lib/intent-pages";

export function getSiteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "https://zerobug.ro";
}

export type SitemapEntry = {
  path: string;
  priority: number;
  changeFrequency:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
};

/** Public marketing URLs included in sitemap.xml */
export function getSitemapEntries(): SitemapEntry[] {
  const staticPages: SitemapEntry[] = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/servicii", priority: 0.9, changeFrequency: "weekly" },
    { path: "/servicii/oras", priority: 0.85, changeFrequency: "weekly" },
    { path: "/mentenanta", priority: 0.9, changeFrequency: "weekly" },
    { path: "/portofoliu", priority: 0.8, changeFrequency: "monthly" },
    { path: "/despre", priority: 0.7, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.8, changeFrequency: "monthly" },
    { path: "/termeni", priority: 0.3, changeFrequency: "yearly" },
    {
      path: "/politica-confidentialitate",
      priority: 0.3,
      changeFrequency: "yearly",
    },
  ];

  const categoryPages: SitemapEntry[] = SERVICE_CATEGORIES.map((c) => ({
    path: `/servicii/${c.slug}`,
    priority: 0.85,
    changeFrequency: "weekly" as const,
  }));

  const intentPages: SitemapEntry[] = INTENT_PAGES.map((p) => ({
    path: `/servicii/${p.slug}`,
    priority: 0.88,
    changeFrequency: "monthly" as const,
  }));

  const serviceSpokes: SitemapEntry[] = ALL_SERVICE_PAGES.map((p) => ({
    path: getServiceHref(p),
    priority: 0.7,
    changeFrequency: "monthly" as const,
  }));

  const cityHubs: SitemapEntry[] = CITIES.map((c) => ({
    path: cityHubPath(c.slug),
    priority: 0.75,
    changeFrequency: "monthly" as const,
  }));

  const localSpokes: SitemapEntry[] = ALL_LOCAL_PAGES.map((p) => ({
    path: p.path,
    priority: 0.65,
    changeFrequency: "monthly" as const,
  }));

  return [
    ...staticPages,
    ...categoryPages,
    ...intentPages,
    ...serviceSpokes,
    ...cityHubs,
    ...localSpokes,
  ];
}

export const DEFAULT_ROBOTS_TXT = `User-agent: *
Allow: /

Disallow: /admin
Disallow: /api/
Disallow: /mentenanta/success

Sitemap: {{SITE_URL}}/sitemap.xml
`;

export const DEFAULT_LLMS_TXT = `# ZeroBug

> Agenție IT din România: web development, e-commerce, API & integrări / batch-uri, mobile, Google Ads tracking și mentenanță WordPress / WooCommerce.

ZeroBug construiește și întreține produse digitale pentru companii — de la site-uri și magazine online la automatizări, tracking și abonamente de mentenanță cu facturare lunară.

## Site

- Home: {{SITE_URL}}/
- Servicii: {{SITE_URL}}/servicii
- Servicii pe oraș: {{SITE_URL}}/servicii/oras
- Mentenanță: {{SITE_URL}}/mentenanta
- Portofoliu: {{SITE_URL}}/portofoliu
- Despre: {{SITE_URL}}/despre
- Contact: {{SITE_URL}}/contact

## Categorii servicii

{{SERVICE_LINKS}}

## Intent / money keywords

{{INTENT_LINKS}}

## Exemple pagini serviciu

{{SERVICE_SPOKE_LINKS}}

## Orașe

{{CITY_LINKS}}

## Contact

- Email: contact@zerobug.ro
- Site: {{SITE_URL}}

## Optional

- Sitemap: {{SITE_URL}}/sitemap.xml
- Robots: {{SITE_URL}}/robots.txt
`;

export function renderRobotsTxt(
  template: string,
  siteUrl = getSiteUrl(),
): string {
  return template.replaceAll("{{SITE_URL}}", siteUrl).trim() + "\n";
}

export function renderLlmsTxt(
  template: string,
  siteUrl = getSiteUrl(),
): string {
  const serviceLinks = SERVICE_CATEGORIES.map(
    (c) => `- ${c.title}: ${siteUrl}/servicii/${c.slug}`,
  ).join("\n");

  const spokeLinks = ALL_SERVICE_PAGES.filter(
    (p) => p.categorySlug === "web-development",
  )
    .slice(0, 8)
    .map((p) => `- ${p.name}: ${siteUrl}${getServiceHref(p)}`)
    .join("\n");

  const intentLinks = INTENT_PAGES.map(
    (p) => `- ${p.name}: ${siteUrl}/servicii/${p.slug}`,
  ).join("\n");

  const cityLinks = CITIES.slice(0, 8)
    .map((c) => `- ${c.name}: ${siteUrl}${cityHubPath(c.slug)}`)
    .join("\n");

  return (
    template
      .replaceAll("{{SITE_URL}}", siteUrl)
      .replaceAll("{{SERVICE_LINKS}}", serviceLinks)
      .replaceAll("{{SERVICE_SPOKE_LINKS}}", spokeLinks)
      .replaceAll("{{INTENT_LINKS}}", intentLinks)
      .replaceAll("{{CITY_LINKS}}", cityLinks)
      .trim() + "\n"
  );
}

/** Seconds in one week — used by Next.js sitemap revalidate */
export const SITEMAP_REVALIDATE_SECONDS = 60 * 60 * 24 * 7;
