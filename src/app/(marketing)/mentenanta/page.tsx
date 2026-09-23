import { MaintenanceConfigurator } from "@/components/maintenance-configurator";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import {
  JsonLd,
  breadcrumbSchema,
  serviceSchema,
  webPageSchema,
} from "@/components/json-ld";
import { PAGE_SEO, pageMetadata } from "@/lib/page-seo";

export const metadata = pageMetadata(PAGE_SEO.mentenanta);

export default function MentenantaPage() {
  return (
    <main className="relative bg-zinc-950 text-white pb-24 lg:pb-16">
      <JsonLd
        data={[
          webPageSchema({
            path: PAGE_SEO.mentenanta.path,
            name: `${PAGE_SEO.mentenanta.title} · ZeroBug`,
            description: PAGE_SEO.mentenanta.description,
          }),
          serviceSchema({
            name: "Mentenanță website",
            description: PAGE_SEO.mentenanta.description,
            path: "/mentenanta",
          }),
          breadcrumbSchema([
            { name: "Acasă", path: "/" },
            { name: "Mentenanță", path: "/mentenanta" },
          ]),
        ]}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_top,_rgba(34,197,94,0.08),_transparent_55%)]" />
      <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-20">
        <p className="text-sm font-medium tracking-wide text-[color:var(--brand)]">
          Mentenanță
        </p>
        <TextGenerateEffect
          as="h1"
          words="Spune-ne despre site — îți estimăm mentenanța"
          className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl"
          duration={0.4}
        />
        <TextGenerateEffect
          words="Răspunzi la câteva întrebări despre platformă, business și infrastructură. Vezi live un interval de preț și ne trimiți cererea — revenim cu oferta personalizată, fără obligație."
          className="mt-4 max-w-2xl text-zinc-400 leading-relaxed"
          duration={0.3}
        />
        <div className="mt-12">
          <MaintenanceConfigurator />
        </div>
      </div>
    </main>
  );
}
