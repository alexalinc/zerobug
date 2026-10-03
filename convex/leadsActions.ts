"use node";

import { v } from "convex/values";
import { action, internalAction, type ActionCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { Resend } from "resend";
import { requireAdminSession, requireBridgeSecret } from "./lib/adminGate";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function plainToHtml(body: string) {
  return escapeHtml(body).replace(/\n/g, "<br/>");
}

function normalizeEmail(raw: string): string {
  const angle = raw.match(/<([^>]+)>/);
  return (angle?.[1] || raw).trim().toLowerCase().replace(/[\r\n\0\s]/g, "");
}

function extractTextBody(html: string | null, text: string | null): string {
  if (text && text.trim()) return text.trim();
  if (!html) return "";
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function fromAddress(): string {
  return process.env.RESEND_FROM_EMAIL || "ZeroBug <contact@zerobug.ro>";
}

function inboxAddress(): string {
  return process.env.LEADS_INBOX_EMAIL || "contact@zerobug.ro";
}

export const notifyLeadEmail = internalAction({
  args: {
    type: v.string(),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    message: v.optional(v.string()),
    serviceCategory: v.optional(v.string()),
    serviceName: v.optional(v.string()),
    planKey: v.optional(v.string()),
    complexity: v.optional(v.string()),
    addons: v.optional(v.array(v.string())),
    budget: v.optional(v.number()),
    quoteDetails: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (_ctx, args) => {
    const apiKey = process.env.RESEND_API_KEY;
    const from = fromAddress();
    const to = inboxAddress();

    if (!apiKey) {
      console.error("RESEND_API_KEY missing — lead email not sent");
      return null;
    }

    const typeLabel =
      args.type === "service_quote"
        ? "Ofertă serviciu"
        : args.type === "maintenance"
          ? "Mentenanță"
          : "Contact";

    const safeName = args.name.replace(/[\r\n\0]/g, " ").slice(0, 120);
    const safeCompany = (args.company || "")
      .replace(/[\r\n\0]/g, " ")
      .slice(0, 200);
    const safeEmail = args.email.replace(/[\r\n\0\s]/g, "").slice(0, 254);
    if (!safeEmail.includes("@")) {
      console.error("Invalid replyTo email — skipping lead notification");
      return null;
    }

    const rows = [
      ["Tip", typeLabel],
      ["Nume", safeName],
      ["Email", safeEmail],
      ["Telefon", args.phone || "—"],
      ["Firmă", safeCompany || "—"],
      ["Categorie", args.serviceCategory || "—"],
      ["Serviciu", args.serviceName || "—"],
      ["Plan sugerat", args.planKey || "—"],
      ["Complexitate", args.complexity || "—"],
      ["Nevoi / add-ons", args.addons?.join(", ") || "—"],
      [
        "Estimare max",
        args.budget != null ? `${args.budget.toFixed(2)} € + TVA` : "—",
      ],
      ["Detalii ofertă", args.quoteDetails || "—"],
      ["Mesaj", args.message || "—"],
    ];

    const html = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:560px">
        <h2 style="margin:0 0 12px">Lead nou ZeroBug — ${typeLabel}</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          ${rows
            .map(
              ([k, val]) =>
                `<tr>
                  <td style="padding:8px 0;border-bottom:1px solid #eee;color:#666;width:140px">${k}</td>
                  <td style="padding:8px 0;border-bottom:1px solid #eee">${escapeHtml(String(val))}</td>
                </tr>`,
            )
            .join("")}
        </table>
        <p style="margin-top:16px;color:#666;font-size:12px">Trimis automat din formularul site-ului ZeroBug.</p>
      </div>
    `;

    const resend = new Resend(apiKey);
    await resend.emails.send({
      from,
      to,
      replyTo: safeEmail,
      subject: `[ZeroBug] ${typeLabel}: ${safeName}${safeCompany ? ` — ${safeCompany}` : ""}`,
      html,
    });

    return null;
  },
});

/** Admin reply to a lead — sends from ZeroBug via Resend and marks lead contacted. */
export const replyToLead = action({
  args: {
    sessionToken: v.string(),
    leadId: v.id("leads"),
    subject: v.string(),
    body: v.string(),
  },
  returns: v.object({
    ok: v.boolean(),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    await requireAdminSession(args.sessionToken);

    const subject = args.subject.replace(/[\r\n\0]/g, " ").trim().slice(0, 200);
    const body = args.body.trim().slice(0, 8000);
    if (subject.length < 2) {
      return { ok: false, error: "Subiect invalid" };
    }
    if (body.length < 2) {
      return { ok: false, error: "Mesajul e prea scurt" };
    }

    const lead = await ctx.runQuery(internal.leads.getByIdInternal, {
      id: args.leadId,
    });
    if (!lead) {
      return { ok: false, error: "Cererea nu există" };
    }

    const to = lead.email.replace(/[\r\n\0\s]/g, "").slice(0, 254);
    if (!to.includes("@")) {
      return { ok: false, error: "Email client invalid" };
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = fromAddress();
    const replyTo = inboxAddress();
    if (!apiKey) {
      return { ok: false, error: "RESEND_API_KEY lipsește" };
    }

    const html = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:560px;font-size:15px;line-height:1.55;color:#111">
        <div style="margin:0 0 20px">${plainToHtml(body)}</div>
        <p style="margin:0;color:#888;font-size:12px">Trimis din ZeroBug Admin</p>
      </div>
    `;

    let resendEmailId: string | undefined;
    try {
      const resend = new Resend(apiKey);
      const { data, error } = await resend.emails.send({
        from,
        to,
        subject,
        html,
        text: body,
        // Replies must land on Receiving for contact@zerobug.ro
        replyTo,
      });
      if (error) {
        console.error("Lead reply Resend error:", error);
        return {
          ok: false,
          error:
            typeof error === "object" && error && "message" in error
              ? String((error as { message?: string }).message)
              : "Trimiterea a eșuat",
        };
      }
      resendEmailId = data?.id;
    } catch (e) {
      console.error("Lead reply failed:", e);
      return {
        ok: false,
        error: e instanceof Error ? e.message : "Trimiterea a eșuat",
      };
    }

    await ctx.runMutation(internal.leadMessages.recordOutboundInternal, {
      leadId: args.leadId,
      subject,
      bodyText: body,
      fromEmail: from,
      toEmail: to,
      resendEmailId,
    });

    await ctx.runMutation(internal.leads.markContactedInternal, {
      id: args.leadId,
    });

    return { ok: true };
  },
});

async function ingestReceivedEmailId(
  ctx: ActionCtx,
  emailId: string,
  meta?: { from?: string; to?: string[]; subject?: string; createdAt?: string },
): Promise<{ ok: boolean; skipped?: string; leadId?: string }> {
  const existing = await ctx.runQuery(
    internal.leadMessages.getByResendInternal,
    { resendEmailId: emailId },
  );
  if (existing) return { ok: true, skipped: "duplicate" };

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, skipped: "no_api_key" };

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.receiving.get(emailId);
  if (error || !data) {
    console.error("receiving.get failed", emailId, error);
    return { ok: false, skipped: "fetch_failed" };
  }

  const from = normalizeEmail(data.from || meta?.from || "");
  if (!from.includes("@")) return { ok: false, skipped: "bad_from" };

  const leadId = await ctx.runQuery(
    internal.leadMessages.findLeadByEmailInternal,
    { email: from },
  );
  if (!leadId) {
    return { ok: true, skipped: "no_matching_lead" };
  }

  const bodyText = extractTextBody(data.html ?? null, data.text ?? null);
  const subject = (data.subject || meta?.subject || "(fără subiect)").slice(
    0,
    300,
  );
  const toEmail = normalizeEmail(
    (data.to && data.to[0]) ||
      (meta?.to && meta.to[0]) ||
      inboxAddress(),
  );
  const createdAt = data.created_at
    ? Date.parse(data.created_at)
    : meta?.createdAt
      ? Date.parse(meta.createdAt)
      : Date.now();

  await ctx.runMutation(internal.leadMessages.recordInboundInternal, {
    leadId,
    subject,
    bodyText: bodyText || "(email fără text)",
    fromEmail: from,
    toEmail: toEmail || inboxAddress(),
    resendEmailId: emailId,
    createdAt: Number.isFinite(createdAt) ? createdAt : Date.now(),
  });

  return { ok: true, leadId };
}

/** Called from Next.js Resend webhook (email.received). */
export const ingestReceivedWebhook = action({
  args: {
    bridgeSecret: v.string(),
    emailId: v.string(),
    from: v.optional(v.string()),
    to: v.optional(v.array(v.string())),
    subject: v.optional(v.string()),
    createdAt: v.optional(v.string()),
  },
  returns: v.object({
    ok: v.boolean(),
    skipped: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    requireBridgeSecret(args.bridgeSecret, "CONVEX_BRIDGE_SECRET");
    const result = await ingestReceivedEmailId(ctx, args.emailId, {
      from: args.from,
      to: args.to,
      subject: args.subject,
      createdAt: args.createdAt,
    });
    return { ok: result.ok, skipped: result.skipped };
  },
});

/** Admin: pull recent Resend Receiving inbox and attach to leads by From email. */
export const syncInboundReplies = action({
  args: { sessionToken: v.string() },
  returns: v.object({
    ok: v.boolean(),
    imported: v.number(),
    scanned: v.number(),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    await requireAdminSession(args.sessionToken);
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return {
        ok: false,
        imported: 0,
        scanned: 0,
        error: "RESEND_API_KEY lipsește",
      };
    }

    try {
      const resend = new Resend(apiKey);
      const { data, error } = await resend.emails.receiving.list({ limit: 40 });
      if (error) {
        return {
          ok: false,
          imported: 0,
          scanned: 0,
          error: error.message || "Nu am putut lista inbox Receiving",
        };
      }

      const emails = data?.data ?? [];
      let imported = 0;
      for (const email of emails) {
        const before = await ctx.runQuery(
          internal.leadMessages.getByResendInternal,
          { resendEmailId: email.id },
        );
        if (before) continue;
        const result = await ingestReceivedEmailId(ctx, email.id, {
          from: email.from,
          to: email.to,
          subject: email.subject,
          createdAt: email.created_at,
        });
        if (result.ok && result.leadId) imported += 1;
      }

      return { ok: true, imported, scanned: emails.length };
    } catch (e) {
      return {
        ok: false,
        imported: 0,
        scanned: 0,
        error: e instanceof Error ? e.message : "Sync eșuat",
      };
    }
  },
});
