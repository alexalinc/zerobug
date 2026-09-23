import { NextRequest, NextResponse } from "next/server";
import {
  checkLoginRateLimit,
  clearLoginRateLimit,
  createAdminSession,
  destroyAdminSession,
  getClientIp,
  recordLoginFailure,
  verifyAdminCredentials,
} from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const action = body.action as string;

  if (action === "logout") {
    await destroyAdminSession();
    return NextResponse.json({ ok: true });
  }

  if (action === "login") {
    const ip = getClientIp(req);
    const limit = checkLoginRateLimit(ip);
    if (!limit.ok) {
      return NextResponse.json(
        {
          error: `Prea multe încercări. Reîncearcă în ${limit.retryAfterSec}s.`,
          retryAfterSec: limit.retryAfterSec,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(limit.retryAfterSec ?? 900),
          },
        },
      );
    }

    const username = String(body.username || "");
    const password = String(body.password || "");
    const rememberMe = Boolean(body.rememberMe);

    if (!verifyAdminCredentials(username, password)) {
      recordLoginFailure(ip);
      return NextResponse.json(
        { error: "Utilizator sau parolă invalidă" },
        { status: 401 },
      );
    }

    clearLoginRateLimit(ip);
    await createAdminSession(rememberMe);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
