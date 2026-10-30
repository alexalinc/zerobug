"use client";

import {
  useAdminSessionToken,
  withAdminToken,
} from "@/components/admin-session-provider";

import { useAction, useConvex, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Id } from "@convex/_generated/dataModel";
import {
  computeVatAmounts,
  formatRon,
  type VatMode,
} from "@/lib/vat";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Calculator,
  CheckCircle2,
  Download,
  Eye,
  FilePlus2,
  FileText,
  Hash,
  Loader2,
  Mail,
  MailWarning,
  RefreshCw,
  UserPlus,
  X,
} from "lucide-react";

function currentPeriodKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/** Next calendar month as YYYY-MM (used for early invoice generation). */
function nextPeriodKey(from = new Date()) {
  const d = new Date(from.getFullYear(), from.getMonth() + 1, 1);
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

type InvoiceListItem = {
  _id: Id<"invoices">;
  number: string;
  series?: string;
  periodLabel: string;
  periodKey?: string;
  netAmount: number;
  vatAmount: number;
  grossAmount: number;
  emailStatus: string;
  emailError?: string;
  accountingEmailStatus?: string;
  accountingEmailError?: string;
  pdfStorageId?: Id<"_storage">;
  company?: { name?: string; email?: string } | null;
};

async function downloadPdfFile(url: string, filename: string) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("fetch failed");
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

function StatusPill({
  tone,
  children,
  title,
}: {
  tone: "ok" | "warn" | "danger" | "info" | "muted";
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium tracking-wide",
        tone === "ok" &&
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
        tone === "warn" &&
          "border-amber-500/20 bg-amber-500/10 text-amber-300",
        tone === "danger" && "border-red-500/20 bg-red-500/10 text-red-300",
        tone === "info" && "border-sky-500/20 bg-sky-500/10 text-sky-300",
        tone === "muted" && "border-white/10 bg-white/[0.04] text-zinc-400",
      )}
    >
      {children}
    </span>
  );
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-transparent p-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 font-semibold tracking-tight text-white tabular-nums text-xl md:text-2xl">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-zinc-500">{hint}</p> : null}
    </div>
  );
}

