"use client";

import { useMemo, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Globe2,
  Building2,
  Server,
  Wrench,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  ACCESS_OPTIONS,
  BUSINESS_TYPES,
  buildQuoteSummary,
  createEmptyAnswers,
  estimateMaintenance,
  formatEstimateRange,
  HOSTING_OPTIONS,
  MAINTENANCE_NEEDS,
  PLATFORMS,
  TRAFFIC_LEVELS,
  type MaintenanceQuoteAnswers,
  type NeedId,
} from "@/lib/maintenance-estimate";

const STEPS = [
  { id: 1, label: "Site", icon: Globe2 },
  { id: 2, label: "Business", icon: Building2 },
  { id: 3, label: "Infrastructură", icon: Server },
  { id: 4, label: "Nevoi", icon: Wrench },
  { id: 5, label: "Contact", icon: Send },
] as const;

function OptionCard({
  selected,
  onClick,
  children,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-2xl border px-4 py-3 text-left text-sm transition-colors",
        selected
          ? "border-[color:var(--brand)]/60 bg-[color:var(--brand)]/10 text-white"
          : "border-white/10 bg-white/[0.02] text-zinc-300 hover:border-white/25 hover:bg-white/[0.04]",
        className,
      )}
    >
      {children}
    </button>
  );
}

