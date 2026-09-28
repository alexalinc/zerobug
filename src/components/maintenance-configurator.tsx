"use client";

import { useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  getAdsClickIdsForLead,
  getMarketingConsentForLead,
} from "@/lib/gclid";
import { fetchLeadFormToken } from "@/lib/lead-form-client";
import { MAINTENANCE_PLANS, withVat } from "@/lib/services";
import {
  useQuoteFunnel,
  useQuoteFunnelVisibility,
} from "@/components/use-quote-funnel";

export function MaintenanceConfigurator() {
  const createLead = useMutation(api.leads.create);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [planKey, setPlanKey] = useState(
    () => MAINTENANCE_PLANS.find((p) => p.highlighted)?.id ?? "pro",
  );
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [loading, setLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const { trackView, trackStart, trackField, trackSubmit } =
    useQuoteFunnel("maintenance");
  useQuoteFunnelVisibility(rootRef, trackView);

  const selectedPlan =
    MAINTENANCE_PLANS.find((p) => p.id === planKey) ?? MAINTENANCE_PLANS[1];

  async function submitOffer(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    trackStart("1", "Formular scurt mentenanță");
    try {
      const formToken = await fetchLeadFormToken();
      const plan = selectedPlan;
      const messageParts = [
        siteUrl.trim() ? `Site: ${siteUrl.trim()}` : null,
        plan ? `Plan interes: ${plan.name} (${plan.priceNet} € + TVA /lună)` : null,
        notes.trim() || null,
      ].filter(Boolean);

      await createLead({
        type: "maintenance",
        name,
        email,
        phone: phone || undefined,
        message: messageParts.join("\n") || undefined,
        planKey: plan?.id,
        budget: plan?.priceNet,
        quoteDetails: JSON.stringify({
          simplified: true,
          siteUrl: siteUrl.trim() || undefined,
          notes: notes.trim() || undefined,
          planKey: plan?.id,
        }),
        formToken,
        website: "",
        ...getAdsClickIdsForLead(),
        marketingConsent: getMarketingConsentForLead(),
      });
      trackSubmit();
      setStatus("ok");
    } catch {
      setStatus("err");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative" ref={rootRef}>
      <form
        onSubmit={submitOffer}
        className="mx-auto max-w-xl space-y-6 rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-8"
      >
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-white">
            Cere ofertă de mentenanță
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Complezi 4 câmpuri — revenim pe email sau telefon, fără obligație.
          </p>
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-400">Plan orientativ</Label>
          <div className="grid grid-cols-3 gap-2">
            {MAINTENANCE_PLANS.map((plan) => {
              const selected = planKey === plan.id;
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setPlanKey(plan.id)}
                  className={cn(
                    "rounded-2xl border px-2 py-3 text-center transition-colors",
                    selected
                      ? "border-[color:var(--brand)]/60 bg-[color:var(--brand)]/10"
                      : "border-white/10 bg-white/[0.02] hover:border-white/25",
                  )}
                >
                  <p className="text-xs font-medium text-white">{plan.name}</p>
                  <p className="mt-1 text-[11px] text-zinc-400">
                    {plan.priceNet} €
                    <span className="text-zinc-600"> + TVA</span>
                  </p>
                </button>
              );
            })}
          </div>
          {selectedPlan ? (
            <p className="text-xs text-zinc-500">
              ≈ {withVat(selectedPlan.priceNet).gross.toFixed(2)} € cu TVA /lună ·{" "}
              {selectedPlan.description}
            </p>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="maint-name">Nume</Label>
            <Input
              id="maint-name"
              required
              autoComplete="name"
              placeholder="Numele tău"
              value={name}
              onFocus={() => trackField("name", "1")}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maint-email">Email</Label>
            <Input
              id="maint-email"
              type="email"
              required
              autoComplete="email"
              placeholder="email@firma.ro"
              value={email}
              onFocus={() => trackField("email", "1")}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maint-phone">Telefon</Label>
            <Input
              id="maint-phone"
              type="tel"
              required
              autoComplete="tel"
              placeholder="07xx xxx xxx"
              value={phone}
              onFocus={() => trackField("phone", "1")}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maint-site">URL site</Label>
            <Input
              id="maint-site"
              type="url"
              required
              inputMode="url"
              placeholder="https://exemplu.ro"
              value={siteUrl}
              onFocus={() => trackField("siteUrl", "1")}
              onChange={(e) => setSiteUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maint-notes">
              Ce te preocupă{" "}
              <span className="font-normal text-zinc-500">(opțional)</span>
            </Label>
            <Textarea
              id="maint-notes"
              rows={2}
              placeholder="Update-uri, viteză, securitate, backup…"
              value={notes}
              onFocus={() => trackField("notes", "1")}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {status === "ok" ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-300">
            Cererea a fost trimisă. Te contactăm în curând pe email sau telefon.
          </div>
        ) : (
          <Button type="submit" disabled={loading} className="h-11 w-full">
            {loading ? "Se trimite…" : "Trimite cererea"}
            <Send className="ml-2 h-4 w-4" />
          </Button>
        )}

        {status === "err" ? (
          <p className="text-sm text-red-400">
            Nu am putut trimite cererea. Încearcă din nou sau scrie-ne la
            contact@zerobug.ro.
          </p>
        ) : null}
      </form>
    </div>
  );
}
