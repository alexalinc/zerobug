import { QuoteForm } from "@/components/quote-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <main className="bg-zinc-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-16 grid gap-12 lg:grid-cols-2">
        <div>
          <h1 className="text-4xl md:text-6xl font-[family-name:var(--font-serif)] tracking-tight">
            Contact
          </h1>
          <p className="mt-4 text-zinc-400">
            Spune-ne pe scurt ce ai nevoie. Răspundem de obicei în aceeași zi
            lucrătoare.
          </p>
          <ul className="mt-8 space-y-2 text-sm text-zinc-300">
            <li>
              Email:{" "}
              <a className="text-cyan-300" href="mailto:contact@zerobug.ro">
                contact@zerobug.ro
              </a>
            </li>
            <li>
              Tel:{" "}
              <a className="text-cyan-300" href="tel:0773319554">
                0773 319 554
              </a>
            </li>
            <li>SC AXP GLOBAL RETAIL SRL · CUI RO48715417</li>
          </ul>
        </div>
        <QuoteForm type="contact" title="Trimite un mesaj" />
      </div>
    </main>
  );
}
