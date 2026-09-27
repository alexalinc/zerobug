/** Classify marketing traffic: Ads, organic, AI chatbots, social, etc. */

export type TrafficSource =
  | "google_ads"
  | "organic"
  | "ai"
  | "social"
  | "referral"
  | "direct"
  | "email"
  | "other";

export type TrafficAttribution = {
  source: TrafficSource;
  referrer?: string;
  referrerHost?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  hasAdsClickId: boolean;
};

const SEARCH_HOSTS = [
  "google.",
  "bing.com",
  "yahoo.",
  "duckduckgo.com",
  "ecosia.org",
  "search.brave.com",
  "yandex.",
];

const AI_HOSTS = [
  "chat.openai.com",
  "chatgpt.com",
  "openai.com",
  "perplexity.ai",
  "claude.ai",
  "anthropic.com",
  "gemini.google.com",
  "bard.google.com",
  "copilot.microsoft.com",
  "you.com",
  "phind.com",
  "poe.com",
  "character.ai",
  "meta.ai",
  "grok.x.ai",
  "x.ai",
  "deepseek.com",
  "chat.deepseek.com",
];

const SOCIAL_HOSTS = [
  "facebook.com",
  "fb.com",
  "instagram.com",
  "linkedin.com",
  "twitter.com",
  "x.com",
  "t.co",
  "tiktok.com",
  "pinterest.com",
  "reddit.com",
  "youtube.com",
  "youtu.be",
  "threads.net",
  "whatsapp.com",
  "telegram.org",
  "t.me",
];

function hostMatches(host: string, needles: string[]) {
  const h = host.toLowerCase();
  return needles.some((n) => h === n || h.endsWith(`.${n}`) || h.includes(n));
}

function parseHost(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}

export function detectTrafficSource(input: {
  search?: string;
  referrer?: string;
  hasAdsClickId?: boolean;
}): TrafficAttribution {
  const params = new URLSearchParams(input.search || "");
  const utmSource = params.get("utm_source")?.trim().toLowerCase() || undefined;
  const utmMedium = params.get("utm_medium")?.trim().toLowerCase() || undefined;
  const utmCampaign =
    params.get("utm_campaign")?.trim().toLowerCase() || undefined;
  const gclid = Boolean(params.get("gclid")?.trim());
  const gbraid = Boolean(params.get("gbraid")?.trim());
  const wbraid = Boolean(params.get("wbraid")?.trim());
  const hasAdsClickId = Boolean(input.hasAdsClickId || gclid || gbraid || wbraid);

  const referrer = input.referrer?.trim() || undefined;
  const referrerHost = parseHost(referrer);

  if (
    hasAdsClickId ||
    utmMedium === "cpc" ||
    utmMedium === "ppc" ||
    utmMedium === "paid" ||
    utmMedium === "paidsearch" ||
    (utmSource === "google" &&
      (utmMedium === "cpc" || utmMedium === "ppc" || utmMedium === "ads")) ||
    utmSource === "googleads" ||
    utmSource === "google_ads"
  ) {
    return {
      source: "google_ads",
      referrer,
      referrerHost,
      utmSource,
      utmMedium,
      utmCampaign,
      hasAdsClickId,
    };
  }

  if (
    utmMedium === "email" ||
    utmSource === "email" ||
    utmSource === "newsletter"
  ) {
    return {
      source: "email",
      referrer,
      referrerHost,
      utmSource,
      utmMedium,
      utmCampaign,
      hasAdsClickId,
    };
  }

  if (
    utmSource &&
    (utmSource.includes("chatgpt") ||
      utmSource.includes("perplexity") ||
      utmSource.includes("claude") ||
      utmSource === "ai" ||
      utmMedium === "ai")
  ) {
    return {
      source: "ai",
      referrer,
      referrerHost,
      utmSource,
      utmMedium,
      utmCampaign,
      hasAdsClickId,
    };
  }

  if (referrerHost && hostMatches(referrerHost, AI_HOSTS)) {
    return {
      source: "ai",
      referrer,
      referrerHost,
      utmSource,
      utmMedium,
      utmCampaign,
      hasAdsClickId,
    };
  }

  if (
    (utmSource &&
      (utmSource.includes("facebook") ||
        utmSource.includes("instagram") ||
        utmSource.includes("linkedin") ||
        utmSource.includes("twitter") ||
        utmSource === "social" ||
        utmMedium === "social")) ||
    (referrerHost && hostMatches(referrerHost, SOCIAL_HOSTS))
  ) {
    return {
      source: "social",
      referrer,
      referrerHost,
      utmSource,
      utmMedium,
      utmCampaign,
      hasAdsClickId,
    };
  }

  if (
    utmMedium === "organic" ||
    (referrerHost && hostMatches(referrerHost, SEARCH_HOSTS))
  ) {
    return {
      source: "organic",
      referrer,
      referrerHost,
      utmSource,
      utmMedium,
      utmCampaign,
      hasAdsClickId,
    };
  }

  if (utmSource || utmMedium || utmCampaign) {
    return {
      source: "other",
      referrer,
      referrerHost,
      utmSource,
      utmMedium,
      utmCampaign,
      hasAdsClickId,
    };
  }

  if (referrerHost) {
    // Same-site navigations shouldn't create a new attribution
    const siteHost =
      typeof window !== "undefined"
        ? window.location.hostname.replace(/^www\./, "")
        : "";
    if (siteHost && (referrerHost === siteHost || referrerHost.endsWith(`.${siteHost}`))) {
      return {
        source: "direct",
        referrer,
        referrerHost,
        hasAdsClickId,
      };
    }
    return {
      source: "referral",
      referrer,
      referrerHost,
      hasAdsClickId,
    };
  }

  return {
    source: "direct",
    hasAdsClickId,
  };
}

export const TRAFFIC_SOURCE_LABELS: Record<TrafficSource, string> = {
  google_ads: "Google Ads",
  organic: "Organic (căutare)",
  ai: "AI / chatbots",
  social: "Social",
  referral: "Referral",
  direct: "Direct",
  email: "Email",
  other: "Altele (UTM)",
};
