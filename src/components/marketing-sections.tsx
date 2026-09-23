import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { FooterTapedDesign } from "@/components/ui/footer-taped-design";

export { CategoryGrid } from "@/components/category-grid";

export function SiteFooter() {
  return <FooterTapedDesign />;
}

const MAINTENANCE_HIGHLIGHTS = [
  "Update-uri și patch-uri de securitate",
  "Backup și monitorizare uptime",
  "Support pe email, cu SLA pe plan",
  "Factură PDF generată lunar pe email",
];

export function MaintenanceTeaser() {
  return (
    <section className="relative overflow-hidden bg-zinc-950 text-white py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(34,197,94,0.1),_transparent_55%)]" />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <p className="text-sm font-medium tracking-wide text-[color:var(--brand)]">
              Mentenanță
            </p>
            <TextGenerateEffect
              as="h2"
              words="Site-ul tău, îngrijit lunar — de la 19,99 € + TVA"
              className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight md:text-5xl"
              duration={0.35}
            />
            <TextGenerateEffect
              words="Răspunzi la câteva întrebări despre platformă, trafic și nevoi — vezi live un interval de preț și ne trimiți cererea. Fără obligație."
              className="mt-4 max-w-xl text-zinc-400 leading-relaxed"
              duration={0.3}
            />

            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {MAINTENANCE_HIGHLIGHTS.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm text-zinc-300"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[color:var(--brand)]/15 text-[color:var(--brand)]">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/mentenanta"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--brand)] px-5 py-3 text-sm font-medium text-zinc-950 transition-colors hover:bg-[color:var(--brand-soft)]"
              >
                Estimează mentenanța
                <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="text-sm text-zinc-500">
                ~2 minute · ofertă personalizată
              </p>
            </div>
          </div>

          <div className="relative border border-white/10 bg-white/[0.03] p-6 md:p-8">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Interval tipic
            </p>
            <p className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
              19,99–99,99 €
              <span className="mt-1 block text-base font-normal text-zinc-500">
                /lună + TVA
              </span>
            </p>
            <div className="mt-6 space-y-3 border-t border-white/10 pt-6 text-sm text-zinc-400">
              <p>
                <span className="text-white">Starter</span> — site simplu
              </p>
              <p>
                <span className="text-white">Pro</span> — magazin / site activ
              </p>
              <p>
                <span className="text-white">Business</span> — trafic &amp; SLA
              </p>
            </div>
            <p className="mt-6 text-xs leading-relaxed text-zinc-500">
              Prețul final depinde de platformă, trafic și nevoi — îl estimăm
              împreună în wizard.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CtaBand() {
  return (
    <section className="bg-[color:var(--brand)] text-zinc-950 py-16">
      <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <TextGenerateEffect
            as="h2"
            words="Ai un proiect pe masă?"
            className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-950"
            duration={0.35}
          />
          <TextGenerateEffect
            words="Spune-ne ce construiești — revenim cu o ofertă clară."
            className="mt-2 text-zinc-800/80"
            filter={false}
            duration={0.35}
          />
        </div>
        <Link
          href="/contact"
          className="inline-flex self-start rounded-full bg-zinc-950 text-white px-5 py-3 text-sm font-medium hover:bg-zinc-800 transition-colors"
        >
          Contactează ZeroBug
        </Link>
      </div>
    </section>
  );
}
