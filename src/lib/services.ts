export type ServiceCategory = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  accent: string;
  services: string[];
};

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    slug: "web-development",
    title: "Web development",
    shortTitle: "Web",
    description:
      "Website-uri de prezentare, corporate, landing pages și platforme custom pe Next.js, React sau WordPress.",
    accent: "#22d3ee",
    services: [
      "Creare website de prezentare",
      "Website corporate custom",
      "Landing page-uri pentru Google Ads",
      "Website Next.js / React",
      "Website WordPress",
      "Website WordPress + Elementor",
      "Migrare website WordPress",
      "Optimizare / refactorizare website existent",
      "Redesign website",
      "Website multilingv",
      "Website cu CMS custom",
      "Portal / platformă web custom",
    ],
  },
  {
    slug: "e-commerce",
    title: "E-commerce",
    shortTitle: "Shop",
    description:
      "Magazine WooCommerce & Shopify, marketplace-uri, B2B, checkout custom și automatizări de comenzi.",
    accent: "#34d399",
    services: [
      "Creare magazin WooCommerce",
      "Dezvoltare Shopify",
      "Personalizare WooCommerce",
      "Personalizare Shopify",
      "Migrare Shopify ↔ WooCommerce",
      "Migrare Magento/PrestaShop → WooCommerce/Shopify",
      "Optimizare magazin online",
      "Dezvoltare funcționalități custom pentru magazine",
      "Checkout custom",
      "Sistem custom de discounturi",
      "Abonamente / subscriptions",
      "Multi-vendor marketplace",
      "B2B eCommerce",
      "Catalog B2B cu prețuri personalizate",
      "Integrare furnizori / dropshipping",
      "Import automat produse",
      "Sincronizare stocuri și prețuri",
      "Automatizare procesare comenzi",
    ],
  },
  {
    slug: "api-integrari",
    title: "API & integrări",
    shortTitle: "API",
    description:
      "Integrări ERP, CRM, curieri, facturare, plăți, feed-uri și sincronizări între sisteme.",
    accent: "#a3e635",
    services: [
      "Integrare API custom",
      "Integrare ERP",
      "Integrare CRM",
      "Integrare marketplace",
      "Integrare procesator de plăți",
      "Integrare curier / AWB",
      "Integrare facturare",
      "Integrare SmartBill",
      "Integrare Sameday / FAN / DPD etc.",
      "Integrare Google Merchant Center",
      "Integrare Google Ads / conversion tracking",
      "Integrare Meta Ads",
      "Integrare feed-uri XML/CSV/JSON",
      "Sincronizare între două sisteme",
      "Dezvoltare API REST",
    ],
  },
  {
    slug: "aplicatii-mobile",
    title: "Aplicații mobile",
    shortTitle: "Mobile",
    description:
      "Aplicații iOS, Android și Flutter pentru magazine, rezervări, loialitate și fluxuri interne.",
    accent: "#67e8f9",
    services: [
      "Aplicații iOS",
      "Aplicații Android",
      "Aplicații Flutter cross-platform",
      "Aplicații pentru magazine online",
      "Aplicații interne pentru companii",
      "Aplicații de rezervări",
      "Aplicații de loialitate",
      "Aplicații marketplace",
      "Aplicații cu Firebase",
      "Mentenanță aplicații mobile existente",
    ],
  },
  {
    slug: "ai-automatizari",
    title: "AI & automatizări",
    shortTitle: "AI",
    description:
      "Chatbot-uri AI, agenți pentru companii, automatizări CRM/ofertare și integrări LLM — focus ZeroBug 2026.",
    accent: "#2dd4bf",
    services: [
      "Implementare AI pentru firme",
      "Chatbot AI pentru website",
      "AI customer support",
      "AI chatbot conectat la baza de date",
      "AI pentru procesarea comenzilor",
      "AI pentru procesarea documentelor",
      "Automatizare task-uri repetitive",
      "Automatizări cu API-uri",
      "AI pentru generarea descrierilor de produse",
      "AI pentru customer service",
      "AI pentru email-uri",
      "AI pentru analiza datelor",
      "AI agent pentru companie",
      "Automatizare lead-uri",
      "Automatizare CRM",
      "Automatizare ofertare",
      "Automatizare raportare",
      "Integrare OpenAI/LLM în aplicații",
    ],
  },
  {
    slug: "google-ads-analytics",
    title: "Google Ads / tracking / eCommerce analytics",
    shortTitle: "Ads",
    description:
      "Conversion tracking server-side, POAS, COGS, Merchant Center, GA4, GTM și dashboard-uri de profit.",
    accent: "#fbbf24",
    services: [
      "Google Ads conversion tracking",
      "Server-side conversion tracking",
      "Google Ads + WooCommerce",
      "Google Ads + Shopify",
      "Profit tracking pentru eCommerce",
      "POAS tracking",
      "COGS tracking",
      "Google Merchant Center feeds",
      "Product feeds custom",
      "GA4 implementation",
      "Google Tag Manager",
      "Enhanced Conversions",
      "Dashboard-uri de profit",
      "Dashboard-uri custom pentru eCommerce",
    ],
  },
  {
    slug: "wordpress-woocommerce",
    title: "WordPress / WooCommerce",
    shortTitle: "WP",
    description:
      "Plugin-uri custom, checkout, pricing, performance, securitate și mentenanță WordPress/WooCommerce.",
    accent: "#38bdf8",
    services: [
      "WooCommerce development",
      "Plugin WordPress custom",
      "Plugin WooCommerce custom",
      "Custom checkout",
      "Custom product configurator",
      "Custom shipping logic",
      "Custom pricing logic",
      "Custom vendor marketplace",
      "WooCommerce performance optimization",
      "WooCommerce bug fixing",
      "WordPress malware/security cleanup",
      "WordPress maintenance",
      "WooCommerce migration",
    ],
  },
];

