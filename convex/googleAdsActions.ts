"use node";

import { createHash } from "crypto";
import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

const DATA_MANAGER_INGEST =
  "https://datamanager.googleapis.com/v1/events:ingest";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
/** Google Ads API version for listing resources (v19 sunset Feb 2026) */
const ADS_API = "https://googleads.googleapis.com/v25";

/** Fixed conversion value for every lead (contact / quote / maintenance). */
export const LEAD_CONVERSION_VALUE_RON = 20;

function sha256Hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizePhone(phone: string): string | null {
  const digits = phone.replace(/[^\d+]/g, "").trim();
  if (!digits) return null;
  let normalized = digits;
  if (normalized.startsWith("00")) {
    normalized = `+${normalized.slice(2)}`;
  } else if (normalized.startsWith("0") && !normalized.startsWith("+")) {
    normalized = `+40${normalized.slice(1)}`;
  } else if (!normalized.startsWith("+") && normalized.length >= 10) {
    normalized = `+${normalized}`;
  }
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

type SettingsRow = {
  refreshToken: string;
  accessToken?: string;
  tokenExpiresAt?: number;
  customerId?: string;
  loginCustomerId?: string;
  conversionActionId?: string;
  conversionValueRon?: number;
  enabled?: boolean;
};

async function ensureAccessToken(
  ctx: {
    runMutation: (
      ref: typeof internal.googleAds.patchTokensInternal,
      args: {
        accessToken: string;
        tokenExpiresAt: number;
        refreshToken?: string;
      },
    ) => Promise<null>;
  },
  settings: SettingsRow,
): Promise<string> {
  let accessToken = settings.accessToken;
  let expiresAt = settings.tokenExpiresAt;
  const skewMs = 60_000;
  if (!accessToken || !expiresAt || expiresAt < Date.now() + skewMs) {
    const refreshed = await refreshAccessToken(settings.refreshToken);
    accessToken = refreshed.accessToken;
    expiresAt = Date.now() + refreshed.expiresIn * 1000;
    await ctx.runMutation(internal.googleAds.patchTokensInternal, {
      accessToken,
      tokenExpiresAt: expiresAt,
      refreshToken: refreshed.refreshToken,
    });
  }
  return accessToken;
}

async function googleAdsSearch(
  accessToken: string,
  customerId: string,
  loginCustomerId: string,
  query: string,
): Promise<unknown[]> {
  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN?.trim();
  if (!developerToken) {
    throw new Error(
      "GOOGLE_ADS_DEVELOPER_TOKEN lipsește în Convex env (API Center Google Ads). Verifică Deployment = Production în Dashboard.",
    );
  }

  const res = await fetch(
    `${ADS_API}/customers/${customerId}/googleAds:search`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "developer-token": developerToken,
        "login-customer-id": loginCustomerId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    },
  );

  const text = await res.text();
  let json: {
    results?: unknown[];
    error?: { message?: string };
  } = {};
  try {
    json = JSON.parse(text) as typeof json;
  } catch {
    /* ignore */
  }

  if (!res.ok) {
    const apiMsg = json.error?.message || "";
    if (/insufficient.*scope|ACCESS_TOKEN_SCOPE_INSUFFICIENT/i.test(apiMsg + text)) {
      throw new Error(
        "Lipsește permisiunea Google Ads (scope adwords). Deconectează contul, apoi reconectează și acceptă toate permisiunile.",
      );
    }
    const snippet = text.trimStart().startsWith("<!")
      ? `Google Ads API ${res.status} (endpoint invalid / versiune scoasă din uz). Verifică customer ID.`
      : text.slice(0, 400);
    throw new Error(
      apiMsg || snippet || `Google Ads search failed (${res.status})`,
    );
  }

  return json.results ?? [];
}

