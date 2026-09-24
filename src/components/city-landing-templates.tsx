import Link from "next/link";
import Image from "next/image";
import {
  CITIES,
  cityHubPath,
  getCityBySlug,
  type City,
} from "@/lib/cities";
import {
  getLocalPagesByCity,
  getRelatedLocalPages,
  type LocalServicePage,
} from "@/lib/local-pages";
import { getCategoryBySlug } from "@/lib/services";
import { ServiceQuoteConfigurator } from "@/components/service-quote-configurator";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import {
  JsonLd,
  breadcrumbSchema,
  faqPageSchemaForPath,
  itemListSchema,
  serviceSchema,
  webPageSchemaWithImage,
} from "@/components/json-ld";

export function CityIndexPage() {
  return (
    <main className="bg-zinc-950 text-white">
      <JsonLd
        data={[
          webPageSchemaWithImage({
            path: "/servicii/oras",
            name: "Servicii IT pe oraș | ZeroBug",
            description:
              "Servicii ZeroBug pe orașe din România: magazin online, website, WordPress, tracking Ads.",
            type: "CollectionPage",
          }),
          itemListSchema({
            name: "Orașe ZeroBug",
            path: "/servicii/oras",
            items: CITIES.map((c) => ({
              name: c.name,
              path: cityHubPath(c.slug),
            })),
          }),
          breadcrumbSchema([
            { name: "Acasă", path: "/" },
            { name: "Servicii", path: "/servicii" },
            { name: "Pe oraș", path: "/servicii/oras" },
          ]),
        ]}
      />
      <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <Link href="/servicii" className="text-sm text-zinc-400 hover:text-white">
          ← Servicii
        </Link>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight md:text-5xl">
          Servicii IT pe oraș
        </h1>
        <p className="mt-3 max-w-2xl text-zinc-400">
          Livrăm remote în toată țara. Alege orașul ca să vezi paginile dedicate
          pe intent local (magazin online, website, mentenanță WordPress etc.).
        </p>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CITIES.map((c) => (
            <Link
              key={c.slug}
              href={cityHubPath(c.slug)}
              className="rounded-2xl border border-white/10 bg-zinc-900/40 p-4 transition-colors hover:border-[color:var(--brand)]/40"
            >
              <p className="font-medium text-white">{c.name}</p>
              <p className="mt-1 text-xs text-zinc-500">județ {c.county}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

export function CityHubTemplate({ city }: { city: City }) {
  const path = cityHubPath(city.slug);
  const pages = getLocalPagesByCity(city.slug);

  return (
    <main className="bg-zinc-950 text-white">
      <JsonLd
        data={[
          webPageSchemaWithImage({
            path,
            name: `Servicii IT ${city.inLocative} | ZeroBug`,
            description: `Dezvoltare web, magazin online, WordPress și tracking pentru firme ${city.from}. Ofertă ZeroBug.`,
            type: "CollectionPage",
          }),
          serviceSchema({
            name: `Servicii IT ${city.inLocative}`,
            description: `Servicii digitale pentru companii ${city.from}.`,
            path,
            serviceType: "Servicii IT",
            areaServed: {
              "@type": "City",
              name: city.name,
            },
          }),
          itemListSchema({
            name: `Servicii ${city.inLocative}`,
            path,
            items: pages.map((p) => ({ name: p.name, path: p.path })),
          }),
          breadcrumbSchema([
            { name: "Acasă", path: "/" },
            { name: "Servicii", path: "/servicii" },
            { name: "Pe oraș", path: "/servicii/oras" },
            { name: city.name, path },
          ]),
        ]}
      />
      <div className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,#22c55e33,transparent_55%)] opacity-40" />
        <div className="relative mx-auto max-w-6xl px-6 py-10 md:py-14">
          <Link
            href="/servicii/oras"
            className="text-sm text-zinc-400 hover:text-white"
          >
            ← Toate orașele
          </Link>
          <TextGenerateEffect
            as="h1"
            words={`Servicii IT ${city.inLocative}`}
            className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl"
            duration={0.4}
          />
          <p className="mt-3 max-w-2xl text-zinc-400">
            ZeroBug lucrează cu firme {city.from} și din județul {city.county}.
            Livrare remote, sync-uri clare, ofertă pe etape.
          </p>
          <a
            href="#oferta"
            className="mt-8 inline-flex rounded-xl bg-[color:var(--brand)] px-5 py-2.5 text-sm font-medium text-zinc-950"
          >
            Cere ofertă
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10 md:py-12">
        <h2 className="text-xl font-semibold">Servicii populare {city.inLocative}</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pages.map((p) => (
            <Link
              key={p.slug}
              href={p.path}
              className="rounded-2xl border border-white/10 bg-zinc-900/40 p-4 hover:border-[color:var(--brand)]/40"
            >
              <p className="text-sm font-medium text-white">{p.name}</p>
              <p className="mt-2 line-clamp-2 text-xs text-zinc-500">
                {p.seoDescription}
              </p>
            </Link>
          ))}
        </div>

        <div id="oferta" className="mt-14 scroll-mt-24">
          <ServiceQuoteConfigurator
            categorySlug="web-development"
            categoryTitle={`Proiect ${city.inLocative}`}
            accent="#22c55e"
            services={[
              `Creare website ${city.inLocative}`,
              `Creare magazin online ${city.inLocative}`,
              `Mentenanță WordPress ${city.inLocative}`,
              "Altceva / consultanță",
            ]}
          />
        </div>
      </div>
    </main>
  );
}

export function LocalServiceLandingTemplate({
  page,
}: {
  page: LocalServicePage;
}) {
  const city = getCityBySlug(page.citySlug)!;
  const category = getCategoryBySlug(page.categorySlug);
  const related = getRelatedLocalPages(page, 4);
  const image = page.image ?? "/images/logozerobug.png";
  const accent = category?.accent ?? "#22c55e";
  const contactHref = `/contact?oras=${encodeURIComponent(city.name)}&serviciu=${encodeURIComponent(page.name)}&categorie=${encodeURIComponent(page.categorySlug)}`;

  return (
    <main className="bg-zinc-950 text-white">
      <JsonLd
        data={[
          webPageSchemaWithImage({
            path: page.path,
            name: page.seoTitle,
            description: page.seoDescription,
            image,
          }),
          serviceSchema({
            name: page.name,
            description: page.seoDescription,
            path: page.path,
            serviceType: category?.title ?? page.name,
            image,
            areaServed: {
              "@type": "City",
              name: city.name,
            },
          }),
          breadcrumbSchema([
            { name: "Acasă", path: "/" },
            { name: "Servicii", path: "/servicii" },
            { name: "Pe oraș", path: "/servicii/oras" },
            { name: city.name, path: cityHubPath(city.slug) },
            { name: page.name, path: page.path },
          ]),
          faqPageSchemaForPath(page.path, page.faqs),
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
              href={cityHubPath(city.slug)}
              className="text-sm text-zinc-400 hover:text-white"
            >
              ← {city.name}
            </Link>
            <TextGenerateEffect
              as="h1"
              words={page.h1}
              className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl"
              duration={0.4}
            />
            <p className="mt-4 max-w-2xl text-zinc-400">{page.intro}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#oferta"
                className="inline-flex rounded-xl bg-[color:var(--brand)] px-5 py-2.5 text-sm font-medium text-zinc-950"
              >
                Cere ofertă
              </a>
              {page.nationalPath ? (
                <Link
                  href={page.nationalPath}
                  className="inline-flex rounded-xl border border-white/15 px-5 py-2.5 text-sm text-zinc-200"
                >
                  Versiune națională
                </Link>
              ) : null}
              <Link
                href={contactHref}
                className="inline-flex px-3 py-2.5 text-sm text-zinc-400 underline-offset-4 hover:underline"
              >
                Contact rapid
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10">
            <Image src={image} alt={page.name} fill className="object-cover" sizes="40vw" priority />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-14 px-6 py-12">
        <section>
          <h2 className="text-xl font-semibold">Beneficii</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {page.benefits.map((b) => (
              <li
                key={b}
                className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-zinc-300"
              >
                {b}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-semibold">Ce include</h2>
          <ul className="mt-6 space-y-2">
            {page.includes.map((item) => (
              <li key={item} className="flex gap-3 text-sm text-zinc-300">
                <span
                  className="mt-1.5 h-1.5 w-1.5 rounded-full"
                  style={{ background: accent }}
                />
                {item}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-semibold">Cum lucrăm</h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {page.process.map((step, i) => (
              <li
                key={step.title}
                className="rounded-2xl border border-white/10 p-4"
              >
                <p className="text-xs uppercase" style={{ color: accent }}>
                  Pasul {i + 1}
                </p>
                <p className="mt-2 font-medium">{step.title}</p>
                <p className="mt-1 text-sm text-zinc-400">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>
        <section>
          <h2 className="text-xl font-semibold">FAQ</h2>
          <div className="mt-6 space-y-3">
            {page.faqs.map((faq) => (
              <details
                key={faq.question}
                className="rounded-2xl border border-white/10 px-4 py-3"
              >
                <summary className="cursor-pointer text-sm font-medium">
                  {faq.question}
                </summary>
                <p className="mt-2 text-sm text-zinc-400">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
        {related.length > 0 ? (
          <section>
            <h2 className="text-xl font-semibold">
              Alte servicii {city.inLocative}
            </h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={r.path}
                  className="rounded-2xl border border-white/10 px-4 py-3 text-sm hover:border-[color:var(--brand)]/40"
                >
                  {r.name}
                </Link>
              ))}
            </div>
          </section>
        ) : null}
        {page.showMaintenanceCta ? (
          <Link
            href="/mentenanta"
            className="inline-flex rounded-xl border border-[color:var(--brand)]/40 px-4 py-2 text-sm text-[color:var(--brand)]"
          >
            Estimare mentenanță →
          </Link>
        ) : null}
        {category ? (
          <section id="oferta" className="scroll-mt-24">
            <h2 className="mb-6 text-2xl font-semibold">
              Ofertă — {page.name}
            </h2>
            <ServiceQuoteConfigurator
              categorySlug={category.slug}
              categoryTitle={category.title}
              accent={category.accent}
              services={category.services}
              initialService={
                category.services.find((s) =>
                  s.toLowerCase().includes(
                    page.slug.split("-").slice(0, 2).join(" "),
                  ),
                ) ?? category.services[0]
              }
            />
          </section>
        ) : null}
      </div>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-zinc-950/95 p-3 md:hidden">
        <a
          href="#oferta"
          className="flex w-full justify-center rounded-xl bg-[color:var(--brand)] py-3 text-sm font-medium text-zinc-950"
        >
          Cere ofertă
        </a>
      </div>
      <div className="h-16 md:hidden" />
    </main>
  );
}
