import { ServicesCatalog } from "@/components/services-catalog";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import {
  JsonLd,
  breadcrumbSchema,
  webPageSchema,
} from "@/components/json-ld";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Servicii IT",
  description:
    "Catalog ZeroBug: web, e-commerce, API, mobile, tracking Google Ads și WordPress — cere o ofertă personalizată.",
};

export default function ServiciiPage() {
  return (
    <main className="bg-zinc-950 text-white">
      <JsonLd
        data={[
          webPageSchema({
            path: "/servicii",
            name: "Servicii IT · ZeroBug",
            description:
              "Catalog ZeroBug: web, e-commerce, API, mobile, tracking Google Ads și WordPress.",
            type: "CollectionPage",
          }),
          breadcrumbSchema([
            { name: "Acasă", path: "/" },
            { name: "Servicii", path: "/servicii" },
          ]),
        ]}
      />
      <div className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(34,197,94,0.14),_transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-10 md:py-14">
          <p className="text-sm font-medium tracking-wide text-[color:var(--brand)]">
            Catalog ZeroBug
          </p>
          <TextGenerateEffect
            as="h1"
            words="Servicii IT construite pentru rezultate"
            className="mt-2 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl"
            duration={0.4}
          />
          <TextGenerateEffect
            words="Web, e-commerce, API, mobile, tracking Google Ads și WordPress — totul într-un singur partener. Alege categoria și trimite o cerere personalizată."
            className="mt-3 max-w-2xl text-base leading-relaxed text-zinc-400 md:text-lg"
            duration={0.3}
          />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8 md:py-10">
        <ServicesCatalog />
      </div>
    </main>
  );
}
