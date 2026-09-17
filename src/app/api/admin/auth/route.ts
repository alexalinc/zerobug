import { NextRequest, NextResponse } from "next/server";
import {
  createAdminSession,
  destroyAdminSession,
  verifyAdminPassword,
} from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const action = body.action as string;

  if (action === "logout") {
    await destroyAdminSession();
    return NextResponse.json({ ok: true });
  }

  if (action === "login") {
    const password = String(body.password || "");
    if (!verifyAdminPassword(password)) {
      return NextResponse.json({ error: "Parolă invalidă" }, { status: 401 });
    }
    await createAdminSession();
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
