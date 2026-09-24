/** Cookie consent helpers — marketing = Google Ads identifiers + EC. */

export type CookiePrefs = {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
};

const CONSENT_KEY = "cookie-consent";
const PREFS_KEY = "cookie-preferences";

export function getCookiePreferences(): CookiePrefs | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(PREFS_KEY);
  if (!raw) {
    // Legacy: accept-all without prefs object
    if (localStorage.getItem(CONSENT_KEY) === "true") {
      return {
        necessary: true,
        functional: true,
        analytics: true,
        marketing: true,
      };
    }
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<CookiePrefs>;
    return {
      necessary: true,
      functional: Boolean(parsed.functional),
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
    };
  } catch {
    return null;
  }
}

export function hasMarketingConsent(): boolean {
  const prefs = getCookiePreferences();
  return Boolean(prefs?.marketing);
}

export function setCookiePreferences(prefs: CookiePrefs) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    PREFS_KEY,
    JSON.stringify({ ...prefs, necessary: true }),
  );
}

export function setCookieConsentAccepted(accepted: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CONSENT_KEY, accepted ? "true" : "false");
}

export function hasAnsweredCookieBanner(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(CONSENT_KEY) != null;
}
