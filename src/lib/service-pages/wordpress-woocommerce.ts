import type { ServicePage } from "./types";
import { slugifyServiceName } from "./types";

const IMG = "/images/portfolio/mercana.jpg";
const PROCESS = [
  {
    title: "Brief",
    body: "Ce site/magazin ai, ce doare, ce obiectiv ai.",
  },
  {
    title: "Ofertă",
    body: "Scope clar: build, fix, performance sau mentenanță.",
  },
  {
    title: "Implementare",
    body: "Staging, teste, deploy controlat.",
  },
  {
    title: "Handoff",
    body: "Documentare + opțiune de mentenanță lunară.",
  },
];

type Spec = {
  name: string;
  seoDescription: string;
  h1: string;
  intro: string;
  benefits: string[];
  includes: string[];
  faqs: { question: string; answer: string }[];
  related: string[];
  maintenance?: boolean;
};

function page(spec: Spec): ServicePage {
  return {
    slug: slugifyServiceName(spec.name),
    categorySlug: "wordpress-woocommerce",
    name: spec.name,
    seoTitle: `${spec.name} | ZeroBug`,
    seoDescription: spec.seoDescription,
    h1: spec.h1,
    intro: spec.intro,
    benefits: spec.benefits,
    includes: spec.includes,
    process: PROCESS,
    faqs: spec.faqs,
    relatedSlugs: spec.related.map(slugifyServiceName),
    image: IMG,
    showMaintenanceCta: spec.maintenance ?? true,
  };
}

