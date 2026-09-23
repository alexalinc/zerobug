"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { cn } from "@/lib/utils";

const TECH: {
  name: string;
  blurb: string;
  logo: string;
  logos?: string[];
  image: string;
  href: string;
  span: string;
}[] = [
  {
    name: "React",
    blurb: "UI reactive, componente reutilizabile",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg",
    image:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80",
    href: "/servicii/web-development",
    span: "md:col-span-2 md:row-span-2",
  },
  {
    name: "Next.js",
    blurb: "App Router, SEO & magazine online",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg",
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=900&q=80",
    href: "/servicii/web-development",
    span: "md:col-span-1",
  },
  {
    name: "Stripe",
    blurb: "Plăți & abonamente",
    logo: "https://cdn.simpleicons.org/stripe/635BFF",
    image:
      "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&w=900&q=80",
    href: "/servicii/e-commerce",
    span: "md:col-span-1",
  },
  {
    name: "WordPress",
    blurb: "CMS + magazine WooCommerce",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/wordpress/wordpress-plain.svg",
    image:
      "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=900&q=80",
    href: "/servicii/wordpress-woocommerce",
    span: "md:col-span-1",
  },
  {
    name: "Flutter",
    blurb: "iOS + Android dintr-un codebase",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/flutter/flutter-original.svg",
    image:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=900&q=80",
    href: "/servicii/aplicatii-mobile",
    span: "md:col-span-1",
  },
  {
    name: "OpenAI & Claude",
    blurb: "Chatbot-uri, agenți & automatizări",
    logo: "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/openai.svg",
    logos: [
      "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/openai.svg",
      "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/anthropic.svg",
    ],
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
    href: "/servicii",
    span: "md:col-span-2",
  },
  {
    name: "Shopify",
    blurb: "Magazine online gata de scalat",
    logo: "https://cdn.simpleicons.org/shopify/95BF47",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=900&q=80",
    href: "/servicii/e-commerce",
    span: "md:col-span-1",
  },
  {
    name: "Google Ads",
    blurb: "Tracking, POAS & analytics",
    logo: "https://cdn.simpleicons.org/googleads/4285F4",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80",
    href: "/servicii/google-ads-analytics",
    span: "md:col-span-1",
  },
];

function SkeletonPulse({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-white/10",
        className,
      )}
    />
  );
}

function BentoSkeletonCard({ large }: { large?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-zinc-900/80 p-5 overflow-hidden",
        large && "md:min-h-[320px]",
      )}
    >
      <div className="flex items-center gap-3">
        <SkeletonPulse className="h-10 w-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <SkeletonPulse className="h-4 w-24" />
          <SkeletonPulse className="h-3 w-40" />
        </div>
      </div>
      <SkeletonPulse className={cn("mt-5 w-full", large ? "h-44" : "h-24")} />
      <div className="mt-4 space-y-2">
        <SkeletonPulse className="h-3 w-full" />
        <SkeletonPulse className="h-3 w-3/4" />
      </div>
    </div>
  );
}

export function TechBentoGrid() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 700);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <section className="relative bg-zinc-950 text-white py-24 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(34,197,94,0.08),_transparent_50%)]" />
      <div className="relative mx-auto max-w-6xl px-6">
        <p className="text-[color:var(--brand)] text-sm font-medium tracking-wide">
          Stack & livrabile
        </p>
        <TextGenerateEffect
          as="h2"
          words="De ce ZeroBug pentru proiectul tău"
          className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight md:text-5xl"
          duration={0.35}
        />
        <TextGenerateEffect
          words="Construim pe tehnologii mature — React, Next.js, Stripe, WordPress, Flutter, Shopify, OpenAI, Claude și Google Ads — cu mentenanță și tracking în discuție."
          className="mt-4 text-zinc-400 max-w-xl"
          duration={0.3}
        />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[minmax(160px,auto)]">
          {!ready &&
            TECH.map((item) => (
              <div key={`sk-${item.name}`} className={item.span}>
                <BentoSkeletonCard large={item.span.includes("row-span")} />
              </div>
            ))}

          {ready &&
            TECH.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 hover:border-[color:var(--brand)]/40 transition-colors min-h-[160px]",
                  item.span,
                )}
              >
                <Image
                  src={item.image}
                  alt=""
                  fill
                  unoptimized
                  className="object-cover opacity-30 group-hover:opacity-40 transition-opacity"
                  sizes="(max-width:768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/20" />
                <div className="relative z-10 flex h-full flex-col justify-between p-5 md:p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-1">
                      {(item.logos ?? [item.logo]).map((src) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={src}
                          src={src}
                          alt=""
                          className="h-10 w-10 rounded-xl bg-white/95 p-1.5 object-contain ring-2 ring-zinc-950"
                        />
                      ))}
                    </div>
                    <div>
                      <p className="font-semibold tracking-tight">{item.name}</p>
                      <p className="text-sm text-zinc-400">{item.blurb}</p>
                    </div>
                  </div>
                  <p className="text-sm text-[color:var(--brand)]/90 mt-6">
                    Vezi servicii →
                  </p>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </section>
  );
}
