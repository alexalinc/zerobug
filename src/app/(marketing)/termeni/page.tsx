import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termeni și condiții",
};

export default function TermsPage() {
  return (
    <main className="bg-zinc-950 text-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-4xl font-[family-name:var(--font-serif)]">
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
