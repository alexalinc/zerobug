import Link from "next/link";
import { PortfolioGrid } from "@/components/portfolio-grid";
import { PORTFOLIO_ITEMS, PORTFOLIO_MORE } from "@/lib/portfolio";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import {
  JsonLd,
  breadcrumbSchema,
  webPageSchema,
} from "@/components/json-ld";
import { PAGE_SEO, pageMetadata } from "@/lib/page-seo";

export const metadata = pageMetadata(PAGE_SEO.portofoliu);

export default function PortofoliuPage() {
  return (
    <main className="bg-zinc-950 text-white">
      <JsonLd
        data={[
          webPageSchema({
            path: PAGE_SEO.portofoliu.path,
            name: `${PAGE_SEO.portofoliu.title} · ZeroBug`,
            description: PAGE_SEO.portofoliu.description,
            type: "CollectionPage",
          }),
          breadcrumbSchema([
            { name: "Acasă", path: "/" },
            { name: "Portofoliu", path: "/portofoliu" },
          ]),
        ]}
      />
      <div className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(34,197,94,0.14),_transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-10 md:py-14">
          <p className="text-sm font-medium tracking-wide text-[color:var(--brand)]">
            Portofoliu ZeroBug
          </p>
          <TextGenerateEffect
            as="h1"
            words="Ce am construit — site-uri, SaaS și aplicații"
            className="mt-2 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl"
            duration={0.4}
          />
          <TextGenerateEffect
            words={`${PORTFOLIO_ITEMS.length} proiecte publice selectate, plus automatizări, API-uri și soft-uri de gestiune livrate pentru magazine și echipe de produs. Apasă pe un card ca să deschizi proiectul live.`}
            className="mt-3 max-w-2xl text-base leading-relaxed text-zinc-400 md:text-lg"
            duration={0.3}
          />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10 md:py-12">
        <PortfolioGrid />

        <section className="mt-14 rounded-3xl border border-white/10 bg-zinc-900/50 p-6 md:p-8">
          <TextGenerateEffect
            as="h2"
            words="Și multe altele"
            className="text-xl font-semibold tracking-tight md:text-2xl"
            duration={0.35}
          />
          <TextGenerateEffect
            words="Pe lângă proiectele de mai sus, livrăm constant lucrări custom — adesea fără landing public — pentru operațiuni e-commerce și automatizări interne."
            className="mt-2 max-w-2xl text-sm text-zinc-400"
            duration={0.3}
          />
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {PORTFOLIO_MORE.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-white/10 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-300"
              >
                {item}
              </li>
            ))}
          </ul>
          <Link
            href="/contact"
            className="mt-8 inline-flex rounded-full bg-[color:var(--brand)] px-5 py-2.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-[color:var(--brand-soft)]"
          >
            Discută un proiect similar
          </Link>
        </section>
      </div>
    </main>
  );
}
