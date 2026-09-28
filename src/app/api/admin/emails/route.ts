import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  listAdminEmails,
  resendConfigured,
  type EmailFolder,
} from "@/lib/email/resend-admin";

function parseFolder(value: string | null): EmailFolder | null {
  if (value === "inbox" || value === "sent") return value;
  return null;
}

export async function GET(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  if (!resendConfigured()) {
    return NextResponse.json(
      { error: "RESEND_API_KEY lipsește. Configurează cheia în .env." },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(req.url);
  const folder = parseFolder(searchParams.get("folder"));
  if (!folder) {
    return NextResponse.json(
      { error: "folder trebuie să fie inbox sau sent" },
      { status: 400 },
    );
  }

  const after = searchParams.get("after")?.trim() || undefined;
  const limitRaw = Number(searchParams.get("limit") ?? "50");
  const limit = Number.isFinite(limitRaw) ? limitRaw : 50;

  const result = await listAdminEmails({ folder, limit, after });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({
    emails: result.emails,
    has_more: result.has_more,
  });
}
