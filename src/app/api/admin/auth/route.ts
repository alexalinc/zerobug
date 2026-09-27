import { NextRequest, NextResponse } from "next/server";
import {
  createAdminSession,
  destroyAdminSession,
  getClientIp,
  verifyAdminCredentials,
} from "@/lib/admin-auth";
import {
  persistentCheckLogin,
  persistentClearLogin,
  persistentRecordLoginFailure,
} from "@/lib/persistent-rate-limit";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const action = body.action as string;

  if (action === "logout") {
    await destroyAdminSession();
    return NextResponse.json({ ok: true });
  }

  if (action === "login") {
    const ip = getClientIp(req);
    const limit = await persistentCheckLogin(ip);
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
      const after = await persistentRecordLoginFailure(ip);
      if (!after.ok) {
        return NextResponse.json(
          {
            error: `Prea multe încercări. Reîncearcă în ${after.retryAfterSec}s.`,
            retryAfterSec: after.retryAfterSec,
          },
          {
            status: 429,
            headers: {
              "Retry-After": String(after.retryAfterSec ?? 900),
            },
          },
        );
      }
      return NextResponse.json(
        { error: "Utilizator sau parolă invalidă" },
        { status: 401 },
      );
    }

    await persistentClearLogin(ip);
    await createAdminSession(rememberMe);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
