import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  listAdminEmails,
  resendConfigured,
  sendAdminEmailReply,
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

export async function POST(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  if (!resendConfigured()) {
    return NextResponse.json(
      { error: "RESEND_API_KEY lipsește. Configurează cheia în .env." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalid" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Payload invalid" }, { status: 400 });
  }

  const payload = body as {
    action?: unknown;
    emailId?: unknown;
    folder?: unknown;
    subject?: unknown;
    body?: unknown;
    to?: unknown;
  };

  if (payload.action !== "reply") {
    return NextResponse.json(
      { error: "action trebuie să fie reply" },
      { status: 400 },
    );
  }

  const emailId =
    typeof payload.emailId === "string" ? payload.emailId.trim() : "";
  const folder = parseFolder(
    typeof payload.folder === "string" ? payload.folder : null,
  );
  const subject =
    typeof payload.subject === "string" ? payload.subject : "";
  const message = typeof payload.body === "string" ? payload.body : "";
  const to = typeof payload.to === "string" ? payload.to : undefined;

  if (!emailId) {
    return NextResponse.json({ error: "emailId lipsește" }, { status: 400 });
  }
  if (!folder) {
    return NextResponse.json(
      { error: "folder trebuie să fie inbox sau sent" },
      { status: 400 },
    );
  }

  const result = await sendAdminEmailReply({
    emailId,
    folder,
    subject,
    body: message,
    to,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    id: result.id,
    to: result.to,
    subject: result.subject,
  });
}
