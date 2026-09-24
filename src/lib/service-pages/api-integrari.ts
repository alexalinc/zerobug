import type { ServicePage } from "./types";
import { buildCategoryServicePages } from "./generate";

const IMG = "/images/portfolio/wootrack.jpg";
const PROCESS = [
  {
    title: "Brief",
    body: "Sisteme, volume, erori actuale, owner operațional.",
  },
  {
    title: "Design integrare",
    body: "Mapare câmpuri, frecvență, retry, alertare.",
  },
  {
    title: "Build",
    body: "API pe staging, teste pe cazuri reale.",
  },
  {
    title: "Go-live",
    body: "Cutover, monitorizare, handoff.",
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
  "Integrare SmartBill": {
    seoDescription:
      "Integrare SmartBill cu WooCommerce, Shopify sau ERP: facturi automate din comenzi. România.",
    h1: "Integrare SmartBill pentru magazine online",
    intro:
      "Comanda intră, factura iese — fără copy-paste. Legăm SmartBill de magazin sau ERP cu mapare TVA și produse.",
    benefits: [
      "Facturi automate",
      "Mai puține erori",
      "Mapare TVA",
      "Handoff contabil",
    ],
    includes: ["Analiză flux", "API SmartBill", "Teste", "Docs"],
    faqs: [
      {
        question: "Woo și Shopify?",
        answer: "Da — și endpoint-uri custom.",
      },
    ],
  },
  "Integrare Sameday / FAN / DPD etc.": {
    seoDescription:
      "Integrare curieri Sameday, FAN, DPD: AWB automat, tracking, statusuri în magazin.",
    h1: "Integrare curieri Sameday / FAN / DPD",
    intro:
      "AWB din admin sau automat la status. Tracking înapoi în magazin, mai puțin timp pe copy tracking number.",
    benefits: [
      "AWB automat",
      "Statusuri sync",
      "Mai multe curieri",
      "Mai puțin operațional",
    ],
    includes: ["Alegere curieri", "API", "Reguli", "QA"],
    faqs: [
      {
        question: "Un singur curier?",
        answer: "Poți începe cu unul și adăuga ulterior.",
      },
    ],
  },
  "Integrare curier / AWB": {
    seoDescription:
      "Integrare curier / AWB: generare AWB, etichete, tracking în Woo/Shopify.",
    h1: "Integrare curier / AWB",
    intro:
      "Generare AWB din comenzi, etichete, update status. Conectăm curierul de care ai nevoie.",
    benefits: [
      "AWB din comandă",
      "Etichete",
      "Tracking",
      "Reguli pe greutate/zonă",
    ],
    includes: ["Setup", "Mapare", "Teste", "Go-live"],
    faqs: [
      {
        question: "Multi-curier?",
        answer: "Da — cu reguli de selecție.",
      },
    ],
  },
  "Integrare ERP": {
    seoDescription:
      "Integrare ERP cu magazin online: stocuri, prețuri, comenzi, clienți.",
    h1: "Integrare ERP ↔ e-commerce",
    intro:
      "Magazinul și ERP-ul vorbesc aceeași limbă: stoc, preț, comandă. Sync bidirectional sau pe direcția care contează.",
    benefits: [
      "Stoc aliniat",
      "Comenzi în ERP",
      "Mai puțin Excel",
      "Retry pe erori",
    ],
    includes: ["Discovery", "Mapare", "Build", "Monitor"],
    faqs: [
      {
        question: "ERP-ul nostru e vechi?",
        answer: "Lucrăm cu API, CSV sau conectori — după ce expune.",
      },
    ],
  },
  "Integrare CRM": {
    seoDescription:
      "Integrare CRM: lead-uri din site/shop în hubspot/pipedrive/custom. Sync statusuri.",
    h1: "Integrare CRM",
    intro:
      "Lead-urile și clienții ajung în CRM cu sursa și contextul corect — fără CSV săptămânal.",
    benefits: [
      "Lead-uri complete",
      "Sursă UTM",
      "Update status",
      "Mai puțină muncă manuală",
    ],
    includes: ["Mapare câmpuri", "Webhooks/API", "QA", "Docs"],
    faqs: [
      {
        question: "HubSpot / Pipedrive?",
        answer: "Da, și CRM-uri custom via API.",
      },
    ],
  },
  "Integrare facturare": {
    seoDescription:
      "Integrare facturare e-commerce: SmartBill și altele. Facturi din comenzi.",
    h1: "Integrare facturare pentru e-commerce",
    intro:
      "Facturare legată de comenzi: serie, TVA, clienți. SmartBill sau alt provider.",
    benefits: [
      "Automatizare",
      "Conform fluxului tău",
      "Mai puține erori",
      "Export contabil",
    ],
    includes: ["Provider", "Mapare", "Teste", "Handoff"],
    faqs: [
      {
        question: "Doar SmartBill?",
        answer: "SmartBill e frecvent; putem și alți furnizori cu API.",
      },
    ],
  },
  "Integrare procesator de plăți": {
    seoDescription:
      "Integrare plăți: Stripe, PayU și altele pe Woo/Shopify/custom.",
    h1: "Integrare procesator de plăți",
    intro:
      "Plăți online corecte, webhook-uri, reconciliere. Setup și troubleshooting pe gateway-ul tău.",
    benefits: [
      "Checkout stabil",
      "Webhook-uri",
      "Refund-uri ok",
      "Log-uri",
    ],
    includes: ["Setup", "Test cards", "Go-live", "Docs"],
    faqs: [
      {
        question: "3D Secure?",
        answer: "Da — respectăm fluxul gateway-ului.",
      },
    ],
  },
  "Integrare Google Merchant Center": {
    seoDescription:
      "Integrare Google Merchant Center cu magazin: feed, sync, erori.",
    h1: "Integrare Google Merchant Center",
    intro:
      "Produsele în Shopping: feed curat, sync, remediere disapprovals.",
    benefits: [
      "Feed valid",
      "Sync",
      "Monitor erori",
      "Legătură Ads",
    ],
    includes: ["Feed", "Linking", "Fix", "Monitor"],
    faqs: [
      {
        question: "Dublură cu pagina de feeds?",
        answer:
          "Feeds = conținutul; aici + linking/cont și operațional Merchant.",
      },
    ],
  },
  "Integrare Google Ads / conversion tracking": {
    seoDescription:
      "Integrare Google Ads conversion tracking pe site/shop. Tag-uri și server-side.",
    h1: "Integrare Google Ads / conversion tracking",
    intro:
      "Conectăm site-ul de Ads cu conversii măsurate corect — pe web sau server-side.",
    benefits: [
      "Conversii corecte",
      "Deduplicare",
      "Compatibil GA4",
      "Handoff buyer",
    ],
    includes: ["Audit", "Implementare", "QA", "Docs"],
    faqs: [
      {
        question: "E același lucru cu pagina Ads?",
        answer:
          "Da ca intent — aici e unghiul „integrare tehnică pe proprietatea ta”.",
      },
    ],
  },
  "Integrare API custom": {
    seoDescription:
      "Integrare API custom între sisteme: sync, webhooks, cozi, monitorizare.",
    h1: "Integrare API custom",
    intro:
      "Două (sau zece) sisteme care trebuie să vorbească. Proiectăm contractul API, retry și observabilitate.",
    benefits: [
      "Contract clar",
      "Retry/backoff",
      "Log-uri",
      "Scalabil",
    ],
    includes: ["Design", "Build", "Tests", "Monitor"],
    faqs: [
      {
        question: "Realtime sau batch?",
        answer: "Ce merită — le putem combina.",
      },
    ],
  },
  "Dezvoltare API REST": {
    seoDescription:
      "Dezvoltare API REST: endpoints, auth, docs. Pentru produse și integrări.",
    h1: "Dezvoltare API REST",
    intro:
      "API-uri curate pentru mobile, parteneri sau integrări. Auth, versioning, documentație.",
    benefits: [
      "Contract stabil",
      "Auth",
      "Docs OpenAPI",
      "Rate limits",
    ],
    includes: ["Design", "Implementare", "Docs", "QA"],
    faqs: [
      {
        question: "GraphQL?",
        answer: "Putem — default-ul e REST când e suficient.",
      },
    ],
  },
};

export function buildApiPages(): ServicePage[] {
  const generated = buildCategoryServicePages("api-integrari");
  return generated.map((g) => {
    const rich = RICH[g.name];
    if (!rich) return g;
    return {
      ...g,
      ...rich,
      process: PROCESS,
      image: IMG,
    };
  });
}