export function getCategoryBySlug(slug: string) {
  return SERVICE_CATEGORIES.find((c) => c.slug === slug);
}

export type MaintenancePlan = {
  id: string;
  name: string;
  priceNet: number;
  sites: number;
  description: string;
  features: string[];
  highlighted?: boolean;
};

export const MAINTENANCE_PLANS: MaintenancePlan[] = [
  {
    id: "starter",
    name: "Starter",
    priceNet: 19.99,
    sites: 1,
    description: "Mentenanță esențială pentru un site simplu.",
    features: [
      "1 website",
      "Update-uri lunare de securitate",
      "Backup săptămânal",
      "Monitorizare uptime",
      "Support pe email (48h)",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    priceNet: 49.99,
    sites: 1,
    description: "Pentru site-uri active sau magazine mici.",
    highlighted: true,
    features: [
      "1 website (complexitate medie)",
      "Update-uri + patch-uri de securitate",
      "Backup zilnic",
      "Monitorizare uptime + alertă",
      "Optimizări minore de performanță",
      "Support prioritar (24h)",
    ],
  },
  {
    id: "business",
    name: "Business",
    priceNet: 99.99,
    sites: 3,
    description: "Pentru magazine și platforme cu trafic real.",
    features: [
      "Până la 3 website-uri",
      "Securitate avansată + malware cleanup",
      "Backup zilnic offsite",
      "SLA 4h pe incidente critice",
      "Raport lunar de sănătate",
      "Hotfix-uri minore incluse (2h/lună)",
    ],
  },
];

export const VAT_RATE = 0.21;

export function withVat(net: number) {
  const vat = Math.round(net * VAT_RATE * 100) / 100;
  const gross = Math.round((net + vat) * 100) / 100;
  return { net, vat, gross };
}

export const ISSUER_DEFAULTS = {
  companyName: "SC AXP GLOBAL RETAIL SRL",
  cui: "RO48715417",
  regCom: "J2023001304021",
  address: "Str. Principala nr. 1290",
  phone: "0773319554",
  email: "contact@zerobug.ro",
  bank: "TRANSILVANIA",
  iban: "RO21BTRLRONCRT0CN2566601",
  invoiceSeries: "ZB",
  brandName: "ZeroBug",
};
