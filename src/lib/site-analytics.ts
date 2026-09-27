/**
 * First-party site analytics helpers (visitor/session IDs in localStorage).
 * Only used when the visitor granted analytics cookie consent.
 */

import { hasAnalyticsConsent } from "@/lib/cookie-consent";
import {
  detectTrafficSource,
  type TrafficAttribution,
  type TrafficSource,
} from "@/lib/traffic-source";
import { parseAdsClickIdsFromSearch, getStoredAdsClickIds } from "@/lib/gclid";

const VISITOR_KEY = "zb_vid";
const SESSION_KEY = "zb_asid";
const SESSION_CONVEX_KEY = "zb_asid_convex";
const ATTR_KEY = "zb_attr";
const SESSION_TTL_MS = 30 * 60 * 1000;

export type StoredSession = {
  localId: string;
  convexId?: string;
  startedAt: number;
  lastSeenAt: number;
  attribution: TrafficAttribution;
};

function randomId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `zb_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getVisitorId(): string | null {
  if (typeof window === "undefined") return null;
  if (!hasAnalyticsConsent()) return null;
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = randomId();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

function readSessionRaw(): StoredSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

function writeSession(session: StoredSession) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    if (session.convexId) {
      sessionStorage.setItem(SESSION_CONVEX_KEY, session.convexId);
    }
    sessionStorage.setItem(ATTR_KEY, JSON.stringify(session.attribution));
  } catch {
    /* ignore */
  }
}

export function getConvexSessionId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(SESSION_CONVEX_KEY);
  } catch {
    return null;
  }
}

export function setConvexSessionId(id: string) {
  const session = readSessionRaw();
  if (session) {
    session.convexId = id;
    writeSession(session);
  } else {
    try {
      sessionStorage.setItem(SESSION_CONVEX_KEY, id);
    } catch {
      /* ignore */
    }
  }
}

export function getOrCreateLocalSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  if (!hasAnalyticsConsent()) return null;

  const now = Date.now();
  const existing = readSessionRaw();
  const adsFromUrl = parseAdsClickIdsFromSearch();
  const adsStored = getStoredAdsClickIds();
  const hasAdsClickId = Boolean(
    adsFromUrl.gclid ||
      adsFromUrl.gbraid ||
      adsFromUrl.wbraid ||
      adsStored.gclid ||
      adsStored.gbraid ||
      adsStored.wbraid,
  );

  const freshAttribution = detectTrafficSource({
    search: window.location.search,
    referrer: document.referrer || undefined,
    hasAdsClickId,
  });

  const shouldRefresh =
    !existing ||
    now - existing.lastSeenAt > SESSION_TTL_MS ||
    // New paid / UTM landing within an idle session
    (freshAttribution.source !== "direct" &&
      freshAttribution.source !== existing.attribution.source &&
      Boolean(
        window.location.search.includes("utm_") ||
          window.location.search.includes("gclid") ||
          window.location.search.includes("gbraid") ||
          window.location.search.includes("wbraid"),
      ));

  if (!shouldRefresh && existing) {
    existing.lastSeenAt = now;
    writeSession(existing);
    return existing;
  }

  const session: StoredSession = {
    localId: randomId(),
    startedAt: now,
    lastSeenAt: now,
    attribution: freshAttribution,
  };
  writeSession(session);
  return session;
}

export function getSessionAttribution(): TrafficAttribution | null {
  const session = getOrCreateLocalSession();
  return session?.attribution ?? null;
}

export function normalizeAnalyticsPath(pathname: string): string {
  if (!pathname) return "/";
  if (pathname.startsWith("/admin")) return "";
  // Drop trailing slash except root
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function isTrackablePath(pathname: string): boolean {
  return Boolean(normalizeAnalyticsPath(pathname));
}

export type QuoteFormType = "contact" | "service_quote" | "maintenance";

export type QuoteFunnelEventName =
  | "view"
  | "start"
  | "step"
  | "field"
  | "abandon"
  | "submit";

export { type TrafficSource };
