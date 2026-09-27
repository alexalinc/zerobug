"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { hasAnalyticsConsent } from "@/lib/cookie-consent";
import {
  getConvexSessionId,
  getOrCreateLocalSession,
  getVisitorId,
  isTrackablePath,
  normalizeAnalyticsPath,
  setConvexSessionId,
} from "@/lib/site-analytics";

/**
 * Tracks pageviews + session attribution when analytics cookies are allowed.
 * Mount once in the root layout (outside /admin is filtered automatically).
 */
export function SiteAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const startSession = useMutation(api.analytics.startOrResumeSession);
  const trackPageview = useMutation(api.analytics.trackPageview);
  const leavePageview = useMutation(api.analytics.leavePageview);

  const pageviewIdRef = useRef<Id<"analyticsPageviews"> | null>(null);
  const previousPathRef = useRef<string | undefined>(undefined);
  const enabledRef = useRef(false);

  useEffect(() => {
    function syncConsent() {
      enabledRef.current = hasAnalyticsConsent();
    }
    syncConsent();
    window.addEventListener("zb-cookie-consent-changed", syncConsent);
    return () =>
      window.removeEventListener("zb-cookie-consent-changed", syncConsent);
  }, []);

  useEffect(() => {
    if (!hasAnalyticsConsent()) return;
    if (!isTrackablePath(pathname)) return;

    const path = normalizeAnalyticsPath(pathname);
    if (!path) return;

    let cancelled = false;

    async function run() {
      const visitorId = getVisitorId();
      const local = getOrCreateLocalSession();
      if (!visitorId || !local) return;

      try {
        const existing =
          (getConvexSessionId() as Id<"analyticsSessions"> | null) ?? undefined;
        const sessionId = await startSession({
          visitorId,
          sessionLocalId: local.localId,
          landingPath: path,
          referrer: local.attribution.referrer,
          referrerHost: local.attribution.referrerHost,
          utmSource: local.attribution.utmSource,
          utmMedium: local.attribution.utmMedium,
          utmCampaign: local.attribution.utmCampaign,
          source: local.attribution.source,
          existingSessionId: existing,
        });
        if (cancelled) return;
        setConvexSessionId(sessionId);

        // Close previous pageview
        const prevId = pageviewIdRef.current;
        const { pageviewId } = await trackPageview({
          visitorId,
          sessionId,
          path,
          title:
            typeof document !== "undefined" ? document.title.slice(0, 200) : undefined,
          previousPath: previousPathRef.current,
          source: local.attribution.source,
          previousPageviewId: prevId ?? undefined,
        });
        if (cancelled) return;
        pageviewIdRef.current = pageviewId;
        previousPathRef.current = path;
      } catch {
        /* ignore tracking failures */
      }
    }

    void run();

    function onLeave() {
      const visitorId = getVisitorId();
      const pv = pageviewIdRef.current;
      if (!visitorId || !pv) return;
      void leavePageview({ visitorId, pageviewId: pv }).catch(() => {});
    }

    function onVisibility() {
      if (document.visibilityState === "hidden") onLeave();
    }

    window.addEventListener("pagehide", onLeave);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      window.removeEventListener("pagehide", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // searchParams included so UTM landings re-attribute
  }, [pathname, searchParams, startSession, trackPageview, leavePageview]);

  return null;
}
