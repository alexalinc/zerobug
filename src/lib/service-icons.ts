import type { LucideIcon } from "lucide-react";
import {
  BadgePercent,
  BarChart3,
  Boxes,
  Briefcase,
  Building2,
  CalendarCheck,
  Code2,
  CreditCard,
  FileCode2,
  FileJson,
  Gift,
  Globe2,
  Languages,
  LayoutTemplate,
  LineChart,
  Link2,
  Package,
  Paintbrush,
  Plug,
  RefreshCw,
  Repeat,
  Server,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Store,
  Truck,
  Wrench,
  Zap,
} from "lucide-react";

export type ServiceVisual =
  | { kind: "logo"; src: string; alt: string }
  | { kind: "icon"; Icon: LucideIcon };

const LOGO = {
  wordpress:
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/wordpress/wordpress-plain.svg",
  react:
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg",
  nextjs:
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg",
  shopify: "https://cdn.simpleicons.org/shopify/95BF47",
  woocommerce: "https://cdn.simpleicons.org/woocommerce/96588A",
  magento:
    "https://cdn.jsdelivr.net/npm/simple-icons@11.4.0/icons/magento.svg",
  prestashop:
    "https://cdn.jsdelivr.net/npm/simple-icons@11.4.0/icons/prestashop.svg",
  stripe: "https://cdn.simpleicons.org/stripe/635BFF",
  google: "https://cdn.simpleicons.org/google/4285F4",
  googleads: "https://cdn.simpleicons.org/googleads/4285F4",
  googleanalytics: "https://cdn.simpleicons.org/googleanalytics/E37400",
  googletagmanager: "https://cdn.simpleicons.org/googletagmanager/246FDB",
  meta: "https://cdn.simpleicons.org/meta/0668E1",
  apple:
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/apple/apple-original.svg",
  android:
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/android/android-original.svg",
  flutter:
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/flutter/flutter-original.svg",
  firebase:
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/firebase/firebase-plain.svg",
  dpd: "https://cdn.simpleicons.org/dpd/DC0032",
} as const;

