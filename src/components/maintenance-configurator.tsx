"use client";

import { useMemo, useState } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { MAINTENANCE_PLANS, withVat } from "@/lib/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const ADDONS = [
  "Backup zilnic offsite",
  "Monitorizare uptime 24/7",
  "Security hardening",
  "Hotfix-uri minore (2h)",
  "Raport lunar",
];

export function MaintenanceConfigurator() {
  const createLead = useMutation(api.leads.create);
  const checkout = useAction(api.stripe.createCheckoutSession);
  const [step, setStep] = useState(1);
  const [planId, setPlanId] = useState("starter");
  const [complexity, setComplexity] = useState("simplu");
  const [addons, setAddons] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [loading, setLoading] = useState(false);

  const plan = useMemo(
    () => MAINTENANCE_PLANS.find((p) => p.id === planId)!,
    [planId],
  );
  const price = withVat(plan.priceNet);

  function toggleAddon(a: string) {
    setAddons((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a],
    );
  }

  async function submitLead(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await createLead({
        type: "maintenance",
        name: String(fd.get("name") || ""),
        email: String(fd.get("email") || ""),
        phone: String(fd.get("phone") || "") || undefined,
        company: String(fd.get("company") || "") || undefined,
        message: String(fd.get("message") || "") || undefined,
        planKey: planId,
        complexity,
        addons,
      });
      setStatus("ok");
    } catch {
      setStatus("err");
    } finally {
      setLoading(false);
    }
  }

  async function payWithStripe(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await createLead({
        type: "maintenance",
        name: String(fd.get("name") || ""),
        email: String(fd.get("email") || ""),
        phone: String(fd.get("phone") || "") || undefined,
        company: String(fd.get("company") || "") || undefined,
        planKey: planId,
        complexity,
        addons,
        message: "Checkout Stripe",
      });
      const origin = window.location.origin;
      const { url } = await checkout({
        planKey: planId,
        companyName: String(fd.get("company") || fd.get("name") || "Client"),
        email: String(fd.get("email") || ""),
        cui: String(fd.get("cui") || "") || undefined,
        address: String(fd.get("address") || "") || undefined,
        phone: String(fd.get("phone") || "") || undefined,
        successUrl: `${origin}/mentenanta/success`,
        cancelUrl: `${origin}/mentenanta`,
      });
      if (url) window.location.href = url;
      else setStatus("err");
    } catch {
      setStatus("err");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex gap-2 text-sm text-zinc-400">
        {[1, 2, 3, 4].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStep(s)}
            className={`px-3 py-1 rounded-full border ${
              step === s
                ? "border-cyan-300 text-cyan-300"
                : "border-white/10"
            }`}
          >
            Pas {s}
          </button>
        ))}
      </div>

      {step === 1 && (
        <div className="grid gap-4 md:grid-cols-3">
          {MAINTENANCE_PLANS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setPlanId(p.id);
                setStep(2);
              }}
              className={`text-left border p-5 transition-colors ${
                planId === p.id
                  ? "border-cyan-300/60 bg-cyan-300/5"
                  : "border-white/10 hover:border-white/25"
              }`}
            >
              <p className="font-medium">{p.name}</p>
              <p className="mt-2 text-2xl">
                {p.priceNet.toFixed(2)} €
                <span className="text-sm text-zinc-500"> /lună + TVA</span>
              </p>
              <p className="mt-2 text-sm text-zinc-400">{p.description}</p>
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 max-w-lg">
          <Label>Complexitate site</Label>
          {["simplu", "mediu", "complex"].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setComplexity(c)}
              className={`block w-full text-left border px-4 py-3 capitalize ${
                complexity === c
                  ? "border-cyan-300/60"
                  : "border-white/10"
              }`}
            >
              {c}
            </button>
          ))}
          <Button type="button" onClick={() => setStep(3)}>
            Continuă
          </Button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3 max-w-lg">
          <Label>Add-ons (opțional)</Label>
          {ADDONS.map((a) => (
            <label
              key={a}
              className="flex items-center gap-3 border border-white/10 px-4 py-3 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={addons.includes(a)}
                onChange={() => toggleAddon(a)}
              />
              <span className="text-sm">{a}</span>
            </label>
          ))}
          <Button type="button" onClick={() => setStep(4)}>
            Continuă la date firmă
          </Button>
        </div>
      )}

      {step === 4 && (
        <div className="grid gap-8 lg:grid-cols-2">
          <form onSubmit={payWithStripe} className="space-y-4">
            <p className="text-sm text-zinc-400">
              Plan selectat:{" "}
              <strong className="text-white">{plan.name}</strong> —{" "}
              {price.net.toFixed(2)} € + TVA ({price.gross.toFixed(2)} €)
            </p>
            <div className="space-y-2">
              <Label htmlFor="name">Nume contact</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email facturare</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Denumire firmă</Label>
              <Input id="company" name="company" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cui">CUI</Label>
              <Input id="cui" name="cui" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Adresă</Label>
              <Input id="address" name="address" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input id="phone" name="phone" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Note</Label>
              <Textarea id="message" name="message" rows={3} />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? "Se procesează..." : "Plătește cu Stripe"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={async (ev) => {
                  const form = (ev.target as HTMLElement).closest("form");
                  if (form) {
                    await submitLead({
                      preventDefault: () => undefined,
                      currentTarget: form,
                    } as React.FormEvent<HTMLFormElement>);
                  }
                }}
              >
                Vreau factură / contact
              </Button>
            </div>
            {status === "ok" && (
              <p className="text-sm text-emerald-400">
                Cererea a fost înregistrată. Te contactăm pentru facturare.
              </p>
            )}
            {status === "err" && (
              <p className="text-sm text-red-400">
                Eroare. Verifică datele sau încearcă din nou (Stripe poate lipsi
                din env).
              </p>
            )}
          </form>
          <div className="border border-white/10 p-6 h-fit">
            <h3 className="font-medium">Rezumat</h3>
            <ul className="mt-4 space-y-2 text-sm text-zinc-400">
              <li>Plan: {plan.name}</li>
              <li>Complexitate: {complexity}</li>
              <li>
                Add-ons: {addons.length ? addons.join(", ") : "niciunul"}
              </li>
              <li>Site-uri incluse: {plan.sites}</li>
            </ul>
            <ul className="mt-4 space-y-1 text-sm text-zinc-300">
              {plan.features.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
