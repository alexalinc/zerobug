import type { ServicePage } from "./types";
import { buildCategoryServicePages } from "./generate";

const IMG = "/images/portfolio/profit-bid.jpg";
const PROCESS = [
  {
    title: "Audit",
    body: "Ce e măsurat greșit sau deloc.",
  },
  {
    title: "Design evenimente",
    body: "Conversii, item-uri, profit dacă e cazul.",
  },
  {
    title: "Implementare",
    body: "GTM / GA4 / server-side pe staging.",
  },
  {
    title: "Validare",
    body: "Teste + handoff către media buyer.",
  },
];

const RICH: Record<
  string,
  {
    seoDescription: string;
    h1: string;
    intro: string;
    benefits: string[];
    includes: string[];
    faqs: { question: string; answer: string }[];
  }
> = {
  "Google Ads conversion tracking": {
    seoDescription:
      "Google Ads conversion tracking corect: tag-uri, Enhanced Conversions, deduplicare. Pentru magazine și lead-gen din România.",
    h1: "Google Ads conversion tracking care nu minte",
    intro:
      "Fără conversii corecte, optimizarea Ads e pe noroc. Reparăm și configurăm tracking-ul ca bid-urile să vadă realitatea.",
    benefits: [
      "Conversii de încredere",
      "Enhanced Conversions",
      "Deduplicare",
      "Documentație pentru buyer",
    ],
    includes: ["Audit", "Setup", "Teste", "Docs"],
    faqs: [
      {
        question: "Merge cu GA4?",
        answer: "Da — aliniem evenimentele GA4 cu conversiile Ads.",
      },
    ],
  },
  "Server-side conversion tracking": {
    seoDescription:
      "Server-side conversion tracking: GTM server, rezistență la adblock, date mai complete.",
    h1: "Server-side conversion tracking",
    intro:
      "Browser-ul pierde evenimente. Server-side îmbunătățește colectarea și controlul pe datele trimise către Ads.",
    benefits: [
      "Mai multe hit-uri valide",
      "Control pe payload",
      "Potrivit e-commerce",
      "Compatibil GA4/Ads",
    ],
    includes: ["Architură", "GTM server", "Tag-uri", "QA"],
    faqs: [
      {
        question: "E scump de hostat?",
        answer:
          "Costul e modest față de media waste-ul din tracking prost — îți arătăm opțiunile.",
      },
    ],
  },
  "Google Ads + WooCommerce": {
    seoDescription:
      "Google Ads + WooCommerce: conversii purchase, item-uri, remarketing. Tracking pe magazin Woo.",
    h1: "Google Ads pe WooCommerce — tracking pe purchase",
    intro:
      "Din view_item la purchase, cu valori corecte. Legăm Woo de Ads/GA4 ca ROAS-ul să aibă sens.",
    benefits: [
      "Purchase value corect",
      "Remarketing feed-ready",
      "Compatible GTM",
      "Teste pe staging",
    ],
    includes: ["Mapare evenimente", "Implementare", "QA comenzi", "Handoff"],
    faqs: [
      {
        question: "Includeți Merchant Center?",
        answer: "Ca pachet separat sau împreună — vezi feed-uri.",
      },
    ],
  },
  "Google Ads + Shopify": {
    seoDescription:
      "Google Ads + Shopify: pixel/conversii, GA4, purchase tracking pe storefront Shopify.",
    h1: "Google Ads pe Shopify",
    intro:
      "Shopify + Ads fără evenimente dublate sau lipsă. Curățăm setup-ul native + GTM unde e nevoie.",
    benefits: [
      "Fără dubluri",
      "Purchase corect",
      "GA4 aliniat",
      "Handoff buyer",
    ],
    includes: ["Audit", "Fix", "Teste", "Docs"],
    faqs: [
      {
        question: "Shopify markets?",
        answer: "Le luăm în calcul la valorile de conversie pe piață.",
      },
    ],
  },
  "Profit tracking pentru eCommerce": {
    seoDescription:
      "Profit tracking e-commerce: COGS, fees, POAS. Vezi profitul, nu doar revenue.",
    h1: "Profit tracking pentru e-commerce",
    intro:
      "ROAS mare pe produse cu marjă mică te ruinează. Legăm costurile de produs și fees ca să vezi profitul pe campanie.",
    benefits: [
      "POAS / profit",
      "COGS în date",
      "Decizii pe marjă",
      "Dashboard",
    ],
    includes: ["Model costuri", "Pipeline date", "Dashboard", "Training"],
    faqs: [
      {
        question: "De unde luăm COGS?",
        answer: "ERP, feed, sau import — mapăm ce ai deja.",
      },
    ],
  },
  "POAS tracking": {
    seoDescription:
      "POAS tracking: profit on ad spend. Optimizare Ads pe profit, nu pe revenue.",
    h1: "POAS tracking — profit pe Ads",
    intro:
      "POAS = profit / ad spend. Construim măsurarea ca media buyer-ul să scaleze ce e cu adevărat profitabil.",
    benefits: [
      "Focus pe profit",
      "Integrare Ads",
      "Vizibilitate pe SKU",
      "Mai puțin waste",
    ],
    includes: ["Definire POAS", "Implementare", "Validare", "Handoff"],
    faqs: [
      {
        question: "Înlocuiește ROAS?",
        answer: "Nu neapărat — îl completează cu realitatea marjelor.",
      },
    ],
  },
  "COGS tracking": {
    seoDescription:
      "COGS tracking în e-commerce analytics: cost produs în GA4/dashboard-uri.",
    h1: "COGS tracking pentru magazine online",
    intro:
      "Fără cost de produs, „profitul” e ficțiune. Ingestăm COGS în pipeline-ul de analytics.",
    benefits: [
      "Marjă vizibilă",
      "POAS posibil",
      "Alertă pe SKU toxice",
      "Sync din ERP/feed",
    ],
    includes: ["Sursă COGS", "Mapare", "Pipeline", "QA"],
    faqs: [
      {
        question: "COGS variază des?",
        answer: "Atunci sync-ul trebuie frecvent — îl proiectăm așa.",
      },
    ],
  },
  "Google Merchant Center feeds": {
    seoDescription:
      "Google Merchant Center feeds: product feed curat, erori remediare, sync Woo/Shopify.",
    h1: "Feed-uri Google Merchant Center",
    intro:
      "Feed respins = zero Shopping. Construim și reparăm feed-uri ca produsele să intre și să rămână aprobate.",
    benefits: [
      "Mai puține disapprovals",
      "Atribute complete",
      "Sync automat",
      "Monitorizare",
    ],
    includes: ["Audit feed", "Fix mapping", "Automatizare", "Monitor"],
    faqs: [
      {
        question: "Woo și Shopify?",
        answer: "Ambele — plus feed-uri custom din ERP.",
      },
    ],
  },
  "Product feeds custom": {
    seoDescription:
      "Product feeds custom XML/CSV pentru Ads, comparatoare, parteneri.",
    h1: "Product feeds custom",
    intro:
      "Feed pe specificația partenerului: mapare, filtrare, programare. Nu doar „export din plugin”.",
    benefits: [
      "Spec partener",
      "Filtre pe stoc/marjă",
      "Programat",
      "Log-uri",
    ],
    includes: ["Spec", "Pipeline", "Hosting feed", "QA"],
    faqs: [
      {
        question: "Mai multe feed-uri?",
        answer: "Da — câte canale, câte variante.",
      },
    ],
  },
  "GA4 implementation": {
    seoDescription:
      "Implementare GA4: evenimente e-commerce, conversii, debug. Magazin și lead-gen.",
    h1: "Implementare GA4",
    intro:
      "GA4 configurat serios: evenimente, item-uri, conversii, filtre. Nu doar „codul în header”.",
    benefits: [
      "Evenimente corecte",
      "DebugView curat",
      "Compatibil Ads",
      "Docs",
    ],
    includes: ["Plan evenimente", "GTM/GA4", "QA", "Handoff"],
    faqs: [
      {
        question: "Migrare din UA?",
        answer: "UA e mort — reconstruim pe GA4 corect, nu 1:1 orb.",
      },
    ],
  },
  "Google Tag Manager": {
    seoDescription:
      "Google Tag Manager: containere curate, tag-uri, trigger-e, consent mode.",
    h1: "Google Tag Manager — setup curat",
    intro:
      "GTM fără haos: naming, foldere, versiuni, consent. Tag-uri Ads/Meta/GA4 sub control.",
    benefits: [
      "Ordine în container",
      "Release-uri cu versiuni",
      "Consent-aware",
      "Mai puține conflicte",
    ],
    includes: ["Audit", "Rebuild/curățenie", "Publish", "Docs"],
    faqs: [
      {
        question: "Server-side GTM?",
        answer: "Da, când merită — vezi server-side tracking.",
      },
    ],
  },
  "Enhanced Conversions": {
    seoDescription:
      "Enhanced Conversions Google Ads: date hashing, match rate mai bun.",
    h1: "Enhanced Conversions",
    intro:
      "Trimitem date hashed (email etc.) ca Google să potrivească mai bine conversiile — GDPR-aware.",
    benefits: [
      "Match rate mai bun",
      "Compatibil consent",
      "Pe web și unde e suportat",
      "QA",
    ],
    includes: ["Setup", "Validare", "Docs"],
    faqs: [
      {
        question: "E legal?",
        answer:
          "Cu hashing și bază legală/consent corecte — te ghidăm pe implementarea tehnică.",
      },
    ],
  },
  "Dashboard-uri de profit": {
    seoDescription:
      "Dashboard-uri de profit e-commerce: Ads, marjă, POAS. Looker/Sheets/custom.",
    h1: "Dashboard-uri de profit",
    intro:
      "Un ecran cu ce contează: profit pe canal, pe campanie, pe SKU. Nu 40 de grafice vanity.",
    benefits: [
      "Decizii pe profit",
      "Surse unificate",
      "Refresh automat",
      "Training scurt",
    ],
    includes: ["KPI-uri", "Pipeline", "UI", "Handoff"],
    faqs: [
      {
        question: "Looker Studio?",
        answer: "Da, sau alternativă — pe stack-ul tău.",
      },
    ],
  },
  "Dashboard-uri custom pentru eCommerce": {
    seoDescription:
      "Dashboard-uri custom e-commerce: operațiuni, stoc, comenzi, marketing.",
    h1: "Dashboard-uri custom pentru e-commerce",
    intro:
      "Operațiuni + marketing pe același tablou: comenzi, AOV, retururi, stoc critic, Ads.",
    benefits: [
      "Pe procesul tău",
      "Alerte",
      "Surse multiple",
      "Mobil ok",
    ],
    includes: ["Discovery", "Build", "Alerte", "Docs"],
    faqs: [
      {
        question: "Live din Woo?",
        answer: "Da — plus Ads, SmartBill, ERP dacă există.",
      },
    ],
  },
};

export function buildAdsPages(): ServicePage[] {
  const generated = buildCategoryServicePages("google-ads-analytics");
  return generated.map((g) => {
    const rich = RICH[g.name];
    if (!rich) return g;
    return {
      ...g,
      seoDescription: rich.seoDescription,
      h1: rich.h1,
      intro: rich.intro,
      benefits: rich.benefits,
      includes: rich.includes,
      faqs: rich.faqs,
      process: PROCESS,
      image: IMG,
      relatedSlugs: g.relatedSlugs,
    };
  });
}
