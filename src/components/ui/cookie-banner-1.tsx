"use client";

import { useEffect, useRef, useState } from "react";
import {
  Cookie,
  Shield,
  Info,
  X,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getCookiePreferences,
  hasMarketingConsent,
  setCookieConsentAccepted,
  setCookiePreferences,
  type CookiePrefs,
} from "@/lib/cookie-consent";
import { captureAdsClickIdsFromUrl } from "@/lib/gclid";

type Prefs = CookiePrefs;

interface CookiePanelProps {
  title?: string;
  message?: string;
  acceptText?: string;
  customizeText?: string;
  icon?: "cookie" | "shield" | "info";
  className?: string;
  privacyHref?: string;
  termsHref?: string;
}

const CookiePanel = (props: CookiePanelProps) => {
  const {
    title = "Acest site folosește cookie-uri",
    message =
      "Folosim cookie-uri pentru ca site-ul să funcționeze. Cookie-urile de marketing le folosim doar dacă ești de acord, ca să măsurăm eficiența reclamelor.",
    acceptText = "Accept toate",
    customizeText = "Personalizează",
    icon = "cookie",
    className,
    privacyHref = "/politica-confidentialitate",
    termsHref = "/termeni",
  } = props;

  const [visible, setVisible] = useState(false);
  const [render, setRender] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
  });

  const prefsRef = useRef<HTMLDivElement | null>(null);
  const [prefsHeight, setPrefsHeight] = useState<number>(0);

  useEffect(() => {
    const stored =
      typeof window !== "undefined"
        ? localStorage.getItem("cookie-consent")
        : null;

    if (!stored) {
      setRender(true);
      requestAnimationFrame(() => setVisible(true));
    }

    const existing = getCookiePreferences();
    if (existing) {
      setPrefs({ ...existing, necessary: true });
    }
  }, []);

  useEffect(() => {
    if (showPrefs && prefsRef.current) {
      setPrefsHeight(prefsRef.current.scrollHeight);
    } else {
      setPrefsHeight(0);
    }
  }, [showPrefs, prefs]);

  const afterConsent = (next: Prefs) => {
    setCookiePreferences(next);
    setCookieConsentAccepted(true);
    if (next.marketing || hasMarketingConsent()) {
      captureAdsClickIdsFromUrl();
    }
    window.dispatchEvent(new Event("zb-cookie-consent-changed"));
  };

  const closeWithExit = (val?: "true" | "false") => {
    if (val === "true") {
      const allOn: Prefs = {
        necessary: true,
        functional: true,
        analytics: true,
        marketing: true,
      };
      setPrefs(allOn);
      afterConsent(allOn);
    } else if (val === "false") {
      const essential: Prefs = {
        necessary: true,
        functional: false,
        analytics: false,
        marketing: false,
      };
      setPrefs(essential);
      afterConsent(essential);
    }
    setVisible(false);
    setTimeout(() => setRender(false), 300);
  };

  const savePreferences = () => {
    const next = { ...prefs, necessary: true };
    afterConsent(next);
    setShowPrefs(false);
    setVisible(false);
    setTimeout(() => setRender(false), 300);
  };

  if (!render) return null;

  const IconEl =
    icon === "shield" ? Shield : icon === "info" ? Info : Cookie;

  const PrefRow = ({
    title: rowTitle,
    desc,
    field,
    locked,
  }: {
    title: string;
    desc: string;
    field: keyof Prefs;
    locked?: boolean;
  }) => (
    <div className="flex items-start gap-2 rounded-lg border border-white/10 p-2">
      <button
        type="button"
        disabled={locked}
        onClick={() =>
          !locked && setPrefs((p) => ({ ...p, [field]: !p[field] }))
        }
        className={cn(
          "mt-0.5 inline-flex size-5 items-center justify-center rounded border",
          locked
            ? "cursor-not-allowed border-white/10 bg-white/5 text-zinc-500"
            : "cursor-pointer border-white/15 bg-zinc-900 hover:bg-white/10",
        )}
        aria-pressed={prefs[field]}
        aria-label={`${rowTitle} preferință cookie`}
      >
        {prefs[field] && <Check className="size-4" />}
      </button>

      <div className="flex-1">
        <div className="text-xs font-medium text-zinc-200">
          {rowTitle}{" "}
          {locked && (
            <span className="text-[10px] text-zinc-500">(obligatoriu)</span>
          )}
        </div>
        <p className="mt-0.5 text-[10px] text-zinc-500">{desc}</p>
      </div>
    </div>
  );

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Consimțământ cookie-uri"
      className={cn(
        "fixed right-4 bottom-4 z-50 w-[360px] max-w-[90vw] md:right-6 md:bottom-6",
      )}
    >
      <div
        className={cn(
          "relative flex flex-col gap-3 rounded-xl border border-white/10 bg-zinc-950/95 p-4 text-zinc-100 shadow-xl backdrop-blur",
          visible
            ? "animate-in fade-in slide-in-from-bottom-8"
            : "animate-out fade-out slide-out-to-bottom-8",
          "duration-300 ease-out",
          className,
        )}
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
            <IconEl className="size-5" aria-hidden="true" />
          </span>

          <h2 className="text-sm font-semibold leading-5">{title}</h2>

          <button
            type="button"
            onClick={() => closeWithExit("false")}
            className="ml-auto inline-flex size-8 cursor-pointer items-center justify-center rounded-md hover:bg-white/5"
            aria-label="Închide banner cookie"
          >
            <X className="size-4 text-zinc-500" />
          </button>
        </div>

        <p className="text-xs leading-5 text-zinc-400">
          {message} Vezi{" "}
          <a
            href={privacyHref}
            className="cursor-pointer underline underline-offset-4 hover:text-white"
          >
            Politica de confidențialitate
          </a>{" "}
          și{" "}
          <a
            href={termsHref}
            className="cursor-pointer underline underline-offset-4 hover:text-white"
          >
            Termenii și condițiile
          </a>
          .
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPrefs((p) => !p)}
            className={cn(
              "flex cursor-pointer items-center gap-1 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300",
              "transition-colors hover:bg-white/10",
            )}
            aria-expanded={showPrefs}
            aria-controls="cookie-preferences-inline"
          >
            {customizeText}
            {showPrefs ? (
              <ChevronUp className="size-3" />
            ) : (
              <ChevronDown className="size-3" />
            )}
          </button>

          <button
            type="button"
            onClick={() => closeWithExit("true")}
            className={cn(
              "cursor-pointer rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-medium text-zinc-950",
              "transition-colors hover:bg-emerald-400",
            )}
          >
            {acceptText}
          </button>
        </div>

        <div
          id="cookie-preferences-inline"
          ref={prefsRef}
          style={{ height: prefsHeight ? `${prefsHeight}px` : 0 }}
          className="overflow-hidden transition-[height] duration-300 ease-out will-change-[height]"
        >
          {showPrefs && (
            <div className="mt-2 flex animate-in flex-col gap-2 fade-in slide-in-from-bottom-2 duration-200">
              <PrefRow
                title="Strict necesare"
                desc="Autentificare admin, securitate, funcționare de bază."
                field="necessary"
                locked
              />
              <PrefRow
                title="Funcționale"
                desc="Reține preferințe de interfață."
                field="functional"
              />
              <PrefRow
                title="Analitică"
                desc="Ne ajută să înțelegem utilizarea site-ului."
                field="analytics"
              />
              <PrefRow
                title="Marketing"
                desc="Ne ajută să măsurăm dacă reclamele aduc vizite și cereri pe site."
                field="marketing"
              />

              <div className="mt-1 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPrefs(false)}
                  className="cursor-pointer rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-400 hover:bg-white/10"
                >
                  Anulează
                </button>
                <button
                  type="button"
                  onClick={savePreferences}
                  className="cursor-pointer rounded-md bg-emerald-500 px-2.5 py-1 text-xs font-medium text-zinc-950 hover:bg-emerald-400"
                >
                  Salvează
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { CookiePanel };
