import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Despre ZeroBug",
};

export default function DesprePage() {
  return (
    <main className="bg-zinc-950 text-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-4xl md:text-6xl font-[family-name:var(--font-serif)] tracking-tight">
          Despre ZeroBug
        </h1>
        <div className="mt-8 space-y-5 text-zinc-400 leading-relaxed">
          <p>
            ZeroBug este brandul de servicii IT al SC AXP GLOBAL RETAIL SRL.
            Construim website-uri, magazine, integrări API, aplicații mobile și
            — în 2026 — punem accent pe AI și automatizări care reduc costurile
            operaționale.
          </p>
          <p>
            Diferențiatorul nostru: putem livra atât dezvoltarea, cât și
            tracking-ul Google Ads / eCommerce analytics (POAS, COGS, server-side
            conversions) — rar găsit într-un singur partener tehnic.
          </p>
          <p>
            Oferim și mentenanță lunară de la 19,99 € + TVA, cu facturare PDF
            automată pe 1 ale fiecărei luni.
          </p>
        </div>
      </div>
    </main>
  );
}
