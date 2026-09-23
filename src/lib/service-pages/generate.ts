import { SERVICE_CATEGORIES } from "@/lib/services";
import type { ServicePage } from "./types";
import { slugifyServiceName } from "./types";

const CATEGORY_IMAGES: Record<string, string> = {
  "e-commerce": "/images/portfolio/bijuteriairis.jpg",
  "api-integrari": "/images/portfolio/wootrack.jpg",
  "aplicatii-mobile": "/images/portfolio/spido.jpg",
  "google-ads-analytics": "/images/portfolio/profit-bid.jpg",
  "wordpress-woocommerce": "/images/portfolio/mercana.jpg",
};

const DEFAULT_PROCESS = [
  {
    title: "Brief",
    body: "Clarificăm obiectivul, constrângerile și sistemele implicate.",
  },
  {
    title: "Ofertă",
    body: "Primești scope, termene și pașii de livrare.",
  },
  {
    title: "Implementare",
    body: "Lucrăm pe etape, cu preview și feedback.",
  },
  {
    title: "Lansare",
    body: "Go-live, verificări și handoff documentat.",
  },
];

function buildGeneratedPage(
  categorySlug: string,
  categoryTitle: string,
  name: string,
  allNames: string[],
): ServicePage {
  const slug = slugifyServiceName(name);
  const related = allNames
    .filter((n) => n !== name)
    .slice(0, 4)
    .map(slugifyServiceName);

  const maintenance =
    categorySlug === "wordpress-woocommerce" ||
    /wordpress|woocommerce|mentenan/i.test(name);

  return {
    slug,
    categorySlug,
    name,
    seoTitle: `${name} | ZeroBug`,
    seoDescription: `${name} cu ZeroBug — soluții IT pentru companii din România. ${categoryTitle}: ofertă personalizată, livrare pe etape și suport după lansare.`,
    h1: `${name} pentru business-uri din România`,
    intro: `Cauți „${name.toLowerCase()}”? La ZeroBug livrăm proiecte din categoria ${categoryTitle}: clar pe scope, tehnologie potrivită și focus pe rezultat de business — nu pe slide-uri.`,
    benefits: [
      `Experiență practică pe ${categoryTitle.toLowerCase()}`,
      "Comunicare directă cu echipa care implementează",
      "Ofertă pe etape, fără surprize de scope",
      "Pregătit pentru SEO și măsurare",
      "Opțiuni de mentenanță după lansare",
    ],
    includes: [
      "Analiză scurtă a nevoii",
      `Implementare ${name.toLowerCase()}`,
      "Testare pe staging",
      "Documentare / handoff",
      "Recomandări de next steps",
    ],
    process: DEFAULT_PROCESS,
    faqs: [
      {
        question: `Ce include serviciul „${name}”?`,
        answer: `Scope-ul exact îl stabilim în ofertă după brief. De regulă acoperim implementarea, testarea și lansarea pentru ${name.toLowerCase()}, plus recomandări de mentenanță.`,
      },
      {
        question: "Cât durează proiectul?",
        answer:
          "Depinde de complexitate: de la câteva zile (configurări) la câteva săptămâni (build-uri complete). Îți dăm un interval realist înainte să începem.",
      },
      {
        question: "Cum cer o ofertă?",
        answer:
          "Folosește butonul „Cere ofertă” de pe această pagină — precompletăm categoria și serviciul ca să răspundem mai rapid.",
      },
    ],
    relatedSlugs: related,
    image: CATEGORY_IMAGES[categorySlug] ?? "/images/logozerobug.png",
    showMaintenanceCta: maintenance,
  };
}

/** Generated pages for categories other than web-development (unique per name). */
export function buildCategoryServicePages(
  categorySlug: string,
): ServicePage[] {
  const cat = SERVICE_CATEGORIES.find((c) => c.slug === categorySlug);
  if (!cat) return [];
  return cat.services.map((name) =>
    buildGeneratedPage(cat.slug, cat.title, name, cat.services),
  );
}
