"use client";

import { useMemo, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getServiceVisual } from "@/lib/service-icons";
import { cn } from "@/lib/utils";

const BUDGET_MIN = 500;
const BUDGET_MAX = 25000;
const BUDGET_STEP = 500;

type Props = {
  categorySlug: string;
  categoryTitle: string;
  accent: string;
  services: string[];
};

function formatBudget(value: number) {
  if (value >= BUDGET_MAX) return `${BUDGET_MAX.toLocaleString("ro-RO")}+ €`;
  return `${value.toLocaleString("ro-RO")} €`;
}

function ServiceVisualMark({
  service,
  categorySlug,
  active,
}: {
  service: string;
  categorySlug: string;
  active: boolean;
}) {
  const visual = getServiceVisual(service, categorySlug);

  if (visual.kind === "logo") {
    return (
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-white p-1.5 transition-colors",
          active ? "border-[color:var(--brand)]/50" : "border-white/10",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={visual.src}
          alt={visual.alt}
          className="h-full w-full object-contain"
        />
      </span>
    );
  }

  const { Icon } = visual;
  return (
    <span
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors",
        active
          ? "border-[color:var(--brand)]/50 bg-[color:var(--brand)]/15 text-[color:var(--brand)]"
          : "border-white/10 bg-white/[0.03] text-zinc-300",
      )}
    >
      <Icon className="h-5 w-5" strokeWidth={1.75} />
    </span>
  );
}

export function ServiceQuoteConfigurator({
  categorySlug,
  categoryTitle,
  accent,
  services,
}: Props) {
  const createLead = useMutation(api.leads.create);
  const [selected, setSelected] = useState<string[]>([]);
  const [budget, setBudget] = useState(3000);
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [loading, setLoading] = useState(false);

  const progress = useMemo(
    () => ((budget - BUDGET_MIN) / (BUDGET_MAX - BUDGET_MIN)) * 100,
    [budget],
  );

  function toggle(service: string) {
    setSelected((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service],
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (selected.length === 0) {
      setStatus("err");
      return;
    }

    setLoading(true);
    setStatus("idle");
    const fd = new FormData(e.currentTarget);

    try {
      await createLead({
        type: "service_quote",
        name: String(fd.get("name") || ""),
        email: String(fd.get("email") || ""),
        phone: String(fd.get("phone") || "") || undefined,
        company: String(fd.get("company") || "") || undefined,
        message: String(fd.get("message") || "") || undefined,
        serviceCategory: categorySlug,
        serviceName: selected.join(", "),
        budget,
      });
      setStatus("ok");
      setSelected([]);
      setBudget(3000);
      e.currentTarget.reset();
    } catch {
      setStatus("err");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-10 md:space-y-12">
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-medium" style={{ color: accent }}>
              Pasul 1
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight md:text-2xl">
              Alege serviciile din {categoryTitle}
            </h2>
            <p className="mt-1.5 text-sm text-zinc-400">
              Bifează tot ce te interesează — poți selecta mai multe.
            </p>
          </div>
          <p className="text-sm text-zinc-500">
            {selected.length} selectate
          </p>
        </div>

        <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
          {services.map((service) => {
            const active = selected.includes(service);
            return (
              <button
                key={service}
                type="button"
                onClick={() => toggle(service)}
                className={cn(
                  "group flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-left text-sm transition-all",
                  active
                    ? "border-[color:var(--brand)]/50 bg-[color:var(--brand)]/10 text-white"
                    : "border-white/10 bg-zinc-900/50 text-zinc-300 hover:border-white/20 hover:bg-zinc-900",
                )}
              >
                <ServiceVisualMark
                  service={service}
                  categorySlug={categorySlug}
                  active={active}
                />
                <span className="min-w-0 flex-1 leading-snug">{service}</span>
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                    active
                      ? "border-[color:var(--brand)] bg-[color:var(--brand)] text-zinc-950"
                      : "border-white/20 bg-transparent",
                  )}
                >
                  {active && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-zinc-900/50 p-5 md:p-7">
        <p className="text-sm font-medium" style={{ color: accent }}>
          Pasul 2
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight md:text-2xl">
          Care e bugetul aproximativ?
        </h2>
        <p className="mt-1.5 text-sm text-zinc-400">
          Mută slider-ul — ne ajută să propunem o soluție realistă.
        </p>

        <div className="mt-8">
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-3xl font-semibold tracking-tight tabular-nums md:text-4xl">
              {formatBudget(budget)}
            </p>
            <p className="text-sm text-zinc-500">buget estimat</p>
          </div>

          <div className="relative mt-6">
            <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-white/10" />
            <div
              className="absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-[color:var(--brand)]"
              style={{ width: `${progress}%` }}
            />
            <input
              type="range"
              min={BUDGET_MIN}
              max={BUDGET_MAX}
              step={BUDGET_STEP}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="relative z-10 h-2 w-full cursor-pointer appearance-none bg-transparent accent-[color:var(--brand)] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[color:var(--brand)] [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_rgba(34,197,94,0.25)] [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[color:var(--brand)]"
              aria-label="Buget estimat"
            />
          </div>

          <div className="mt-2 flex justify-between text-xs text-zinc-500">
            <span>{BUDGET_MIN.toLocaleString("ro-RO")} €</span>
            <span>{BUDGET_MAX.toLocaleString("ro-RO")}+ €</span>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 md:p-7">
        <p className="text-sm font-medium" style={{ color: accent }}>
          Pasul 3
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight md:text-2xl">
          Trimite cererea
        </h2>
        <p className="mt-1.5 text-sm text-zinc-400">
          Apară direct în panoul ZeroBug — revenim noi cu o ofertă.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="sq-name">Nume *</Label>
            <Input id="sq-name" name="name" required placeholder="Numele tău" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sq-email">Email *</Label>
            <Input
              id="sq-email"
              name="email"
              type="email"
              required
              placeholder="email@firma.ro"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sq-phone">Telefon</Label>
            <Input id="sq-phone" name="phone" placeholder="07xx xxx xxx" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sq-company">Firmă</Label>
            <Input
              id="sq-company"
              name="company"
              placeholder="Denumire firmă"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="sq-message">Detalii suplimentare</Label>
            <Textarea
              id="sq-message"
              name="message"
              rows={3}
              placeholder="Deadline, site existent, context proiect..."
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-500">
            {selected.length > 0
              ? `${selected.length} servicii · buget ${formatBudget(budget)}`
              : "Selectează cel puțin un serviciu"}
          </p>
          <Button
            type="submit"
            disabled={loading || selected.length === 0}
            className="rounded-full bg-[color:var(--brand)] px-6 text-zinc-950 hover:bg-[color:var(--brand-soft)] disabled:opacity-50"
          >
            {loading ? "Se trimite..." : "Trimite cererea de ofertă"}
          </Button>
        </div>

        {status === "ok" && (
          <p className="mt-4 text-sm text-emerald-400">
            Cererea a fost înregistrată. Te contactăm în curând cu o ofertă.
          </p>
        )}
        {status === "err" && (
          <p className="mt-4 text-sm text-red-400">
            {selected.length === 0
              ? "Selectează cel puțin un serviciu înainte de trimitere."
              : "Nu am putut salva cererea. Încearcă din nou."}
          </p>
        )}
      </section>
    </form>
  );
}