/** Exact service name → visual (logos for brands, lucide otherwise). */
const BY_NAME: Record<string, ServiceVisual> = {
  // Web
  "Creare website de prezentare": { kind: "icon", Icon: Globe2 },
  "Website corporate custom": { kind: "icon", Icon: Building2 },
  "Landing page-uri pentru Google Ads": {
    kind: "logo",
    src: LOGO.googleads,
    alt: "Google Ads",
  },
  "Website Next.js / React": {
    kind: "logo",
    src: LOGO.nextjs,
    alt: "Next.js",
  },
  "Magazin online Next.js / React": {
    kind: "logo",
    src: LOGO.nextjs,
    alt: "Next.js",
  },
  "Website WordPress": {
    kind: "logo",
    src: LOGO.wordpress,
    alt: "WordPress",
  },
  "Magazin online WordPress / WooCommerce": {
    kind: "logo",
    src: LOGO.woocommerce,
    alt: "WooCommerce",
  },
  "Website WordPress + Elementor": {
    kind: "logo",
    src: LOGO.wordpress,
    alt: "WordPress",
  },
  "Migrare website WordPress": {
    kind: "logo",
    src: LOGO.wordpress,
    alt: "WordPress",
  },
  "Optimizare / refactorizare website existent": {
    kind: "icon",
    Icon: Zap,
  },
  "Redesign website": { kind: "icon", Icon: Paintbrush },
  "Website multilingv": { kind: "icon", Icon: Languages },
  "Website cu CMS custom": { kind: "icon", Icon: LayoutTemplate },
  "Portal / platformă web custom": { kind: "icon", Icon: Boxes },

  // E-commerce
  "Creare magazin WooCommerce": {
    kind: "logo",
    src: LOGO.woocommerce,
    alt: "WooCommerce",
  },
  "Dezvoltare Shopify": {
    kind: "logo",
    src: LOGO.shopify,
    alt: "Shopify",
  },
  "Personalizare WooCommerce": {
    kind: "logo",
    src: LOGO.woocommerce,
    alt: "WooCommerce",
  },
  "Personalizare Shopify": {
    kind: "logo",
    src: LOGO.shopify,
    alt: "Shopify",
  },
  "Migrare Shopify ↔ WooCommerce": {
    kind: "logo",
    src: LOGO.shopify,
    alt: "Shopify",
  },
  "Migrare Magento/PrestaShop → WooCommerce/Shopify": {
    kind: "logo",
    src: LOGO.magento,
    alt: "Magento",
  },
  "Optimizare magazin online": { kind: "icon", Icon: ShoppingBag },
  "Dezvoltare funcționalități custom pentru magazine": {
    kind: "icon",
    Icon: Settings2,
  },
  "Checkout custom": { kind: "icon", Icon: CreditCard },
  "Sistem custom de discounturi": { kind: "icon", Icon: BadgePercent },
  "Abonamente / subscriptions": { kind: "icon", Icon: Repeat },
  "Multi-vendor marketplace": { kind: "icon", Icon: Store },
  "B2B eCommerce": { kind: "icon", Icon: Briefcase },
  "Catalog B2B cu prețuri personalizate": { kind: "icon", Icon: Package },
  "Integrare furnizori / dropshipping": { kind: "icon", Icon: Truck },
  "Import automat produse": { kind: "icon", Icon: RefreshCw },
  "Sincronizare stocuri și prețuri": { kind: "icon", Icon: Link2 },
  "Automatizare procesare comenzi": { kind: "icon", Icon: ShoppingCart },

  // API
  "Integrare API custom": { kind: "icon", Icon: Plug },
  "Integrare ERP": { kind: "icon", Icon: Building2 },
  "Integrare CRM": { kind: "icon", Icon: Briefcase },
  "Integrare marketplace": { kind: "icon", Icon: Store },
  "Integrare procesator de plăți": {
    kind: "logo",
    src: LOGO.stripe,
    alt: "Stripe",
  },
  "Integrare curier / AWB": { kind: "icon", Icon: Truck },
  "Integrare facturare": { kind: "icon", Icon: FileCode2 },
  "Integrare SmartBill": { kind: "icon", Icon: FileCode2 },
  "Integrare Sameday / FAN / DPD etc.": {
    kind: "logo",
    src: LOGO.dpd,
    alt: "DPD",
  },
  "Integrare Google Merchant Center": {
    kind: "logo",
    src: LOGO.google,
    alt: "Google",
  },
  "Integrare Google Ads / conversion tracking": {
    kind: "logo",
    src: LOGO.googleads,
    alt: "Google Ads",
  },
  "Integrare Meta Ads": {
    kind: "logo",
    src: LOGO.meta,
    alt: "Meta",
  },
  "Integrare feed-uri XML/CSV/JSON": { kind: "icon", Icon: FileJson },
  "Sincronizare între două sisteme": { kind: "icon", Icon: RefreshCw },
  "Dezvoltare API REST": { kind: "icon", Icon: Code2 },

  // Mobile
  "Aplicații iOS": { kind: "logo", src: LOGO.apple, alt: "Apple" },
  "Aplicații Android": {
    kind: "logo",
    src: LOGO.android,
    alt: "Android",
  },
  "Aplicații Flutter cross-platform": {
    kind: "logo",
    src: LOGO.flutter,
    alt: "Flutter",
  },
  "Aplicații pentru magazine online": { kind: "icon", Icon: ShoppingBag },
  "Aplicații interne pentru companii": { kind: "icon", Icon: Building2 },
  "Aplicații de rezervări": { kind: "icon", Icon: CalendarCheck },
  "Aplicații de loialitate": { kind: "icon", Icon: Gift },
  "Aplicații marketplace": { kind: "icon", Icon: Store },
  "Aplicații cu Firebase": {
    kind: "logo",
    src: LOGO.firebase,
    alt: "Firebase",
  },
  "Mentenanță aplicații mobile existente": { kind: "icon", Icon: Wrench },

  // Ads / analytics
  "Google Ads conversion tracking": {
    kind: "logo",
    src: LOGO.googleads,
    alt: "Google Ads",
  },
  "Server-side conversion tracking": { kind: "icon", Icon: Server },
  "Google Ads + WooCommerce": {
    kind: "logo",
    src: LOGO.woocommerce,
    alt: "WooCommerce",
  },
  "Google Ads + Shopify": {
    kind: "logo",
    src: LOGO.shopify,
    alt: "Shopify",
  },
  "Profit tracking pentru eCommerce": { kind: "icon", Icon: LineChart },
  "POAS tracking": { kind: "icon", Icon: BarChart3 },
  "COGS tracking": { kind: "icon", Icon: Package },
  "Google Merchant Center feeds": {
    kind: "logo",
    src: LOGO.google,
    alt: "Google",
  },
  "Product feeds custom": { kind: "icon", Icon: FileJson },
  "GA4 implementation": {
    kind: "logo",
    src: LOGO.googleanalytics,
    alt: "GA4",
  },
  "Google Tag Manager": {
    kind: "logo",
    src: LOGO.googletagmanager,
    alt: "GTM",
  },
  "Enhanced Conversions": { kind: "icon", Icon: Zap },
  "Dashboard-uri de profit": { kind: "icon", Icon: LineChart },
  "Dashboard-uri custom pentru eCommerce": { kind: "icon", Icon: BarChart3 },

  // WP / Woo
  "Creare magazin online WooCommerce": {
    kind: "logo",
    src: LOGO.woocommerce,
    alt: "WooCommerce",
  },
  "WooCommerce development": {
    kind: "logo",
    src: LOGO.woocommerce,
    alt: "WooCommerce",
  },
  "Plugin WordPress custom": {
    kind: "logo",
    src: LOGO.wordpress,
    alt: "WordPress",
  },
  "Plugin WooCommerce custom": {
    kind: "logo",
    src: LOGO.woocommerce,
    alt: "WooCommerce",
  },
  "Custom checkout": { kind: "icon", Icon: CreditCard },
  "Custom product configurator": { kind: "icon", Icon: Settings2 },
  "Custom shipping logic": { kind: "icon", Icon: Truck },
  "Custom pricing logic": { kind: "icon", Icon: BadgePercent },
  "Custom vendor marketplace": { kind: "icon", Icon: Store },
  "WooCommerce performance optimization": { kind: "icon", Icon: Zap },
  "WooCommerce bug fixing": { kind: "icon", Icon: Wrench },
  "WordPress malware/security cleanup": { kind: "icon", Icon: ShieldCheck },
  "WordPress maintenance": {
    kind: "logo",
    src: LOGO.wordpress,
    alt: "WordPress",
  },
  "WooCommerce migration": {
    kind: "logo",
    src: LOGO.woocommerce,
    alt: "WooCommerce",
  },
};

