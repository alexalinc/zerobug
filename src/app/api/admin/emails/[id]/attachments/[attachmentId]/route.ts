import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  getAdminEmailAttachment,
  resendConfigured,
  type EmailFolder,
} from "@/lib/email/resend-admin";

export const runtime = "nodejs";
export const maxDuration = 60;

function parseFolder(value: string | null): EmailFolder | null {
  if (value === "inbox" || value === "sent") return value;
  return null;
}

function parseDisposition(value: string | null): "inline" | "attachment" {
  return value === "inline" ? "inline" : "attachment";
}

function contentDispositionHeader(
  disposition: "inline" | "attachment",
  filename: string,
): string {
  const safe =
    filename
      .replace(/[\r\n"]/g, "")
      .replace(/[^\w.\- ()[\]]+/g, "_")
      .slice(0, 180) || "attachment";
  const encoded = encodeURIComponent(filename).replace(
    /['()*]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );
  return `${disposition}; filename="${safe}"; filename*=UTF-8''${encoded}`;
}

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string; attachmentId: string }> },
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

  const { id, attachmentId } = await ctx.params;
  const { searchParams } = new URL(req.url);
  const folder = parseFolder(searchParams.get("folder"));
  if (!folder) {
    return NextResponse.json(
      { error: "folder trebuie să fie inbox sau sent" },
      { status: 400 },
    );
  }

  const disposition = parseDisposition(searchParams.get("disposition"));
  const result = await getAdminEmailAttachment({
    emailId: id,
    attachmentId,
    folder,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  const upstream = await fetch(result.attachment.download_url);
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json(
      { error: "Nu am putut descărca atașamentul de la Resend" },
      { status: 502 },
    );
  }

  const filename = result.attachment.filename?.trim() || "atasament";
  const contentType =
    result.attachment.content_type ||
    upstream.headers.get("content-type") ||
    "application/octet-stream";

  const headers = new Headers();
  headers.set("Content-Type", contentType);
  headers.set(
    "Content-Disposition",
    contentDispositionHeader(disposition, filename),
  );
  headers.set("Cache-Control", "private, no-store");
  const contentLength = upstream.headers.get("content-length");
  if (contentLength) {
    headers.set("Content-Length", contentLength);
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers,
  });
}
