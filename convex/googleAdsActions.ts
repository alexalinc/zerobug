"use node";

import { createHash } from "crypto";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

const DATA_MANAGER_INGEST =
  "https://datamanager.googleapis.com/v1/events:ingest";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

function sha256Hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

/** Normalize email per Google Enhanced Conversions rules. */
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Normalize phone to E.164-ish digits for RO defaults when no country code.
 * Google expects hashed E.164 (e.g. +4077...).
 */
function normalizePhone(phone: string): string | null {
  const digits = phone.replace(/[^\d+]/g, "").trim();
  if (!digits) return null;
  let normalized = digits;
  if (normalized.startsWith("00")) {
    normalized = `+${normalized.slice(2)}`;
  } else if (normalized.startsWith("0") && !normalized.startsWith("+")) {
    // Romania local format → +40
    normalized = `+40${normalized.slice(1)}`;
  } else if (!normalized.startsWith("+") && normalized.length >= 10) {
    normalized = `+${normalized}`;
  }
  // Keep only + and digits
  const cleaned = normalized.replace(/[^\d+]/g, "");
  if (cleaned.replace(/\D/g, "").length < 8) return null;
  return cleaned;
}

type UserIdentifier = {
  emailAddress?: string;
  phoneNumber?: string;
};

function buildUserIdentifiers(
  email: string,
  phone?: string,
): UserIdentifier[] {
  const ids: UserIdentifier[] = [];
  const em = normalizeEmail(email);
  if (em) {
    ids.push({ emailAddress: sha256Hex(em) });
  }
  if (phone) {
    const ph = normalizePhone(phone);
    if (ph) {
      ids.push({ phoneNumber: sha256Hex(ph) });
    }
  }
  return ids;
}

async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  expiresIn: number;
  refreshToken?: string;
}> {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      "GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET lipsesc în Convex env",
    );
  }

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const json = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
    refresh_token?: string;
    error?: string;
    error_description?: string;
  };
  if (!res.ok || !json.access_token) {
    throw new Error(
      json.error_description ||
        json.error ||
        `OAuth token refresh failed (${res.status})`,
    );
  }
  return {
    accessToken: json.access_token,
    expiresIn: json.expires_in ?? 3600,
    refreshToken: json.refresh_token,
  };
}

export const uploadLeadConversion = internalAction({
  args: { leadId: v.id("leads") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const settings = await ctx.runQuery(
      internal.googleAds.getConnectionInternal,
      {},
    );
    if (
      !settings?.refreshToken ||
      !settings.enabled ||
      !settings.customerId ||
      !settings.conversionActionId
    ) {
      await ctx.runMutation(internal.googleAds.patchLeadSyncInternal, {
        leadId: args.leadId,
        googleAdsStatus: "skipped",
        googleAdsError: "Google Ads sync dezactivat sau neconfigurat",
      });
      return null;
    }

    const lead = await ctx.runQuery(internal.googleAds.getLeadInternal, {
      leadId: args.leadId,
    });
    if (!lead) {
      return null;
    }

    const hasClickId = Boolean(lead.gclid || lead.gbraid || lead.wbraid);
    const userIdentifiers = buildUserIdentifiers(lead.email, lead.phone);
    if (!hasClickId && userIdentifiers.length === 0) {
      await ctx.runMutation(internal.googleAds.patchLeadSyncInternal, {
        leadId: args.leadId,
        googleAdsStatus: "skipped",
        googleAdsError: "Fără gclid și fără email/telefon pentru match",
      });
      return null;
    }

    try {
      let accessToken = settings.accessToken as string | undefined;
      let expiresAt = settings.tokenExpiresAt as number | undefined;
      const skewMs = 60_000;
      if (
        !accessToken ||
        !expiresAt ||
        expiresAt < Date.now() + skewMs
      ) {
        const refreshed = await refreshAccessToken(settings.refreshToken);
        accessToken = refreshed.accessToken;
        expiresAt = Date.now() + refreshed.expiresIn * 1000;
        await ctx.runMutation(internal.googleAds.patchTokensInternal, {
          accessToken,
          tokenExpiresAt: expiresAt,
          refreshToken: refreshed.refreshToken,
        });
      }

      const customerId = String(settings.customerId).replace(/-/g, "");
      const loginId = settings.loginCustomerId
        ? String(settings.loginCustomerId).replace(/-/g, "")
        : customerId;

      const adIdentifiers: Record<string, string> = {};
      if (lead.gclid) adIdentifiers.gclid = lead.gclid;
      if (lead.gbraid) adIdentifiers.gbraid = lead.gbraid;
      if (lead.wbraid) adIdentifiers.wbraid = lead.wbraid;

      const event: Record<string, unknown> = {
        eventTimestamp: new Date(lead.createdAt).toISOString(),
        transactionId: String(lead._id),
        eventSource: "WEB",
        currency: "RON",
      };
      if (Object.keys(adIdentifiers).length > 0) {
        event.adIdentifiers = adIdentifiers;
      }
      if (userIdentifiers.length > 0) {
        event.userData = { userIdentifiers };
      }
      if (typeof lead.budget === "number" && lead.budget > 0) {
        event.conversionValue = lead.budget;
      }

      const payload = {
        destinations: [
          {
            operatingAccount: {
              accountType: "GOOGLE_ADS",
              accountId: customerId,
            },
            loginAccount: {
              accountType: "GOOGLE_ADS",
              accountId: loginId,
            },
            productDestinationId: String(settings.conversionActionId),
          },
        ],
        encoding: "HEX",
        consent: {
          adUserData: "CONSENT_GRANTED",
          adPersonalization: "CONSENT_GRANTED",
        },
        events: [event],
      };

      const res = await fetch(DATA_MANAGER_INGEST, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let json: { requestId?: string; error?: { message?: string } } = {};
      try {
        json = JSON.parse(text) as typeof json;
      } catch {
        /* non-JSON body */
      }

      if (!res.ok) {
        const msg =
          json.error?.message ||
          text.slice(0, 400) ||
          `Data Manager error ${res.status}`;
        console.error("Google Ads ingest failed:", msg);
        await ctx.runMutation(internal.googleAds.patchLeadSyncInternal, {
          leadId: args.leadId,
          googleAdsStatus: "failed",
          googleAdsError: msg,
        });
        return null;
      }

      await ctx.runMutation(internal.googleAds.patchLeadSyncInternal, {
        leadId: args.leadId,
        googleAdsStatus: "sent",
        googleAdsError: undefined,
        googleAdsRequestId: json.requestId,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload eșuat";
      console.error("Google Ads uploadLeadConversion:", msg);
      await ctx.runMutation(internal.googleAds.patchLeadSyncInternal, {
        leadId: args.leadId,
        googleAdsStatus: "failed",
        googleAdsError: msg,
      });
    }

    return null;
  },
});
