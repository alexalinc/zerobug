"use client";

import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  BarChart3,
  Code2,
  Globe2,
  Plug,
  ShoppingBag,
  Smartphone,
} from "lucide-react";
import { SERVICE_CATEGORIES } from "@/lib/services";
import { cn } from "@/lib/utils";

export const CATEGORY_VISUALS: Record<
  string,
  { Icon: LucideIcon; image: string }
> = {
  "web-development": {
    Icon: Globe2,
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
  },
  "e-commerce": {
    Icon: ShoppingBag,
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80",
  },
  "api-integrari": {
    Icon: Plug,
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
  },
  "aplicatii-mobile": {
    Icon: Smartphone,
    image:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80",
  },
  "google-ads-analytics": {
    Icon: BarChart3,
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
  },
  "wordpress-woocommerce": {
    Icon: Code2,
    image:
      "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=1200&q=80",
  },
};

export function ServiceCategoryCards({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {SERVICE_CATEGORIES.map((cat) => {
        const visual = CATEGORY_VISUALS[cat.slug];
        const Icon = visual?.Icon ?? Code2;
        const image =
          visual?.image ??
          "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80";
        const countLabel =
          cat.services.length === 1
            ? "1 serviciu"
            : `${cat.services.length} servicii`;

        return (
          <Link
            key={cat.slug}
            href={`/servicii/${cat.slug}`}
            className={cn(
              "group relative flex min-h-[280px] flex-col overflow-hidden rounded-3xl border border-white/[0.08]",
              "bg-zinc-900/80 transition-all duration-300 ease-out",
              "hover:-translate-y-1 hover:border-[color:var(--brand)]/40",
              "hover:shadow-[0_0_0_1px_rgba(34,197,94,0.12),0_28px_60px_-24px_rgba(34,197,94,0.28)]",
            )}
          >
            <Image
              src={image}
              alt=""
              fill
              unoptimized
              className="object-cover opacity-35 transition-all duration-500 group-hover:scale-105 group-hover:opacity-45"
              sizes="(max-width:768px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-zinc-950/30" />
            <div
              className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
              style={{ background: cat.accent }}
            />

            <div className="relative z-10 flex h-full flex-col p-6">
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/95 text-zinc-900 shadow-lg shadow-black/20">
                  <Icon className="h-6 w-6" strokeWidth={1.75} />
                </span>
                <span className="rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[11px] font-medium tracking-wide text-zinc-300 backdrop-blur">
                  {countLabel}
                </span>
              </div>

              <div className="mt-auto pt-10">
                <h3 className="text-xl font-semibold tracking-tight transition-colors group-hover:text-[color:var(--brand-soft)]">
                  {cat.title}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-300/90">
                  {cat.description}
                </p>
                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-sm font-medium text-[color:var(--brand)]">
                    Explorează
                  </span>
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-zinc-200 transition-all group-hover:border-[color:var(--brand)]/50 group-hover:bg-[color:var(--brand)] group-hover:text-zinc-950">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
