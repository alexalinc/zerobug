import { MAINTENANCE_PLANS, withVat, type MaintenancePlan } from "@/lib/services";

export const PLATFORMS = [
  { id: "wordpress", label: "WordPress" },
  { id: "woocommerce", label: "WooCommerce" },
  { id: "nextjs", label: "Next.js / React" },
  { id: "shopify", label: "Shopify" },
  { id: "other", label: "Altceva" },
] as const;

export const TRAFFIC_LEVELS = [
  { id: "low", label: "Sub 5k vizite / lună" },
  { id: "mid", label: "5k–50k vizite / lună" },
  { id: "high", label: "Peste 50k vizite / lună" },
] as const;

export const BUSINESS_TYPES = [
  { id: "presentation", label: "Site de prezentare" },
  { id: "store", label: "Magazin online" },
  { id: "saas", label: "SaaS / platformă" },
  { id: "other", label: "Alt tip" },
] as const;

export const HOSTING_OPTIONS = [
  { id: "shared", label: "Shared hosting" },
  { id: "vps", label: "VPS / cloud" },
  { id: "managed", label: "Managed / agency" },
  { id: "unknown", label: "Nu știu" },
] as const;

export const ACCESS_OPTIONS = [
  { id: "client", label: "Doar noi (client)" },
  { id: "agency", label: "Agenție / freelancer" },
  { id: "zerobug", label: "Vrem acces pentru ZeroBug" },
] as const;

export const MAINTENANCE_NEEDS = [
  { id: "updates", label: "Update-uri & patch-uri" },
  { id: "security", label: "Securitate / hardening" },
  { id: "monitoring", label: "Monitorizare uptime" },
  { id: "backups", label: "Backup-uri" },
  { id: "hotfixes", label: "Hotfix-uri minore" },
  { id: "report", label: "Raport lunar" },
  { id: "urgency", label: "Răspuns rapid la incidente" },
] as const;

export type PlatformId = (typeof PLATFORMS)[number]["id"];
export type TrafficId = (typeof TRAFFIC_LEVELS)[number]["id"];
export type BusinessTypeId = (typeof BUSINESS_TYPES)[number]["id"];
export type HostingId = (typeof HOSTING_OPTIONS)[number]["id"];
export type AccessId = (typeof ACCESS_OPTIONS)[number]["id"];
export type NeedId = (typeof MAINTENANCE_NEEDS)[number]["id"];

export type MaintenanceQuoteAnswers = {
  siteUrl: string;
  platform: PlatformId | "";
  siteCount: number;
  traffic: TrafficId | "";
  industry: string;
  businessType: BusinessTypeId | "";
  hosting: HostingId | "";
  access: AccessId | "";
  hasBackup: boolean | null;
  hasSslCdn: boolean | null;
  needs: NeedId[];
};

export type MaintenanceEstimate = {
  minNet: number;
  maxNet: number;
  suggestedPlanId: string;
  suggestedPlan: MaintenancePlan;
  complexity: "simplu" | "mediu" | "complex";
  score: number;
  reasons: string[];
  features: string[];
};

const FLOOR = 19.99;
const CEILING = 149.99;

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function createEmptyAnswers(): MaintenanceQuoteAnswers {
  return {
    siteUrl: "",
    platform: "",
    siteCount: 1,
    traffic: "",
    industry: "",
    businessType: "",
    hosting: "",
    access: "",
    hasBackup: null,
    hasSslCdn: null,
    needs: [],
  };
}

