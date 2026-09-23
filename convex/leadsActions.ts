"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { Resend } from "resend";

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
    const from =
      process.env.RESEND_FROM_EMAIL || "ZeroBug <contact@zerobug.ro>";
    const to = process.env.LEADS_INBOX_EMAIL || "contact@zerobug.ro";

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

    const rows = [
      ["Tip", typeLabel],
      ["Nume", args.name],
      ["Email", args.email],
      ["Telefon", args.phone || "—"],
      ["Firmă", args.company || "—"],
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
                  <td style="padding:8px 0;border-bottom:1px solid #eee">${String(val).replace(/</g, "&lt;")}</td>
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
      replyTo: args.email,
      subject: `[ZeroBug] ${typeLabel}: ${args.name}${args.company ? ` — ${args.company}` : ""}`,
      html,
    });

    return null;
  },
});
