import {
  JsonLd,
  breadcrumbSchema,
  webPageSchema,
} from "@/components/json-ld";
import { PAGE_SEO, pageMetadata } from "@/lib/page-seo";

export const metadata = pageMetadata(PAGE_SEO.privacy);

export default function PrivacyPage() {
  return (
    <main className="bg-zinc-950 text-white">
      <JsonLd
        data={[
          webPageSchema({
            path: PAGE_SEO.privacy.path,
            name: `${PAGE_SEO.privacy.title} · ZeroBug`,
            description: PAGE_SEO.privacy.description,
          }),
          breadcrumbSchema([
            { name: "Acasă", path: "/" },
            {
              name: "Politica de confidențialitate",
              path: "/politica-confidentialitate",
            },
          ]),
        ]}
      />
      <div className="mx-auto max-w-3xl px-6 py-16 prose prose-invert">
        <h1 className="text-4xl font-semibold tracking-tight">
          Politica de confidențialitate
        </h1>
        <p className="mt-6 text-zinc-400 leading-relaxed">
          ZeroBug (SC AXP GLOBAL RETAIL SRL) prelucrează datele pe care ni le
          trimiți prin formulare (nume, email, telefon, firmă) exclusiv pentru a
          răspunde solicitărilor și pentru facturare. Nu vindem datele către
          terți. Pentru abonamente Stripe, datele de plată sunt procesate de
          Stripe conform politicii lor. Poți solicita ștergerea datelor la
          contact@zerobug.ro.
        </p>
      </div>
    </main>
  );
}
