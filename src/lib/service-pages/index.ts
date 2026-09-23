import { SERVICE_CATEGORIES } from "@/lib/services";
import { WEB_DEVELOPMENT_PAGES } from "./web-development";
import { buildCategoryServicePages } from "./generate";
import type { ServicePage } from "./types";
import { servicePath } from "./types";

export type { ServicePage, ServiceFaq, ServiceProcessStep } from "./types";
export { servicePath, slugifyServiceName } from "./types";

const OTHER_CATEGORY_SLUGS = SERVICE_CATEGORIES.map((c) => c.slug).filter(
  (s) => s !== "web-development",
);

const GENERATED_PAGES: ServicePage[] = OTHER_CATEGORY_SLUGS.flatMap(
  buildCategoryServicePages,
);

/** All spoke service pages (wave-1 web + generated for other categories). */
export const ALL_SERVICE_PAGES: ServicePage[] = [
  ...WEB_DEVELOPMENT_PAGES,
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
