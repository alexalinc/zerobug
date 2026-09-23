import Link from "next/link";
import {
  JsonLd,
  breadcrumbSchema,
  webPageSchema,
} from "@/components/json-ld";
import { PAGE_SEO, pageMetadata } from "@/lib/page-seo";

export const metadata = pageMetadata(PAGE_SEO.mentenantaSuccess);

export default function MentenantaSuccessPage() {
  return (
    <main className="bg-zinc-950 text-white min-h-[60vh] flex items-center">
      <JsonLd
        data={[
          webPageSchema({
            path: PAGE_SEO.mentenantaSuccess.path,
            name: `${PAGE_SEO.mentenantaSuccess.title} · ZeroBug`,
            description: PAGE_SEO.mentenantaSuccess.description,
          }),
          breadcrumbSchema([
            { name: "Acasă", path: "/" },
            { name: "Mentenanță", path: "/mentenanta" },
            { name: "Confirmare", path: "/mentenanta/success" },
          ]),
        ]}
      />
      <div className="mx-auto max-w-xl px-6 py-16 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">Mulțumim!</h1>
        <p className="mt-4 text-zinc-400">
          Plata a fost înregistrată. Vei primi factura PDF pe email, iar
          abonamentul apare în panoul ZeroBug.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-[color:var(--brand)] text-zinc-950 px-5 py-3 text-sm font-medium"
        >
          Înapoi acasă
        </Link>
      </div>
    </main>
  );
}
