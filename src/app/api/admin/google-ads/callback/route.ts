import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  exchangeCodeForTokens,
  verifyOAuthState,
} from "@/lib/google-ads-oauth";

function settingsRedirect(params: Record<string, string>) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const url = new URL("/admin/setari", base);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  return NextResponse.redirect(url.toString());
}

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.redirect(
      new URL("/admin/login", req.nextUrl.origin),
    );
  }

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const oauthError = req.nextUrl.searchParams.get("error");

  if (oauthError) {
    return settingsRedirect({
      google: "error",
      message: oauthError,
    });
  }

  if (!code || !state) {
    return settingsRedirect({
      google: "error",
      message: "missing_code",
    });
  }

  if (!(await verifyOAuthState(state))) {
    return settingsRedirect({
      google: "error",
      message: "invalid_state",
    });
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return settingsRedirect({
      google: "error",
      message: "missing_convex_url",
    });
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    if (!tokens.refreshToken) {
      return settingsRedirect({
        google: "error",
        message:
          "no_refresh_token — deconectează app-ul din Google Account și reconectează cu prompt=consent",
      });
    }

    const client = new ConvexHttpClient(convexUrl);
    await client.mutation(api.googleAds.saveOAuthTokens, {
      refreshToken: tokens.refreshToken,
      accessToken: tokens.accessToken,
      tokenExpiresAt: Date.now() + tokens.expiresIn * 1000,
      email: tokens.email,
    });

    return settingsRedirect({ google: "connected" });
  } catch (err) {
    const message =
      err instanceof Error ? err.message.slice(0, 120) : "oauth_failed";
    return settingsRedirect({ google: "error", message });
  }
}
