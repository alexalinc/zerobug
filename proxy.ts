import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE = "zb_admin_session";

function getSecret() {
  const secret =
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "zerobug-dev-secret-change-me";
  return new TextEncoder().encode(secret);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith("/admin") &&
    !pathname.startsWith("/admin/login")
  ) {
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
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const proxyConfig = {
  matcher: ["/admin/:path*"],
};
