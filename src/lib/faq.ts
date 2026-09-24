import type { FaqCategories, FaqData, FaqItem } from "@/components/ui/faq-tabs";

export const FAQ_CATEGORIES: FaqCategories = {
  general: "General",
  web: "Web & Shop",
  mentenanta: "Mentenanță",
  ads: "Ads & API",
};

export const FAQ_DATA: FaqData = {
  general: [
    {
      question: "Cu ce se ocupă ZeroBug?",
      answer:
        "Construim website-uri, magazine online, API-uri, batch-uri de date, aplicații mobile și automatizări — plus mentenanță lunară și tracking Google Ads. Lucrăm cu Next.js, WordPress/WooCommerce, Shopify și Flutter.",
    },
    {
      question: "Cum începe un proiect?",
      answer:
        "Ne scrii pe Contact sau alegi categoria din Servicii și completezi cererea. Clarificăm scope-ul, îți trimitem o ofertă, apoi trecem la design/dezvoltare și livrare în producție.",
    },
    {
      question: "Lucrați remote sau doar local?",
      answer:
        "Lucrăm remote cu clienți din toată România. Comunicăm pe email/call, cu milestone-uri clare și livrabile pe care le poți verifica pe staging înainte de go-live.",
    },
    {
      question: "Cât durează un website tipic?",
      answer:
        "Un landing sau site de prezentare: de obicei 1–3 săptămâni. Un magazin sau o platformă custom: de la câteva săptămâni la câteva luni, în funcție de integrări și complexitate.",
    },
    {
      question: "Emiteți factură?",
      answer:
        "Da. Facturăm ca SC AXP GLOBAL RETAIL SRL (ZeroBug). Pentru mentenanță, factura PDF este generată lunar și trimisă pe email.",
    },
  ],
  web: [
    {
      question: "Pe ce tehnologii construiți site-urile?",
      answer:
        "Next.js / React pentru aplicații moderne, WordPress + WooCommerce pentru conținut și magazine, Shopify când e potrivit. Alegem stack-ul după obiective, buget și mentenanță pe termen lung.",
    },
    {
      question: "Puteți prelua un site existent?",
      answer:
        "Da — redesign, migrare (ex. Magento/PrestaShop → Woo/Shopify), optimizare performanță, securitate sau refactor. Evaluăm codul și infrastructura înainte de ofertă.",
    },
    {
      question: "Includeți SEO și tracking?",
      answer:
        "Putem livra structură SEO tehnică, sitemap, meta, plus tracking Google Ads / Analytics / Merchant Center. Pentru POAS și profit pe ads, folosim și soluții ca Profit Bid.",
    },
    {
      question: "Faceți și e-commerce B2B / marketplace?",
      answer:
        "Da — WooCommerce și Shopify custom, checkout specializat, sync stoc/ERP, marketplace multi-vendor, când proiectul o cere.",
    },
  ],
  mentenanta: [
    {
      question: "Ce include mentenanța lunară?",
      answer:
        "Update-uri de securitate, backup, monitorizare uptime, support pe email și — pe planuri mai mari — SLA, optimizări minore și raport de sănătate. Interval tipic: 19,99–99,99 € / lună + TVA.",
    },
    {
      question: "Cum aflu ce plan mi se potrivește?",
      answer:
        "Pe pagina Mentenanță completezi un scurt wizard (platformă, trafic, nevoi). Vezi live un interval de preț și ne trimiți cererea — revenim cu oferta personalizată, fără obligație.",
    },
    {
      question: "Trebuie să plătesc pe site acum?",
      answer:
        "Nu pe pagina de ofertă. Trimiti cererea, confirmăm scope-ul, apoi activăm abonamentul și facturarea lunară. Nu există checkout forțat în wizard.",
    },
    {
      question: "Acoperiți WordPress, Woo și Next.js?",
      answer:
        "Da. Mentenanța e potrivită pentru WordPress/WooCommerce, site-uri Next.js/React și magazine cu trafic real — planul depinde de complexitate și SLA.",
    },
  ],
  ads: [
    {
      question: "Ce tip de API / batch-uri faceți?",
      answer:
        "Integrări ERP/CRM, SmartBill, curieri AWB, sync stocuri și prețuri, importuri pe volume, feed-uri Merchant Center — job-uri programate și API-uri REST care țin operațiunile fără copy-paste.",
    },
    {
      question: "Ajutați și la Google Ads / tracking?",
      answer:
        "Da: setup tracking, conversii, Merchant Center, și măsurare orientată pe profit (POAS), nu doar pe ROAS. Putem combina dezvoltarea magazinului cu măsurarea campaniilor.",
    },
    {
      question: "Aveți aplicații mobile?",
      answer:
        "Da — Flutter / native-style pentru magazine și operațiuni (ex. WooTrack pe Android: comenzi, KPI, notificări). Discutăm scope-ul înainte de estimare.",
    },
    {
      question: "Cât costă o integrare API?",
      answer:
        "Depinde de sisteme, volume și frecvența sync-ului. Trimite o cerere pe Servicii → API & integrări sau pe Contact și revenim cu un interval clar.",
    },
  ],
};

/** Flat list for FAQPage JSON-LD */
export function getAllFaqItems(): FaqItem[] {
  return Object.values(FAQ_DATA).flat();
}
