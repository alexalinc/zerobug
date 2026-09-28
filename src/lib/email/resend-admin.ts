import { Resend } from "resend";

export type EmailFolder = "inbox" | "sent";

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
