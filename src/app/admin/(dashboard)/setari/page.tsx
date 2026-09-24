"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useSearchParams } from "next/navigation";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SetariPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-8 max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight">Setări</h1>
          <p className="text-sm text-zinc-500">Se încarcă…</p>
        </div>
      }
    >
      <SetariPageInner />
    </Suspense>
  );
}

function SetariPageInner() {
  const year = useMemo(() => new Date().getFullYear(), []);
  const issuer = useQuery(api.settings.getIssuer, { year });
  const upsert = useMutation(api.settings.upsertIssuer);
  const seed = useMutation(api.settings.seedDefaults);
  const googleConnection = useQuery(api.googleAds.getConnection);
  const updateGoogleConfig = useMutation(api.googleAds.updateConfig);
  const disconnectGoogle = useMutation(api.googleAds.disconnect);
  const searchParams = useSearchParams();

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

  const [gadsForm, setGadsForm] = useState({
    customerId: "",
    loginCustomerId: "",
    conversionActionId: "",
    enabled: false,
  });
  const [gadsSaving, setGadsSaving] = useState(false);
  const [gadsSaved, setGadsSaved] = useState(false);
  const [gadsError, setGadsError] = useState<string | null>(null);
  const [gadsBanner, setGadsBanner] = useState<string | null>(null);

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

  useEffect(() => {
    if (googleConnection) {
      setGadsForm({
        customerId: googleConnection.customerId || "",
        loginCustomerId: googleConnection.loginCustomerId || "",
        conversionActionId: googleConnection.conversionActionId || "",
        enabled: googleConnection.enabled,
      });
    }
  }, [googleConnection]);

  useEffect(() => {
    const google = searchParams.get("google");
    if (google === "connected") {
      setGadsBanner("Cont Google conectat. Completează Customer ID și Conversion Action ID, apoi activează sync.");
    } else if (google === "error") {
      setGadsBanner(
        `Conectarea a eșuat: ${searchParams.get("message") || "eroare necunoscută"}`,
      );
    }
  }, [searchParams]);

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

  async function onSaveGoogle(e: React.FormEvent) {
    e.preventDefault();
    setGadsSaving(true);
    setGadsError(null);
    setGadsSaved(false);
    try {
      await updateGoogleConfig({
        customerId: gadsForm.customerId,
        conversionActionId: gadsForm.conversionActionId,
        loginCustomerId: gadsForm.loginCustomerId || undefined,
        enabled: gadsForm.enabled,
      });
      setGadsSaved(true);
      setTimeout(() => setGadsSaved(false), 2000);
    } catch (err) {
      setGadsError(
        err instanceof Error ? err.message : "Salvarea Google Ads a eșuat",
      );
    } finally {
      setGadsSaving(false);
    }
  }

  async function onDisconnectGoogle() {
    if (!confirm("Deconectezi contul Google Ads?")) return;
    setGadsError(null);
    try {
      await disconnectGoogle({});
      setGadsForm({
        customerId: "",
        loginCustomerId: "",
        conversionActionId: "",
        enabled: false,
      });
      setGadsBanner("Cont Google deconectat.");
    } catch (err) {
      setGadsError(
        err instanceof Error ? err.message : "Deconectarea a eșuat",
      );
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

      <form
        onSubmit={onSaveGoogle}
        className="space-y-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5"
      >
        <div>
          <p className="text-sm font-medium text-white">Google Ads</p>
          <p className="mt-1 text-xs text-zinc-500">
            Conectează contul prin Google Cloud OAuth. Lead-urile de pe site se
            trimit ca Enhanced Conversions (Data Manager API) la submit.
          </p>
        </div>

        {gadsBanner ? (
          <p
            className={`rounded-lg px-3 py-2 text-sm ${
              gadsBanner.includes("eșuat") || gadsBanner.includes("Deconectat")
                ? "bg-amber-500/10 text-amber-200"
                : "bg-emerald-500/10 text-emerald-300"
            }`}
          >
            {gadsBanner}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          {googleConnection?.connected ? (
            <>
              <p className="text-sm text-zinc-300">
                Conectat
                {googleConnection.email
                  ? `: ${googleConnection.email}`
                  : ""}
                {googleConnection.ready ? (
                  <span className="ml-2 text-emerald-400">· sync activ</span>
                ) : (
                  <span className="ml-2 text-amber-400">
                    · completează ID-urile + activează
                  </span>
                )}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void onDisconnectGoogle()}
              >
                Deconectează
              </Button>
            </>
          ) : (
            <a
              href="/api/admin/google-ads/connect"
              className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80"
            >
              Conectează Google Ads
            </a>
          )}
        </div>

        {googleConnection?.connected ? (
          <>
            <div className="space-y-1.5">
              <Label>Customer ID (Google Ads)</Label>
              <Input
                value={gadsForm.customerId}
                onChange={(e) =>
                  setGadsForm((f) => ({ ...f, customerId: e.target.value }))
                }
                placeholder="1234567890"
                required
              />
              <p className="text-[11px] text-zinc-500">
                Fără liniuțe. Contul care deține Conversion Action.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>Login Customer ID (MCC, opțional)</Label>
              <Input
                value={gadsForm.loginCustomerId}
                onChange={(e) =>
                  setGadsForm((f) => ({
                    ...f,
                    loginCustomerId: e.target.value,
                  }))
                }
                placeholder="gol = același cu Customer ID"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Conversion Action ID</Label>
              <Input
                value={gadsForm.conversionActionId}
                onChange={(e) =>
                  setGadsForm((f) => ({
                    ...f,
                    conversionActionId: e.target.value,
                  }))
                }
                placeholder="987654321"
                required
              />
              <p className="text-[11px] text-zinc-500">
                Tools → Conversions → acțiune tip Import / Upload clicks.
                ID numeric, nu resource name.
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={gadsForm.enabled}
                onChange={(e) =>
                  setGadsForm((f) => ({ ...f, enabled: e.target.checked }))
                }
                className="size-4 rounded border-white/20 bg-zinc-900"
              />
              Activează sync lead → conversie
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={gadsSaving}>
                {gadsSaving ? "Se salvează…" : "Salvează Google Ads"}
              </Button>
              {gadsSaved ? (
                <p className="text-sm text-emerald-400">Salvat.</p>
              ) : null}
              {gadsError ? (
                <p className="text-sm text-red-400">{gadsError}</p>
              ) : null}
            </div>
          </>
        ) : null}
      </form>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 text-sm text-zinc-400 space-y-1">
        <p className="font-medium text-zinc-300">Env necesare</p>
        <code className="block text-xs text-zinc-500 whitespace-pre-wrap">
          STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, RESEND_API_KEY,
          RESEND_FROM_EMAIL, ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_SESSION_SECRET,
          NEXT_PUBLIC_CONVEX_URL
          {"\n"}
          GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET,
          GOOGLE_OAUTH_REDIRECT_URI
          {"\n"}
          (aceleași GOOGLE_* și în Convex Dashboard → Settings → Environment
          Variables, pentru refresh token la upload)
        </code>
      </div>
    </div>
  );
}
