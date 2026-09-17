import Link from "next/link";
import { SERVICE_CATEGORIES } from "@/lib/services";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Servicii IT",
};

export default function ServiciiPage() {
  return (
    <main className="bg-zinc-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="text-4xl md:text-6xl font-[family-name:var(--font-serif)] tracking-tight">
          Servicii
        </h1>
        <p className="mt-4 text-zinc-400 max-w-2xl">
          Alege categoria — fiecare pagină listează serviciile concrete pe care
          le livrăm.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {SERVICE_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/servicii/${cat.slug}`}
              className="border border-white/10 p-6 hover:border-cyan-300/40 transition-colors"
            >
              <h2 className="text-xl font-medium">{cat.title}</h2>
              <p className="mt-2 text-sm text-zinc-400">{cat.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
