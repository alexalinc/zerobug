import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE = "zb_admin_session";

function getSecret() {
  const secret =
    process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (
    (process.env.NODE_ENV === "production" || process.env.VERCEL) &&
    (!secret ||
      secret === "zerobug-dev-secret-change-me" ||
      secret === "zerobug-admin" ||
      secret === "changeme")
  ) {
    // Fail closed: treat as unverified rather than using a public default
    return new TextEncoder().encode(
      `missing-production-secret-${Math.random()}`,
    );
  }
  return new TextEncoder().encode(
    secret || "zerobug-dev-secret-change-me",
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminPage =
    pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");
  const isAdminApi =
    pathname.startsWith("/api/admin") &&
    !pathname.startsWith("/api/admin/auth") &&
    // OAuth return from Google — auth via signed `state`, cookie may be missing cross-site
    !pathname.startsWith("/api/admin/google-ads/callback");

  if (isAdminPage || isAdminApi) {
    const token = request.cookies.get(COOKIE)?.value;
    let ok = false;
    if (token) {
      try {
        await jwtVerify(token, getSecret());
        ok = true;
      } catch {
        ok = false;
      }
    }
    if (!ok) {
      if (isAdminApi) {
        // OAuth connect: send user to login instead of raw JSON
        if (pathname.startsWith("/api/admin/google-ads/connect")) {
          const url = request.nextUrl.clone();
          url.pathname = "/admin/login";
          url.search = "";
          url.searchParams.set("next", pathname);
          return NextResponse.redirect(url);
        }
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      if (pathname !== "/admin") {
        url.searchParams.set("next", pathname);
      }
      const redirectResponse = NextResponse.redirect(url);
      // Never let CDN/browser cache an unauthenticated admin HTML shell
      redirectResponse.headers.set(
        "Cache-Control",
        "private, no-store, max-age=0, must-revalidate",
      );
      return redirectResponse;
    }

    const response = NextResponse.next();
    response.headers.set(
      "Cache-Control",
      "private, no-store, max-age=0, must-revalidate",
    );
    return response;
  }
  return NextResponse.next();
}

export const config = {
  // Explicit `/admin` — `:path*` alone can miss the exact root path in some matchers
  matcher: ["/admin", "/admin/:path*", "/api/admin", "/api/admin/:path*"],
};