function EstimatePanel({
  answers,
  className,
}: {
  answers: MaintenanceQuoteAnswers;
  className?: string;
}) {
  const estimate = useMemo(() => estimateMaintenance(answers), [answers]);
  const range = formatEstimateRange(estimate);

  return (
    <aside
      className={cn(
        "rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-6",
        className,
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        Estimare live
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
        {range.netLabel}
        <span className="ml-2 text-base font-normal text-zinc-500">
          /lună + TVA
        </span>
      </p>
      <p className="mt-1 text-sm text-zinc-400">
        ≈ {range.grossLabel} cu TVA
      </p>

      <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[color:var(--brand)]/30 bg-[color:var(--brand)]/10 px-3 py-1 text-xs font-medium text-[color:var(--brand-soft)]">
        Plan sugerat: {estimate.suggestedPlan.name}
      </div>

      <ul className="mt-6 space-y-2 text-sm text-zinc-400">
        {estimate.features.slice(0, 4).map((f) => (
          <li key={f} className="flex gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--brand)]" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {estimate.reasons.length > 0 && (
        <div className="mt-6 border-t border-white/10 pt-4">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            De ce acest interval
          </p>
          <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-zinc-500">
            {estimate.reasons.map((r) => (
              <li key={r}>• {r}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-6 text-xs leading-relaxed text-zinc-600">
        Estimare orientativă. Oferta finală vine după review tehnic — fără
        obligație de abonament.
      </p>
    </aside>
  );
}

export function MaintenanceConfigurator() {
  const createLead = useMutation(api.leads.create);
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<MaintenanceQuoteAnswers>(
    createEmptyAnswers,
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [loading, setLoading] = useState(false);

  const estimate = useMemo(() => estimateMaintenance(answers), [answers]);
  const range = formatEstimateRange(estimate);

  function patch(partial: Partial<MaintenanceQuoteAnswers>) {
    setAnswers((prev) => ({ ...prev, ...partial }));
  }

  function toggleNeed(id: NeedId) {
    setAnswers((prev) => ({
      ...prev,
      needs: prev.needs.includes(id)
        ? prev.needs.filter((n) => n !== id)
        : [...prev.needs, id],
    }));
  }

  function canContinue() {
    if (step === 1) {
      return Boolean(answers.platform && answers.traffic && answers.siteCount >= 1);
    }
    if (step === 2) {
      return Boolean(answers.businessType);
    }
    if (step === 3) {
      return Boolean(answers.hosting && answers.access);
    }
    if (step === 4) {
      return answers.needs.length > 0;
    }
    return true;
  }

  async function submitOffer(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    try {
      const summary = buildQuoteSummary(answers, estimate, notes);
      await createLead({
        type: "maintenance",
        name,
        email,
        phone: phone || undefined,
        company: company || undefined,
        message: summary,
        planKey: estimate.suggestedPlanId,
        complexity: estimate.complexity,
        addons: answers.needs.map(
          (id) => MAINTENANCE_NEEDS.find((n) => n.id === id)?.label ?? id,
        ),
        budget: estimate.maxNet,
        quoteDetails: JSON.stringify({
          answers,
          estimate: {
            minNet: estimate.minNet,
            maxNet: estimate.maxNet,
            suggestedPlanId: estimate.suggestedPlanId,
            complexity: estimate.complexity,
            reasons: estimate.reasons,
          },
        }),
      });
      setStatus("ok");
    } catch {
      setStatus("err");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <div className="mb-8 flex flex-wrap gap-2">
        {STEPS.map((s) => {
          const Icon = s.icon;
          const active = step === s.id;
          const done = step > s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                if (s.id < step || (s.id === step + 1 && canContinue())) {
                  setStep(s.id);
                } else if (s.id <= step) {
                  setStep(s.id);
                }
              }}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "border-[color:var(--brand)]/50 bg-[color:var(--brand)]/10 text-[color:var(--brand-soft)]"
                  : done
                    ? "border-white/15 text-white"
                    : "border-white/10 text-zinc-500",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {s.id}. {s.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-white">
                  Despre site-ul tău
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  URL, platformă, câte site-uri și ce trafic ai aproximativ.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteUrl">URL site (opțional)</Label>
                <Input
                  id="siteUrl"
                  placeholder="https://exemplu.ro"
                  value={answers.siteUrl}
                  onChange={(e) => patch({ siteUrl: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Platformă</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {PLATFORMS.map((p) => (
                    <OptionCard
                      key={p.id}
                      selected={answers.platform === p.id}
                      onClick={() => patch({ platform: p.id })}
                    >
                      {p.label}
                    </OptionCard>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteCount">Număr site-uri</Label>
                <Input
                  id="siteCount"
                  type="number"
                  min={1}
                  max={10}
                  value={answers.siteCount}
                  onChange={(e) =>
                    patch({
                      siteCount: Math.max(
                        1,
                        Math.min(10, Number(e.target.value) || 1),
                      ),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Trafic aproximativ</Label>
                <div className="grid gap-2">
                  {TRAFFIC_LEVELS.map((t) => (
                    <OptionCard
                      key={t.id}
                      selected={answers.traffic === t.id}
                      onClick={() => patch({ traffic: t.id })}
                    >
                      {t.label}
                    </OptionCard>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-white">
                  Cu ce te ocupi
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Tipul de business influențează nivelul de mentenanță.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Tip site / produs</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {BUSINESS_TYPES.map((b) => (
                    <OptionCard
                      key={b.id}
                      selected={answers.businessType === b.id}
                      onClick={() => patch({ businessType: b.id })}
                    >
                      {b.label}
                    </OptionCard>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Domeniu de activitate</Label>
                <Input
                  id="industry"
                  placeholder="ex. retail, clinici, SaaS B2B…"
                  value={answers.industry}
                  onChange={(e) => patch({ industry: e.target.value })}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-white">
                  Infrastructură
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Hosting, acces și ce ai deja setat pe partea de backup / SSL.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Hosting</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {HOSTING_OPTIONS.map((h) => (
                    <OptionCard
                      key={h.id}
                      selected={answers.hosting === h.id}
                      onClick={() => patch({ hosting: h.id })}
                    >
                      {h.label}
                    </OptionCard>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cine are acces acum</Label>
                <div className="grid gap-2">
                  {ACCESS_OPTIONS.map((a) => (
                    <OptionCard
                      key={a.id}
                      selected={answers.access === a.id}
                      onClick={() => patch({ access: a.id })}
                    >
                      {a.label}
                    </OptionCard>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Ai backup-uri clare?</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <OptionCard
                      selected={answers.hasBackup === true}
                      onClick={() => patch({ hasBackup: true })}
                    >
                      Da
                    </OptionCard>
                    <OptionCard
                      selected={answers.hasBackup === false}
                      onClick={() => patch({ hasBackup: false })}
                    >
                      Nu / nu știu
                    </OptionCard>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>SSL + CDN activ?</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <OptionCard
                      selected={answers.hasSslCdn === true}
                      onClick={() => patch({ hasSslCdn: true })}
                    >
                      Da
                    </OptionCard>
                    <OptionCard
                      selected={answers.hasSslCdn === false}
                      onClick={() => patch({ hasSslCdn: false })}
                    >
                      Nu / nu știu
                    </OptionCard>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-white">
                  Ce vrei de la mentenanță
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Selectează tot ce e relevant — estimarea se actualizează live.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {MAINTENANCE_NEEDS.map((n) => {
                  const selected = answers.needs.includes(n.id);
                  return (
                    <OptionCard
                      key={n.id}
                      selected={selected}
                      onClick={() => toggleNeed(n.id)}
                      className="flex items-center gap-3"
                    >
                      <span
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded-md border",
                          selected
                            ? "border-[color:var(--brand)] bg-[color:var(--brand)] text-zinc-950"
                            : "border-white/20",
                        )}
                      >
                        {selected && <Check className="h-3.5 w-3.5" />}
                      </span>
                      {n.label}
                    </OptionCard>
                  );
                })}
              </div>
            </div>
          )}

          {step === 5 && (
            <form onSubmit={submitOffer} className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-white">
                  Trimite oferta
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Îți trimitem o ofertă personalizată pe baza răspunsurilor —
                  estimare actuală{" "}
                  <span className="text-white">{range.netLabel} + TVA</span>{" "}
                  /lună.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nume</Label>
                  <Input
                    id="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Firmă</Label>
                  <Input
                    id="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Note / context</Label>
                <Textarea
                  id="notes"
                  rows={4}
                  placeholder="Deadline, probleme curente, preferințe…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {status === "ok" ? (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-300">
                  Cererea a fost trimisă. Revenim cu oferta pe email — de obicei
                  în 1–2 zile lucrătoare.
                </div>
              ) : (
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-11 w-full sm:w-auto"
                >
                  {loading ? "Se trimite…" : "Trimite oferta"}
                  <Send className="ml-2 h-4 w-4" />
                </Button>
              )}
              {status === "err" && (
                <p className="text-sm text-red-400">
                  Nu am putut trimite cererea. Încearcă din nou sau scrie-ne la
                  contact@zerobug.ro.
                </p>
              )}
            </form>
          )}

          {step < 5 && (
            <div className="mt-8 flex items-center justify-between gap-3 border-t border-white/10 pt-6">
              <Button
                type="button"
                variant="outline"
                disabled={step === 1}
                onClick={() => setStep((s) => Math.max(1, s - 1))}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Înapoi
              </Button>
              <Button
                type="button"
                disabled={!canContinue()}
                onClick={() => setStep((s) => Math.min(5, s + 1))}
              >
                Continuă
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 5 && status !== "ok" && (
            <div className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(4)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Înapoi
              </Button>
            </div>
          )}
        </div>

        <EstimatePanel
          answers={answers}
          className="hidden lg:sticky lg:top-24 lg:block lg:self-start"
        />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-zinc-950/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">
              Estimare
            </p>
            <p className="text-lg font-semibold text-white">
              {range.netLabel}
              <span className="ml-1 text-xs font-normal text-zinc-500">
                + TVA /lună
              </span>
            </p>
          </div>
          <p className="text-right text-xs text-zinc-500">
            {estimate.suggestedPlan.name}
          </p>
        </div>
      </div>
    </div>
  );
}
