import type { ServiceFaq, ServiceProcessStep } from "@/lib/service-pages/types";

export type IntentPage = {
  slug: string;
  name: string;
  seoTitle: string;
  seoDescription: string;
  h1: string;
  intro: string;
  benefits: string[];
  includes: string[];
  process: ServiceProcessStep[];
  faqs: ServiceFaq[];
  /** Links to national spokes / categories */
  ctaLinks: { label: string; href: string }[];
  categorySlug: string;
  image?: string;
  showMaintenanceCta?: boolean;
};

const PROCESS: ServiceProcessStep[] = [
  {
    title: "Brief",
    body: "Clarificăm obiectivul, catalogul, canalele de vânzare și constrângerile.",
  },
  {
    title: "Recomandare platformă",
    body: "Woo, Shopify sau custom — pe baza volumului, echipei și bugetului.",
  },
  {
    title: "Build",
    body: "Design, catalog, checkout, plăți, livrări — pe etape cu preview.",
  },
  {
    title: "Lansare",
    body: "Go-live, tracking, handoff și opțiuni de mentenanță.",
  },
];

/** National umbrella / money-keyword pages under /servicii/[slug] */
export const INTENT_PAGES: IntentPage[] = [
  {
    slug: "creare-magazin-online",
    name: "Creare magazin online",
    seoTitle: "Creare magazin online | ZeroBug",
    seoDescription:
      "Creare magazin online în România: WooCommerce, Shopify sau custom. Catalog, checkout, plăți, curieri. Ofertă pe etape de la ZeroBug.",
    h1: "Creare magazin online pentru afaceri din România",
    intro:
      "Vrei să vinzi online? Te ajutăm să alegi platforma potrivită și să lansezi un magazin care încasează: produse clare, checkout fluid, plăți și livrări. WooCommerce, Shopify sau build custom — pe obiectiv, nu pe modă.",
    benefits: [
      "Recomandare Woo vs Shopify vs custom, pe datele tale",
      "Checkout și fluxuri de comandă pe conversie",
      "Integrări RO: plăți, curieri, SmartBill",
      "Pregătit pentru Google Ads și Merchant Center",
      "Mentenanță și optimizare după lansare",
    ],
    includes: [
      "Discovery scurt (catalog, volum, echipă)",
      "Propunere platformă + scope",
      "Design pe brand",
      "Implementare magazin",
      "Plăți, shipping, email-uri de comandă",
      "Checklist go-live + tracking de bază",
    ],
    process: PROCESS,
    faqs: [
      {
        question: "WooCommerce sau Shopify?",
        answer:
          "Shopify e rapid de operat și hostat. WooCommerce dă control maxim pe WordPress. Custom (Next.js) când ai fluxuri atipice. În ofertă alegem împreună.",
      },
      {
        question: "Cât costă un magazin online?",
        answer:
          "Depinde de catalog, design și integrări. Trimite un brief — îți dăm un interval realist pe etape, fără preț inventat pe site.",
      },
      {
        question: "Puteți migra magazinul existent?",
        answer:
          "Da — Shopify↔Woo, Magento/PrestaShop și altele. Planificăm redirect-uri SEO și cutover.",
      },
    ],
    ctaLinks: [
      {
        label: "Magazin WooCommerce",
        href: "/servicii/e-commerce/creare-magazin-woocommerce",
      },
      {
        label: "Dezvoltare Shopify",
        href: "/servicii/e-commerce/dezvoltare-shopify",
      },
      {
        label: "Magazin Next.js",
        href: "/servicii/web-development/magazin-online-next-js-react",
      },
      {
        label: "Optimizare magazin",
        href: "/servicii/e-commerce/optimizare-magazin-online",
      },
    ],
    categorySlug: "e-commerce",
    image: "/images/portfolio/bijuteriairis.jpg",
  },
  {
    slug: "creare-website",
    name: "Creare website",
    seoTitle: "Creare website | ZeroBug",
    seoDescription:
      "Creare website pentru firme din România: prezentare, corporate, WordPress sau Next.js. Design, SEO tehnic, ofertă pe etape.",
    h1: "Creare website pentru afaceri din România",
    intro:
      "Un website bun explică oferta și aduce lead-uri. Construim site-uri de prezentare, corporate și landing-uri — pe WordPress sau Next.js — cu structură clară și bază SEO.",
    benefits: [
      "Structură pe conversie",
      "Mobil-first și viteză",
      "SEO tehnic de bază",
      "CMS când ai nevoie să editezi singur",
    ],
    includes: [
      "Sitemap + mesaj",
      "Design pe brand",
      "Implementare",
      "Formulare / CTA",
      "Go-live",
    ],
    process: PROCESS,
    faqs: [
      {
        question: "WordPress sau Next.js?",
        answer:
          "WordPress pentru editare familiară. Next.js pentru performanță și UI custom. Te ghidăm după obiectiv.",
      },
    ],
    ctaLinks: [
      {
        label: "Website de prezentare",
        href: "/servicii/web-development/creare-website-de-prezentare",
      },
      {
        label: "Website WordPress",
        href: "/servicii/web-development/website-wordpress",
      },
      {
        label: "Website Next.js",
        href: "/servicii/web-development/website-next-js-react",
      },
      {
        label: "Redesign",
        href: "/servicii/web-development/redesign-website",
      },
    ],
    categorySlug: "web-development",
    image: "/images/portfolio/spido.jpg",
    showMaintenanceCta: true,
  },
  {
    slug: "mentenanta-wordpress",
    name: "Mentenanță WordPress",
    seoTitle: "Mentenanță WordPress | ZeroBug",
    seoDescription:
      "Mentenanță WordPress și WooCommerce: update-uri, backup, securitate, support. Abonament lunar — estimare pe zerobug.ro/mentenanta.",
    h1: "Mentenanță WordPress & WooCommerce",
    intro:
      "Update-uri, backup, securitate și cineva care răspunde când e urgent. Mentenanță lunară pentru site-uri și magazine WordPress din România.",
    benefits: [
      "Cost predictibil",
      "Update-uri controlate",
      "Backup și monitorizare",
      "Intervenții la incidente",
    ],
    includes: [
      "Update core / plugin-uri / teme",
      "Backup",
      "Scan securitate",
      "Raport lunar",
      "Ore support conform plan",
    ],
    process: [
      {
        title: "Audit",
        body: "Starea site-ului și riscurile.",
      },
      {
        title: "Plan",
        body: "Alegi pachetul potrivit.",
      },
      {
        title: "Onboarding",
        body: "Accese și checklist.",
      },
      {
        title: "Operare",
        body: "Mentenanță lunară + support.",
      },
    ],
    faqs: [
      {
        question: "Aveți și cleanup malware?",
        answer:
          "Da. Curățăm, securizăm, apoi trecem pe mentenanță ca să reducem riscul de recidivă.",
      },
    ],
    ctaLinks: [
      { label: "Estimare mentenanță", href: "/mentenanta" },
      {
        label: "WordPress / WooCommerce",
        href: "/servicii/wordpress-woocommerce",
      },
    ],
    categorySlug: "wordpress-woocommerce",
    image: "/images/portfolio/mercana.jpg",
    showMaintenanceCta: true,
  },
  {
    slug: "optimizare-magazin-online",
    name: "Optimizare magazin online",
    seoTitle: "Optimizare magazin online | ZeroBug",
    seoDescription:
      "Optimizare magazin online: viteză, checkout, conversie, tracking GA4/Ads. WooCommerce și Shopify.",
    h1: "Optimizare magazin online — viteză și conversie",
    intro:
      "Magazinul există, dar e lent sau pierde comenzi? Optimizăm performanța, checkout-ul și măsurarea — ca Ads și organic să aibă pe ce să lucreze.",
    benefits: [
      "Core Web Vitals",
      "Checkout mai clar",
      "Tracking corect",
      "Prioritizare pe impact",
    ],
    includes: [
      "Audit tehnic + UX",
      "Fix-uri de viteză",
      "Îmbunătățiri checkout",
      "Verificare conversii",
      "Raport before/after",
    ],
    process: PROCESS,
    faqs: [
      {
        question: "Lucrați pe Woo și Shopify?",
        answer: "Da, pe ambele — plus magazine custom când e cazul.",
      },
    ],
    ctaLinks: [
      {
        label: "Optimizare e-commerce",
        href: "/servicii/e-commerce/optimizare-magazin-online",
      },
      {
        label: "Google Ads tracking",
        href: "/servicii/google-ads-analytics/google-ads-conversion-tracking",
      },
    ],
    categorySlug: "e-commerce",
    image: "/images/portfolio/bijuteriairis.jpg",
  },
  {
    slug: "integrare-smartbill",
    name: "Integrare SmartBill",
    seoTitle: "Integrare SmartBill | ZeroBug",
    seoDescription:
      "Integrare SmartBill cu WooCommerce, Shopify sau ERP: facturi automate din comenzi. Pentru magazine din România.",
    h1: "Integrare SmartBill pentru magazine online",
    intro:
      "Facturile pleacă din comenzi, nu din copy-paste. Legăm SmartBill de magazin sau ERP ca contabilitatea să țină pasul cu volumul.",
    benefits: [
      "Automatizare facturi",
      "Mai puține erori",
      "Mapare TVA / produse",
      "Handoff pentru contabil",
    ],
    includes: [
      "Analiză flux",
      "Implementare API",
      "Teste staging",
      "Documentare",
    ],
    process: PROCESS,
    faqs: [
      {
        question: "Merge cu WooCommerce?",
        answer: "Da — și cu Shopify sau sisteme custom via API.",
      },
    ],
    ctaLinks: [
      {
        label: "Integrare SmartBill",
        href: "/servicii/api-integrari/integrare-smartbill",
      },
      { label: "Toate integrările", href: "/servicii/api-integrari" },
    ],
    categorySlug: "api-integrari",
    image: "/images/portfolio/wootrack.jpg",
  },
  {
    slug: "migrare-magazin-online",
    name: "Migrare magazin online",
    seoTitle: "Migrare magazin online | ZeroBug",
    seoDescription:
      "Migrare magazin online: Shopify↔WooCommerce, Magento, PrestaShop. Produse, clienți, SEO, cutover planificat.",
    h1: "Migrare magazin online fără pierderi de SEO",
    intro:
      "Schimbi platforma, nu pierzi catalogul sau pozițiile. Planificăm migrări cu mapare date, redirect-uri și fereastră de cutover controlată.",
    benefits: [
      "Migrare produse / clienți / comenzi",
      "Redirect-uri 301",
      "Staging înainte de go-live",
      "Smoke tests post-cutover",
    ],
    includes: [
      "Audit sursă",
      "Plan migrare",
      "Import + mapare",
      "Redirect-uri",
      "Go-live",
    ],
    process: PROCESS,
    faqs: [
      {
        question: "Shopify către Woo sau invers?",
        answer: "Ambele direcții — plus Magento/PrestaShop către Woo/Shopify.",
      },
    ],
    ctaLinks: [
      {
        label: "Migrare Shopify ↔ Woo",
        href: "/servicii/e-commerce/migrare-shopify-woocommerce",
      },
      { label: "E-commerce", href: "/servicii/e-commerce" },
    ],
    categorySlug: "e-commerce",
    image: "/images/portfolio/bijuteriairis.jpg",
  },
  {
    slug: "google-ads-tracking",
    name: "Google Ads tracking",
    seoTitle: "Google Ads tracking | ZeroBug",
    seoDescription:
      "Google Ads conversion tracking, GA4, GTM, Enhanced Conversions, server-side. Măsurare corectă pentru e-commerce din România.",
    h1: "Google Ads tracking & conversii corecte",
    intro:
      "Dacă Ads „merge” dar nu știi ce vinde, tracking-ul e stricat. Configurăm conversii, GA4 și GTM — inclusiv server-side și POAS când ai COGS.",
    benefits: [
      "Conversii de încredere",
      "GA4 + GTM curat",
      "Enhanced Conversions",
      "Bază pentru profit tracking",
    ],
    includes: [
      "Audit",
      "Implementare / reparare",
      "Teste",
      "Documentație pentru media buyer",
    ],
    process: PROCESS,
    faqs: [
      {
        question: "Faceți și POAS?",
        answer:
          "Da, când ai costuri de produs (COGS) — legăm tracking-ul de profit, nu doar de ROAS.",
      },
    ],
    ctaLinks: [
      {
        label: "Conversion tracking",
        href: "/servicii/google-ads-analytics/google-ads-conversion-tracking",
      },
      {
        label: "POAS tracking",
        href: "/servicii/google-ads-analytics/poas-tracking",
      },
    ],
    categorySlug: "google-ads-analytics",
    image: "/images/portfolio/profit-bid.jpg",
  },
  {
    slug: "aplicatie-mobila",
    name: "Aplicație mobilă",
    seoTitle: "Aplicație mobilă | ZeroBug",
    seoDescription:
      "Aplicații mobile iOS, Android și Flutter: magazine, rezervări, loialitate. Dezvoltare pentru companii din România.",
    h1: "Aplicații mobile pentru business",
    intro:
      "iOS, Android sau Flutter — aplicații pentru magazine, rezervări, loialitate sau operațiuni interne. Scope clar, UI pe brand, mentenanță după lansare.",
    benefits: [
      "Flutter sau nativ pe obiectiv",
      "Integrare shop / backend",
      "UX mobil clar",
      "Store submission support",
    ],
    includes: [
      "Discovery",
      "UI",
      "Build",
      "QA",
      "Lansare stores",
    ],
    process: PROCESS,
    faqs: [
      {
        question: "Flutter e suficient?",
        answer:
          "De cele mai multe ori da pentru MVP și produse business. Nativ când ai cerințe speciale de platformă.",
      },
    ],
    ctaLinks: [
      {
        label: "Flutter",
        href: "/servicii/aplicatii-mobile/aplicatii-flutter-cross-platform",
      },
      { label: "Aplicații mobile", href: "/servicii/aplicatii-mobile" },
    ],
    categorySlug: "aplicatii-mobile",
    image: "/images/portfolio/spido.jpg",
  },
];

export function getIntentPage(slug: string): IntentPage | undefined {
  return INTENT_PAGES.find((p) => p.slug === slug);
}

export function isIntentSlug(slug: string): boolean {
  return INTENT_PAGES.some((p) => p.slug === slug);
}