export default function FacturiPage() {
  const token = useAdminSessionToken();
  const convex = useConvex();
  const periodKey = useMemo(() => currentPeriodKey(), []);
  const upcomingPeriodKey = useMemo(() => nextPeriodKey(), []);
  const [billingPeriodKey, setBillingPeriodKey] = useState(periodKey);
  const year = useMemo(
    () => Number(billingPeriodKey.split("-")[0]),
    [billingPeriodKey],
  );
  const invoices = useQuery(api.invoices.list, withAdminToken(token)) as
    | InvoiceListItem[]
    | undefined;
  const nextNumber = useQuery(
    api.invoices.peekNextNumber,
    withAdminToken(token, { year }),
  );
  const manualList = useQuery(
    api.invoices.manualGenerationList,
    withAdminToken(token, { periodKey: billingPeriodKey }),
  );
  const generateForCompany = useAction(
    api.invoicesBilling.generateForCompany,
  );
  const generateOneOff = useAction(api.invoicesBilling.generateOneOff);
  const resend = useAction(api.invoices.resendEmail);
  const regeneratePdf = useAction(api.invoices.regeneratePdf);
  const sendToAccounting = useAction(api.invoices.sendToAccounting);
  const clientsForInvoice = useQuery(
    api.companies.listForInvoicing,
    withAdminToken(token),
  );

  const [showGenerate, setShowGenerate] = useState(false);
  const [generateTab, setGenerateTab] = useState<"monthly" | "oneoff">(
    "monthly",
  );
  const isNextMonthBilling = billingPeriodKey === upcomingPeriodKey;
  const [busyId, setBusyId] = useState<Id<"companies"> | null>(null);
  const [oneOffBusy, setOneOffBusy] = useState(false);
  const [sendingId, setSendingId] = useState<Id<"invoices"> | null>(null);
  const [accountingId, setAccountingId] =
    useState<Id<"invoices"> | null>(null);
  const [regeneratingId, setRegeneratingId] =
    useState<Id<"invoices"> | null>(null);
  const [selected, setSelected] = useState<Set<Id<"invoices">>>(new Set());
  const [downloading, setDownloading] = useState(false);
  const [sendingAccountingBulk, setSendingAccountingBulk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [oneOffMode, setOneOffMode] = useState<"existing" | "new">("existing");
  const [oneOffCompanyId, setOneOffCompanyId] = useState<string>("");
  const [oneOffClient, setOneOffClient] = useState({
    name: "",
    email: "",
    cui: "",
    regCom: "",
    address: "",
    phone: "",
  });
  const [oneOffSaveClient, setOneOffSaveClient] = useState(true);
  const [oneOffAmount, setOneOffAmount] = useState("");
  const [oneOffVatMode, setOneOffVatMode] = useState<VatMode>("excluded");
  const [oneOffDescription, setOneOffDescription] = useState(
    "Prestare servicii conform contract",
  );

  const oneOffPreview = useMemo(() => {
    const amount = Number(oneOffAmount);
    if (!amount || amount <= 0) return null;
    return computeVatAmounts(amount, oneOffVatMode);
  }, [oneOffAmount, oneOffVatMode]);

  const selectableIds = useMemo(
    () =>
      (invoices ?? [])
        .filter((inv) => Boolean(inv.pdfStorageId))
        .map((inv) => inv._id),
    [invoices],
  );

  const allSelectableSelected =
    selectableIds.length > 0 &&
    selectableIds.every((id) => selected.has(id));

  const summary = useMemo(() => {
    const list = invoices ?? [];
    const thisMonth = list.filter(
      (i) =>
        i.periodKey === periodKey ||
        (i.periodKey?.startsWith(`${periodKey}-`) ?? false),
    );
    const scope = thisMonth.length > 0 ? thisMonth : list;
    const gross = scope.reduce((s, i) => s + i.grossAmount, 0);
    const sent = scope.filter((i) => i.emailStatus === "sent").length;
    const accounting = scope.filter(
      (i) => i.accountingEmailStatus === "sent",
    ).length;
    return {
      count: scope.length,
      gross,
      sent,
      accounting,
      scopedToMonth: thisMonth.length > 0,
    };
  }, [invoices, periodKey]);

  function toggleOne(id: Id<"invoices">) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allSelectableSelected) {
      setSelected(new Set());
      return;
    }
    setSelected(new Set(selectableIds));
  }

  function successGenerateMessage() {
    return isNextMonthBilling
      ? `Factură generată pentru ${periodLabel(billingPeriodKey)}. Pe 1 ale lunii nu se mai emite automat pentru acest client — ciclul continuă luna următoare.`
      : `Factură generată pentru ${periodLabel(billingPeriodKey)}.`;
  }

  async function onGenerate(companyId: Id<"companies">) {
    if (!token) return;
    setBusyId(companyId);
    setError(null);
    try {
      await generateForCompany({
        sessionToken: token,
        companyId,
        periodKey: billingPeriodKey,
      });
      setError(successGenerateMessage());
    } catch (e) {
      const message = e instanceof Error ? e.message : "Generarea a eșuat";
      // Long PDF/email actions can outlive the browser↔Convex websocket;
      // the server often finishes anyway (invoice appears in the list).
      if (/connection lost while action was in flight/i.test(message)) {
        setError(
          `${successGenerateMessage()} Conexiunea s-a întrerupt în timp ce se genera PDF/email — verifică lista; de obicei factura e deja creată.`,
        );
      } else {
        setError(message);
      }
    } finally {
      setBusyId(null);
    }
  }

  function resetOneOffForm() {
    setOneOffMode("existing");
    setOneOffCompanyId("");
    setOneOffClient({
      name: "",
      email: "",
      cui: "",
      regCom: "",
      address: "",
      phone: "",
    });
    setOneOffSaveClient(true);
    setOneOffAmount("");
    setOneOffVatMode("excluded");
    setOneOffDescription("Prestare servicii conform contract");
  }

  async function onGenerateOneOff(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    const amount = Number(oneOffAmount);
    if (!amount || amount <= 0) {
      setError("Introdu o sumă validă");
      return;
    }
    setOneOffBusy(true);
    setError(null);
    try {
      await generateOneOff({
        sessionToken: token,
        amount,
        vatMode: oneOffVatMode,
        description: oneOffDescription,
        ...(oneOffMode === "existing"
          ? { companyId: oneOffCompanyId as Id<"companies"> }
          : {
              client: {
                name: oneOffClient.name,
                email: oneOffClient.email,
                cui: oneOffClient.cui || undefined,
                regCom: oneOffClient.regCom || undefined,
                address: oneOffClient.address || undefined,
                phone: oneOffClient.phone || undefined,
              },
              saveClient: oneOffSaveClient,
            }),
      });
      setError("Factură unică generată și trimisă.");
      resetOneOffForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generarea a eșuat");
    } finally {
      setOneOffBusy(false);
    }
  }

  async function onSend(invoiceId: Id<"invoices">) {
    if (!token) return;
    setSendingId(invoiceId);
    setError(null);
    try {
      await resend({ sessionToken: token, invoiceId });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Trimiterea a eșuat");
    } finally {
      setSendingId(null);
    }
  }

  async function onRegeneratePdf(invoiceId: Id<"invoices">) {
    if (!token) return;
    setRegeneratingId(invoiceId);
    setError(null);
    try {
      await regeneratePdf({ sessionToken: token, invoiceId });
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Regenerarea PDF a eșuat",
      );
    } finally {
      setRegeneratingId(null);
    }
  }

  async function onSendAccounting(invoiceIds: Id<"invoices">[]) {
    if (!token || invoiceIds.length === 0) return;
    const bulk = invoiceIds.length > 1;
    if (bulk) setSendingAccountingBulk(true);
    else setAccountingId(invoiceIds[0]!);
    setError(null);
    try {
      const result = await sendToAccounting({
        sessionToken: token,
        invoiceIds,
      });
      setSelected(new Set());
      setError(
        `Trimis la contabilitate (${result.to}): ${result.sent} factură(i).`,
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Trimiterea către contabilitate a eșuat",
      );
    } finally {
      setSendingAccountingBulk(false);
      setAccountingId(null);
    }
  }

  async function onDownloadSelected() {
    if (!token || selected.size === 0) return;
    setDownloading(true);
    setError(null);
    try {
      const rows = await convex.query(api.invoices.getPdfUrls, {
        sessionToken: token,
        ids: Array.from(selected),
      });
      const withPdf = rows.filter(
        (r: { url: string | null }) => Boolean(r.url),
      );
      if (withPdf.length === 0) {
        setError("Nicio factură selectată nu are PDF.");
        return;
      }
      for (const row of withPdf) {
        if (!row.url) continue;
        await downloadPdfFile(row.url, `${row.number}.pdf`);
        await new Promise((r) => setTimeout(r, 250));
      }
      const skipped = rows.length - withPdf.length;
      if (skipped > 0) {
        setError(
          `${withPdf.length} descărcate; ${skipped} fără PDF au fost sărite.`,
        );
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Descărcarea în bulk a eșuat",
      );
    } finally {
      setDownloading(false);
    }
  }

  const loading = invoices === undefined;
  const isSuccessBanner =
    error?.startsWith("Trimis la contabilitate") ||
    error?.startsWith("Factură unică generată") ||
    error?.startsWith("Factură generată pentru");

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[linear-gradient(135deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.02)_40%,transparent_100%)] p-4 sm:p-6 md:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[color:var(--brand)]/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 left-1/3 h-40 w-72 rounded-full bg-white/[0.04] blur-3xl"
        />

        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400">
              <FileText className="size-3.5 text-[color:var(--brand)]" />
              Billing
            </div>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-4xl">
              Facturi
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              Emisiune lunară pe 1, PDF-uri și trimitere către client sau
              contabilitate — într-un singur loc.
            </p>
            <p className="mt-3 text-xs text-zinc-500">
              Perioada curentă ·{" "}
              <span className="text-zinc-300">{periodLabel(periodKey)}</span>
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <div className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 backdrop-blur-sm sm:min-w-[160px] sm:flex-none">
              <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-zinc-500">
                <Hash className="size-3.5" />
                Următorul nr.
              </div>
              <p className="mt-1.5 text-lg font-semibold tracking-tight text-[color:var(--brand)] tabular-nums">
                {nextNumber?.formatted ?? "—"}
              </p>
              <p className="mt-0.5 text-[11px] text-zinc-600">
                {new Date().toLocaleDateString("ro-RO")}
              </p>
            </div>
            <Button
              type="button"
              onClick={() => setShowGenerate((v) => !v)}
              className="h-11 w-full gap-2 px-4 sm:w-auto"
            >
              {showGenerate ? (
                <>
                  <X className="size-4" />
                  Închide
                </>
              ) : (
                <>
                  <FilePlus2 className="size-4" />
                  Generează factură
                </>
              )}
            </Button>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label={summary.scopedToMonth ? "Facturi luna asta" : "Facturi"}
          value={loading ? "—" : String(summary.count)}
        />
        <MetricCard
          label="Total brut"
          value={loading ? "—" : formatRon(summary.gross)}
          hint={summary.scopedToMonth ? periodLabel(periodKey) : "Toate perioadele"}
        />
        <MetricCard
          label="Trimise client"
          value={loading ? "—" : String(summary.sent)}
          hint={
            loading
              ? undefined
              : `${summary.count - summary.sent} în așteptare / eșuate`
          }
        />
        <MetricCard
          label="La contabilitate"
          value={loading ? "—" : String(summary.accounting)}
          hint="Status trimis contabilitate"
        />
      </div>

      {error ? (
        <div
          className={cn(
            "flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm",
            isSuccessBanner
              ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
              : "border-red-500/25 bg-red-500/10 text-red-200",
          )}
        >
          {isSuccessBanner ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          ) : (
            <MailWarning className="mt-0.5 size-4 shrink-0" />
          )}
          <p className="leading-relaxed">{error}</p>
        </div>
      ) : null}

      {/* Generate panel */}
      {showGenerate ? (
        <section className="space-y-5 overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.025]">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.06] px-5 py-4 md:px-6">
            <div>
              <p className="text-sm font-medium text-white">
                Generare factură
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Lunară pe firme active, sau factură unică pentru orice client
              </p>
            </div>
            <div className="flex rounded-xl border border-white/10 bg-black/20 p-1">
              <button
                type="button"
                onClick={() => setGenerateTab("monthly")}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  generateTab === "monthly"
                    ? "bg-white/10 text-white"
                    : "text-zinc-500 hover:text-zinc-300",
                )}
              >
                Firme lunare
              </button>
              <button
                type="button"
                onClick={() => setGenerateTab("oneoff")}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  generateTab === "oneoff"
                    ? "bg-white/10 text-white"
                    : "text-zinc-500 hover:text-zinc-300",
                )}
              >
                Factură unică
              </button>
            </div>
          </div>

          {generateTab === "monthly" ? (
            <div className="space-y-4 px-2 pb-4 md:px-3">
              <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.06] bg-black/20 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
                    Perioada facturii
                  </p>
                  <p className="mt-1 text-sm text-zinc-300">
                    {isNextMonthBilling
                      ? "Emisi acum pentru luna următoare — pe 1 nu se mai generează automat pentru clienții facturați aici."
                      : "Emisi pentru luna curentă (aceeași perioadă ca facturarea automată pe 1)."}
                  </p>
                </div>
                <div className="flex rounded-xl border border-white/10 bg-black/30 p-1">
                  <button
                    type="button"
                    onClick={() => setBillingPeriodKey(periodKey)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                      !isNextMonthBilling
                        ? "bg-white/10 text-white"
                        : "text-zinc-500 hover:text-zinc-300",
                    )}
                  >
                    Luna curentă · {periodLabel(periodKey)}
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingPeriodKey(upcomingPeriodKey)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                      isNextMonthBilling
                        ? "bg-white/10 text-white"
                        : "text-zinc-500 hover:text-zinc-300",
                    )}
                  >
                    Luna următoare · {periodLabel(upcomingPeriodKey)}
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-[0.12em] text-zinc-500">
                      <th className="px-4 py-3 font-medium">Firmă</th>
                      <th className="px-4 py-3 font-medium">Sumă / TVA</th>
                      <th className="px-4 py-3 font-medium">Detalii</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {(manualList ?? []).map((row) => (
                      <tr
                        key={row.companyId}
                        className="border-t border-white/[0.05] transition-colors hover:bg-white/[0.025]"
                      >
                        <td className="px-4 py-4">
                          <p className="font-medium text-white">{row.name}</p>
                          <p className="mt-0.5 text-xs text-zinc-500">
                            {row.email}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-xs text-zinc-400">
                          <p>
                            Net {formatRon(row.net)} · TVA {formatRon(row.vat)}
                          </p>
                          <p className="mt-1 font-medium text-white tabular-nums">
                            Total {formatRon(row.gross)}
                          </p>
                          <p className="mt-1 text-zinc-600">
                            {row.vatMode === "included"
                              ? "TVA inclus"
                              : "fără TVA (+21%)"}
                          </p>
                        </td>
                        <td className="max-w-[240px] px-4 py-4 text-xs text-zinc-400">
                          <p>
                            Nr.{" "}
                            {row.alreadyGenerated
                              ? "deja alocat"
                              : (nextNumber?.formatted ?? "—")}
                          </p>
                          <p className="mt-1">
                            {periodLabel(billingPeriodKey)}
                          </p>
                          <p className="mt-1 line-clamp-2 text-zinc-500">
                            {row.invoiceDescription ||
                              "Prestare servicii conform contract"}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <StatusPill
                            tone={row.alreadyGenerated ? "ok" : "muted"}
                          >
                            {row.alreadyGenerated
                              ? "Deja generată"
                              : "Pregătită"}
                          </StatusPill>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Button
                            size="sm"
                            disabled={
                              row.alreadyGenerated || busyId === row.companyId
                            }
                            onClick={() => onGenerate(row.companyId)}
                          >
                            {busyId === row.companyId
                              ? "Se generează…"
                              : isNextMonthBilling
                                ? "Generează luna viitoare"
                                : "Generează"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {(manualList ?? []).length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-12 text-center text-sm text-zinc-500"
                        >
                          Nicio firmă activă cu sumă lunară. Adaugă suma în
                          Firme.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <form
              onSubmit={(e) => void onGenerateOneOff(e)}
              className="space-y-5 px-5 pb-6 md:px-6"
            >
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setOneOffMode("existing")}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-xs font-medium transition-colors",
                    oneOffMode === "existing"
                      ? "border-[color:var(--brand)]/40 bg-[color:var(--brand)]/10 text-white"
                      : "border-white/10 text-zinc-400 hover:text-zinc-200",
                  )}
                >
                  Client existent
                </button>
                <button
                  type="button"
                  onClick={() => setOneOffMode("new")}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors",
                    oneOffMode === "new"
                      ? "border-[color:var(--brand)]/40 bg-[color:var(--brand)]/10 text-white"
                      : "border-white/10 text-zinc-400 hover:text-zinc-200",
                  )}
                >
                  <UserPlus className="size-3.5" />
                  Client nou (nesalvat)
                </button>
              </div>

              {oneOffMode === "existing" ? (
                <div className="space-y-2">
                  <Label htmlFor="oneoff-client">Selectează clientul</Label>
                  <select
                    id="oneoff-client"
                    required
                    value={oneOffCompanyId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setOneOffCompanyId(id);
                      const c = clientsForInvoice?.find((x) => x._id === id);
                      if (c) {
                        if (c.vatMode) setOneOffVatMode(c.vatMode);
                        if (c.invoiceDescription) {
                          setOneOffDescription(c.invoiceDescription);
                        }
                      }
                    }}
                    className="h-9 w-full rounded-lg border border-white/15 bg-zinc-950 px-3 text-sm text-white outline-none focus-visible:border-[color:var(--brand)]/50"
                  >
                    <option value="">— Alege din clienți —</option>
                    {(clientsForInvoice ?? []).map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                        {c.hasMonthlyBilling ? " · lunar" : ""} · {c.email}
                      </option>
                    ))}
                  </select>
                  {(clientsForInvoice ?? []).length === 0 ? (
                    <p className="text-xs text-zinc-500">
                      Nu există clienți salvați. Adaugă unul nou mai jos sau în
                      Firme.
                    </p>
                  ) : null}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="oneoff-name">Denumire firmă *</Label>
                    <Input
                      id="oneoff-name"
                      required
                      value={oneOffClient.name}
                      onChange={(e) =>
                        setOneOffClient((s) => ({
                          ...s,
                          name: e.target.value,
                        }))
                      }
                      placeholder="SC Exemplu SRL"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="oneoff-email">Email factură *</Label>
                    <Input
                      id="oneoff-email"
                      type="email"
                      required
                      value={oneOffClient.email}
                      onChange={(e) =>
                        setOneOffClient((s) => ({
                          ...s,
                          email: e.target.value,
                        }))
                      }
                      placeholder="facturi@exemplu.ro"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="oneoff-cui">CUI</Label>
                    <Input
                      id="oneoff-cui"
                      value={oneOffClient.cui}
                      onChange={(e) =>
                        setOneOffClient((s) => ({
                          ...s,
                          cui: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="oneoff-reg">Reg. Com.</Label>
                    <Input
                      id="oneoff-reg"
                      value={oneOffClient.regCom}
                      onChange={(e) =>
                        setOneOffClient((s) => ({
                          ...s,
                          regCom: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="oneoff-address">Adresă</Label>
                    <Input
                      id="oneoff-address"
                      value={oneOffClient.address}
                      onChange={(e) =>
                        setOneOffClient((s) => ({
                          ...s,
                          address: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="oneoff-phone">Telefon</Label>
                    <Input
                      id="oneoff-phone"
                      value={oneOffClient.phone}
                      onChange={(e) =>
                        setOneOffClient((s) => ({
                          ...s,
                          phone: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-end pb-1 sm:col-span-2">
                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                      <input
                        type="checkbox"
                        checked={oneOffSaveClient}
                        onChange={(e) =>
                          setOneOffSaveClient(e.target.checked)
                        }
                        className="mt-0.5 size-4 rounded border-white/20 bg-zinc-950 accent-[color:var(--brand)]"
                      />
                      <span>
                        <span className="block text-sm font-medium text-white">
                          Salvează clientul în Firme
                        </span>
                        <span className="mt-0.5 block text-xs text-zinc-500">
                          Fără facturare lunară — doar ca să-l poți selecta la
                          facturi viitoare.
                        </span>
                      </span>
                    </label>
                  </div>
                </div>
              )}

              <div className="grid gap-4 border-t border-white/[0.06] pt-5 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="oneoff-amount">Sumă *</Label>
                  <Input
                    id="oneoff-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={oneOffAmount}
                    onChange={(e) => setOneOffAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="oneoff-vat">Mod TVA</Label>
                  <select
                    id="oneoff-vat"
                    value={oneOffVatMode}
                    onChange={(e) =>
                      setOneOffVatMode(e.target.value as VatMode)
                    }
                    className="h-9 w-full rounded-lg border border-white/15 bg-zinc-950 px-3 text-sm text-white outline-none focus-visible:border-[color:var(--brand)]/50"
                  >
                    <option value="excluded">Sumă netă (+21% TVA)</option>
                    <option value="included">TVA inclus în sumă</option>
                  </select>
                </div>
                <div className="space-y-2 sm:col-span-3">
                  <Label htmlFor="oneoff-desc">Descriere pe factură *</Label>
                  <Input
                    id="oneoff-desc"
                    required
                    value={oneOffDescription}
                    onChange={(e) => setOneOffDescription(e.target.value)}
                  />
                </div>
              </div>

              {oneOffPreview ? (
                <p className="text-xs text-zinc-400">
                  Net {formatRon(oneOffPreview.net)} · TVA{" "}
                  {formatRon(oneOffPreview.vat)} ·{" "}
                  <span className="font-medium text-white">
                    Total {formatRon(oneOffPreview.gross)}
                  </span>
                  {" · "}
                  Nr. {nextNumber?.formatted ?? "—"}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <Button
                  type="submit"
                  disabled={
                    oneOffBusy ||
                    (oneOffMode === "existing" && !oneOffCompanyId)
                  }
                  className="gap-2"
                >
                  {oneOffBusy ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <FilePlus2 className="size-4" />
                  )}
                  {oneOffBusy ? "Se generează…" : "Generează factura"}
                </Button>
              </div>
            </form>
          )}
        </section>
      ) : null}

      {/* List */}
      <section className="space-y-3">
        {selected.size > 0 ? (
          <div className="sticky top-3 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[color:var(--brand)]/25 bg-zinc-950/90 px-4 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-md">
            <div>
              <p className="text-sm font-medium text-white">
                {selected.size} selectat{selected.size === 1 ? "ă" : "e"}
              </p>
              <p className="text-[11px] text-zinc-500">
                Descarcă sau trimite tot lotul la contabilitate
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setSelected(new Set())}
              >
                Anulează
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-1.5"
                disabled={downloading || sendingAccountingBulk}
                onClick={() => void onDownloadSelected()}
              >
                {downloading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Download className="size-3.5" />
                )}
                Descarcă ({selected.size})
              </Button>
              <Button
                type="button"
                size="sm"
                className="gap-1.5"
                disabled={downloading || sendingAccountingBulk}
                onClick={() => void onSendAccounting(Array.from(selected))}
              >
                {sendingAccountingBulk ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Calculator className="size-3.5" />
                )}
                Contabilitate ({selected.size})
              </Button>
            </div>
          </div>
        ) : null}

        <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-4">
            <div>
              <p className="text-sm font-medium text-white">Registru facturi</p>
              <p className="mt-0.5 text-xs text-zinc-500">
                {loading
                  ? "Se încarcă…"
                  : `${invoices?.length ?? 0} înregistrări`}
              </p>
            </div>
          </div>

          <div className="-mx-px overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm md:min-w-[960px]">
              <thead>
                <tr className="border-b border-white/[0.06] text-left text-[11px] uppercase tracking-[0.12em] text-zinc-500">
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label="Selectează toate facturile cu PDF"
                      checked={allSelectableSelected}
                      disabled={selectableIds.length === 0}
                      onChange={toggleAll}
                      className="size-4 rounded border-white/20 bg-zinc-950 accent-[color:var(--brand)]"
                    />
                  </th>
                  <th className="px-3 py-3 font-medium">Factură</th>
                  <th className="px-3 py-3 font-medium">Firmă</th>
                  <th className="px-3 py-3 font-medium">Perioadă</th>
                  <th className="px-3 py-3 font-medium text-right">Net</th>
                  <th className="px-3 py-3 font-medium text-right">TVA</th>
                  <th className="px-3 py-3 font-medium text-right">Total</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {(invoices ?? []).map((inv) => (
                  <InvoiceRow
                    key={inv._id}
                    inv={inv}
                    sessionToken={token}
                    selected={selected.has(inv._id)}
                    onToggle={() => toggleOne(inv._id)}
                    sending={sendingId === inv._id}
                    sendingAccounting={accountingId === inv._id}
                    regenerating={regeneratingId === inv._id}
                    onSend={() => onSend(inv._id)}
                    onSendAccounting={() => onSendAccounting([inv._id])}
                    onRegeneratePdf={() => onRegeneratePdf(inv._id)}
                  />
                ))}
                {!loading && (invoices ?? []).length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-16 text-center text-sm text-zinc-500"
                    >
                      Încă nu există facturi generate.
                    </td>
                  </tr>
                ) : null}
                {loading ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-16 text-center text-sm text-zinc-500"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="size-4 animate-spin" />
                        Se încarcă facturile…
                      </span>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

function InvoiceRow({
  inv,
  sessionToken,
  selected,
  onToggle,
  sending,
  sendingAccounting,
  regenerating,
  onSend,
  onSendAccounting,
  onRegeneratePdf,
}: {
  inv: InvoiceListItem;
  sessionToken: string | null | undefined;
  selected: boolean;
  onToggle: () => void;
  sending: boolean;
  sendingAccounting: boolean;
  regenerating: boolean;
  onSend: () => void;
  onSendAccounting: () => void;
  onRegeneratePdf: () => void;
}) {
  const pdfUrl = useQuery(
    api.invoices.getPdfUrl,
    withAdminToken(sessionToken, { id: inv._id }),
  );
  const hasPdf = Boolean(inv.pdfStorageId);
  const accountingSent = inv.accountingEmailStatus === "sent";
  const accountingFailed = inv.accountingEmailStatus === "failed";

  return (
    <tr
      className={cn(
        "border-b border-white/[0.04] transition-colors",
        selected ? "bg-[color:var(--brand)]/[0.06]" : "hover:bg-white/[0.025]",
      )}
    >
      <td className="px-4 py-4">
        <input
          type="checkbox"
          aria-label={`Selectează factura ${inv.number}`}
          checked={selected}
          disabled={!hasPdf}
          onChange={onToggle}
          title={hasPdf ? undefined : "Fără PDF"}
          className="size-4 rounded border-white/20 bg-zinc-950 accent-[color:var(--brand)] disabled:opacity-30"
        />
      </td>
      <td className="px-3 py-4">
        <p className="font-medium tracking-tight text-white tabular-nums">
          {inv.number}
        </p>
        {inv.series ? (
          <p className="mt-0.5 text-[11px] text-zinc-600">Serie {inv.series}</p>
        ) : null}
      </td>
      <td className="px-3 py-4">
        <p className="font-medium text-zinc-100">{inv.company?.name ?? "—"}</p>
        {inv.company?.email ? (
          <p className="mt-0.5 text-xs text-zinc-500">{inv.company.email}</p>
        ) : null}
      </td>
      <td className="px-3 py-4 text-zinc-400">{inv.periodLabel}</td>
      <td className="px-3 py-4 text-right text-zinc-400 tabular-nums">
        {formatRon(inv.netAmount)}
      </td>
      <td className="px-3 py-4 text-right text-zinc-400 tabular-nums">
        {formatRon(inv.vatAmount)}
      </td>
      <td className="px-3 py-4 text-right font-medium text-white tabular-nums">
        {formatRon(inv.grossAmount)}
      </td>
      <td className="px-3 py-4">
        <div className="flex flex-col gap-1.5">
          <StatusPill
            tone={
              inv.emailStatus === "sent"
                ? "ok"
                : inv.emailStatus === "failed"
                  ? "danger"
                  : "warn"
            }
            title={inv.emailError}
          >
            {emailLabel(inv.emailStatus)}
          </StatusPill>
          {accountingSent ? (
            <StatusPill tone="info">Contabilitate</StatusPill>
          ) : accountingFailed ? (
            <StatusPill tone="danger" title={inv.accountingEmailError}>
              Contab. eșuat
            </StatusPill>
          ) : null}
        </div>
        {inv.emailStatus === "failed" && inv.emailError ? (
          <p className="mt-1.5 max-w-[180px] text-[11px] leading-snug text-red-400/80">
            {inv.emailError}
          </p>
        ) : null}
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {pdfUrl ? (
            <>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
                title="Vezi factura"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "gap-1.5",
                )}
              >
                <Eye className="size-3.5" />
                Vezi
              </a>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                title="Descarcă PDF"
                onClick={() =>
                  void downloadPdfFile(pdfUrl, `${inv.number}.pdf`)
                }
              >
                <Download className="size-3.5" />
                PDF
              </Button>
            </>
          ) : pdfUrl === null ? (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              disabled={regenerating}
              onClick={onRegeneratePdf}
            >
              {regenerating ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <RefreshCw className="size-3.5" />
              )}
              Regenerează
            </Button>
          ) : (
            <Button size="sm" variant="outline" disabled>
              …
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            disabled={sending}
            onClick={onSend}
            title={
              inv.emailStatus === "sent" ? "Retrimite email" : "Trimite email"
            }
          >
            {sending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Mail className="size-3.5" />
            )}
            {inv.emailStatus === "sent" ? "Retrimite" : "Email"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            disabled={!hasPdf || sendingAccounting}
            onClick={onSendAccounting}
            title={
              accountingSent
                ? "Retrimite contabilitate"
                : "Trimite contabilitate"
            }
          >
            {sendingAccounting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Calculator className="size-3.5" />
            )}
            Contab.
          </Button>
        </div>
      </td>
    </tr>
  );
}
