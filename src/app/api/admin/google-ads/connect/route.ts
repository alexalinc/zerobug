import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticatedRequest } from "@/lib/admin-auth";
import {
  buildGoogleAuthUrl,
  createOAuthState,
  getGoogleOAuthConfig,
} from "@/lib/google-ads-oauth";

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthenticatedRequest(req))) {
    const login = new URL("/admin/login", req.nextUrl.origin);
    login.searchParams.set("next", "/api/admin/google-ads/connect");
    return NextResponse.redirect(login);
  }

  const { clientId } = getGoogleOAuthConfig();
  if (!clientId) {
    return NextResponse.json(
      {
        error:
          "GOOGLE_OAUTH_CLIENT_ID lipsește. Adaugă-l în env (Vercel / .env.local).",
      },
      { status: 500 },
    );
  }

  try {
    const state = await createOAuthState();
    const url = buildGoogleAuthUrl(state);
    return NextResponse.redirect(url);
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Nu am putut porni OAuth",
      },
      { status: 500 },
    );
  }
}
