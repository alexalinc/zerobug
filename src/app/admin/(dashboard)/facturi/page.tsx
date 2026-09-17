"use client";

import { useAction, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import type { Id } from "@convex/_generated/dataModel";

export default function FacturiPage() {
  const invoices = useQuery(api.invoices.list);
  const resend = useAction(api.invoices.resendEmail);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-[family-name:var(--font-serif)]">Facturi</h1>
      <div className="overflow-x-auto border border-white/10">
        <table className="w-full text-sm">
          <thead className="text-left text-zinc-400 border-b border-white/10">
            <tr>
              <th className="p-3">Număr</th>
              <th className="p-3">Firmă</th>
              <th className="p-3">Perioadă</th>
              <th className="p-3">Total</th>
              <th className="p-3">Email</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {(invoices ?? []).map((inv) => (
              <InvoiceRow
                key={inv._id}
                inv={inv}
                onResend={() => resend({ invoiceId: inv._id })}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InvoiceRow({
  inv,
  onResend,
}: {
  inv: {
    _id: Id<"invoices">;
    number: string;
    periodLabel: string;
    grossAmount: number;
    emailStatus: string;
    company?: { name?: string } | null;
  };
  onResend: () => void;
}) {
  const pdfUrl = useQuery(api.invoices.getPdfUrl, { id: inv._id });

  return (
    <tr className="border-b border-white/5">
      <td className="p-3 font-medium">{inv.number}</td>
      <td className="p-3">{inv.company?.name ?? "—"}</td>
      <td className="p-3">{inv.periodLabel}</td>
      <td className="p-3">{inv.grossAmount.toFixed(2)} €</td>
      <td className="p-3">{inv.emailStatus}</td>
      <td className="p-3 text-right space-x-2">
        {pdfUrl && (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="text-cyan-300 text-sm underline"
          >
            PDF
          </a>
        )}
        <Button size="sm" variant="outline" onClick={onResend}>
          Re-send
        </Button>
      </td>
    </tr>
  );
}
