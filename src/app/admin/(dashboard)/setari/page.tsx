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
    githubRepoUrl: "",
    vercelDashboardUrl: "",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void seed({});
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
        githubRepoUrl: issuer.githubRepoUrl || "",
        vercelDashboardUrl: issuer.vercelDashboardUrl || "",
      });
    }
  }, [issuer]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    await upsert({
      ...form,
      githubRepoUrl: form.githubRepoUrl || undefined,
      vercelDashboardUrl: form.vercelDashboardUrl || undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <h1 className="text-3xl font-[family-name:var(--font-serif)]">Setări</h1>
      <p className="text-sm text-zinc-400">
        Date emitent factură. Stripe / Resend se configurează prin variabile de
        mediu pe Vercel.
      </p>
      <form onSubmit={onSave} className="space-y-4">
        {(
          [
            ["brandName", "Brand"],
            ["companyName", "Denumire legală"],
            ["cui", "CUI"],
            ["regCom", "Reg. Com."],
            ["address", "Adresă"],
            ["phone", "Telefon"],
            ["email", "Email"],
            ["bank", "Bancă"],
            ["iban", "IBAN"],
            ["invoiceSeries", "Serie factură"],
            ["githubRepoUrl", "GitHub repo URL"],
            ["vercelDashboardUrl", "Vercel dashboard URL"],
          ] as const
        ).map(([key, label]) => (
          <div key={key} className="space-y-1">
            <Label>{label}</Label>
            <Input
              value={form[key]}
              onChange={(e) =>
                setForm((f) => ({ ...f, [key]: e.target.value }))
              }
              required={
                key !== "githubRepoUrl" && key !== "vercelDashboardUrl"
              }
            />
          </div>
        ))}
        <Button type="submit">Salvează</Button>
        {saved && <p className="text-sm text-emerald-400">Salvat.</p>}
      </form>
      <div className="border border-white/10 p-4 text-sm text-zinc-400 space-y-1">
        <p>Env necesare:</p>
        <code className="block text-xs text-zinc-300">
          STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, RESEND_API_KEY,
          RESEND_FROM_EMAIL, ADMIN_PASSWORD, ADMIN_SESSION_SECRET,
          NEXT_PUBLIC_CONVEX_URL
        </code>
      </div>
    </div>
  );
}
