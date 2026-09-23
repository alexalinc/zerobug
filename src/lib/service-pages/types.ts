export type ServiceFaq = {
  question: string;
  answer: string;
};

export type ServiceProcessStep = {
  title: string;
  body: string;
};

export type ServicePage = {
  slug: string;
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
  relatedSlugs: string[];
  image?: string;
  /** Link toward maintenance when relevant */
  showMaintenanceCta?: boolean;
};

export function servicePath(categorySlug: string, serviceSlug: string) {
  return `/servicii/${categorySlug}/${serviceSlug}`;
}

export function slugifyServiceName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/↔/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}
