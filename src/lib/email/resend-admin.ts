import { Resend } from "resend";
import {
  extractEmailAddress,
  resolveReplyToAddress,
} from "@/lib/email/reply-helpers";

export type EmailFolder = "inbox" | "sent";

export {
  extractEmailAddress,
  replySubjectFor,
  resolveReplyToAddress,
} from "@/lib/email/reply-helpers";

export type AdminEmailListItem = {
  id: string;
  from: string;
  to: string[];
  subject: string;
  created_at: string;
  folder: EmailFolder;
  last_event?: string | null;
  has_attachments?: boolean;
};

export type AdminEmailDetail = {
  id: string;
  from: string;
  to: string[];
  cc: string[] | null;
  bcc: string[] | null;
  reply_to: string[] | null;
  subject: string;
  created_at: string;
  folder: EmailFolder;
  html: string | null;
  text: string | null;
  last_event?: string | null;
  attachments?: Array<{
    id: string;
    filename: string | null;
    size: number;
    content_type: string;
  }>;
};

function getResend() {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  return new Resend(key);
}

export function resendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export async function listAdminEmails(input: {
  folder: EmailFolder;
  limit?: number;
  after?: string;
}): Promise<
  | { ok: true; emails: AdminEmailListItem[]; has_more: boolean }
  | { ok: false; error: string }
> {
  const resend = getResend();
  if (!resend) {
    return { ok: false, error: "RESEND_API_KEY lipsește" };
  }

  const limit = Math.min(Math.max(input.limit ?? 50, 1), 100);
  const pagination = input.after
    ? { limit, after: input.after }
    : { limit };

  if (input.folder === "inbox") {
    const { data, error } = await resend.emails.receiving.list(pagination);
    if (error) {
      return { ok: false, error: error.message || "Eroare la listarea inbox" };
    }
    const emails: AdminEmailListItem[] = (data?.data ?? []).map((email) => ({
      id: email.id,
      from: email.from,
      to: email.to ?? [],
      subject: email.subject || "(fără subiect)",
      created_at: email.created_at,
      folder: "inbox",
      has_attachments: (email.attachments?.length ?? 0) > 0,
    }));
    return { ok: true, emails, has_more: Boolean(data?.has_more) };
  }

  const { data, error } = await resend.emails.list(pagination);
  if (error) {
    return { ok: false, error: error.message || "Eroare la listarea trimise" };
  }
  const emails: AdminEmailListItem[] = (data?.data ?? []).map((email) => ({
    id: email.id,
    from: email.from,
    to: email.to ?? [],
    subject: email.subject || "(fără subiect)",
    created_at: email.created_at,
    folder: "sent",
    last_event: email.last_event ?? null,
  }));
  return { ok: true, emails, has_more: Boolean(data?.has_more) };
}

export async function getAdminEmail(input: {
  id: string;
  folder: EmailFolder;
}): Promise<{ ok: true; email: AdminEmailDetail } | { ok: false; error: string }> {
  const resend = getResend();
  if (!resend) {
    return { ok: false, error: "RESEND_API_KEY lipsește" };
  }

  if (input.folder === "inbox") {
    const { data, error } = await resend.emails.receiving.get(input.id);
    if (error || !data) {
      return {
        ok: false,
        error: error?.message || "Emailul primit nu a fost găsit",
      };
    }
    return {
      ok: true,
      email: {
        id: data.id,
        from: data.from,
        to: data.to ?? [],
        cc: data.cc,
        bcc: data.bcc,
        reply_to: data.reply_to,
        subject: data.subject || "(fără subiect)",
        created_at: data.created_at,
        folder: "inbox",
        html: data.html,
        text: data.text,
        attachments: (data.attachments ?? []).map((a) => ({
          id: a.id,
          filename: a.filename,
          size: a.size,
          content_type: a.content_type,
        })),
      },
    };
  }

  const { data, error } = await resend.emails.get(input.id);
  if (error || !data) {
    return {
      ok: false,
      error: error?.message || "Emailul trimis nu a fost găsit",
    };
  }
  return {
    ok: true,
    email: {
      id: data.id,
      from: data.from,
      to: data.to ?? [],
      cc: data.cc,
      bcc: data.bcc,
      reply_to: data.reply_to,
      subject: data.subject || "(fără subiect)",
      created_at: data.created_at,
      folder: "sent",
      html: data.html,
      text: data.text,
      last_event: data.last_event ?? null,
    },
  };
}

export type AdminEmailAttachment = {
  id: string;
  filename: string | null;
  size: number;
  content_type: string;
  download_url: string;
  expires_at: string;
};

