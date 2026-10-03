import type { AdminEmailDetail } from "@/lib/email/resend-admin";

/** Extract bare email from `Name <addr@host>` or plain address. */
export function extractEmailAddress(raw: string): string | null {
  const angle = raw.match(/<([^>]+)>/);
  const value = (angle?.[1] || raw).trim().replace(/[\r\n\0\s]/g, "");
  if (!value.includes("@") || value.length > 254) return null;
  return value;
}

export function replySubjectFor(subject: string): string {
  const trimmed = subject.replace(/[\r\n\0]/g, " ").trim() || "(fără subiect)";
  if (/^re:\s/i.test(trimmed)) return trimmed.slice(0, 200);
  return `Re: ${trimmed}`.slice(0, 200);
}

export function resolveReplyToAddress(email: AdminEmailDetail): string | null {
  const fromReplyTo = email.reply_to?.map(extractEmailAddress).find(Boolean);
  if (fromReplyTo) return fromReplyTo;
  return extractEmailAddress(email.from);
}
