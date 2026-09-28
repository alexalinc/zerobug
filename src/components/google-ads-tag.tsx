"use client";

import Script from "next/script";
import { useEffect } from "react";
import {
  getCookiePreferences,
  hasAnalyticsConsent,
  hasMarketingConsent,
} from "@/lib/cookie-consent";
import { GOOGLE_ADS_ID } from "@/lib/google-ads-tag";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function applyConsentUpdate() {
  if (typeof window.gtag !== "function") return;
  const marketing = hasMarketingConsent();
  const analytics = hasAnalyticsConsent();
  window.gtag("consent", "update", {
    ad_storage: marketing ? "granted" : "denied",
    ad_user_data: marketing ? "granted" : "denied",
    ad_personalization: marketing ? "granted" : "denied",
    analytics_storage: analytics ? "granted" : "denied",
  });
}

/**
 * Google Ads tag (gtag.js) with Consent Mode v2.
 * Tag loads site-wide; storage stays denied until cookie prefs allow it.
 */
export function GoogleAdsTag() {
  useEffect(() => {
    applyConsentUpdate();
    window.addEventListener("zb-cookie-consent-changed", applyConsentUpdate);
    return () =>
      window.removeEventListener(
        "zb-cookie-consent-changed",
        applyConsentUpdate,
      );
  }, []);

  return (
    <>
      <Script
        id="google-ads-consent-default"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            (function(){
              var marketing = false, analytics = false;
              try {
                var raw = localStorage.getItem("cookie-preferences");
                if (raw) {
                  var p = JSON.parse(raw);
                  marketing = !!p.marketing;
                  analytics = !!p.analytics;
                } else if (localStorage.getItem("cookie-consent") === "true") {
                  marketing = true;
                  analytics = true;
                }
              } catch (e) {}
              gtag("consent", "default", {
                ad_storage: marketing ? "granted" : "denied",
                ad_user_data: marketing ? "granted" : "denied",
                ad_personalization: marketing ? "granted" : "denied",
                analytics_storage: analytics ? "granted" : "denied",
                wait_for_update: 500
              });
            })();
          `,
        }}
      />
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-ads-gtag-config"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag("js", new Date());
            gtag("config", "${GOOGLE_ADS_ID}");
          `,
        }}
        onReady={() => {
          // Re-apply in case prefs changed while scripts were loading
          if (getCookiePreferences()) applyConsentUpdate();
        }}
      />
    </>
  );
}
