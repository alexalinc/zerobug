import Link from "next/link";
import { SERVICE_CATEGORIES, MAINTENANCE_PLANS, withVat } from "@/lib/services";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-zinc-950 text-zinc-400">
      <div className="mx-auto max-w-6xl px-6 py-14 grid gap-10 md:grid-cols-3">
        <div>
          <p className="text-white text-lg font-semibold tracking-tight">ZeroBug</p>
          <p className="mt-3 text-sm leading-relaxed">
            Servicii IT complete: web, e-commerce, API, mobile, AI și tracking
            Google Ads — plus mentenanță lunară cu facturare automată.
          </p>
        </div>
        <div>
          <p className="text-white text-sm font-medium mb-3">Navigare</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/servicii" className="hover:text-white">
                Servicii
              </Link>
            </li>
            <li>
              <Link href="/mentenanta" className="hover:text-white">
                Mentenanță
              </Link>
            </li>
            <li>
              <Link href="/despre" className="hover:text-white">
                Despre
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white">
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-white text-sm font-medium mb-3">Contact</p>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="mailto:contact@zerobug.ro" className="hover:text-white">
                contact@zerobug.ro
              </a>
            </li>
            <li>
              <a href="tel:0773319554" className="hover:text-white">
                0773 319 554
              </a>
            </li>
            <li>SC AXP GLOBAL RETAIL SRL</li>
            <li>CUI RO48715417</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5 px-6 py-4 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} ZeroBug ·{" "}
        <Link href="/politica-confidentialitate" className="hover:text-white">
          Confidențialitate
        </Link>{" "}
        ·{" "}
        <Link href="/termeni" className="hover:text-white">
          Termeni
        </Link>
      </div>
    </footer>
  );
}

export function CategoryGrid() {
  return (
    <section className="bg-zinc-950 text-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-cyan-300 text-sm font-medium tracking-wide">Servicii</p>
        <h2 className="mt-3 text-3xl md:text-5xl font-[family-name:var(--font-serif)] tracking-tight max-w-2xl">
          Tot ce ai nevoie pentru digital — într-un singur partener.
        </h2>
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICE_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/servicii/${cat.slug}`}
              className="group block border-t border-white/15 pt-5 hover:border-cyan-300/60 transition-colors"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-xl font-medium group-hover:text-cyan-200 transition-colors">
                  {cat.title}
                </h3>
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: cat.accent }}
                />
              </div>
              <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
                {cat.description}
              </p>
              <p className="mt-4 text-sm text-cyan-300/80">
                {cat.services.length} servicii →
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AiFocusSection() {
  return (
    <section className="relative overflow-hidden bg-zinc-900 text-white py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(34,211,238,0.12),_transparent_55%)]" />
      <div className="relative mx-auto max-w-6xl px-6 grid gap-10 lg:grid-cols-2 items-center">
        <div>
          <p className="text-cyan-300 text-sm font-medium">AI & automatizări · 2026</p>
          <h2 className="mt-3 text-3xl md:text-5xl font-[family-name:var(--font-serif)] tracking-tight">
            Chatbot-uri, agenți și fluxuri care reduc munca repetitivă.
          </h2>
          <p className="mt-5 text-zinc-400 leading-relaxed">
            Implementăm AI conectat la baza ta de date, automatizări CRM/ofertare
            și procesare documente — nu demo-uri, ci sisteme integrate în operațiuni.
          </p>
          <Link
            href="/servicii/ai-automatizari"
            className="mt-8 inline-flex rounded-full bg-cyan-300 text-zinc-950 px-5 py-3 text-sm font-medium hover:bg-cyan-200 transition-colors"
          >
            Explorează AI ZeroBug
          </Link>
        </div>
        <ul className="space-y-4 text-sm text-zinc-300">
          {[
            "Chatbot AI pe website, legat de catalog / FAQ / CRM",
            "AI pentru customer support și procesare comenzi",
            "Automatizare lead-uri, ofertare și raportare",
            "Integrare OpenAI / LLM în aplicații existente",
          ].map((item) => (
            <li
              key={item}
              className="border-l-2 border-cyan-400/50 pl-4 py-1 reveal-on-scroll"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function MaintenanceTeaser() {
  return (
    <section className="bg-zinc-950 text-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-cyan-300 text-sm font-medium">Mentenanță</p>
        <h2 className="mt-3 text-3xl md:text-5xl font-[family-name:var(--font-serif)] tracking-tight max-w-xl">
          De la 19,99 € / lună + TVA
        </h2>
        <p className="mt-4 text-zinc-400 max-w-xl">
          Update-uri, backup, securitate și support — factură PDF generată lunar
          și trimisă pe email.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {MAINTENANCE_PLANS.map((plan) => {
            const price = withVat(plan.priceNet);
            return (
              <div
                key={plan.id}
                className={`border border-white/10 p-6 ${
                  plan.highlighted ? "ring-1 ring-cyan-300/40" : ""
                }`}
              >
                <h3 className="text-lg font-medium">{plan.name}</h3>
                <p className="mt-2 text-3xl tracking-tight">
                  {price.net.toFixed(2)} €
                  <span className="text-sm text-zinc-500 font-normal">
                    {" "}
                    /lună + TVA
                  </span>
                </p>
                <p className="mt-3 text-sm text-zinc-400">{plan.description}</p>
              </div>
            );
          })}
        </div>
        <Link
          href="/mentenanta"
          className="mt-10 inline-flex rounded-full border border-white/20 px-5 py-3 text-sm hover:bg-white/5 transition-colors"
        >
          Configurează pachetul
        </Link>
      </div>
    </section>
  );
}

export function CtaBand() {
  return (
    <section className="bg-cyan-300 text-zinc-950 py-16">
      <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-[family-name:var(--font-serif)]">
            Ai un proiect pe masă?
          </h2>
          <p className="mt-2 text-zinc-800/80">
            Spune-ne ce construiești — revenim cu o ofertă clară.
          </p>
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
