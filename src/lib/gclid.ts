/**
 * First-party capture of Google Ads click IDs for offline / enhanced conversions.
 * Only persisted / returned when the visitor granted marketing cookie consent.
 */

import { hasMarketingConsent } from "@/lib/cookie-consent";

const COOKIE_NAME = "zb_gads";
const MAX_AGE_SEC = 60 * 60 * 24 * 90;

export type AdsClickIds = {
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
};

function readCookieRaw(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${COOKIE_NAME}=`));
  if (!match) return null;
  return decodeURIComponent(match.slice(COOKIE_NAME.length + 1));
}

function writeCookie(ids: AdsClickIds) {
  if (typeof document === "undefined") return;
  if (!hasMarketingConsent()) return;
  const payload = encodeURIComponent(JSON.stringify(ids));
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";
  document.cookie = `${COOKIE_NAME}=${payload}; Path=/; Max-Age=${MAX_AGE_SEC}; SameSite=Lax${secure}`;
}

export function clearAdsClickIdsCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function parseAdsClickIdsFromSearch(
  search: string = typeof window !== "undefined" ? window.location.search : "",
): AdsClickIds {
  const params = new URLSearchParams(search);
  const out: AdsClickIds = {};
  const gclid = params.get("gclid")?.trim();
  const gbraid = params.get("gbraid")?.trim();
  const wbraid = params.get("wbraid")?.trim();
  if (gclid) out.gclid = gclid;
  if (gbraid) out.gbraid = gbraid;
  if (wbraid) out.wbraid = wbraid;
  return out;
}

export function captureAdsClickIdsFromUrl(): AdsClickIds {
  if (!hasMarketingConsent()) {
    return {};
  }
  const fromUrl = parseAdsClickIdsFromSearch();
  if (!fromUrl.gclid && !fromUrl.gbraid && !fromUrl.wbraid) {
    return getStoredAdsClickIds();
  }
  const existing = getStoredAdsClickIds();
  const merged: AdsClickIds = {
    gclid: fromUrl.gclid || existing.gclid,
    gbraid: fromUrl.gbraid || existing.gbraid,
    wbraid: fromUrl.wbraid || existing.wbraid,
  };
  writeCookie(merged);
  return merged;
}

export function getStoredAdsClickIds(): AdsClickIds {
  if (!hasMarketingConsent()) return {};
  const raw = readCookieRaw();
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as AdsClickIds;
    return {
      gclid: parsed.gclid || undefined,
      gbraid: parsed.gbraid || undefined,
      wbraid: parsed.wbraid || undefined,
    };
  } catch {
    return {};
  }
}

/** Call from lead form submit — ids only if marketing consent is granted. */
export function getAdsClickIdsForLead(): AdsClickIds {
  if (!hasMarketingConsent()) return {};
  const fromUrl = parseAdsClickIdsFromSearch();
  if (fromUrl.gclid || fromUrl.gbraid || fromUrl.wbraid) {
    writeCookie({
      ...getStoredAdsClickIds(),
      ...fromUrl,
    });
    return { ...getStoredAdsClickIds(), ...fromUrl };
  }
  return getStoredAdsClickIds();
}

export function getMarketingConsentForLead(): boolean {
  return hasMarketingConsent();
}
