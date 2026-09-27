"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type RefObject,
} from "react";
import { usePathname } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { hasAnalyticsConsent } from "@/lib/cookie-consent";
import {
  getConvexSessionId,
  getOrCreateLocalSession,
  getVisitorId,
  type QuoteFormType,
  type QuoteFunnelEventName,
} from "@/lib/site-analytics";

type TrackArgs = {
  event: QuoteFunnelEventName;
  step?: string;
  stepLabel?: string;
  field?: string;
};

/**
 * Tracks quote-form funnel events (view / start / step / abandon / submit).
 * No-ops without analytics consent or an active session.
 */
export function useQuoteFunnel(formType: QuoteFormType) {
  const pathname = usePathname();
  const trackQuoteEvent = useMutation(api.analytics.trackQuoteEvent);
  const startedAtRef = useRef<number | null>(null);
  const lastStepRef = useRef<string | undefined>(undefined);
  const startedRef = useRef(false);
  const submittedRef = useRef(false);
  const viewedRef = useRef(false);

  const track = useCallback(
    async (args: TrackArgs) => {
      if (!hasAnalyticsConsent()) return;
      const visitorId = getVisitorId();
      const sessionId = getConvexSessionId() as Id<"analyticsSessions"> | null;
      const local = getOrCreateLocalSession();
      if (!visitorId || !sessionId || !local) return;

      if (args.event === "view") {
        if (viewedRef.current) return;
        viewedRef.current = true;
      }
      if (args.event === "start") {
        if (!startedRef.current) {
          startedRef.current = true;
          startedAtRef.current = Date.now();
        }
      }
      if (
        (args.event === "step" || args.event === "field") &&
        !startedRef.current
      ) {
        startedRef.current = true;
        startedAtRef.current = Date.now();
      }
      if (args.event === "submit") {
        submittedRef.current = true;
      }
      if (args.step) lastStepRef.current = args.step;

      const durationMs =
        startedAtRef.current != null
          ? Date.now() - startedAtRef.current
          : undefined;

      try {
        await trackQuoteEvent({
          visitorId,
          sessionId,
          formType,
          event: args.event,
          step: args.step,
          stepLabel: args.stepLabel,
          field: args.field,
          path: pathname || "/",
          source: local.attribution.source,
          durationMs,
        });
      } catch {
        /* ignore */
      }
    },
    [formType, pathname, trackQuoteEvent],
  );

  const trackView = useCallback(() => {
    void track({ event: "view", step: "view", stepLabel: "Văzut formular" });
  }, [track]);

  const trackStart = useCallback(
    (step?: string, stepLabel?: string) => {
      if (startedRef.current) {
        if (step) void track({ event: "step", step, stepLabel });
        return;
      }
      void track({
        event: "start",
        step: step ?? "start",
        stepLabel: stepLabel ?? "Început",
      });
    },
    [track],
  );

  const lastStepSentRef = useRef<string | undefined>(undefined);

  const trackStep = useCallback(
    (step: string, stepLabel?: string) => {
      if (lastStepSentRef.current === step) return;
      lastStepSentRef.current = step;
      void track({ event: "step", step, stepLabel });
    },
    [track],
  );

  const trackField = useCallback(
    (field: string, step?: string) => {
      void track({
        event: startedRef.current ? "field" : "start",
        field,
        step: step ?? lastStepRef.current ?? "contact",
        stepLabel: step ?? "Contact",
      });
    },
    [track],
  );

  const trackSubmit = useCallback(() => {
    void track({
      event: "submit",
      step: "submit",
      stepLabel: "Trimis",
    });
  }, [track]);

  const trackAbandon = useCallback(() => {
    if (!startedRef.current || submittedRef.current) return;
    void track({
      event: "abandon",
      step: lastStepRef.current,
      stepLabel: lastStepRef.current,
    });
  }, [track]);

  useEffect(() => {
    function onLeave() {
      trackAbandon();
    }
    function onVisibility() {
      if (document.visibilityState === "hidden") onLeave();
    }
    window.addEventListener("pagehide", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      onLeave();
    };
  }, [trackAbandon]);

  return {
    trackView,
    trackStart,
    trackStep,
    trackField,
    trackSubmit,
    trackAbandon,
  };
}

/** IntersectionObserver helper: fire trackView once when form enters viewport. */
export function useQuoteFunnelVisibility(
  formRef: RefObject<HTMLElement | null>,
  trackView: () => void,
) {
  useEffect(() => {
    const el = formRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          trackView();
          obs.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [formRef, trackView]);
}
