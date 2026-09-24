/**
 * First-party capture of Google Ads click IDs for offline / enhanced conversions.
 * Cookie lasts ~90 days (Ads click attribution window).
 */

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
  const payload = encodeURIComponent(JSON.stringify(ids));
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";
  document.cookie = `${COOKIE_NAME}=${payload}; Path=/; Max-Age=${MAX_AGE_SEC}; SameSite=Lax${secure}`;
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

/** Call from lead form submit — returns ids to pass into leads.create */
export function getAdsClickIdsForLead(): AdsClickIds {
  // Prefer fresh URL params, fall back to cookie
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
