import { SERVICE_CATEGORIES } from "@/lib/services";
import { WEB_DEVELOPMENT_PAGES } from "./web-development";
import { ECOMMERCE_PAGES } from "./e-commerce";
import { WORDPRESS_PAGES } from "./wordpress-woocommerce";
import { buildAdsPages } from "./google-ads-analytics";
import { buildApiPages } from "./api-integrari";
import { buildCategoryServicePages } from "./generate";
import type { ServicePage } from "./types";
import { servicePath } from "./types";

export type { ServicePage, ServiceFaq, ServiceProcessStep } from "./types";
export { servicePath, slugifyServiceName } from "./types";

const GENERATED_ONLY = SERVICE_CATEGORIES.map((c) => c.slug).filter(
  (s) =>
    s !== "web-development" &&
    s !== "e-commerce" &&
    s !== "wordpress-woocommerce" &&
    s !== "google-ads-analytics" &&
    s !== "api-integrari",
);

const GENERATED_PAGES: ServicePage[] = GENERATED_ONLY.flatMap(
  buildCategoryServicePages,
);

/** All spoke service pages */
export const ALL_SERVICE_PAGES: ServicePage[] = [
  ...WEB_DEVELOPMENT_PAGES,
  ...ECOMMERCE_PAGES,
  ...WORDPRESS_PAGES,
  ...buildAdsPages(),
  ...buildApiPages(),
  ...GENERATED_PAGES,
];

export function getServicePagesByCategory(
  categorySlug: string,
): ServicePage[] {
  return ALL_SERVICE_PAGES.filter((p) => p.categorySlug === categorySlug);
}

export function getServicePage(
  categorySlug: string,
  serviceSlug: string,
): ServicePage | undefined {
  return ALL_SERVICE_PAGES.find(
    (p) => p.categorySlug === categorySlug && p.slug === serviceSlug,
  );
}

export function getRelatedServicePages(
  page: ServicePage,
  limit = 4,
): ServicePage[] {
  const fromRelated = page.relatedSlugs
    .map((slug) => getServicePage(page.categorySlug, slug))
    .filter((p): p is ServicePage => Boolean(p));

  if (fromRelated.length >= limit) return fromRelated.slice(0, limit);

  const extras = getServicePagesByCategory(page.categorySlug).filter(
    (p) => p.slug !== page.slug && !fromRelated.some((r) => r.slug === p.slug),
  );

  return [...fromRelated, ...extras].slice(0, limit);
}

export function getAllServiceStaticParams() {
  return ALL_SERVICE_PAGES.map((p) => ({
    slug: p.categorySlug,
    service: p.slug,
  }));
}

export function getServiceHref(page: ServicePage) {
  return servicePath(page.categorySlug, page.slug);
}
