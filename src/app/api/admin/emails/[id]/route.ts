import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  getAdminEmail,
  resendConfigured,
  type EmailFolder,
} from "@/lib/email/resend-admin";

function parseFolder(value: string | null): EmailFolder | null {
  if (value === "inbox" || value === "sent") return value;
  return null;
}

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  if (!resendConfigured()) {
    return NextResponse.json(
      { error: "RESEND_API_KEY lipsește. Configurează cheia în .env." },
      { status: 503 },
    );
  }

  const { id } = await ctx.params;
  const { searchParams } = new URL(req.url);
  const folder = parseFolder(searchParams.get("folder"));
  if (!folder) {
    return NextResponse.json(
      { error: "folder trebuie să fie inbox sau sent" },
      { status: 400 },
    );
  }

  const result = await getAdminEmail({ id, folder });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({ email: result.email });
}
