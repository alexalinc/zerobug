import { CITIES, cityServicePath, getCityBySlug } from "@/lib/cities";
import { LOCAL_KEYWORDS, getLocalKeyword } from "./keywords";
import type { LocalServicePage } from "./types";
import { fillCityTpl } from "./types";

function buildLocalPage(
  citySlug: string,
  keywordSlug: string,
): LocalServicePage | undefined {
  const city = getCityBySlug(citySlug);
  const kw = getLocalKeyword(keywordSlug);
  if (!city || !kw) return undefined;

  const path = cityServicePath(city.slug, kw.slug);
  const cityCtx = {
    name: city.name,
    from: city.from,
    inLocative: city.inLocative,
  };

  return {
    slug: kw.slug,
    citySlug: city.slug,
    cityName: city.name,
    categorySlug: kw.categorySlug,
    name: `${kw.name} ${city.inLocative}`,
    seoTitle: fillCityTpl(kw.seoTitleTpl, cityCtx),
    seoDescription: fillCityTpl(kw.seoDescriptionTpl, cityCtx),
    h1: fillCityTpl(kw.h1Tpl, cityCtx),
    intro: fillCityTpl(kw.introTpl, cityCtx),
    benefits: [
      ...kw.baseBenefits,
      `Suport pentru companii ${city.from} și din județul ${city.county}`,
    ],
    includes: kw.baseIncludes,
    process: kw.baseProcess,
    faqs: kw.faqTpls.map((f) => ({
      question: fillCityTpl(f.question, cityCtx),
      answer: fillCityTpl(f.answerTpl, cityCtx),
    })),
    image: kw.image,
    showMaintenanceCta: kw.showMaintenanceCta,
    nationalPath: kw.nationalPath,
    path,
  };
}

export const ALL_LOCAL_PAGES: LocalServicePage[] = CITIES.flatMap((city) =>
  LOCAL_KEYWORDS.map((kw) => buildLocalPage(city.slug, kw.slug)!).filter(
    Boolean,
  ),
);

export function getLocalPage(
  citySlug: string,
  serviceSlug: string,
): LocalServicePage | undefined {
  return ALL_LOCAL_PAGES.find(
    (p) => p.citySlug === citySlug && p.slug === serviceSlug,
  );
}

export function getLocalPagesByCity(citySlug: string): LocalServicePage[] {
  return ALL_LOCAL_PAGES.filter((p) => p.citySlug === citySlug);
}

export function getAllLocalStaticParams() {
  return ALL_LOCAL_PAGES.map((p) => ({
    city: p.citySlug,
    service: p.slug,
  }));
}

export function getRelatedLocalPages(
  page: LocalServicePage,
  limit = 4,
): LocalServicePage[] {
  return getLocalPagesByCity(page.citySlug)
    .filter((p) => p.slug !== page.slug)
    .slice(0, limit);
}

export { LOCAL_KEYWORDS, getLocalKeyword };
export type { LocalServicePage, LocalKeyword } from "./types";
