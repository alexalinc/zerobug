"use client";

import { useAction, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import type { Id } from "@convex/_generated/dataModel";
import { formatRon } from "@/lib/vat";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

function currentPeriodKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function periodLabel(key: string) {
  const [y, m] = key.split("-");
  const months = [
    "Ianuarie",
    "Februarie",
    "Martie",
    "Aprilie",
    "Mai",
    "Iunie",
    "Iulie",
    "August",
    "Septembrie",
    "Octombrie",
    "Noiembrie",
    "Decembrie",
  ];
  return `${months[Number(m) - 1]} ${y}`;
}

function emailLabel(status: string) {
  if (status === "sent") return "Trimis";
  if (status === "failed") return "Eșuat";
  return "Netrimis";
}

export default function FacturiPage() {
  const periodKey = useMemo(() => currentPeriodKey(), []);
  const year = useMemo(() => Number(periodKey.split("-")[0]), [periodKey]);
  const invoices = useQuery(api.invoices.list);
  const nextNumber = useQuery(api.invoices.peekNextNumber, { year });
  const manualList = useQuery(api.invoices.manualGenerationList, {
    periodKey,
  });
  const generateForCompany = useAction(
    api.invoicesBilling.generateForCompany,
  );
  const resend = useAction(api.invoices.resendEmail);

  const [showGenerate, setShowGenerate] = useState(false);
  const [busyId, setBusyId] = useState<Id<"companies"> | null>(null);
  const [sendingId, setSendingId] = useState<Id<"invoices"> | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onGenerate(companyId: Id<"companies">) {
    setBusyId(companyId);
    setError(null);
    try {
      await generateForCompany({ companyId, periodKey });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generarea a eșuat");
    } finally {
      setBusyId(null);
    }
  }

  async function onSend(invoiceId: Id<"invoices">) {
    setSendingId(invoiceId);
    setError(null);
    try {
      await resend({ invoiceId });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Trimiterea a eșuat");
    } finally {
      setSendingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Facturi</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Generare manuală sau automată pe 1 ale lunii. Numărul crește cu +1
            la fiecare factură; emailul pleacă automat către client.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setShowGenerate((v) => !v)}
          className="shrink-0"
        >
          {showGenerate ? "Închide generarea" : "Generează factură"}
        </Button>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {error}
        </p>
      ) : null}

      {showGenerate ? (
        <div className="space-y-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-white">
                Generare manuală — {periodLabel(periodKey)}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Doar firmele active cu sumă lunară setată.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-zinc-950/50 px-4 py-2 text-right text-xs">
              <p className="text-zinc-500">Următorul număr</p>
              <p className="mt-0.5 font-medium text-[color:var(--brand)]">
                {nextNumber?.formatted ?? "—"}
              </p>
              <p className="mt-0.5 text-zinc-600">
                Data {new Date().toLocaleDateString("ro-RO")}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10 text-left text-zinc-500">
                <tr>
                  <th className="p-3 font-medium">Firmă</th>
                  <th className="p-3 font-medium">Sumă / TVA</th>
                  <th className="p-3 font-medium">Detalii factură</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {(manualList ?? []).map((row) => (
                  <tr key={row.companyId} className="border-b border-white/5">
                    <td className="p-3">
                      <p className="font-medium text-white">{row.name}</p>
                      <p className="text-xs text-zinc-500">{row.email}</p>
                    </td>
                    <td className="p-3 text-xs text-zinc-400">
                      <p>
                        Net {formatRon(row.net)} · TVA {formatRon(row.vat)}
                      </p>
                      <p className="mt-0.5 font-medium text-white">
                        Total {formatRon(row.gross)}
                      </p>
                      <p className="mt-0.5 text-zinc-600">
                        {row.vatMode === "included"
                          ? "TVA inclus"
                          : "fără TVA (+21%)"}
                      </p>
                    </td>
                    <td className="max-w-[240px] p-3 text-xs text-zinc-400">
                      <p>
                        Nr.{" "}
                        {row.alreadyGenerated
                          ? "deja alocat"
                          : (nextNumber?.formatted ?? "—")}
                      </p>
                      <p className="mt-0.5">
                        Perioadă: {periodLabel(periodKey)}
                      </p>
                      <p className="mt-0.5 line-clamp-2">
                        {row.invoiceDescription ||
                          "Prestare servicii conform contract"}
                      </p>
                    </td>
                    <td className="p-3">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs",
                          row.alreadyGenerated
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-zinc-500/15 text-zinc-400",
                        )}
                      >
                        {row.alreadyGenerated
                          ? "Deja generată"
                          : "Pregătită"}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        size="sm"
                        disabled={
                          row.alreadyGenerated || busyId === row.companyId
                        }
                        onClick={() => onGenerate(row.companyId)}
                      >
                        {busyId === row.companyId
                          ? "Se generează…"
                          : "Generează"}
                      </Button>
                    </td>
                  </tr>
                ))}
                {(manualList ?? []).length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-sm text-zinc-500"
                    >
                      Nicio firmă activă cu sumă lunară. Adaugă suma în Firme.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
        <table className="w-full text-sm">
          <thead className="border-b border-white/10 text-left text-zinc-500">
            <tr>
              <th className="p-3 font-medium">Factură</th>
              <th className="p-3 font-medium">Firmă</th>
              <th className="p-3 font-medium">Perioadă</th>
              <th className="p-3 font-medium">Net</th>
              <th className="p-3 font-medium">TVA</th>
              <th className="p-3 font-medium">Total</th>
              <th className="p-3 font-medium">Email</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {(invoices ?? []).map((inv) => (
              <InvoiceRow
                key={inv._id}
                inv={inv}
                sending={sendingId === inv._id}
                onSend={() => onSend(inv._id)}
              />
            ))}
            {(invoices ?? []).length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="p-8 text-center text-sm text-zinc-500"
                >
                  Încă nu există facturi generate.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InvoiceRow({
  inv,
  sending,
  onSend,
}: {
  inv: {
    _id: Id<"invoices">;
    number: string;
    series?: string;
    periodLabel: string;
    netAmount: number;
    vatAmount: number;
    grossAmount: number;
    emailStatus: string;
    emailError?: string;
    company?: { name?: string; email?: string } | null;
  };
  sending: boolean;
  onSend: () => void;
}) {
  const pdfUrl = useQuery(api.invoices.getPdfUrl, { id: inv._id });

  return (
    <tr className="border-b border-white/5">
      <td className="p-3 font-medium text-white">{inv.number}</td>
      <td className="p-3 text-zinc-300">
        <p>{inv.company?.name ?? "—"}</p>
        {inv.company?.email ? (
          <p className="text-xs text-zinc-600">{inv.company.email}</p>
        ) : null}
      </td>
      <td className="p-3 text-zinc-400">{inv.periodLabel}</td>
      <td className="p-3 text-zinc-400">{formatRon(inv.netAmount)}</td>
      <td className="p-3 text-zinc-400">{formatRon(inv.vatAmount)}</td>
      <td className="p-3 font-medium text-white">
        {formatRon(inv.grossAmount)}
      </td>
      <td className="p-3">
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs",
            inv.emailStatus === "sent"
              ? "bg-emerald-500/15 text-emerald-400"
              : inv.emailStatus === "failed"
                ? "bg-red-500/15 text-red-400"
                : "bg-amber-500/15 text-amber-400",
          )}
          title={inv.emailError}
        >
          {emailLabel(inv.emailStatus)}
        </span>
      </td>
      <td className="space-x-2 p-3 text-right whitespace-nowrap">
        {pdfUrl ? (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-[color:var(--brand)] underline"
          >
            PDF
          </a>
        ) : null}
        <Button size="sm" variant="outline" disabled={sending} onClick={onSend}>
          {sending
            ? "Se trimite…"
            : inv.emailStatus === "sent"
              ? "Retrimite email"
              : "Trimite pe email"}
        </Button>
      </td>
    </tr>
  );
}
