import {
  JsonLd,
  breadcrumbSchema,
  webPageSchema,
} from "@/components/json-ld";
import { PAGE_SEO, pageMetadata } from "@/lib/page-seo";

export const metadata = pageMetadata(PAGE_SEO.termeni);

export default function TermsPage() {
  return (
    <main className="bg-zinc-950 text-white">
      <JsonLd
        data={[
          webPageSchema({
            path: PAGE_SEO.termeni.path,
            name: `${PAGE_SEO.termeni.title} · ZeroBug`,
            description: PAGE_SEO.termeni.description,
          }),
          breadcrumbSchema([
            { name: "Acasă", path: "/" },
            { name: "Termeni", path: "/termeni" },
          ]),
        ]}
      />
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-4xl font-semibold tracking-tight">
          Termeni și condiții
        </h1>
        <p className="mt-6 text-zinc-400 leading-relaxed">
          Serviciile ZeroBug sunt livrate pe bază de ofertă / contract. Pachetele
          de mentenanță se facturează lunar (+ TVA 21%). Anularea abonamentului
          Stripe se face cu efect la finalul perioadei curente. Facturile PDF
          sunt emise de SC AXP GLOBAL RETAIL SRL. Detaliile tehnice și SLA-urile
          se stabilesc per proiect.
        </p>
      </div>
    </main>
  );
}
