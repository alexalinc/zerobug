import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryBySlug, SERVICE_CATEGORIES } from "@/lib/services";
import {
  getServiceHref,
  getServicePagesByCategory,
} from "@/lib/service-pages";
import { INTENT_PAGES, getIntentPage } from "@/lib/intent-pages";
import { IntentLandingTemplate } from "@/components/intent-landing-template";
import { ServiceQuoteConfigurator } from "@/components/service-quote-configurator";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import {
  JsonLd,
  breadcrumbSchema,
  itemListSchema,
  serviceSchema,
  webPageSchema,
} from "@/components/json-ld";
import { pageMetadata, serviceCategoryMetadata } from "@/lib/page-seo";
import { CITIES, cityHubPath } from "@/lib/cities";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return [
    ...SERVICE_CATEGORIES.map((c) => ({ slug: c.slug })),
    ...INTENT_PAGES.map((p) => ({ slug: p.slug })),
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const intent = getIntentPage(slug);
  if (intent) {
    return pageMetadata({
      title: intent.seoTitle,
      description: intent.seoDescription,
      path: `/servicii/${intent.slug}`,
      image: intent.image,
      imageAlt: intent.name,
    });
  }
  const cat = getCategoryBySlug(slug);
  if (!cat) {
    return { title: "Serviciu" };
  }
  return serviceCategoryMetadata({
    title: cat.title,
    description: cat.description,
    slug: cat.slug,
  });
}

export default async function ServiceCategoryOrIntentPage({ params }: Props) {
  const { slug } = await params;

  const intent = getIntentPage(slug);
  if (intent) {
    return <IntentLandingTemplate page={intent} />;
  }

  const cat = getCategoryBySlug(slug);
  if (!cat) notFound();

  const others = SERVICE_CATEGORIES.filter((c) => c.slug !== slug);
  const path = `/servicii/${cat.slug}`;
  const spokes = getServicePagesByCategory(cat.slug);
  const sampleCities = CITIES.slice(0, 6);

  return (
    <main className="bg-zinc-950 text-white">
      <JsonLd
        data={[
          webPageSchema({
            path,
            name: `${cat.title} · ZeroBug`,
            description: cat.description,
            type: "CollectionPage",
          }),
          serviceSchema({
            name: cat.title,
            description: cat.description,
            path,
            serviceType: cat.title,
          }),
          itemListSchema({
            name: `Servicii ${cat.title}`,
            path,
            items: spokes.map((s) => ({
              name: s.name,
              path: getServiceHref(s),
            })),
          }),
          breadcrumbSchema([
            { name: "Acasă", path: "/" },
            { name: "Servicii", path: "/servicii" },
            { name: cat.title, path },
          ]),
        ]}
      />
      <div className="relative overflow-hidden border-b border-white/10">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(ellipse at top right, ${cat.accent}33, transparent 55%)`,
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_top,black_15%,transparent_65%)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-10 md:py-14">
          <Link
            href="/servicii"
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            ← Toate serviciile
          </Link>
          <p className="mt-5 text-sm font-medium" style={{ color: cat.accent }}>
            {cat.shortTitle}
          </p>
          <TextGenerateEffect
            as="h1"
            words={cat.title}
            className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl"
            duration={0.4}
          />
          <TextGenerateEffect
            words={cat.description}
            className="mt-3 max-w-2xl text-base text-zinc-400 md:text-lg"
            duration={0.3}
          />
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
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10 md:py-12">
        <div id="oferta" className="scroll-mt-24">
          <ServiceQuoteConfigurator
            categorySlug={cat.slug}
            categoryTitle={cat.title}
            accent={cat.accent}
            services={cat.services}
          />
        </div>

        <div className="mt-12 border-t border-white/10 pt-8">
          <h3 className="text-sm font-medium text-zinc-400">
            Disponibil și pe oraș
          </h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {sampleCities.map((c) => (
              <Link
                key={c.slug}
                href={cityHubPath(c.slug)}
                className="rounded-full border border-white/10 px-3.5 py-1.5 text-sm text-zinc-300 hover:border-[color:var(--brand)]/40 hover:text-white"
              >
                {c.name}
              </Link>
            ))}
            <Link
              href="/servicii/oras"
              className="rounded-full border border-white/10 px-3.5 py-1.5 text-sm text-[color:var(--brand)]"
            >
              Toate →
            </Link>
          </div>
        </div>

        {others.length > 0 && (
          <div className="mt-12 border-t border-white/10 pt-8">
            <h3 className="text-sm font-medium text-zinc-400">
              Alte categorii
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {others.map((o) => (
                <Link
                  key={o.slug}
                  href={`/servicii/${o.slug}`}
                  className="rounded-full border border-white/10 px-3.5 py-1.5 text-sm text-zinc-300 transition-colors hover:border-[color:var(--brand)]/40 hover:text-white"
                >
                  {o.shortTitle}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
