import type { ServicePage } from "./types";
import { slugifyServiceName } from "./types";

const IMG = "/images/portfolio/bijuteriairis.jpg";
const PROCESS = [
  {
    title: "Brief",
    body: "Catalog, volum, canale Ads, integrări obligatorii.",
  },
  {
    title: "Ofertă",
    body: "Scope pe etape, platformă recomandată, termene.",
  },
  {
    title: "Build",
    body: "Design, checkout, plăți, livrări — preview pe staging.",
  },
  {
    title: "Lansare",
    body: "Go-live, tracking, handoff și opțiuni de mentenanță.",
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
    categorySlug: "e-commerce",
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
    showMaintenanceCta: spec.maintenance,
  };
}

export const ECOMMERCE_PAGES: ServicePage[] = [
  page({
    name: "Creare magazin WooCommerce",
    seoDescription:
      "Creare magazin WooCommerce: catalog, checkout, plăți, curieri. Dezvoltare pe WordPress pentru magazine din România. Ofertă ZeroBug.",
    h1: "Creare magazin WooCommerce pentru retaileri din România",
    intro:
      "WooCommerce îți dă control pe WordPress — ideal când vrei flexibilitate, plugin-uri și cost de platformă predictibil. Construim magazine stabile, pregătite pentru comenzi reale și Ads.",
    benefits: [
      "Control total pe WordPress",
      "Logică custom când template-ul nu ajunge",
      "Integrări RO (plăți, curieri, facturare)",
      "Potrivit pentru mentenanță lunară",
    ],
    includes: [
      "Temă / design pe brand",
      "Catalog, atribute, variații",
      "Checkout + email-uri",
      "Plăți și shipping",
      "Checklist go-live",
    ],
    faqs: [
      {
        question: "Woo e mai bun decât Shopify?",
        answer:
          "Depinde. Woo = control și costuri flexibile. Shopify = operațiuni mai simple. Te ghidăm după catalog și echipă.",
      },
      {
        question: "Puteți prelua un magazin existent?",
        answer: "Da — audit, bugfix, redesign sau migrare.",
      },
    ],
    related: [
      "Optimizare magazin online",
      "Personalizare WooCommerce",
      "Checkout custom",
      "Dezvoltare Shopify",
    ],
    maintenance: true,
  }),
  page({
    name: "Dezvoltare Shopify",
    seoDescription:
      "Dezvoltare Shopify: temă, apps, checkout, setup brand D2C. Magazin online rapid de lansat. Ofertă ZeroBug.",
    h1: "Dezvoltare Shopify pentru branduri D2C",
    intro:
      "Shopify e rapid de lansat și solid la scală. Configurăm tema, apps esențiale, plăți și fluxuri de fulfillment pentru branduri care vor să vândă fără fretting pe hosting.",
    benefits: [
      "Time-to-launch scurt",
      "Hosting gestionat",
      "Ecosistem apps",
      "Bun pentru scaling Ads",
    ],
    includes: [
      "Setup magazin",
      "Temă pe brand",
      "Colecții / produse",
      "Apps esențiale",
      "Training admin",
    ],
    faqs: [
      {
        question: "Faceți și Shopify Plus?",
        answer:
          "Putem lucra pe Plus când volumul merită; pentru majoritatea startăm pe Shopify standard.",
      },
    ],
    related: [
      "Personalizare Shopify",
      "Migrare Shopify ↔ WooCommerce",
      "Creare magazin WooCommerce",
      "Optimizare magazin online",
    ],
  }),
  page({
    name: "Personalizare WooCommerce",
    seoDescription:
      "Personalizare WooCommerce: reguli de preț, checkout, shipping, UX. Extindem magazinul existent fără rebuild.",
    h1: "Personalizare WooCommerce pe nevoile magazinului tău",
    intro:
      "Ai deja Woo, dar îți lipsește o regulă de discount, un checkout sau un flux B2B? Extindem magazinul cu logică custom, curat și mentenabil.",
    benefits: [
      "Fără rebuild complet",
      "Logică pe business-ul tău",
      "Cod documentat",
      "Compatibil cu update-uri",
    ],
    includes: [
      "Analiză cerință",
      "Implementare pe staging",
      "Teste pe fluxuri critice",
      "Deploy + handoff",
    ],
    faqs: [
      {
        question: "Stricați tema la update?",
        answer:
          "Lucrăm pe child theme / plugin custom ca update-urile să rămână sigure.",
      },
    ],
    related: [
      "Creare magazin WooCommerce",
      "Checkout custom",
      "Sistem custom de discounturi",
      "WooCommerce performance optimization",
    ],
    maintenance: true,
  }),
  page({
    name: "Personalizare Shopify",
    seoDescription:
      "Personalizare Shopify: temă Liquid, apps, checkout extensibility. Magazin pe măsură brandului tău.",
    h1: "Personalizare Shopify — temă și fluxuri pe brand",
    intro:
      "Dincolo de tema din App Store: ajustăm Liquid, secțiuni, apps și fluxuri ca magazinul să arate și să vândă ca brandul tău.",
    benefits: [
      "UI pe brand",
      "Apps doar cât e nevoie",
      "Performanță pe storefront",
      "Pregătit pentru campanii",
    ],
    includes: [
      "Audit temă",
      "Custom sections",
      "Integrare apps",
      "QA pe mobil",
    ],
    faqs: [
      {
        question: "Checkout-ul Shopify se poate modifica?",
        answer:
          "În limitele Shopify (plus extensibility pe planuri potrivite). Îți spunem ce e fezabil înainte.",
      },
    ],
    related: [
      "Dezvoltare Shopify",
      "Checkout custom",
      "Optimizare magazin online",
    ],
  }),
  page({
    name: "Migrare Shopify ↔ WooCommerce",
    seoDescription:
      "Migrare Shopify ↔ WooCommerce: produse, clienți, comenzi, SEO. Cutover planificat, downtime minim.",
    h1: "Migrare Shopify ↔ WooCommerce fără pierderi",
    intro:
      "Schimbi platforma, păstrezi catalogul și semnalele SEO. Mapăm datele, setăm redirect-uri și facem cutover pe o fereastră agreată.",
    benefits: [
      "Migrare date complete",
      "Redirect-uri 301",
      "Staging înainte de go-live",
      "Smoke tests",
    ],
    includes: [
      "Audit sursă",
      "Plan migrare",
      "Import",
      "Redirect-uri",
      "Go-live",
    ],
    faqs: [
      {
        question: "Pierd review-urile?",
        answer:
          "Depinde de sursă; le migrăm când e tehnic posibil sau exportăm pentru reimport.",
      },
    ],
    related: [
      "Migrare Magento/PrestaShop → WooCommerce/Shopify",
      "Creare magazin WooCommerce",
      "Dezvoltare Shopify",
    ],
  }),
  page({
    name: "Migrare Magento/PrestaShop → WooCommerce/Shopify",
    seoDescription:
      "Migrare Magento sau PrestaShop către WooCommerce/Shopify. Catalog, clienți, SEO, cutover controlat.",
    h1: "Migrare Magento / PrestaShop către Woo sau Shopify",
    intro:
      "Platforme vechi, costuri mari, stack greu? Mutăm catalogul pe Woo sau Shopify cu plan de SEO și operațiuni după cutover.",
    benefits: [
      "Scăpare de legacy greu",
      "Stack modern",
      "SEO păstrat prin redirect-uri",
      "Training pe noul admin",
    ],
    includes: [
      "Audit Magento/Presta",
      "Mapare date",
      "Build țintă",
      "Migrare + redirect",
      "Go-live",
    ],
    faqs: [
      {
        question: "Cât durează?",
        answer:
          "De la 2–3 săptămâni (catalog mic) la câteva luni (catalog mare + custom). Îți dăm estimare după audit.",
      },
    ],
    related: [
      "Migrare Shopify ↔ WooCommerce",
      "Optimizare magazin online",
    ],
  }),
  page({
    name: "Optimizare magazin online",
    seoDescription:
      "Optimizare magazin online: viteză, checkout, conversie, Core Web Vitals. WooCommerce și Shopify.",
    h1: "Optimizare magazin online — viteză și conversie",
    intro:
      "Magazin lent sau abandon mare în checkout? Audităm tehnic + UX, prioritizăm fix-urile cu impact și măsurăm before/after.",
    benefits: [
      "Viteză mai bună",
      "Checkout mai clar",
      "Tracking verificat",
      "ROI pe efort",
    ],
    includes: [
      "Audit",
      "Fix-uri performanță",
      "UX checkout",
      "Raport",
    ],
    faqs: [
      {
        question: "E nevoie de redesign complet?",
        answer:
          "Nu neapărat. Multe câștiguri vin din performanță, trust și simplificarea pașilor.",
      },
    ],
    related: [
      "Creare magazin WooCommerce",
      "Checkout custom",
      "Google Ads + WooCommerce",
    ],
  }),
  page({
    name: "Dezvoltare funcționalități custom pentru magazine",
    seoDescription:
      "Funcționalități custom e-commerce: configuratoare, reguli, portaluri B2B. Woo, Shopify sau headless.",
    h1: "Funcționalități custom pentru magazine online",
    intro:
      "Când apps/plugin-urile nu acoperă fluxul, construim pe măsură: configuratoare, reguli de stoc, portaluri clienți.",
    benefits: [
      "Pe procesul tău",
      "Integrat în shop",
      "Testat pe staging",
      "Documentat",
    ],
    includes: [
      "Spec scurtă",
      "Implementare",
      "QA",
      "Deploy",
    ],
    faqs: [
      {
        question: "Woo sau Shopify?",
        answer: "Ambele — alegem stack-ul în funcție de magazinul tău actual.",
      },
    ],
    related: [
      "Custom product configurator",
      "B2B eCommerce",
      "Checkout custom",
    ],
  }),
  page({
    name: "Checkout custom",
    seoDescription:
      "Checkout custom WooCommerce/Shopify: pași simplificați, upsell, validări. Mai multe comenzi finalizate.",
    h1: "Checkout custom care reduce abandonul",
    intro:
      "Checkout-ul e locul unde se pierd bani. Simplificăm pașii, adăugăm validări și upsell-uri care nu încetinesc plata.",
    benefits: [
      "Mai puțini pași",
      "Mobil-first",
      "Validări clare",
      "Upsell controlat",
    ],
    includes: [
      "Audit funnel",
      "Design flux",
      "Implementare",
      "A/B ready tracking",
    ],
    faqs: [
      {
        question: "Pe Shopify e posibil?",
        answer:
          "Da, în limitele platformei; pe Woo avem flexibilitate maximă.",
      },
    ],
    related: [
      "Optimizare magazin online",
      "Personalizare WooCommerce",
      "Sistem custom de discounturi",
    ],
  }),
  page({
    name: "Sistem custom de discounturi",
    seoDescription:
      "Discounturi custom e-commerce: reguli complexe, cupoane, B2B. WooCommerce și Shopify.",
    h1: "Sistem custom de discounturi pentru e-commerce",
    intro:
      "Promoții care nu încap în plugin-ul standard: reguli pe cantitate, segment, colecție sau client B2B.",
    benefits: [
      "Reguli pe business",
      "Fără hack-uri fragile",
      "Raportare clară",
      "Compatibil campanii",
    ],
    includes: [
      "Mapare reguli",
      "Implementare",
      "Teste edge-case",
      "Documentare pentru marketing",
    ],
    faqs: [
      {
        question: "Se pot combina cu cupoane?",
        answer: "Da — definim priorități ca să nu se dubleze haotic.",
      },
    ],
    related: ["Checkout custom", "B2B eCommerce", "Catalog B2B cu prețuri personalizate"],
  }),
  page({
    name: "Abonamente / subscriptions",
    seoDescription:
      "Abonamente e-commerce: Woo Subscriptions sau Shopify. Reînnoiri, pauze, upgrade-uri.",
    h1: "Magazine cu abonamente / subscriptions",
    intro:
      "Vânzări recurente: box-uri, consumabile, SaaS fizic. Configurăm reînnoiri, pauze și comunicarea cu clientul.",
    benefits: [
      "Venit recurent",
      "Fluxuri de reînnoire",
      "Email-uri de lifecycle",
      "Raportare MRR de bază",
    ],
    includes: [
      "Alegere stack",
      "Setup produse recurente",
      "Politici pause/cancel",
      "Teste plăți",
    ],
    faqs: [
      {
        question: "Woo Subscriptions e obligatoriu?",
        answer:
          "E opțiunea matură pe Woo; pe Shopify există apps dedicate. Alegem împreună.",
      },
    ],
    related: ["Creare magazin WooCommerce", "Dezvoltare Shopify"],
  }),
  page({
    name: "Multi-vendor marketplace",
    seoDescription:
      "Marketplace multi-vendor: onboarding vânzători, comisioane, payouts. Woo sau custom.",
    h1: "Marketplace multi-vendor",
    intro:
      "Mai mulți vânzători, un catalog. Construim onboarding, comisioane, aprobări și payout-uri pe un model clar.",
    benefits: [
      "Onboarding vânzători",
      "Comisioane configurabile",
      "Moderare produse",
      "Rapoarte payout",
    ],
    includes: [
      "Model de business",
      "Implementare platformă",
      "Panel vendor",
      "Go-live",
    ],
    faqs: [
      {
        question: "Dokan / marketplace apps?",
        answer:
          "Le folosim când potrivesc; altfel custom. Depinde de complexitatea comisioanelor.",
      },
    ],
    related: ["B2B eCommerce", "Custom vendor marketplace"],
  }),
  page({
    name: "B2B eCommerce",
    seoDescription:
      "B2B eCommerce: prețuri pe rol, comenzi minime, aprobări. Magazine wholesale pe Woo/custom.",
    h1: "B2B eCommerce — prețuri și fluxuri wholesale",
    intro:
      "B2B nu e un shop cu TVA ascuns. Construim catalog pe roluri, prețuri personalizate, comenzi minime și aprobări interne.",
    benefits: [
      "Prețuri pe client",
      "Comenzi pe factură",
      "Aprobări",
      "Integrare ERP opțională",
    ],
    includes: [
      "Model roluri",
      "Catalog B2B",
      "Checkout wholesale",
      "Integrări",
    ],
    faqs: [
      {
        question: "Se poate pe Shopify?",
        answer:
          "Da, cu limitări; Woo/custom e adesea mai flexibil pentru wholesale complex.",
      },
    ],
    related: [
      "Catalog B2B cu prețuri personalizate",
      "Integrare ERP",
      "Sincronizare stocuri și prețuri",
    ],
  }),
  page({
    name: "Catalog B2B cu prețuri personalizate",
    seoDescription:
      "Catalog B2B cu prețuri personalizate pe client/grup. WooCommerce sau portal custom.",
    h1: "Catalog B2B cu prețuri personalizate",
    intro:
      "Fiecare client vede prețul lui. Implementăm liste de preț, grupuri și vizibilitate pe rol — fără Excel-uri paralele.",
    benefits: [
      "Prețuri pe contract",
      "Vizibilitate controlată",
      "Update din ERP",
      "Audit trail",
    ],
    includes: [
      "Model prețuri",
      "Implementare",
      "Import/sync",
      "QA pe roluri",
    ],
    faqs: [
      {
        question: "Sync cu ERP?",
        answer: "Da — frecvent legăm listele de preț de ERP/CRM.",
      },
    ],
    related: ["B2B eCommerce", "Sincronizare stocuri și prețuri"],
  }),
  page({
    name: "Integrare furnizori / dropshipping",
    seoDescription:
      "Integrare furnizori și dropshipping: stocuri, comenzi, AWB. Automatizare pentru magazine RO.",
    h1: "Integrare furnizori / dropshipping",
    intro:
      "Comenzile pleacă la furnizor automat, stocurile se actualizează. Legăm feed-uri și API-uri ca să reduci munca manuală.",
    benefits: [
      "Mai puțin operațional manual",
      "Stocuri actualizate",
      "Comenzi către furnizor",
      "Scalabil pe SKU",
    ],
    includes: [
      "Mapare furnizori",
      "Integrare API/feed",
      "Reguli stoc",
      "Monitorizare erori",
    ],
    faqs: [
      {
        question: "Merge cu mai mulți furnizori?",
        answer: "Da — cu reguli de prioritate pe stoc/preț.",
      },
    ],
    related: [
      "Import automat produse",
      "Sincronizare stocuri și prețuri",
      "Automatizare procesare comenzi",
    ],
  }),
  page({
    name: "Import automat produse",
    seoDescription:
      "Import automat produse e-commerce din XML/CSV/API. Mapping atribute, imagini, stoc.",
    h1: "Import automat produse în magazin",
    intro:
      "Mii de SKU-uri nu se bagă manual. Construim importuri recurente din feed-uri sau API, cu validări și log-uri.",
    benefits: [
      "Import recurent",
      "Mapare atribute",
      "Log-uri de erori",
      "Idempotent updates",
    ],
    includes: [
      "Analiză feed",
      "Mapping",
      "Job-uri programate",
      "Alerting",
    ],
    faqs: [
      {
        question: "XML de la furnizor e „murdar”?",
        answer: "Da, de obicei — curățăm și normalizăm în pipeline.",
      },
    ],
    related: [
      "Integrare furnizori / dropshipping",
      "Sincronizare stocuri și prețuri",
    ],
  }),
  page({
    name: "Sincronizare stocuri și prețuri",
    seoDescription:
      "Sincronizare stocuri și prețuri magazin↔ERP/furnizor. Near real-time pentru e-commerce.",
    h1: "Sincronizare stocuri și prețuri",
    intro:
      "Stoc greșit = oversell. Sync între magazin, ERP și furnizori, cu conflicte gestionate și retry.",
    benefits: [
      "Mai puține oversell-uri",
      "Prețuri aliniate",
      "Retry pe erori",
      "Vizibilitate în log-uri",
    ],
    includes: [
      "Design sync",
      "Implementare",
      "Monitorizare",
      "Documentare",
    ],
    faqs: [
      {
        question: "Cât de des sync?",
        answer:
          "De la câteva minute la nearly real-time — pe volumul și API-ul sursei.",
      },
    ],
    related: ["Integrare ERP", "Import automat produse", "B2B eCommerce"],
  }),
  page({
    name: "Automatizare procesare comenzi",
    seoDescription:
      "Automatizare comenzi e-commerce: AWB, facturi, statusuri, notificări. Mai puțin copy-paste.",
    h1: "Automatizare procesare comenzi",
    intro:
      "Din „comandă nouă” la AWB + factură + email fără pași manuali. Orchestrăm Woo/Shopify cu curieri și SmartBill.",
    benefits: [
      "Timp operațional redus",
      "Mai puține erori",
      "Statusuri consistente",
      "Scalare pe volum",
    ],
    includes: [
      "Mapare flux",
      "Integrări",
      "Reguli pe status",
      "Alerting",
    ],
    faqs: [
      {
        question: "Includeți curieri RO?",
        answer: "Da — Sameday, FAN, DPD și alții pe API.",
      },
    ],
    related: [
      "Integrare curier / AWB",
      "Integrare SmartBill",
      "Optimizare magazin online",
    ],
  }),
];
