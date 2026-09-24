import Link from "next/link";
import Image from "next/image";
import type { ServiceCategory } from "@/lib/services";
import type { ServicePage } from "@/lib/service-pages";
import {
  getRelatedServicePages,
  getServiceHref,
  servicePath,
} from "@/lib/service-pages";
import { CITIES, cityHubPath, cityServicePath } from "@/lib/cities";
import { getLocalKeyword } from "@/lib/local-pages";
import { ServiceQuoteConfigurator } from "@/components/service-quote-configurator";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import {
  JsonLd,
  breadcrumbSchema,
  faqPageSchemaForPath,
  serviceSchema,
  webPageSchemaWithImage,
} from "@/components/json-ld";

type Props = {
  page: ServicePage;
  category: ServiceCategory;
};

/** Map national spokes to local money-keyword slugs when names overlap */
function localKeywordForPage(page: ServicePage): string | undefined {
  const bySlug = getLocalKeyword(page.slug);
  if (bySlug) return bySlug.slug;

  const aliases: Record<string, string> = {
    "creare-magazin-woocommerce": "creare-magazin-woocommerce",
    "creare-magazin-online-woocommerce": "creare-magazin-woocommerce",
    "dezvoltare-shopify": "creare-magazin-shopify",
    "creare-website-de-prezentare": "creare-website",
    "website-wordpress": "creare-website-wordpress",
    "redesign-website": "redesign-website",
    "wordpress-maintenance": "mentenanta-wordpress",
    "optimizare-magazin-online": "optimizare-magazin-online",
    "integrare-smartbill": "integrare-smartbill",
    "google-ads-conversion-tracking": "google-ads-tracking",
    "migrare-shopify-woocommerce": "migrare-magazin-online",
    "aplicatii-flutter-cross-platform": "aplicatie-mobila",
  };
  return aliases[page.slug];
}

