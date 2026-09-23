"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SetariPage() {
  const issuer = useQuery(api.settings.getIssuer);
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
        brandName: issuer.brandName,
        accountingEmail:
          issuer.accountingEmail || "exactexpert@yahoo.com",
        githubRepoUrl: issuer.githubRepoUrl || "",
        vercelDashboardUrl: issuer.vercelDashboardUrl || "",
      });
    }
  }, [issuer]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await upsert({
        ...form,
        accountingEmail: form.accountingEmail || undefined,
        githubRepoUrl: form.githubRepoUrl || undefined,
        vercelDashboardUrl: form.vercelDashboardUrl || undefined,
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
          Datele firmei apar pe coloana din stânga a facturilor. Seria se
          folosește la numărul din mijloc. Contabilitatea primește copie BCC
          la fiecare factură (inclusiv regenerarea din 1 ale lunii).
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
            ["invoiceSeries", "Serie factură"],
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
            {key === "invoiceSeries" ? (
              <p className="text-[11px] text-zinc-500">
                Exemplu pe PDF: {form.invoiceSeries || "ZB"}-2026-0001
              </p>
            ) : null}
            {key === "accountingEmail" ? (
              <p className="text-[11px] text-zinc-500">
                Copie BCC la fiecare factură trimisă (ex. regenerare pe 1:
                exactexpert@yahoo.com).
              </p>
            ) : null}
          </div>
        ))}
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
