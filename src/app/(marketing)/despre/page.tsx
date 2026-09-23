import type { Metadata } from "next";
import Link from "next/link";
import AboutSection3 from "@/components/ui/about-section";
import ClientFeedback from "@/components/ui/testimonial";
import {
  CategoryGrid,
  CtaBand,
} from "@/components/marketing-sections";
import { StatsTicker } from "@/components/stats-ticker";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import {
  JsonLd,
  breadcrumbSchema,
  webPageSchema,
} from "@/components/json-ld";
import { PAGE_SEO, pageMetadata } from "@/lib/page-seo";

export const metadata: Metadata = pageMetadata(PAGE_SEO.despre);

const VALUES = [
  {
    title: "Livrabile în producție",
    body: "Nu vindem slide-uri. Construim website-uri, magazine, API-uri și automatizări care rulează zilnic pentru clienți reali.",
  },
  {
    title: "Dezvoltare + tracking",
    body: "Putem livra atât produsul digital, cât și măsurarea Google Ads / eCommerce (POAS, COGS, server-side) — într-un singur partener.",
  },
  {
    title: "AI unde contează",
    body: "Integrăm OpenAI & Claude pentru chatboți, automatizări și fluxuri care reduc costurile operaționale, nu doar pentru demo-uri.",
  },
  {
    title: "Mentenanță predictibilă",
    body: "Abonamente de la 19,99 € + TVA, cu update-uri, backup, securitate și facturare PDF automată pe 1 ale fiecărei luni.",
  },
];

const DETAILS = [
  { label: "Companie", value: "SC AXP GLOBAL RETAIL SRL" },
  { label: "CUI", value: "RO48715417" },
  { label: "Email", value: "contact@zerobug.ro", href: "mailto:contact@zerobug.ro" },
  { label: "Telefon", value: "0773 319 554", href: "tel:0773319554" },
];

export default function DesprePage() {
  return (
    <main>
      <JsonLd
        data={[
          webPageSchema({
            path: PAGE_SEO.despre.path,
            name: PAGE_SEO.despre.title,
            description: PAGE_SEO.despre.description,
            type: "AboutPage",
          }),
          breadcrumbSchema([
            { name: "Acasă", path: "/" },
            { name: "Despre", path: "/despre" },
          ]),
        ]}
      />
      <AboutSection3 />

      <section className="bg-zinc-950 text-white">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <p className="text-sm font-medium tracking-wide text-[color:var(--brand)]">
            Povestea ZeroBug
          </p>
          <TextGenerateEffect
            as="h2"
            words="Un partener tehnic pentru web, e-commerce, AI și mentenanță"
            className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl"
            duration={0.35}
          />
          <div className="mt-8 grid gap-8 text-zinc-400 leading-relaxed md:grid-cols-2">
            <TextGenerateEffect
              words="ZeroBug este brandul de servicii IT al SC AXP GLOBAL RETAIL SRL. Am pornit de la proiecte web și magazine online, apoi am extins către integrări API, aplicații mobile, analytics și — în 2026 — AI cu OpenAI & Claude."
              duration={0.3}
            />
            <TextGenerateEffect
              words="Lucrăm cu startup-uri și companii din România care vor rezultate măsurabile: site-uri care convertesc, tracking corect, automatizări care scurtează timpul pe operațiuni, și mentenanță fără surprize."
              duration={0.3}
            />
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((item) => (
              <div
                key={item.title}
                className="border border-white/10 bg-white/[0.03] p-5"
              >
                <h3 className="text-base font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {item.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-14 grid gap-4 border border-white/10 bg-white/[0.03] p-6 sm:grid-cols-2 lg:grid-cols-4">
            {DETAILS.map((item) => (
              <div key={item.label}>
                <p className="text-xs uppercase tracking-wide text-zinc-500">
                  {item.label}
                </p>
                {item.href ? (
                  <a
                    href={item.href}
                    className="mt-1 block text-sm font-medium text-white hover:text-[color:var(--brand-soft)]"
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="mt-1 text-sm font-medium text-white">
                    {item.value}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/portofoliu"
              className="inline-flex rounded-full border border-white/20 px-5 py-3 text-sm text-white transition-colors hover:bg-white/5"
            >
              Vezi portofoliul
            </Link>
            <Link
              href="/contact"
              className="inline-flex rounded-full bg-[color:var(--brand)] px-5 py-3 text-sm font-medium text-zinc-950 transition-colors hover:bg-[color:var(--brand-soft)]"
            >
              Contactează-ne
            </Link>
          </div>
        </div>
      </section>

      <StatsTicker />
      <ClientFeedback />
      <CategoryGrid />
      <CtaBand />
    </main>
  );
}