export function ServiceLandingTemplate({ page, category }: Props) {
  const path = servicePath(page.categorySlug, page.slug);
  const related = getRelatedServicePages(page, 4);
  const image = page.image ?? "/images/logozerobug.png";
  const quoteHref = `#oferta`;
  const contactHref = `/contact?categorie=${encodeURIComponent(page.categorySlug)}&serviciu=${encodeURIComponent(page.name)}`;
  const localKw = localKeywordForPage(page);
  const citySamples = CITIES.slice(0, 6);

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
            serviceType: category.title,
            image,
          }),
          breadcrumbSchema([
            { name: "Acasă", path: "/" },
            { name: "Servicii", path: "/servicii" },
            { name: category.title, path: `/servicii/${category.slug}` },
            { name: page.name, path },
          ]),
          faqPageSchemaForPath(path, page.faqs),
        ]}
      />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(ellipse at top right, ${category.accent}33, transparent 55%)`,
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_top,black_15%,transparent_65%)]" />

        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-10 md:grid-cols-[1.2fr_0.8fr] md:py-14">
          <div>
            <Link
              href={`/servicii/${category.slug}`}
              className="text-sm text-zinc-400 transition-colors hover:text-white"
            >
              ← {category.title}
            </Link>
            <p
              className="mt-5 text-sm font-medium"
              style={{ color: category.accent }}
            >
              {category.shortTitle}
            </p>
            <TextGenerateEffect
              as="h1"
              words={page.h1}
              className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl"
              duration={0.4}
            />
            <p className="mt-4 max-w-2xl text-base text-zinc-400 md:text-lg">
              {page.intro}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={quoteHref}
                className="inline-flex items-center justify-center rounded-xl bg-[color:var(--brand)] px-5 py-2.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-[color:var(--brand-soft)]"
              >
                Cere ofertă
              </a>
              <Link
                href="/portofoliu"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 px-5 py-2.5 text-sm text-zinc-200 transition-colors hover:border-white/30 hover:text-white"
              >
                Vezi portofoliu
              </Link>
              <Link
                href={contactHref}
                className="inline-flex items-center justify-center rounded-xl px-3 py-2.5 text-sm text-zinc-400 underline-offset-4 hover:text-white hover:underline"
              >
                Contact rapid
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
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 to-transparent" />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-16 px-6 py-12 md:py-16">
        {/* Benefits */}
        <section>
          <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
            De ce ZeroBug pentru {page.name.toLowerCase()}
          </h2>
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

        {/* Includes */}
        <section>
          <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
            Ce include
          </h2>
          <ul className="mt-6 space-y-2">
            {page.includes.map((item) => (
              <li
                key={item}
                className="flex gap-3 text-sm text-zinc-300"
              >
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: category.accent }}
                />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Process */}
        <section>
          <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
            Cum lucrăm
          </h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {page.process.map((step, i) => (
              <li
                key={step.title}
                className="rounded-2xl border border-white/10 bg-zinc-900/40 p-4"
              >
                <p
                  className="text-xs font-medium uppercase tracking-wide"
                  style={{ color: category.accent }}
                >
                  Pasul {i + 1}
                </p>
                <p className="mt-2 font-medium text-white">{step.title}</p>
                <p className="mt-1.5 text-sm text-zinc-400">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
            Întrebări frecvente
          </h2>
          <div className="mt-6 space-y-3">
            {page.faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <summary className="cursor-pointer list-none text-sm font-medium text-white marker:content-none [&::-webkit-details-marker]:hidden">
                  {faq.question}
                </summary>
                <p className="mt-2 text-sm text-zinc-400">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Related */}
        {related.length > 0 ? (
          <section>
            <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
              Servicii conexe
            </h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={getServiceHref(r)}
                  className="rounded-2xl border border-white/10 bg-zinc-900/40 px-4 py-3 text-sm text-zinc-300 transition-colors hover:border-[color:var(--brand)]/40 hover:text-white"
                >
                  {r.name}
                </Link>
              ))}
            </div>
            <Link
              href={`/servicii/${category.slug}`}
              className="mt-4 inline-block text-sm text-[color:var(--brand)] hover:underline"
            >
              Toate serviciile din {category.title} →
            </Link>
          </section>
        ) : null}

        <section>
          <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
            Același serviciu pe oraș
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Lucrăm remote în toată țara — vezi și paginile locale.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {citySamples.map((c) => (
              <Link
                key={c.slug}
                href={
                  localKw
                    ? cityServicePath(c.slug, localKw)
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

        {page.showMaintenanceCta ? (
          <section className="rounded-2xl border border-white/10 bg-[color:var(--brand)]/5 p-5 md:p-6">
            <h2 className="text-lg font-semibold text-white">
              Ai deja site? Vezi mentenanța
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Update-uri, backup, securitate și support lunar — estimare rapidă
              pe pagina de mentenanță.
            </p>
            <Link
              href="/mentenanta"
              className="mt-4 inline-flex rounded-xl border border-[color:var(--brand)]/40 px-4 py-2 text-sm text-[color:var(--brand)] hover:bg-[color:var(--brand)]/10"
            >
              Estimare mentenanță
            </Link>
          </section>
        ) : null}

        {/* Quote CTA */}
        <section id="oferta" className="scroll-mt-24">
          <div className="mb-8">
            <p
              className="text-sm font-medium"
              style={{ color: category.accent }}
            >
              Conversie
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
              Cere ofertă pentru {page.name}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              Serviciul e preselectat. Adaugă detalii și te contactăm cu o
              propunere pe etape.
            </p>
          </div>
          <ServiceQuoteConfigurator
            categorySlug={category.slug}
            categoryTitle={category.title}
            accent={category.accent}
            services={category.services}
            initialService={page.name}
          />
        </section>
      </div>

      {/* Mobile sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-zinc-950/95 p-3 backdrop-blur md:hidden">
        <a
          href={quoteHref}
          className="flex w-full items-center justify-center rounded-xl bg-[color:var(--brand)] py-3 text-sm font-medium text-zinc-950"
        >
          Cere ofertă
        </a>
      </div>
      <div className="h-16 md:hidden" />
    </main>
  );
}