export const uploadLeadConversion = internalAction({
  args: { leadId: v.id("leads") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const settings = (await ctx.runQuery(
      internal.googleAds.getConnectionInternal,
      {},
    )) as SettingsRow | null;
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

    if (!lead.marketingConsent) {
      await ctx.runMutation(internal.googleAds.patchLeadSyncInternal, {
        leadId: args.leadId,
        googleAdsStatus: "skipped",
        googleAdsError: "Fără consimțământ marketing (cookie banner)",
      });
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
      const accessToken = await ensureAccessToken(ctx, settings);

      const customerId = String(settings.customerId).replace(/-/g, "");
      const loginId = settings.loginCustomerId
        ? String(settings.loginCustomerId).replace(/-/g, "")
        : customerId;

      const adIdentifiers: Record<string, string> = {};
      if (lead.gclid) adIdentifiers.gclid = lead.gclid;
      if (lead.gbraid) adIdentifiers.gbraid = lead.gbraid;
      if (lead.wbraid) adIdentifiers.wbraid = lead.wbraid;

      const valueRon =
        typeof settings.conversionValueRon === "number" &&
        settings.conversionValueRon > 0
          ? settings.conversionValueRon
          : LEAD_CONVERSION_VALUE_RON;

      const event: Record<string, unknown> = {
        eventTimestamp: new Date(lead.createdAt).toISOString(),
        transactionId: String(lead._id),
        eventSource: "WEB",
        currency: "RON",
        conversionValue: valueRon,
      };
      if (Object.keys(adIdentifiers).length > 0) {
        event.adIdentifiers = adIdentifiers;
      }
      if (userIdentifiers.length > 0) {
        event.userData = { userIdentifiers };
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

const campaignItem = v.object({
  id: v.string(),
  name: v.string(),
  status: v.string(),
  channelType: v.optional(v.string()),
});

const conversionItem = v.object({
  id: v.string(),
  name: v.string(),
  type: v.optional(v.string()),
  status: v.optional(v.string()),
  category: v.optional(v.string()),
});

/** List ENABLED campaigns for the connected customer. */
export const listCampaigns = action({
  args: {
    customerId: v.optional(v.string()),
    loginCustomerId: v.optional(v.string()),
  },
  returns: v.object({
    campaigns: v.array(campaignItem),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const settings = (await ctx.runQuery(
      internal.googleAds.getConnectionInternal,
      {},
    )) as SettingsRow | null;
    const customerId = (args.customerId || settings?.customerId || "")
      .replace(/-/g, "")
      .trim();
    if (!settings?.refreshToken || !customerId) {
      return {
        campaigns: [],
        error: "Conectează Google Ads și setează Customer ID",
      };
    }
    try {
      const accessToken = await ensureAccessToken(ctx, settings);
      const loginId = (
        args.loginCustomerId ||
        settings.loginCustomerId ||
        customerId
      )
        .replace(/-/g, "")
        .trim();

      const results = await googleAdsSearch(
        accessToken,
        customerId,
        loginId,
        `SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type
         FROM campaign
         WHERE campaign.status = 'ENABLED'
         ORDER BY campaign.name`,
      );

      const campaigns = results
        .map((row) => {
          const r = row as {
            campaign?: {
              id?: string | number;
              name?: string;
              status?: string;
              advertisingChannelType?: string;
            };
          };
          return {
            id: String(r.campaign?.id ?? ""),
            name: r.campaign?.name ?? "(fără nume)",
            status: r.campaign?.status ?? "UNKNOWN",
            channelType: r.campaign?.advertisingChannelType,
          };
        })
        .filter((c) => c.id);

      return { campaigns };
    } catch (err) {
      return {
        campaigns: [],
        error: err instanceof Error ? err.message : "Listare campanii eșuată",
      };
    }
  },
});

/** List conversion actions (goals) for selection. */
export const listConversionActions = action({
  args: {
    customerId: v.optional(v.string()),
    loginCustomerId: v.optional(v.string()),
  },
  returns: v.object({
    conversions: v.array(conversionItem),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const settings = (await ctx.runQuery(
      internal.googleAds.getConnectionInternal,
      {},
    )) as SettingsRow | null;
    const customerId = (args.customerId || settings?.customerId || "")
      .replace(/-/g, "")
      .trim();
    if (!settings?.refreshToken || !customerId) {
      return {
        conversions: [],
        error: "Conectează Google Ads și setează Customer ID",
      };
    }
    try {
      const accessToken = await ensureAccessToken(ctx, settings);
      const loginId = (
        args.loginCustomerId ||
        settings.loginCustomerId ||
        customerId
      )
        .replace(/-/g, "")
        .trim();

      const results = await googleAdsSearch(
        accessToken,
        customerId,
        loginId,
        `SELECT conversion_action.id, conversion_action.name, conversion_action.type,
                conversion_action.status, conversion_action.category
         FROM conversion_action
         WHERE conversion_action.status != 'REMOVED'
         ORDER BY conversion_action.name`,
      );

      const conversions = results
        .map((row) => {
          const r = row as {
            conversionAction?: {
              id?: string | number;
              name?: string;
              type?: string;
              status?: string;
              category?: string;
            };
          };
          return {
            id: String(r.conversionAction?.id ?? ""),
            name: r.conversionAction?.name ?? "(fără nume)",
            type: r.conversionAction?.type,
            status: r.conversionAction?.status,
            category: r.conversionAction?.category,
          };
        })
        .filter((c) => c.id);

      return { conversions };
    } catch (err) {
      return {
        conversions: [],
        error:
          err instanceof Error
            ? err.message
            : "Listare conversion actions eșuată",
      };
    }
  },
});
