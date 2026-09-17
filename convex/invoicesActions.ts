"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { Resend } from "resend";

function formatMoney(n: number) {
  return `${n.toFixed(2)} EUR`;
}

async function buildInvoicePdf(data: {
  number: string;
  periodLabel: string;
  issuedAt: number;
  dueAt: number;
  netAmount: number;
  vatAmount: number;
  grossAmount: number;
  lines: Array<{
    description: string;
    quantity: number;
    unitNet: number;
    vatRate: number;
  }>;
  company: {
    name: string;
    email: string;
    cui?: string;
    address?: string;
  };
  issuer: {
    companyName: string;
    cui: string;
    regCom: string;
    address: string;
    phone: string;
    email: string;
    bank: string;
    iban: string;
    brandName: string;
  };
}): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const { height } = page.getSize();
  let y = height - 50;

  const draw = (text: string, x: number, size = 10, isBold = false) => {
    page.drawText(text, {
      x,
      y,
      size,
      font: isBold ? bold : font,
      color: rgb(0.1, 0.1, 0.1),
    });
  };

  draw(data.issuer.brandName || "ZeroBug", 50, 22, true);
  y -= 28;
  draw("FACTURA", 50, 16, true);
  y -= 20;
  draw(`Nr. ${data.number}`, 50, 11, true);
  draw(`Perioada: ${data.periodLabel}`, 280, 11);
  y -= 16;
  draw(`Data: ${new Date(data.issuedAt).toLocaleDateString("ro-RO")}`, 50, 10);
  draw(`Scadenta: ${new Date(data.dueAt).toLocaleDateString("ro-RO")}`, 280, 10);
  y -= 28;

  draw("Furnizor", 50, 11, true);
  draw("Client", 300, 11, true);
  y -= 14;
  draw(data.issuer.companyName, 50, 9);
  draw(data.company.name, 300, 9);
  y -= 12;
  draw(`CUI: ${data.issuer.cui}`, 50, 9);
  draw(data.company.cui ? `CUI: ${data.company.cui}` : "", 300, 9);
  y -= 12;
  draw(`Reg. Com.: ${data.issuer.regCom}`, 50, 9);
  draw(data.company.email, 300, 9);
  y -= 12;
  draw(data.issuer.address, 50, 9);
  if (data.company.address) draw(data.company.address, 300, 9);
  y -= 12;
  draw(`Tel: ${data.issuer.phone}`, 50, 9);
  y -= 12;
  draw(data.issuer.email, 50, 9);
  y -= 28;

  draw("Descriere", 50, 10, true);
  draw("Cant.", 320, 10, true);
  draw("Pret net", 380, 10, true);
  draw("Total", 480, 10, true);
  y -= 6;
  page.drawLine({
    start: { x: 50, y },
    end: { x: 545, y },
    thickness: 0.5,
    color: rgb(0.7, 0.7, 0.7),
  });
  y -= 16;

  for (const line of data.lines) {
    const lineTotal = line.quantity * line.unitNet;
    draw(line.description.slice(0, 55), 50, 9);
    draw(String(line.quantity), 330, 9);
    draw(formatMoney(line.unitNet), 380, 9);
    draw(formatMoney(lineTotal), 480, 9);
    y -= 16;
  }

  y -= 20;
  draw(`Subtotal: ${formatMoney(data.netAmount)}`, 400, 10);
  y -= 14;
  draw(`TVA 21%: ${formatMoney(data.vatAmount)}`, 400, 10);
  y -= 14;
  draw(`TOTAL: ${formatMoney(data.grossAmount)}`, 400, 12, true);
  y -= 36;
  draw("Date bancare", 50, 11, true);
  y -= 14;
  draw(`Banca: ${data.issuer.bank}`, 50, 9);
  y -= 12;
  draw(`IBAN: ${data.issuer.iban}`, 50, 9);
  y -= 24;
  draw("Factura generata automat de ZeroBug.", 50, 8);

  return await pdf.save();
}

export const generateAndSend = internalAction({
  args: { invoiceId: v.id("invoices") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const invoice = await ctx.runQuery(internal.invoices.getInternal, {
      id: args.invoiceId,
    });
    if (!invoice || !invoice.company) {
      throw new Error("Invoice not found");
    }
    const issuer = await ctx.runQuery(internal.settings.getIssuerInternal, {});

    const bytes = await buildInvoicePdf({
      number: invoice.number,
      periodLabel: invoice.periodLabel,
      issuedAt: invoice.issuedAt,
      dueAt: invoice.dueAt,
      netAmount: invoice.netAmount,
      vatAmount: invoice.vatAmount,
      grossAmount: invoice.grossAmount,
      lines: invoice.lines,
      company: invoice.company,
      issuer,
    });

    const storageId = await ctx.storage.store(
      new Blob([Buffer.from(bytes)], { type: "application/pdf" }),
    );
    await ctx.runMutation(internal.invoices.attachPdf, {
      invoiceId: args.invoiceId,
      pdfStorageId: storageId,
    });

    await ctx.runAction(internal.invoicesActions.sendEmailOnly, {
      invoiceId: args.invoiceId,
    });
    return null;
  },
});

export const sendEmailOnly = internalAction({
  args: { invoiceId: v.id("invoices") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const invoice = await ctx.runQuery(internal.invoices.getInternal, {
      id: args.invoiceId,
    });
    if (!invoice?.company) throw new Error("Invoice not found");

    const apiKey = process.env.RESEND_API_KEY;
    const from =
      process.env.RESEND_FROM_EMAIL || "ZeroBug <contact@zerobug.ro>";

    if (!apiKey) {
      await ctx.runMutation(internal.invoices.markEmail, {
        invoiceId: args.invoiceId,
        emailStatus: "failed",
        emailError: "RESEND_API_KEY not configured",
      });
      return null;
    }

    try {
      const resend = new Resend(apiKey);
      let pdfBuffer: Buffer | undefined;
      if (invoice.pdfStorageId) {
        const url = await ctx.storage.getUrl(invoice.pdfStorageId);
        if (url) {
          const res = await fetch(url);
          const ab = await res.arrayBuffer();
          pdfBuffer = Buffer.from(ab);
        }
      }

      await resend.emails.send({
        from,
        to: invoice.company.email,
        subject: `Factura ${invoice.number} — ZeroBug`,
        html: `
          <p>Bună ziua,</p>
          <p>Atașat găsiți factura <strong>${invoice.number}</strong> pentru perioada <strong>${invoice.periodLabel}</strong>.</p>
          <p>Total de plată: <strong>${invoice.grossAmount.toFixed(2)} EUR</strong> (TVA inclus).</p>
          <p>Cu stimă,<br/>Echipa ZeroBug</p>
        `,
        attachments: pdfBuffer
          ? [
              {
                filename: `${invoice.number}.pdf`,
                content: pdfBuffer,
              },
            ]
          : undefined,
      });

      await ctx.runMutation(internal.invoices.markEmail, {
        invoiceId: args.invoiceId,
        emailStatus: "sent",
      });
    } catch (error) {
      await ctx.runMutation(internal.invoices.markEmail, {
        invoiceId: args.invoiceId,
        emailStatus: "failed",
        emailError: error instanceof Error ? error.message : "Email failed",
      });
    }
    return null;
  },
});
