export type PortfolioItem = {
  slug: string;
  title: string;
  url: string;
  urlLabel: string;
  category: string;
  image: string;
  description: string;
  highlights: string[];
};

export const PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    slug: "spido",
    title: "Spido.ro",
    url: "https://spido.ro/",
    urlLabel: "spido.ro",
    category: "Platformă web · Asigurări",
    image: "/images/portfolio/spido.jpg",
    description:
      "Platformă RCA 100% online: calculator multi-pas, comparare oferte de la asigurători, plată online (inclusiv rate TBI Bank) și emitere poliță pe email — fără drumuri la ghișeu.",
    highlights: [
      "Flux 3 pași: vehicul → client → oferte",
      "Autofill după nr. înmatriculare / VIN",
      "Integrare asigurători & plăți",
    ],
  },
  {
    slug: "profit-bid",
    title: "Profit Bid",
    url: "https://profit-bid.com/",
    urlLabel: "profit-bid.com",
    category: "SaaS · Ads & e-commerce",
    image: "/images/portfolio/profit-bid.jpg",
    description:
      "SaaS de profit-based bidding: conectează magazinul la Google Ads, Meta, TikTok și altele, calculează POAS real (COGS, taxe, VAT) și scalează doar campaniile profitabile.",
    highlights: [
      "POAS dashboard & product labels A/C/X",
      "Sync WooCommerce / Shopify → ad platforms",
      "Pixel first-party & upload conversii",
    ],
  },
  {
    slug: "bijuteriairis",
    title: "Bijuteria Iris",
    url: "https://bijuteriairis.ro/",
    urlLabel: "bijuteriairis.ro",
    category: "E-commerce · WooCommerce",
    image: "/images/portfolio/bijuteriairis.jpg",
    description:
      "Magazin online pentru bijuterii, parfumuri și cadouri: catalog pe colecții, checkout, livrare rapidă și prezență digitală legată de magazinul fizic din Ineu.",
    highlights: [
      "Catalog & colecții (argint, parfumuri, ceasuri)",
      "Checkout & livrare RO",
      "Recenzii și UX orientat pe conversie",
    ],
  },
  {
    slug: "mercana",
    title: "Mercana",
    url: "https://mercana.ro/",
    urlLabel: "mercana.ro",
    category: "E-commerce · Marketplace",
    image: "/images/portfolio/mercana.jpg",
    description:
      "Magazin online multi-categorie (beauty, casă, sport, copii) cu produsuri verificate, branduri și livrare națională — focus pe catalog și experiență de cumpărare.",
    highlights: [
      "Catalog multi-categorie",
      "Listări produs & branduri",
      "Checkout și livrare în RO",
    ],
  },
  {
    slug: "wootrack",
    title: "WooTrack App",
    url: "https://play.google.com/store/apps/details?id=com.zeropoint.wootrack&hl=en",
    urlLabel: "Google Play",
    category: "Aplicație mobilă · WooCommerce",
    image: "/images/portfolio/wootrack.jpg",
    description:
      "Aplicație Android pentru magazine WooCommerce: vânzări, comenzi, KPI-uri, notificări în timp real și integrare Google Ads / Merchant Center pentru profit (revenue − ads − COGS).",
    highlights: [
      "Dashboard vânzări & comenzi",
      "Push la comenzi noi",
      "Google Ads + GMC profit tracking",
    ],
  },
  {
    slug: "clinicadronelor",
    title: "Clinica Dronelor",
    url: "https://clinicadronelor.ro/",
    urlLabel: "clinicadronelor.ro",
    category: "Website · Service DJI",
    image: "/images/portfolio/clinicadronelor.jpg",
    description:
      "Site de prezentare și lead-uri pentru service specializat DJI: formular reparații, flux curier gratuit, portofoliu lucrări, prețuri estimative și SEO local pe service drone.",
    highlights: [
      "Formular ofertă / ridicare curier",
      "Prezentare servicii & garanție",
      "Focus conversie lead-uri service",
    ],
  },
];

export const PORTFOLIO_MORE = [
  "Scrappere & automatizări de date",
  "Implementări API (ERP, CRM, curieri, plăți)",
  "Soft-uri scanare & gestiune stoc e-commerce",
  "Tracking Google Ads / POAS / Merchant Center",
  "Integrări WooCommerce & Shopify custom",
];