export const WORDPRESS_PAGES: ServicePage[] = [
  page({
    name: "Creare magazin online WooCommerce",
    seoDescription:
      "Creare magazin online WooCommerce pe WordPress: catalog, plăți, livrări. Pentru retaileri din România.",
    h1: "Creare magazin online WooCommerce",
    intro:
      "Magazin Woo pe WordPress — control, flexibilitate și cost de platformă bun. Construim de la temă la checkout, gata de comenzi.",
    benefits: [
      "Stack familiar WordPress",
      "Extensibil cu plugin-uri / custom",
      "Integrări RO",
      "Mentenanță ușor de adăugat",
    ],
    includes: [
      "Design",
      "Catalog",
      "Checkout",
      "Plăți/shipping",
      "Go-live",
    ],
    faqs: [
      {
        question: "Diferența față de pagina e-commerce?",
        answer:
          "Aceeași expertiză Woo — aici accent pe ecosistemul WordPress/Woo și mentenanță.",
      },
    ],
    related: [
      "WooCommerce development",
      "WooCommerce performance optimization",
      "WordPress maintenance",
    ],
  }),
  page({
    name: "WooCommerce development",
    seoDescription:
      "WooCommerce development: feature-uri, hook-uri, plugin-uri. Magazin pe măsură.",
    h1: "WooCommerce development — feature-uri pe măsură",
    intro:
      "Dezvoltare Woo dincolo de configurare: hook-uri, template-uri, integrări și logică de business.",
    benefits: [
      "Cod pe WordPress standards",
      "Staging înainte de prod",
      "Compatibil update-uri",
      "Documentat",
    ],
    includes: ["Spec", "Dev", "QA", "Deploy"],
    faqs: [
      {
        question: "Lucrați pe magazin live?",
        answer: "Preferăm staging; pe live doar hotfix-uri controlate.",
      },
    ],
    related: [
      "Plugin WooCommerce custom",
      "Custom checkout",
      "WooCommerce bug fixing",
    ],
  }),
  page({
    name: "Plugin WordPress custom",
    seoDescription:
      "Plugin WordPress custom: funcții pe site fără a încărca tema. Cod curat, update-safe.",
    h1: "Plugin WordPress custom",
    intro:
      "Logica de business în plugin, nu în temă — ca update-urile să nu-ți șteargă munca.",
    benefits: [
      "Separat de temă",
      "Reutilizabil",
      "Update-safe",
      "Securizat",
    ],
    includes: ["Spec", "Plugin", "Admin UI dacă e nevoie", "Docs"],
    faqs: [
      {
        question: "Poate înlocui 5 plugin-uri grele?",
        answer: "Adesea da — consolidăm ce e critic într-un plugin ușor.",
      },
    ],
    related: ["Plugin WooCommerce custom", "WordPress maintenance"],
  }),
  page({
    name: "Plugin WooCommerce custom",
    seoDescription:
      "Plugin WooCommerce custom: shipping, pricing, checkout. Extinderi mentenabile.",
    h1: "Plugin WooCommerce custom",
    intro:
      "Când un plugin din directory nu face exact ce trebuie, scriem unul care face — și atât.",
    benefits: [
      "Pe fluxul tău",
      "Fără bloat",
      "Testat pe Woo actual",
      "Handoff clar",
    ],
    includes: ["Analiză", "Dev", "Teste comenzi", "Deploy"],
    faqs: [
      {
        question: "Compatibil HPOS?",
        answer: "Da, țintim compatibilitate cu Woo modern (HPOS inclus).",
      },
    ],
    related: [
      "Custom shipping logic",
      "Custom pricing logic",
      "WooCommerce development",
    ],
  }),
  page({
    name: "Custom checkout",
    seoDescription:
      "Custom checkout WooCommerce: câmpuri, pași, validări. Conversie mai bună pe mobil.",
    h1: "Custom checkout WooCommerce",
    intro:
      "Checkout-ul standard e un start. Îl adaptăm: câmpuri RO, validări, upsell, layout mobil.",
    benefits: [
      "Mai puține abandonuri",
      "Câmpuri locale",
      "Mobil-first",
      "Tracking pe pași",
    ],
    includes: ["Audit funnel", "UI", "Implementare", "QA plăți"],
    faqs: [
      {
        question: "Strică gateway-urile?",
        answer: "Testăm Stripe/PayU etc. pe staging înainte de go-live.",
      },
    ],
    related: [
      "WooCommerce performance optimization",
      "Custom pricing logic",
    ],
  }),
  page({
    name: "Custom product configurator",
    seoDescription:
      "Configurator produse WooCommerce: opțiuni, preț dinamic, preview. Pentru produse complexe.",
    h1: "Configurator de produs WooCommerce",
    intro:
      "Produse cu multe opțiuni (materiale, dimensiuni, add-ons)? Configurator clar, preț live, coș corect.",
    benefits: [
      "UX pentru produse complexe",
      "Preț dinamic",
      "Mai puține comenzi greșite",
      "Integrat în Woo",
    ],
    includes: ["Model opțiuni", "UI", "Logică preț", "QA"],
    faqs: [
      {
        question: "Merge cu variații native?",
        answer:
          "Uneori da; pentru cazuri grele e mai bun un configurator dedicat.",
      },
    ],
    related: ["Plugin WooCommerce custom", "Custom pricing logic"],
  }),
  page({
    name: "Custom shipping logic",
    seoDescription:
      "Shipping custom WooCommerce: zone, greutate, curieri RO, costuri pe reguli.",
    h1: "Logică de shipping custom WooCommerce",
    intro:
      "Livrări pe greutate, județ, curier sau praguri de gratuitate — dincolo de zonele standard.",
    benefits: [
      "Costuri corecte",
      "Curieri RO",
      "Reguli pe coș",
      "Transparență la checkout",
    ],
    includes: ["Mapare reguli", "Implementare", "Teste coș", "Docs"],
    faqs: [
      {
        question: "AWB automat?",
        answer: "Da, ca proiect separat de integrare curier.",
      },
    ],
    related: ["Integrare curier / AWB", "Custom checkout"],
  }),
  page({
    name: "Custom pricing logic",
    seoDescription:
      "Pricing custom Woo: roluri, cantitate, contracte B2B. Prețuri pe măsură.",
    h1: "Logică de preț custom WooCommerce",
    intro:
      "Prețuri pe rol, cantitate sau contract — fără Excel paralel. Implementăm reguli clare în Woo.",
    benefits: [
      "B2B ready",
      "Reguli auditable",
      "Compatibil cupoane",
      "Sync ERP opțional",
    ],
    includes: ["Model", "Dev", "Teste roluri", "Handoff"],
    faqs: [
      {
        question: "Se vede prețul greșit în cache?",
        answer: "Gestionăm cache-ul pe pagini de produs/coș ca prețul să fie corect.",
      },
    ],
    related: ["Custom checkout", "Catalog B2B cu prețuri personalizate"],
  }),
  page({
    name: "Custom vendor marketplace",
    seoDescription:
      "Marketplace vendor pe WooCommerce: comisioane, onboarding, payouts.",
    h1: "Marketplace vendor pe WooCommerce",
    intro:
      "Multi-vendor pe Woo: vânzători, comisioane, moderare. Folosim soluții mature sau custom când e nevoie.",
    benefits: [
      "Onboarding vendor",
      "Comisioane",
      "Moderare",
      "Payout-uri",
    ],
    includes: ["Model", "Setup", "Panel vendor", "Go-live"],
    faqs: [
      {
        question: "Dokan sau custom?",
        answer: "Dokan/Marketplace când potrivește; custom pentru reguli atipice.",
      },
    ],
    related: ["Multi-vendor marketplace", "WooCommerce development"],
  }),
  page({
    name: "WooCommerce performance optimization",
    seoDescription:
      "Optimizare performanță WooCommerce: viteză, query-uri, cache, imagini. Core Web Vitals.",
    h1: "Optimizare performanță WooCommerce",
    intro:
      "Woo poate fi rapid. Tăiem plugin-uri inutile, optimizăm query-uri, cache și media — măsurăm LCP/INP.",
    benefits: [
      "Pagini mai rapide",
      "Admin mai ușor",
      "Mai bun pentru Ads/SEO",
      "Raport before/after",
    ],
    includes: ["Audit", "Fix-uri", "Cache", "Retest"],
    faqs: [
      {
        question: "Hosting-ul e problema?",
        answer:
          "Uneori. Audităm stack-ul; dacă hosting-ul e limită, îți spunem clar.",
      },
    ],
    related: [
      "WooCommerce bug fixing",
      "WordPress maintenance",
      "Optimizare magazin online",
    ],
  }),
  page({
    name: "WooCommerce bug fixing",
    seoDescription:
      "Bug fixing WooCommerce: erori coș, plăți, sync. Diagnostic și fix pe staging.",
    h1: "WooCommerce bug fixing",
    intro:
      "Coșul crapă, plata eșuează, stocul se desincronizează? Diagnosticăm cauza și reparăm fără a „învârti” plugin-uri la întâmplare.",
    benefits: [
      "Root cause",
      "Fix pe staging",
      "Fără guesswork",
      "Prevenire recidivă",
    ],
    includes: ["Repro", "Fix", "Regresie", "Deploy"],
    faqs: [
      {
        question: "Urgențe?",
        answer: "Da — prioritar pe plăți/checkout down.",
      },
    ],
    related: [
      "WooCommerce performance optimization",
      "WordPress malware/security cleanup",
    ],
  }),
  page({
    name: "WordPress malware/security cleanup",
    seoDescription:
      "Curățare malware WordPress: remove backdoors, hardening, restore. Apoi mentenanță.",
    h1: "Curățare malware / securitate WordPress",
    intro:
      "Site infectat sau redirecturi suspecte? Curățăm, închidem găurile, schimbăm secretele și propunem mentenanță ca să nu se repete.",
    benefits: [
      "Cleanup complet",
      "Hardening",
      "Monitorizare după",
      "Raport pentru tine",
    ],
    includes: [
      "Scan",
      "Cleanup",
      "Patch",
      "Reset acces",
      "Recomandări",
    ],
    faqs: [
      {
        question: "Google spune site hacked?",
        answer:
          "Curățăm și te ghidăm pe Search Console pentru review.",
      },
    ],
    related: ["WordPress maintenance", "WooCommerce bug fixing"],
  }),
  page({
    name: "WordPress maintenance",
    seoDescription:
      "Mentenanță WordPress lunară: update-uri, backup, securitate, support. Estimare pe /mentenanta.",
    h1: "Mentenanță WordPress lunară",
    intro:
      "Update-uri controlate, backup, ochi pe securitate și support când e urgent. Abonament lunar predictibil.",
    benefits: [
      "Predictibil",
      "Update-uri sigure",
      "Backup",
      "Răspuns la incidente",
    ],
    includes: [
      "Update-uri",
      "Backup",
      "Scan",
      "Raport",
      "Ore support",
    ],
    faqs: [
      {
        question: "Unde văd prețurile?",
        answer: "Pe pagina de mentenanță — configurator cu estimare.",
      },
    ],
    related: [
      "WordPress malware/security cleanup",
      "WooCommerce performance optimization",
    ],
  }),
  page({
    name: "WooCommerce migration",
    seoDescription:
      "Migrare WooCommerce: host nou, staging, sau de pe altă platformă. SEO păstrat.",
    h1: "Migrare WooCommerce",
    intro:
      "Muți hosting-ul sau aduci un shop pe Woo. Planificăm DNS, date, redirect-uri și smoke tests.",
    benefits: [
      "Downtime minim",
      "Date intacte",
      "SEO cu redirect-uri",
      "Checklist post-migrare",
    ],
    includes: ["Plan", "Migrare", "DNS", "QA"],
    faqs: [
      {
        question: "De pe Shopify?",
        answer: "Da — vezi și migrările din categoria e-commerce.",
      },
    ],
    related: [
      "Creare magazin online WooCommerce",
      "Migrare Shopify ↔ WooCommerce",
    ],
  }),
];
