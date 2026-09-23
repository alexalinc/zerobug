"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { Resend } from "resend";

function formatMoney(n: number) {
  return `${n.toFixed(2)} EUR`;
}

function wrapText(
  text: string,
  font: { widthOfTextAtSize: (t: string, s: number) => number },
  size: number,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

async function buildInvoicePdf(data: {
  number: string;
  series: string;
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
    regCom?: string;
    address?: string;
    phone?: string;
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
    invoiceSeries: string;
  };
}): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const { height } = page.getSize();
  let y = height - 42;

  const draw = (
    text: string,
    x: number,
    size = 10,
    isBold = false,
    color = rgb(0.1, 0.1, 0.1),
  ) => {
    page.drawText(text, {
      x,
      y,
      size,
      font: isBold ? bold : font,
      color,
    });
  };

  const drawBlock = (
    lines: string[],
    x: number,
    size: number,
    isBoldFirst = false,
  ) => {
    let localY = y;
    lines.forEach((line, i) => {
      if (!line) return;
      page.drawText(line, {
        x,
        y: localY,
        size,
        font: isBoldFirst && i === 0 ? bold : font,
        color: rgb(0.12, 0.12, 0.12),
      });
      localY -= size + 3;
    });
    return localY;
  };

  // Title
  draw(data.issuer.brandName || "ZeroBug", 50, 18, true);
  draw("FACTURA", 460, 16, true);
  y -= 28;

  page.drawLine({
    start: { x: 50, y },
    end: { x: 545, y },
    thickness: 0.8,
    color: rgb(0.85, 0.85, 0.85),
  });
  y -= 18;

  // 3 columns: Furnizor | Factură meta | Client
  const col1 = 50;
  const col2 = 230;
  const col3 = 400;
  const issued = new Date(data.issuedAt).toLocaleDateString("ro-RO");
  const due = new Date(data.dueAt).toLocaleDateString("ro-RO");

  draw("FURNIZOR", col1, 9, true, rgb(0.4, 0.4, 0.4));
  draw("FACTURA", col2, 9, true, rgb(0.4, 0.4, 0.4));
  draw("CLIENT", col3, 9, true, rgb(0.4, 0.4, 0.4));
  y -= 14;

  const issuerLines = [
    data.issuer.companyName,
    `CUI: ${data.issuer.cui}`,
    `Reg. Com.: ${data.issuer.regCom}`,
    ...wrapText(data.issuer.address, font, 8, 165),
    `Tel: ${data.issuer.phone}`,
    data.issuer.email,
  ];

  const metaLines = [
    `Serie: ${data.series || data.issuer.invoiceSeries}`,
    `Numar: ${data.number}`,
    `Data: ${issued}`,
    `Scadenta: ${due}`,
    `Perioada: ${data.periodLabel}`,
  ];

  const clientLines = [
    data.company.name,
    data.company.cui ? `CUI: ${data.company.cui}` : "",
    data.company.regCom ? `Reg. Com.: ${data.company.regCom}` : "",
    ...(data.company.address
      ? wrapText(data.company.address, font, 8, 145)
      : []),
    data.company.phone ? `Tel: ${data.company.phone}` : "",
    data.company.email,
  ].filter(Boolean);

  const y1 = drawBlock(issuerLines, col1, 8, true);
  const y2 = drawBlock(metaLines, col2, 8, false);
  const y3 = drawBlock(clientLines, col3, 8, true);
  y = Math.min(y1, y2, y3) - 16;

  page.drawLine({
    start: { x: 50, y },
    end: { x: 545, y },
    thickness: 0.5,
    color: rgb(0.8, 0.8, 0.8),
  });
  y -= 18;

  draw("Descriere", 50, 9, true);
  draw("Cant.", 340, 9, true);
  draw("Pret net", 390, 9, true);
  draw("TVA", 460, 9, true);
  draw("Total", 510, 9, true);
  y -= 6;
  page.drawLine({
    start: { x: 50, y },
    end: { x: 545, y },
    thickness: 0.5,
    color: rgb(0.75, 0.75, 0.75),
  });
  y -= 14;

  for (const line of data.lines) {
    const lineNet = line.quantity * line.unitNet;
    const lineVat = Math.round(lineNet * line.vatRate * 100) / 100;
    const descLines = wrapText(line.description, font, 8, 280);
    for (let i = 0; i < descLines.length; i++) {
      draw(descLines[i]!, 50, 8);
      if (i === 0) {
        draw(String(line.quantity), 348, 8);
        draw(formatMoney(line.unitNet), 390, 8);
        draw(formatMoney(lineVat), 460, 8);
        draw(formatMoney(lineNet), 510, 8);
      }
      y -= 12;
    }
    y -= 4;
  }

  y -= 12;
  draw(`Subtotal (fara TVA): ${formatMoney(data.netAmount)}`, 360, 9);
  y -= 13;
  draw(`TVA 21%: ${formatMoney(data.vatAmount)}`, 360, 9);
  y -= 14;
  draw(`TOTAL DE PLATA: ${formatMoney(data.grossAmount)}`, 360, 11, true);
  y -= 28;

  draw("Date bancare", 50, 10, true);
  y -= 13;
  draw(`Banca: ${data.issuer.bank}`, 50, 8);
  y -= 11;
  draw(`IBAN: ${data.issuer.iban}`, 50, 8);
  y -= 22;

  const legal =
    "Factura circula fara semnatura si stampila conform art. 319 alin. (29) din Legea nr. 227/2015 privind Codul fiscal.";
  for (const line of wrapText(legal, font, 7, 495)) {
    draw(line, 50, 7, false, rgb(0.35, 0.35, 0.35));
    y -= 10;
  }
  y -= 8;
  draw("Document generat automat de ZeroBug.", 50, 7, false, rgb(0.45, 0.45, 0.45));

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
      series: invoice.series,
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

      const issuer = await ctx.runQuery(internal.settings.getIssuerInternal, {});
      const accountingEmail =
        typeof issuer?.accountingEmail === "string"
          ? issuer.accountingEmail.trim()
          : "";
      const bcc =
        accountingEmail &&
        accountingEmail.toLowerCase() !==
          invoice.company.email.trim().toLowerCase()
          ? [accountingEmail]
          : undefined;

      await resend.emails.send({
        from,
        to: invoice.company.email,
        bcc,
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
