import type { LocalKeyword } from "./types";

const PROCESS_BUILD = [
  {
    title: "Brief",
    body: "Clarificăm obiectivul, constrângerile și cum preferi să lucrăm (remote sau întâlnire).",
  },
  {
    title: "Ofertă",
    body: "Primești scope, termene și pașii de livrare — fără surprize de mid-project.",
  },
  {
    title: "Implementare",
    body: "Lucrăm pe etape, cu preview și feedback rapid.",
  },
  {
    title: "Lansare",
    body: "Go-live, verificări și handoff documentat.",
  },
];

/** 12 money keywords × each city */
export const LOCAL_KEYWORDS: LocalKeyword[] = [
  {
    slug: "creare-magazin-online",
    name: "Creare magazin online",
    categorySlug: "e-commerce",
    nationalPath: "/servicii/creare-magazin-online",
    image: "/images/portfolio/bijuteriairis.jpg",
    seoTitleTpl: "Creare magazin online {in} | ZeroBug",
    seoDescriptionTpl:
      "Creare magazin online {in}: WooCommerce, Shopify sau custom. Ofertă pe etape pentru firme {from} și din județul apropiat.",
    h1Tpl: "Creare magazin online {in}",
    introTpl:
      "Construim magazine online pentru magazine și branduri {from}: catalog clar, checkout, plăți și livrări. Lucrăm remote în toată țara, cu kickoff și sync-uri potrivite pentru echipele {from}.",
    baseBenefits: [
      "Alegere platformă (Woo / Shopify / custom) pe obiectiv",
      "Checkout și fluxuri de comandă pe conversie",
      "Pregătit pentru feed-uri și Ads",
      "Integrări locale: facturare, curieri, plăți",
    ],
    baseIncludes: [
      "Structură catalog + categorii",
      "Design pe brand",
      "Plăți și metode de livrare",
      "Panou admin / training scurt",
      "Checklist go-live",
    ],
    baseProcess: PROCESS_BUILD,
    faqTpls: [
      {
        question: "Lucrați cu firme {from}?",
        answerTpl:
          "Da. Livrăm remote pentru clienți {from} și din județ. Putem programa call-uri sau întâlniri când proiectul o cere.",
      },
      {
        question: "WooCommerce sau Shopify?",
        answerTpl:
          "Depinde de catalog, buget și echipă. Pe pagina națională de creare magazin online explicăm diferențele — în ofertă alegem împreună.",
      },
    ],
  },
  {
    slug: "creare-magazin-woocommerce",
    name: "Creare magazin WooCommerce",
    categorySlug: "e-commerce",
    nationalPath: "/servicii/e-commerce/creare-magazin-woocommerce",
    image: "/images/portfolio/bijuteriairis.jpg",
    showMaintenanceCta: true,
    seoTitleTpl: "Creare magazin WooCommerce {in} | ZeroBug",
    seoDescriptionTpl:
      "Magazin WooCommerce {in}: catalog, checkout, plăți, curieri. Dezvoltare și mentenanță pentru magazine {from}.",
    h1Tpl: "Creare magazin WooCommerce {in}",
    introTpl:
      "WooCommerce e alegerea potrivită când vrei control pe WordPress. Construim magazine stabile pentru retaileri {from}, cu focus pe viteză, comenzi și integrări RO.",
    baseBenefits: [
      "Control total pe WordPress",
      "Plugin-uri și logică custom când trebuie",
      "Ușor de operat pentru echipa ta",
      "Potrivit pentru mentenanță lunară",
    ],
    baseIncludes: [
      "Temă / design pe brand",
      "Produse, categorii, atribute",
      "Plăți + shipping",
      "Email-uri de comandă",
      "Optimizări de bază de viteză",
    ],
    baseProcess: PROCESS_BUILD,
    faqTpls: [
      {
        question: "Puteți prelua un Woo existent {in}?",
        answerTpl:
          "Da — audit, bugfix, redesign sau migrare. Spune-ne URL-ul în ofertă.",
      },
      {
        question: "Includeți SmartBill sau curieri?",
        answerTpl:
          "Da, ca integrări separate sau în pachet. Le legăm de fluxul de comenzi Woo.",
      },
    ],
  },
  {
    slug: "creare-magazin-shopify",
    name: "Creare magazin Shopify",
    categorySlug: "e-commerce",
    nationalPath: "/servicii/e-commerce/dezvoltare-shopify",
    image: "/images/portfolio/bijuteriairis.jpg",
    seoTitleTpl: "Creare magazin Shopify {in} | ZeroBug",
    seoDescriptionTpl:
      "Magazin Shopify {in}: temă, checkout, apps și setup pentru branduri {from}. Ofertă ZeroBug.",
    h1Tpl: "Creare magazin Shopify {in}",
    introTpl:
      "Shopify e rapid de lansat și solid la scală. Configurăm magazine pentru branduri {from}: temă, apps esențiale, plăți și fluxuri de fulfillment.",
    baseBenefits: [
      "Time-to-launch scurt",
      "Ecosistem apps matur",
      "Hosting gestionat de Shopify",
      "Bun pentru branduri D2C",
    ],
    baseIncludes: [
      "Setup magazin + temă",
      "Colecții și produse",
      "Plăți și shipping",
      "Apps esențiale",
      "Training scurt pe admin",
    ],
    baseProcess: PROCESS_BUILD,
    faqTpls: [
      {
        question: "Shopify e potrivit {in}?",
        answerTpl:
          "Da, dacă vinzi online și vrei operațiuni simple. Pentru B2B complex sau logică foarte custom, uneori Woo/custom e mai bun — te ghidăm.",
      },
    ],
  },
  {
    slug: "creare-website",
    name: "Creare website",
    categorySlug: "web-development",
    nationalPath: "/servicii/web-development/creare-website-de-prezentare",
    image: "/images/portfolio/spido.jpg",
    showMaintenanceCta: true,
    seoTitleTpl: "Creare website {in} | ZeroBug",
    seoDescriptionTpl:
      "Creare website {in} pentru firme: prezentare, corporate sau landing. Design modern, SEO tehnic, ofertă pe etape.",
    h1Tpl: "Creare website {in}",
    introTpl:
      "Site-uri clare pentru companii {from}: structură pe conversie, mobil-first și bază SEO. Livrăm pe Next.js sau WordPress, după obiectiv.",
    baseBenefits: [
      "Structură orientată pe lead-uri",
      "Performanță pe mobil",
      "SEO tehnic de bază",
      "Formular și CTA-uri vizibile",
    ],
    baseIncludes: [
      "Sitemap + wireframe",
      "Design pe brand",
      "Implementare",
      "Pagini esențiale",
      "Go-live checklist",
    ],
    baseProcess: PROCESS_BUILD,
    faqTpls: [
      {
        question: "Cât durează un website pentru o firmă {from}?",
        answerTpl:
          "De obicei 2–4 săptămâni pentru un site de prezentare, după brief și materiale.",
      },
    ],
  },
  {
    slug: "creare-website-wordpress",
    name: "Creare website WordPress",
    categorySlug: "web-development",
    nationalPath: "/servicii/web-development/website-wordpress",
    image: "/images/portfolio/mercana.jpg",
    showMaintenanceCta: true,
    seoTitleTpl: "Creare website WordPress {in} | ZeroBug",
    seoDescriptionTpl:
      "Website WordPress {in}: CMS familiar, editare ușoară, SEO. Pentru firme {from} care vor autonomie pe conținut.",
    h1Tpl: "Creare website WordPress {in}",
    introTpl:
      "WordPress rămâne alegerea #1 când echipa ta vrea să editeze singură paginile. Construim site-uri curate și mentenabile pentru business-uri {from}.",
    baseBenefits: [
      "Editare ușoară în admin",
      "Ecosistem plugin-uri matur",
      "Potrivit pentru blog + servicii",
      "Mentenanță lunară disponibilă",
    ],
    baseIncludes: [
      "Temă / builder pe nevoie",
      "Pagini de bază",
      "Formulare",
      "Securitate de bază",
      "Training scurt",
    ],
    baseProcess: PROCESS_BUILD,
    faqTpls: [
      {
        question: "Includeți și mentenanță WordPress {in}?",
        answerTpl:
          "Da — update-uri, backup, securitate. Vezi și pagina de mentenanță sau cere ofertă pe site.",
      },
    ],
  },
  {
    slug: "redesign-website",
    name: "Redesign website",
    categorySlug: "web-development",
    nationalPath: "/servicii/web-development/redesign-website",
    image: "/images/portfolio/spido.jpg",
    showMaintenanceCta: true,
    seoTitleTpl: "Redesign website {in} | ZeroBug",
    seoDescriptionTpl:
      "Redesign website {in}: UI modern, UX clar, viteză. Păstrăm SEO și migrăm conținutul relevant.",
    h1Tpl: "Redesign website {in}",
    introTpl:
      "Site-ul tău arată învechit sau nu convertește? Refacem experiența pentru branduri {from}, cu migrare atentă a URL-urilor și a conținutului valoros.",
    baseBenefits: [
      "UI/UX actual",
      "Păstrare semnale SEO",
      "Viteză mai bună",
      "Mesaj clar pe servicii",
    ],
    baseIncludes: [
      "Audit scurt al site-ului actual",
      "Nou design + structură",
      "Migrare conținut",
      "Redirect-uri unde e nevoie",
      "Go-live",
    ],
    baseProcess: PROCESS_BUILD,
    faqTpls: [
      {
        question: "Pierd pozițiile Google după redesign?",
        answerTpl:
          "Nu dacă migrăm corect: mapare URL, redirect-uri 301, păstrare headings/meta esențiale. Planificăm asta în ofertă.",
      },
    ],
  },
  {
    slug: "mentenanta-wordpress",
    name: "Mentenanță WordPress",
    categorySlug: "wordpress-woocommerce",
    nationalPath: "/mentenanta",
    image: "/images/portfolio/mercana.jpg",
    showMaintenanceCta: true,
    seoTitleTpl: "Mentenanță WordPress {in} | ZeroBug",
    seoDescriptionTpl:
      "Mentenanță WordPress {in}: update-uri, backup, securitate, support. Abonament lunar pentru site-uri {from}.",
    h1Tpl: "Mentenanță WordPress {in}",
    introTpl:
      "Site-ul WordPress / Woo trebuie actualizat și protejat. Oferim mentenanță lunară pentru companii {from}: backup, update-uri, monitorizare și intervenții.",
    baseBenefits: [
      "Update-uri controlate",
      "Backup-uri regulate",
      "Răspuns la incidente",
      "Cost lunar predictibil",
    ],
    baseIncludes: [
      "Update core / teme / plugin-uri",
      "Backup",
      "Scan securitate de bază",
      "Raport lunar scurt",
      "Ore de support conform planului",
    ],
    baseProcess: [
      {
        title: "Audit",
        body: "Vedem starea site-ului, plugin-urile și riscurile.",
      },
      {
        title: "Plan",
        body: "Alegi pachetul de mentenanță potrivit.",
      },
      {
        title: "Onboarding",
        body: "Accese, backup, checklist de monitorizare.",
      },
      {
        title: "Operare",
        body: "Update-uri lunare + intervenții când e nevoie.",
      },
    ],
    faqTpls: [
      {
        question: "Aveți și cleanup malware {in}?",
        answerTpl:
          "Da — putem curăța și securiza, apoi trece pe mentenanță ca să nu se repete.",
      },
    ],
  },
  {
    slug: "optimizare-magazin-online",
    name: "Optimizare magazin online",
    categorySlug: "e-commerce",
    nationalPath: "/servicii/e-commerce/optimizare-magazin-online",
    image: "/images/portfolio/bijuteriairis.jpg",
    seoTitleTpl: "Optimizare magazin online {in} | ZeroBug",
    seoDescriptionTpl:
      "Optimizare magazin online {in}: viteză, checkout, conversie, tracking. Pentru magazine Woo/Shopify {from}.",
    h1Tpl: "Optimizare magazin online {in}",
    introTpl:
      "Dacă magazinul încarcă greu sau pierde comenzi în checkout, optimizăm tehnic și pe conversie — pentru shop-uri {from} pe Woo sau Shopify.",
    baseBenefits: [
      "Core Web Vitals mai bune",
      "Checkout mai clar",
      "Tracking corect pentru Ads",
      "Recomandări pe ROI",
    ],
    baseIncludes: [
      "Audit tehnic + UX scurt",
      "Fix-uri de performanță",
      "Îmbunătățiri checkout",
      "Verificare tracking",
      "Raport before/after",
    ],
    baseProcess: PROCESS_BUILD,
    faqTpls: [
      {
        question: "Lucrați pe magazinul nostru existent {in}?",
        answerTpl:
          "Da. Nu e nevoie de rebuild complet — începem cu audit și prioritizăm ce aduce cel mai mult.",
      },
    ],
  },
  {
    slug: "integrare-smartbill",
    name: "Integrare SmartBill",
    categorySlug: "api-integrari",
    nationalPath: "/servicii/api-integrari/integrare-smartbill",
    image: "/images/portfolio/wootrack.jpg",
    seoTitleTpl: "Integrare SmartBill {in} | ZeroBug",
    seoDescriptionTpl:
      "Integrare SmartBill {in}: facturi automate din Woo/Shopify/ERP. Pentru firme {from} cu volum de comenzi.",
    h1Tpl: "Integrare SmartBill {in}",
    introTpl:
      "Legăm magazinul sau ERP-ul de SmartBill ca facturile să plece automat. Ideal pentru retaileri {from} care vor mai puțină muncă manuală pe contabilitate.",
    baseBenefits: [
      "Facturi din comenzi fără copy-paste",
      "Mai puține erori umane",
      "Potrivit Woo / Shopify / custom",
      "Documentare pentru contabil",
    ],
    baseIncludes: [
      "Analiză flux comenzi → factură",
      "Implementare API SmartBill",
      "Mapare produse / TVA",
      "Teste pe staging",
      "Handoff",
    ],
    baseProcess: PROCESS_BUILD,
    faqTpls: [
      {
        question: "SmartBill e deja folosit {in} de contabilul nostru — merge?",
        answerTpl:
          "Da. Lucrăm pe contul existent și mapăm exact ce așteaptă contabilitatea.",
      },
    ],
  },
  {
    slug: "google-ads-tracking",
    name: "Google Ads tracking",
    categorySlug: "google-ads-analytics",
    nationalPath:
      "/servicii/google-ads-analytics/google-ads-conversion-tracking",
    image: "/images/portfolio/profit-bid.jpg",
    seoTitleTpl: "Google Ads tracking {in} | ZeroBug",
    seoDescriptionTpl:
      "Google Ads conversion tracking {in}: GA4, GTM, Enhanced Conversions. Măsurare corectă pentru magazine {from}.",
    h1Tpl: "Google Ads tracking {in}",
    introTpl:
      "Fără tracking corect, Ads aruncă bani. Configurăm conversii, GA4 și GTM pentru magazine și lead-gen {from} — inclusiv server-side când merită.",
    baseBenefits: [
      "Conversii măsurate corect",
      "GA4 + GTM curat",
      "Enhanced Conversions",
      "Bază pentru POAS / profit",
    ],
    baseIncludes: [
      "Audit tracking existent",
      "Setup / reparare tag-uri",
      "Teste pe preview",
      "Documentație evenimente",
      "Handoff către media buyer",
    ],
    baseProcess: PROCESS_BUILD,
    faqTpls: [
      {
        question: "Lucrați cu agenția noastră de Ads {from}?",
        answerTpl:
          "Da — livrăm tracking-ul tehnic și colaborăm cu media buyer-ul ca optimizările să aibă date reale.",
      },
    ],
  },
  {
    slug: "aplicatie-mobila",
    name: "Aplicație mobilă",
    categorySlug: "aplicatii-mobile",
    nationalPath: "/servicii/aplicatii-mobile/aplicatii-flutter-cross-platform",
    image: "/images/portfolio/spido.jpg",
    seoTitleTpl: "Aplicație mobilă {in} | ZeroBug",
    seoDescriptionTpl:
      "Aplicații mobile {in}: iOS, Android, Flutter. Pentru magazine, rezervări și loialitate — firme {from}.",
    h1Tpl: "Aplicație mobilă {in}",
    introTpl:
      "Construim aplicații iOS/Android (nativ sau Flutter) pentru business-uri {from}: magazine, rezervări, loialitate sau fluxuri interne.",
    baseBenefits: [
      "Flutter sau nativ, pe obiectiv",
      "UX clar pe mobil",
      "Integrare cu backend / shop",
      "Mentenanță după lansare",
    ],
    baseIncludes: [
      "Discovery + scope",
      "UI pe brand",
      "Build iOS + Android",
      "Store submission support",
      "Handoff",
    ],
    baseProcess: PROCESS_BUILD,
    faqTpls: [
      {
        question: "E nevoie de sediu {in} ca să facem aplicația?",
        answerTpl:
          "Nu. Lucrăm remote; sync-urile le facem video. Pentru workshop-uri putem programa întâlniri.",
      },
    ],
  },
  {
    slug: "migrare-magazin-online",
    name: "Migrare magazin online",
    categorySlug: "e-commerce",
    nationalPath:
      "/servicii/e-commerce/migrare-shopify-woocommerce",
    image: "/images/portfolio/bijuteriairis.jpg",
    seoTitleTpl: "Migrare magazin online {in} | ZeroBug",
    seoDescriptionTpl:
      "Migrare magazin online {in}: Shopify↔Woo, Magento/PrestaShop. Produse, comenzi, SEO — zero downtime planificat.",
    h1Tpl: "Migrare magazin online {in}",
    introTpl:
      "Muți magazinul pe altă platformă fără să pierzi produse, clienți sau SEO. Planificăm migrări pentru magazine {from}, cu redirect-uri și cutover controlat.",
    baseBenefits: [
      "Mapare produse / clienți / comenzi",
      "Redirect-uri SEO",
      "Cutover planificat",
      "Teste pe staging",
    ],
    baseIncludes: [
      "Audit magazin sursă",
      "Plan de migrare",
      "Import date",
      "Redirect-uri",
      "Go-live + smoke tests",
    ],
    baseProcess: PROCESS_BUILD,
    faqTpls: [
      {
        question: "Magazinul rămâne online în timpul migrării?",
        answerTpl:
          "Da, de regulă. Construim pe staging și facem cutover într-o fereastră agreată, ca downtime-ul să fie minim.",
      },
    ],
  },
];

export function getLocalKeyword(slug: string): LocalKeyword | undefined {
  return LOCAL_KEYWORDS.find((k) => k.slug === slug);
}
