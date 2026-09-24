import { SignJWT, jwtVerify } from "jose";

const OAUTH_SCOPE = [
  "https://www.googleapis.com/auth/datamanager",
  "https://www.googleapis.com/auth/adwords",
  "https://www.googleapis.com/auth/userinfo.email",
  "openid",
].join(" ");
const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

function getOAuthSecret() {
  const secret =
    process.env.ADMIN_SESSION_SECRET ||
    process.env.GOOGLE_OAUTH_CLIENT_SECRET ||
    "zerobug-google-oauth-state";
  return new TextEncoder().encode(secret);
}

export function getGoogleOAuthConfig() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const redirectUri =
    process.env.GOOGLE_OAUTH_REDIRECT_URI ||
    `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/admin/google-ads/callback`;
  return { clientId, clientSecret, redirectUri };
}

export async function createOAuthState(): Promise<string> {
  return await new SignJWT({ purpose: "google-ads-oauth" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(getOAuthSecret());
}

export async function verifyOAuthState(state: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(state, getOAuthSecret());
    return payload.purpose === "google-ads-oauth";
  } catch {
    return false;
  }
}

export function buildGoogleAuthUrl(state: string): string {
  const { clientId, redirectUri } = getGoogleOAuthConfig();
  if (!clientId) throw new Error("GOOGLE_OAUTH_CLIENT_ID lipsește");
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: OAUTH_SCOPE,
    access_type: "offline",
    // Force full consent so a new refresh token includes adwords + datamanager
    prompt: "consent",
    include_granted_scopes: "false",
    state,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string): Promise<{
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  email?: string;
}> {
  const { clientId, clientSecret, redirectUri } = getGoogleOAuthConfig();
  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_OAUTH_CLIENT_ID / SECRET lipsesc");
  }

  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const json = (await res.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
  };
  if (!res.ok || !json.access_token) {
    throw new Error(
      json.error_description ||
        json.error ||
        `Token exchange failed (${res.status})`,
    );
  }

  let email: string | undefined;
  try {
    const ui = await fetch(USERINFO_URL, {
      headers: { Authorization: `Bearer ${json.access_token}` },
    });
    if (ui.ok) {
      const profile = (await ui.json()) as { email?: string };
      email = profile.email;
    }
  } catch {
    /* userinfo optional — datamanager scope may not include profile */
  }

  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresIn: json.expires_in ?? 3600,
    email,
  };
}
