"use client";

import { useMemo, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { getAdsClickIdsForLead } from "@/lib/gclid";

type Props = {
  type: "contact" | "service_quote" | "maintenance";
  serviceCategory?: string;
  serviceName?: string;
  serviceOptions?: string[];
  planKey?: string;
  title?: string;
  subtitle?: string;
};

export function QuoteForm({
  type,
  serviceCategory,
  serviceName,
  serviceOptions,
  planKey,
  title = "Spune-ne ce ai nevoie",
  subtitle = "Complează formularul — îți răspundem pe email, de obicei în aceeași zi.",
}: Props) {
  const createLead = useMutation(api.leads.create);
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [loading, setLoading] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>(
    serviceName ? [serviceName] : [],
  );

  const options = useMemo(() => serviceOptions ?? [], [serviceOptions]);

  function toggleService(s: string) {
    setSelectedServices((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    const fd = new FormData(e.currentTarget);
    const picked =
      selectedServices.length > 0
        ? selectedServices.join(", ")
        : String(fd.get("serviceName") || "") || undefined;

    try {
      const adsIds = getAdsClickIdsForLead();
      await createLead({
        type,
        name: String(fd.get("name") || ""),
        email: String(fd.get("email") || ""),
        phone: String(fd.get("phone") || "") || undefined,
        company: String(fd.get("company") || "") || undefined,
        message: String(fd.get("message") || "") || undefined,
        serviceCategory,
        serviceName: picked,
        planKey,
        complexity: String(fd.get("complexity") || "") || undefined,
        ...adsIds,
      });
      setStatus("ok");
      setSelectedServices([]);
      e.currentTarget.reset();
    } catch {
      setStatus("err");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/70 p-6 md:p-7 space-y-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--brand)]/50 to-transparent" />
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-white">
          {title}
        </h2>
        <p className="mt-1.5 text-sm text-zinc-400">{subtitle}</p>
      </div>

      {options.length > 0 && (
        <div className="space-y-2">
          <Label>Ce te interesează? (poți bifa mai multe)</Label>
          <div className="max-h-48 overflow-y-auto space-y-1.5 rounded-xl border border-white/10 p-2">
            {options.map((s) => {
              const active = selectedServices.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleService(s)}
                  className={cn(
                    "w-full text-left rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-[color:var(--brand)]/15 text-[color:var(--brand-soft)] ring-1 ring-[color:var(--brand)]/40"
                      : "text-zinc-300 hover:bg-white/5",
                  )}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nume *</Label>
          <Input id="name" name="name" required placeholder="Numele tău" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="email@firma.ro"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefon</Label>
          <Input id="phone" name="phone" placeholder="07xx xxx xxx" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">Firmă</Label>
          <Input id="company" name="company" placeholder="Denumire firmă" />
        </div>
      </div>

      {type === "service_quote" && options.length === 0 && (
        <div className="space-y-2">
          <Label htmlFor="serviceName">Serviciu de interes</Label>
          <Input
            id="serviceName"
            name="serviceName"
            defaultValue={serviceName}
            placeholder="Ex: Checkout custom"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="message">Descrie pe scurt ce ai nevoie *</Label>
        <Textarea
          id="message"
          name="message"
          rows={4}
          required
          placeholder="Obiective, deadline, buget aproximativ, link site existent..."
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-[color:var(--brand)] text-zinc-950 hover:bg-[color:var(--brand-soft)]"
      >
        {loading ? "Se trimite..." : "Trimite cererea pe email"}
      </Button>

      {status === "ok" && (
        <p className="text-sm text-emerald-400">
          Mulțumim! Cererea a fost trimisă pe email către echipa ZeroBug.
        </p>
      )}
      {status === "err" && (
        <p className="text-sm text-red-400">
          Eroare la trimitere. Încearcă din nou sau scrie-ne la
          contact@zerobug.ro.
        </p>
      )}
    </form>
  );
}