const FALLBACK_BY_CATEGORY: Record<string, LucideIcon> = {
  "web-development": Globe2,
  "e-commerce": ShoppingBag,
  "api-integrari": Plug,
  "aplicatii-mobile": Smartphone,
  "google-ads-analytics": BarChart3,
  "wordpress-woocommerce": Code2,
};

export function getServiceVisual(
  serviceName: string,
  categorySlug?: string,
): ServiceVisual {
  const exact = BY_NAME[serviceName];
  if (exact) return exact;

  const lower = serviceName.toLowerCase();
  if (lower.includes("shopify"))
    return { kind: "logo", src: LOGO.shopify, alt: "Shopify" };
  if (lower.includes("woocommerce"))
    return { kind: "logo", src: LOGO.woocommerce, alt: "WooCommerce" };
  if (lower.includes("wordpress"))
    return { kind: "logo", src: LOGO.wordpress, alt: "WordPress" };
  if (lower.includes("stripe") || lower.includes("plăți"))
    return { kind: "logo", src: LOGO.stripe, alt: "Stripe" };
  if (lower.includes("google ads"))
    return { kind: "logo", src: LOGO.googleads, alt: "Google Ads" };
  if (lower.includes("meta"))
    return { kind: "logo", src: LOGO.meta, alt: "Meta" };
  if (lower.includes("flutter"))
    return { kind: "logo", src: LOGO.flutter, alt: "Flutter" };
  if (lower.includes("firebase"))
    return { kind: "logo", src: LOGO.firebase, alt: "Firebase" };
  if (lower.includes("ios") || lower.includes("apple"))
    return { kind: "logo", src: LOGO.apple, alt: "Apple" };
  if (lower.includes("android"))
    return { kind: "logo", src: LOGO.android, alt: "Android" };
  if (lower.includes("react") || lower.includes("next"))
    return { kind: "logo", src: LOGO.react, alt: "React" };

  const Icon =
    (categorySlug && FALLBACK_BY_CATEGORY[categorySlug]) || Plug;
  return { kind: "icon", Icon };
}