export function estimateMaintenance(
  answers: MaintenanceQuoteAnswers,
): MaintenanceEstimate {
  let score = 0;
  const reasons: string[] = [];

  if (answers.platform === "woocommerce" || answers.platform === "shopify") {
    score += 2;
    reasons.push("Magazin / e-commerce — complexitate mai mare");
  } else if (answers.platform === "nextjs") {
    score += 1;
    reasons.push("Stack modern (Next.js) — mentenanță tehnică");
  } else if (answers.platform === "wordpress") {
    score += 1;
  }

  if (answers.siteCount >= 3) {
    score += 3;
    reasons.push(`${answers.siteCount} site-uri în scope`);
  } else if (answers.siteCount === 2) {
    score += 1;
    reasons.push("2 site-uri");
  }

  if (answers.traffic === "high") {
    score += 3;
    reasons.push("Trafic ridicat — monitorizare & SLA");
  } else if (answers.traffic === "mid") {
    score += 1;
    reasons.push("Trafic mediu");
  }

  if (answers.businessType === "store" || answers.businessType === "saas") {
    score += 2;
    reasons.push(
      answers.businessType === "store"
        ? "Magazin online — uptime critic"
        : "SaaS / platformă — suport prioritar",
    );
  }

  if (answers.hosting === "shared") {
    score += 1;
    reasons.push("Shared hosting — mai multe riscuri de securitate");
  } else if (answers.hosting === "vps") {
    score += 1;
  }

  if (answers.hasBackup === false) {
    score += 1;
    reasons.push("Fără backup clar — includem backup-uri");
  }

  if (answers.needs.includes("urgency") || answers.needs.includes("hotfixes")) {
    score += 2;
    reasons.push("Nevoie de răspuns rapid / hotfixes");
  }
  if (answers.needs.includes("security")) {
    score += 1;
    reasons.push("Securitate / hardening solicitat");
  }
  if (answers.needs.includes("report")) {
    score += 1;
  }
  if (answers.needs.length >= 5) {
    score += 1;
    reasons.push("Pachet de nevoi extins");
  }

  let suggestedPlanId: string;
  let complexity: MaintenanceEstimate["complexity"];

  if (score >= 7 || answers.siteCount >= 3 || answers.traffic === "high") {
    suggestedPlanId = "business";
    complexity = "complex";
  } else if (score >= 3 || answers.businessType === "store") {
    suggestedPlanId = "pro";
    complexity = "mediu";
  } else {
    suggestedPlanId = "starter";
    complexity = "simplu";
  }

  const suggestedPlan =
    MAINTENANCE_PLANS.find((p) => p.id === suggestedPlanId) ??
    MAINTENANCE_PLANS[0]!;

  const base = suggestedPlan.priceNet;
  let minNet = round2(base * 0.8);
  let maxNet = round2(base * 1.4);

  if (answers.siteCount > suggestedPlan.sites) {
    const extra = (answers.siteCount - suggestedPlan.sites) * 15;
    minNet = round2(minNet + extra * 0.5);
    maxNet = round2(maxNet + extra);
    reasons.push("Extra site-uri față de pachetul de bază");
  }

  minNet = round2(clamp(minNet, FLOOR, CEILING));
  maxNet = round2(clamp(Math.max(maxNet, minNet + 10), FLOOR, CEILING));

  if (reasons.length === 0) {
    reasons.push("Estimare pe baza unui site simplu, cu mentenanță esențială");
  }

  return {
    minNet,
    maxNet,
    suggestedPlanId,
    suggestedPlan,
    complexity,
    score,
    reasons: reasons.slice(0, 5),
    features: suggestedPlan.features,
  };
}

export function formatEstimateRange(estimate: MaintenanceEstimate) {
  const min = withVat(estimate.minNet);
  const max = withVat(estimate.maxNet);
  return {
    netLabel: `${min.net.toFixed(0)}–${max.net.toFixed(0)} €`,
    grossLabel: `${min.gross.toFixed(0)}–${max.gross.toFixed(0)} €`,
    min,
    max,
  };
}

export function buildQuoteSummary(
  answers: MaintenanceQuoteAnswers,
  estimate: MaintenanceEstimate,
  notes?: string,
) {
  const platform =
    PLATFORMS.find((p) => p.id === answers.platform)?.label ?? "—";
  const traffic =
    TRAFFIC_LEVELS.find((t) => t.id === answers.traffic)?.label ?? "—";
  const business =
    BUSINESS_TYPES.find((b) => b.id === answers.businessType)?.label ?? "—";
  const hosting =
    HOSTING_OPTIONS.find((h) => h.id === answers.hosting)?.label ?? "—";
  const access =
    ACCESS_OPTIONS.find((a) => a.id === answers.access)?.label ?? "—";
  const needs = answers.needs
    .map((id) => MAINTENANCE_NEEDS.find((n) => n.id === id)?.label)
    .filter(Boolean)
    .join(", ");

  const lines = [
    `URL: ${answers.siteUrl || "—"}`,
    `Platformă: ${platform}`,
    `Nr. site-uri: ${answers.siteCount}`,
    `Trafic: ${traffic}`,
    `Business: ${business}${answers.industry ? ` (${answers.industry})` : ""}`,
    `Hosting: ${hosting}`,
    `Acces: ${access}`,
    `Backup existent: ${answers.hasBackup == null ? "—" : answers.hasBackup ? "da" : "nu"}`,
    `SSL/CDN: ${answers.hasSslCdn == null ? "—" : answers.hasSslCdn ? "da" : "nu"}`,
    `Nevoi: ${needs || "—"}`,
    `Plan sugerat: ${estimate.suggestedPlan.name}`,
    `Estimare: ${estimate.minNet.toFixed(2)}–${estimate.maxNet.toFixed(2)} € + TVA / lună`,
  ];

  if (notes?.trim()) {
    lines.push(`Note: ${notes.trim()}`);
  }

  return lines.join("\n");
}
