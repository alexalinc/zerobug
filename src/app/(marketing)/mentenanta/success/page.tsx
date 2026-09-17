import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Abonament confirmat",
};

export default function MentenantaSuccessPage() {
  return (
    <main className="bg-zinc-950 text-white min-h-[60vh] flex items-center">
      <div className="mx-auto max-w-xl px-6 py-16 text-center">
        <h1 className="text-4xl font-[family-name:var(--font-serif)]">
          Mulțumim!
        </h1>
        <p className="mt-4 text-zinc-400">
          Plata a fost înregistrată. Vei primi factura PDF pe email, iar
          abonamentul apare în panoul ZeroBug.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-cyan-300 text-zinc-950 px-5 py-3 text-sm font-medium"
        >
          Înapoi acasă
        </Link>
      </div>
    </main>
  );
}
