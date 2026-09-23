"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SetariPage() {
  const year = useMemo(() => new Date().getFullYear(), []);
  const issuer = useQuery(api.settings.getIssuer, { year });
  const upsert = useMutation(api.settings.upsertIssuer);
  const seed = useMutation(api.settings.seedDefaults);
  const [form, setForm] = useState({
    companyName: "",
    cui: "",
    regCom: "",
    address: "",
    phone: "",
    email: "",
    bank: "",
    iban: "",
    invoiceSeries: "ZB",
    invoiceNextNumber: "1",
    brandName: "ZeroBug",
    accountingEmail: "exactexpert@yahoo.com",
    githubRepoUrl: "",
    vercelDashboardUrl: "",
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void seed({}).catch(() => {
      /* Convex down — form still usable with defaults */
    });
  }, [seed]);

  useEffect(() => {
    if (issuer) {
      setForm({
        companyName: issuer.companyName,
        cui: issuer.cui,
        regCom: issuer.regCom,
        address: issuer.address,
        phone: issuer.phone,
        email: issuer.email,
        bank: issuer.bank,
        iban: issuer.iban,
        invoiceSeries: issuer.invoiceSeries,
        invoiceNextNumber: String(issuer.invoiceNextNumber ?? 1),
        brandName: issuer.brandName,
        accountingEmail:
          issuer.accountingEmail || "exactexpert@yahoo.com",
        githubRepoUrl: issuer.githubRepoUrl || "",
        vercelDashboardUrl: issuer.vercelDashboardUrl || "",
      });
    }
  }, [issuer]);

  const previewNumber = useMemo(() => {
    const series = (form.invoiceSeries || "ZB").trim().toUpperCase() || "ZB";
    const n = Math.max(1, Math.floor(Number(form.invoiceNextNumber) || 1));
    return `${series}${String(n).padStart(4, "0")}`;
  }, [form.invoiceSeries, form.invoiceNextNumber]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const next = Math.max(1, Math.floor(Number(form.invoiceNextNumber) || 1));
      await upsert({
        companyName: form.companyName,
        cui: form.cui,
        regCom: form.regCom,
        address: form.address,
        phone: form.phone,
        email: form.email,
        bank: form.bank,
        iban: form.iban,
        invoiceSeries: form.invoiceSeries,
        invoiceNextNumber: next,
        brandName: form.brandName,
        accountingEmail: form.accountingEmail || undefined,
        githubRepoUrl: form.githubRepoUrl || undefined,
        vercelDashboardUrl: form.vercelDashboardUrl || undefined,
        year,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Salvarea a eșuat. Verifică dacă Convex rulează (npm run dev).",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Setări</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Date emitent, serie și număr factură. Contabilitatea primește copie
          BCC la fiecare factură (inclusiv regenerarea din 1 ale lunii).
        </p>
      </div>

      <form
        onSubmit={onSave}
        className="space-y-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5"
      >
        <p className="text-sm font-medium text-white">Emitent factură</p>
        {(
          [
            ["brandName", "Brand"],
            ["companyName", "Denumire legală"],
            ["cui", "CUI"],
            ["regCom", "Reg. Com."],
            ["address", "Adresă"],
            ["phone", "Telefon"],
            ["email", "Email firmă"],
            ["accountingEmail", "Email contabilitate"],
            ["bank", "Bancă"],
            ["iban", "IBAN"],
            ["githubRepoUrl", "GitHub repo URL"],
            ["vercelDashboardUrl", "Vercel dashboard URL"],
          ] as const
        ).map(([key, label]) => (
          <div key={key} className="space-y-1.5">
            <Label>{label}</Label>
            <Input
              type={
                key === "email" || key === "accountingEmail"
                  ? "email"
                  : "text"
              }
              value={form[key]}
              onChange={(e) =>
                setForm((f) => ({ ...f, [key]: e.target.value }))
              }
              required={
                key !== "githubRepoUrl" &&
                key !== "vercelDashboardUrl" &&
                key !== "accountingEmail"
              }
            />
            {key === "accountingEmail" ? (
              <p className="text-[11px] text-zinc-500">
                Copie BCC la fiecare factură trimisă (ex.
                exactexpert@yahoo.com).
              </p>
            ) : null}
          </div>
        ))}

        <div className="space-y-3 rounded-xl border border-white/10 bg-zinc-950/50 p-4">
          <p className="text-sm font-medium text-white">
            Numerotare facturi ({year})
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Serie factură</Label>
              <Input
                value={form.invoiceSeries}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    invoiceSeries: e.target.value.toUpperCase(),
                  }))
                }
                required
                placeholder="ZB"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Următorul număr</Label>
              <Input
                type="number"
                min={1}
                step={1}
                value={form.invoiceNextNumber}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    invoiceNextNumber: e.target.value,
                  }))
                }
                required
              />
            </div>
          </div>
          <p className="text-[11px] text-zinc-500">
            Următoarea factură generată va fi:{" "}
            <span className="font-medium text-[color:var(--brand)]">
              {previewNumber}
            </span>
            {" "}(serie + număr, ex. DEV0010). După fiecare generare, numărul
            crește automat cu +1.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Se salvează…" : "Salvează"}
          </Button>
          {saved ? (
            <p className="text-sm text-emerald-400">Salvat.</p>
          ) : null}
          {error ? (
            <p className="text-sm text-red-400">{error}</p>
          ) : null}
        </div>
      </form>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 text-sm text-zinc-400 space-y-1">
        <p className="font-medium text-zinc-300">Env necesare</p>
        <code className="block text-xs text-zinc-500">
          STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, RESEND_API_KEY,
          RESEND_FROM_EMAIL, ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_SESSION_SECRET,
          NEXT_PUBLIC_CONVEX_URL
        </code>
      </div>
    </div>
  );
}
