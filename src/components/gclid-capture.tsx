"use client";

import { useEffect } from "react";
import { hasMarketingConsent } from "@/lib/cookie-consent";
import { captureAdsClickIdsFromUrl, clearAdsClickIdsCookie } from "@/lib/gclid";

/** Persists gclid/gbraid/wbraid only after marketing cookie consent. */
export function GclidCapture() {
  useEffect(() => {
    function sync() {
      if (hasMarketingConsent()) {
        captureAdsClickIdsFromUrl();
      } else {
        clearAdsClickIdsCookie();
      }
    }
    sync();
    window.addEventListener("zb-cookie-consent-changed", sync);
    return () => window.removeEventListener("zb-cookie-consent-changed", sync);
  }, []);
  return null;
}
