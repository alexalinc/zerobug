import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { PORTFOLIO_ITEMS, PORTFOLIO_MORE } from "@/lib/portfolio";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { cn } from "@/lib/utils";

export function PortfolioGrid({
  limit,
  className,
}: {
  limit?: number;
  className?: string;
}) {
  const items = limit ? PORTFOLIO_ITEMS.slice(0, limit) : PORTFOLIO_ITEMS;

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {items.map((item) => (
        <a
          key={item.slug}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "group relative flex min-h-[320px] flex-col overflow-hidden rounded-3xl border border-white/[0.08]",
            "bg-zinc-900/80 transition-all duration-300",
            "hover:-translate-y-1 hover:border-[color:var(--brand)]/40",
            "hover:shadow-[0_0_0_1px_rgba(34,197,94,0.12),0_28px_60px_-24px_rgba(34,197,94,0.28)]",
          )}
        >
          <Image
            src={item.image}
            alt={item.title}
            fill
            unoptimized
            className="object-cover object-top opacity-45 transition-all duration-500 group-hover:scale-[1.03] group-hover:opacity-55"
            sizes="(max-width:768px) 100vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/75 to-zinc-950/20" />

          <div className="relative z-10 flex h-full flex-col p-6">
            <div className="flex items-start justify-between gap-3">
              <span className="rounded-full border border-white/10 bg-black/35 px-2.5 py-1 text-[11px] font-medium tracking-wide text-zinc-300 backdrop-blur">
                {item.category}
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-zinc-200 transition-all group-hover:border-[color:var(--brand)]/50 group-hover:bg-[color:var(--brand)] group-hover:text-zinc-950">
                <ExternalLink className="h-4 w-4" />
              </span>
            </div>

            <div className="mt-auto pt-16">
              <h3 className="text-xl font-semibold tracking-tight transition-colors group-hover:text-[color:var(--brand-soft)]">
                {item.title}
              </h3>
              <p className="mt-1 text-xs text-zinc-400">{item.urlLabel}</p>
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-zinc-300/90">
                {item.description}
              </p>
              <ul className="mt-4 space-y-1.5">
                {item.highlights.slice(0, 2).map((h) => (
                  <li
                    key={h}
                    className="border-l-2 border-[color:var(--brand)]/40 pl-2.5 text-xs text-zinc-400"
                  >
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}

export function PortfolioTeaser() {
  return (
    <section className="relative overflow-hidden bg-zinc-950 text-white py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(34,197,94,0.08),_transparent_55%)]" />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium tracking-wide text-[color:var(--brand)]">
              Portofoliu
            </p>
            <TextGenerateEffect
              as="h2"
              words="Proiecte livrate — de la magazine la SaaS"
              className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight md:text-5xl"
              duration={0.35}
            />
            <TextGenerateEffect
              words="Platforme RCA, e-commerce, tracking profit pe ads și aplicații mobile — plus automatizări API, scrapere și gestiune stoc."
              className="mt-4 max-w-xl text-zinc-400"
              duration={0.3}
            />
          </div>
          <Link
            href="/portofoliu"
            className="inline-flex items-center gap-2 self-start rounded-full border border-white/15 px-5 py-2.5 text-sm text-white transition-colors hover:border-[color:var(--brand)]/40 hover:bg-white/5"
          >
            Vezi tot portofoliul
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12">
          <PortfolioGrid limit={3} />
        </div>

        <div className="mt-10 flex flex-wrap gap-2">
          {PORTFOLIO_MORE.map((item) => (
            <span
              key={item}
              className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-400"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