export async function getAdminEmailAttachment(input: {
  emailId: string;
  attachmentId: string;
  folder: EmailFolder;
}): Promise<
  { ok: true; attachment: AdminEmailAttachment } | { ok: false; error: string }
> {
  const resend = getResend();
  if (!resend) {
    return { ok: false, error: "RESEND_API_KEY lipsește" };
  }

  const { data, error } =
    input.folder === "inbox"
      ? await resend.emails.receiving.attachments.get({
          emailId: input.emailId,
          id: input.attachmentId,
        })
      : await resend.emails.attachments.get({
          emailId: input.emailId,
          id: input.attachmentId,
        });

  if (error || !data) {
    return {
      ok: false,
      error: error?.message || "Atașamentul nu a fost găsit",
    };
  }

  if (!data.download_url) {
    return { ok: false, error: "Linkul de descărcare lipsește" };
  }

  return {
    ok: true,
    attachment: {
      id: data.id,
      filename: data.filename ?? null,
      size: data.size,
      content_type: data.content_type,
      download_url: data.download_url,
      expires_at: data.expires_at,
    },
  };
}

function fromAddress(): string {
  return process.env.RESEND_FROM_EMAIL?.trim() || "ZeroBug <contact@zerobug.ro>";
}

function inboxAddress(): string {
  return process.env.LEADS_INBOX_EMAIL?.trim() || "contact@zerobug.ro";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function plainToHtml(body: string): string {
  return escapeHtml(body).replace(/\n/g, "<br/>");
}

export async function sendAdminEmailReply(input: {
  emailId: string;
  folder: EmailFolder;
  subject: string;
  body: string;
  to?: string;
}): Promise<
  | { ok: true; id: string; to: string; subject: string }
  | { ok: false; error: string }
> {
  const resend = getResend();
  if (!resend) {
    return { ok: false, error: "RESEND_API_KEY lipsește" };
  }

  const subject = input.subject.replace(/[\r\n\0]/g, " ").trim().slice(0, 200);
  const body = input.body.trim().slice(0, 8000);
  if (subject.length < 2) {
    return { ok: false, error: "Subiect invalid" };
  }
  if (body.length < 2) {
    return { ok: false, error: "Mesajul e prea scurt" };
  }

  const original = await getAdminEmail({
    id: input.emailId,
    folder: input.folder,
  });
  if (!original.ok) {
    return { ok: false, error: original.error };
  }

  const to =
    (input.to ? extractEmailAddress(input.to) : null) ??
    resolveReplyToAddress(original.email);
  if (!to) {
    return { ok: false, error: "Nu am putut determina destinatarul" };
  }

  const from = fromAddress();
  const replyTo = inboxAddress();
  const quoted =
    original.email.text?.trim() ||
    (original.email.html
      ? original.email.html
          .replace(/<style[\s\S]*?<\/style>/gi, " ")
          .replace(/<script[\s\S]*?<\/script>/gi, " ")
          .replace(/<br\s*\/?>/gi, "\n")
          .replace(/<\/p>/gi, "\n")
          .replace(/<[^>]+>/g, " ")
          .replace(/&nbsp;/g, " ")
          .replace(/[ \t]+\n/g, "\n")
          .replace(/\n{3,}/g, "\n\n")
          .trim()
      : "");

  const quoteBlock = quoted
    ? `\n\n---\nPe ${original.email.created_at}, ${original.email.from} a scris:\n${quoted.slice(0, 4000)}`
    : "";

  const text = `${body}${quoteBlock}`;
  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:560px;font-size:15px;line-height:1.55;color:#111">
      <div style="margin:0 0 20px">${plainToHtml(body)}</div>
      ${
        quoted
          ? `<blockquote style="margin:24px 0 0;padding:12px 0 0 14px;border-left:3px solid #ddd;color:#555;font-size:13px;line-height:1.5">
              <p style="margin:0 0 8px;color:#888;font-size:12px">Pe ${escapeHtml(original.email.created_at)}, ${escapeHtml(original.email.from)} a scris:</p>
              <div>${plainToHtml(quoted.slice(0, 4000))}</div>
            </blockquote>`
          : ""
      }
      <p style="margin:24px 0 0;color:#888;font-size:12px">Trimis din ZeroBug Admin</p>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
      replyTo,
    });
    if (error) {
      return {
        ok: false,
        error: error.message || "Trimiterea a eșuat",
      };
    }
    if (!data?.id) {
      return { ok: false, error: "Resend nu a returnat un ID" };
    }
    return { ok: true, id: data.id, to, subject };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Trimiterea a eșuat",
    };
  }
}
