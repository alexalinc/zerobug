import Link from "next/link";
import Image from "next/image";
import { CITIES, cityHubPath, cityServicePath } from "@/lib/cities";
import type { IntentPage } from "@/lib/intent-pages";
import { getLocalKeyword } from "@/lib/local-pages";
import { getCategoryBySlug } from "@/lib/services";
import { ServiceQuoteConfigurator } from "@/components/service-quote-configurator";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import {
  JsonLd,
  breadcrumbSchema,
  faqPageSchemaForPath,
  serviceSchema,
  webPageSchemaWithImage,
} from "@/components/json-ld";

type Props = { page: IntentPage };

export function IntentLandingTemplate({ page }: Props) {
  const category = getCategoryBySlug(page.categorySlug);
  const path = `/servicii/${page.slug}`;
  const image = page.image ?? "/images/logozerobug.png";
  const accent = category?.accent ?? "#22c55e";
  const topCities = CITIES.slice(0, 8);
  const localKw = getLocalKeyword(page.slug);

  return (
    <main className="bg-zinc-950 text-white">
      <JsonLd
        data={[
          webPageSchemaWithImage({
            path,
            name: page.seoTitle,
            description: page.seoDescription,
            image,
          }),
          serviceSchema({
            name: page.name,
            description: page.seoDescription,
            path,
            serviceType: category?.title ?? page.name,
            image,
          }),
          breadcrumbSchema([
            { name: "Acasă", path: "/" },
            { name: "Servicii", path: "/servicii" },
            { name: page.name, path },
          ]),
          faqPageSchemaForPath(path, page.faqs),
        ]}
      />

      <section className="relative overflow-hidden border-b border-white/10">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(ellipse at top right, ${accent}33, transparent 55%)`,
          }}
        />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-10 md:grid-cols-[1.2fr_0.8fr] md:py-14">
          <div>
            <Link
              href="/servicii"
              className="text-sm text-zinc-400 transition-colors hover:text-white"
            >
              ← Servicii
            </Link>
            <TextGenerateEffect
              as="h1"
              words={page.h1}
              className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl"
              duration={0.4}
            />
            <p className="mt-4 max-w-2xl text-base text-zinc-400 md:text-lg">
              {page.intro}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#oferta"
                className="inline-flex rounded-xl bg-[color:var(--brand)] px-5 py-2.5 text-sm font-medium text-zinc-950 hover:bg-[color:var(--brand-soft)]"
              >
                Cere ofertă
              </a>
              <Link
                href="/portofoliu"
                className="inline-flex rounded-xl border border-white/15 px-5 py-2.5 text-sm text-zinc-200 hover:border-white/30"
              >
                Vezi portofoliu
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
            <Image
              src={image}
              alt={page.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 40vw"
              priority
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-16 px-6 py-12 md:py-16">
        <section>
          <h2 className="text-xl font-semibold md:text-2xl">Beneficii</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {page.benefits.map((b) => (
              <li
                key={b}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-300"
              >
                {b}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold md:text-2xl">Ce include</h2>
          <ul className="mt-6 space-y-2">
            {page.includes.map((item) => (
              <li key={item} className="flex gap-3 text-sm text-zinc-300">
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: accent }}
                />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold md:text-2xl">Cum lucrăm</h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {page.process.map((step, i) => (
              <li
                key={step.title}
                className="rounded-2xl border border-white/10 bg-zinc-900/40 p-4"
              >
                <p className="text-xs font-medium uppercase" style={{ color: accent }}>
                  Pasul {i + 1}
                </p>
                <p className="mt-2 font-medium">{step.title}</p>
                <p className="mt-1.5 text-sm text-zinc-400">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold md:text-2xl">Alege direcția</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {page.ctaLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-2xl border border-white/10 bg-zinc-900/40 px-4 py-3 text-sm text-zinc-300 transition-colors hover:border-[color:var(--brand)]/40 hover:text-white"
              >
                {l.label} →
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold md:text-2xl">
            Servicii pe oraș
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Cauți același serviciu local? Vezi paginile pe oraș.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {topCities.map((c) => (
              <Link
                key={c.slug}
                href={
                  localKw
                    ? cityServicePath(c.slug, localKw.slug)
                    : cityHubPath(c.slug)
                }
                className="rounded-full border border-white/10 px-3.5 py-1.5 text-sm text-zinc-300 hover:border-[color:var(--brand)]/40 hover:text-white"
              >
                {c.name}
              </Link>
            ))}
            <Link
              href="/servicii/oras"
              className="rounded-full border border-white/10 px-3.5 py-1.5 text-sm text-[color:var(--brand)]"
            >
              Toate orașele →
            </Link>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold md:text-2xl">FAQ</h2>
          <div className="mt-6 space-y-3">
            {page.faqs.map((faq) => (
              <details
                key={faq.question}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <summary className="cursor-pointer text-sm font-medium">
                  {faq.question}
                </summary>
                <p className="mt-2 text-sm text-zinc-400">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {page.showMaintenanceCta ? (
          <section className="rounded-2xl border border-white/10 bg-[color:var(--brand)]/5 p-5">
            <h2 className="text-lg font-semibold">Ai deja site? Mentenanță</h2>
            <Link
              href="/mentenanta"
              className="mt-4 inline-flex rounded-xl border border-[color:var(--brand)]/40 px-4 py-2 text-sm text-[color:var(--brand)]"
            >
              Estimare mentenanță
            </Link>
          </section>
        ) : null}

        {category ? (
          <section id="oferta" className="scroll-mt-24">
            <h2 className="mb-6 text-2xl font-semibold">
              Cere ofertă — {page.name}
            </h2>
            <ServiceQuoteConfigurator
              categorySlug={category.slug}
              categoryTitle={category.title}
              accent={category.accent}
              services={category.services}
            />
          </section>
        ) : null}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-zinc-950/95 p-3 backdrop-blur md:hidden">
        <a
          href="#oferta"
          className="flex w-full items-center justify-center rounded-xl bg-[color:var(--brand)] py-3 text-sm font-medium text-zinc-950"
        >
          Cere ofertă
        </a>
      </div>
      <div className="h-16 md:hidden" />
    </main>
  );
}
