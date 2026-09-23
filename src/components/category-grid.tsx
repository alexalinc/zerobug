"use client";

import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { ServiceCategoryCards } from "@/components/service-category-cards";

export function CategoryGrid() {
  return (
    <section className="relative overflow-hidden bg-zinc-950 text-white py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(34,197,94,0.07),_transparent_55%)]" />
      <div className="relative mx-auto max-w-6xl px-6">
        <p className="text-[color:var(--brand)] text-sm font-medium tracking-wide">
          Servicii
        </p>
        <TextGenerateEffect
          as="h2"
          words="Tot ce ai nevoie pentru digital — într-un singur partener."
          className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl"
          duration={0.35}
        />

        <div className="mt-12">
          <ServiceCategoryCards />
        </div>
      </div>
    </section>
  );
}
