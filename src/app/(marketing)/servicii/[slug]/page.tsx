import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryBySlug, SERVICE_CATEGORIES } from "@/lib/services";
import { ServiceQuoteConfigurator } from "@/components/service-quote-configurator";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import {
  JsonLd,
  breadcrumbSchema,
  serviceSchema,
  webPageSchema,
} from "@/components/json-ld";
import { serviceCategoryMetadata } from "@/lib/page-seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return SERVICE_CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
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

export default async function ServiceCategoryPage({ params }: Props) {
  const { slug } = await params;
  const cat = getCategoryBySlug(slug);
  if (!cat) notFound();

  const others = SERVICE_CATEGORIES.filter((c) => c.slug !== slug);
  const path = `/servicii/${cat.slug}`;

  return (
    <main className="bg-zinc-950 text-white">
      <JsonLd
        data={[
          webPageSchema({
            path,
            name: `${cat.title} · ZeroBug`,
            description: cat.description,
          }),
          serviceSchema({
            name: cat.title,
            description: cat.description,
            path,
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
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10 md:py-12">
        <ServiceQuoteConfigurator
          categorySlug={cat.slug}
          categoryTitle={cat.title}
          accent={cat.accent}
          services={cat.services}
        />

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
