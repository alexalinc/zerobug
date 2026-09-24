"use client";

import { useEffect } from "react";
import { captureAdsClickIdsFromUrl } from "@/lib/gclid";

/** Persists gclid/gbraid/wbraid from the landing URL into a first-party cookie. */
export function GclidCapture() {
  useEffect(() => {
    captureAdsClickIdsFromUrl();
  }, []);
  return null;
}
