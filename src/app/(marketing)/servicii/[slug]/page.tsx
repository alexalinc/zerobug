import { notFound } from "next/navigation";
import { getCategoryBySlug, SERVICE_CATEGORIES } from "@/lib/services";
import { QuoteForm } from "@/components/quote-form";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return SERVICE_CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = getCategoryBySlug(slug);
  return { title: cat?.title ?? "Serviciu" };
}

export default async function ServiceCategoryPage({ params }: Props) {
  const { slug } = await params;
  const cat = getCategoryBySlug(slug);
  if (!cat) notFound();

  return (
    <main className="bg-zinc-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-16 grid gap-14 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-cyan-300 text-sm font-medium">{cat.shortTitle}</p>
          <h1 className="mt-3 text-4xl md:text-5xl font-[family-name:var(--font-serif)] tracking-tight">
            {cat.title}
          </h1>
          <p className="mt-4 text-zinc-400 max-w-xl">{cat.description}</p>
          <ul className="mt-10 space-y-3">
            {cat.services.map((s) => (
              <li
                key={s}
                className="border-b border-white/10 pb-3 text-zinc-200 text-sm md:text-base"
              >
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:sticky lg:top-20 h-fit">
          <QuoteForm
            type="service_quote"
            serviceCategory={cat.slug}
            title={`Ofertă — ${cat.title}`}
          />
        </div>
      </div>
    </main>
  );
}
