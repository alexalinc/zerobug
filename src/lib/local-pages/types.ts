import type { ServiceFaq, ServiceProcessStep } from "@/lib/service-pages/types";

export type LocalKeyword = {
  slug: string;
  name: string;
  categorySlug: string;
  /** National spoke path when available */
  nationalPath?: string;
  image?: string;
  showMaintenanceCta?: boolean;
  /** Shared body; city strings are injected at build time */
  baseBenefits: string[];
  baseIncludes: string[];
  baseProcess: ServiceProcessStep[];
  /** Templates use {city}, {from}, {in} */
  seoTitleTpl: string;
  seoDescriptionTpl: string;
  h1Tpl: string;
  introTpl: string;
  faqTpls: { question: string; answerTpl: string }[];
};

export type LocalServicePage = {
  slug: string;
  citySlug: string;
  cityName: string;
  categorySlug: string;
  name: string;
  seoTitle: string;
  seoDescription: string;
  h1: string;
  intro: string;
  benefits: string[];
  includes: string[];
  process: ServiceProcessStep[];
  faqs: ServiceFaq[];
  image?: string;
  showMaintenanceCta?: boolean;
  nationalPath?: string;
  path: string;
};

export function fillCityTpl(
  tpl: string,
  city: { name: string; from: string; inLocative: string },
): string {
  return tpl
    .replaceAll("{city}", city.name)
    .replaceAll("{from}", city.from)
    .replaceAll("{in}", city.inLocative);
}
