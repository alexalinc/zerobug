"use client";

import React from "react";
import Link from "next/link";
import { LayoutTextFlip } from "@/components/ui/layout-text-flip";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { LogoCloud } from "@/components/ui/logo-cloud-3";

interface Partner {
  name: string;
  logo?: string;
}

interface ResponsiveHeroBannerProps {
  logoText?: string;
  backgroundImageUrl?: string;
  badgeText?: string;
  badgeLabel?: string;
  title?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonHref?: string;
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
  partnersTitle?: string;
  partners?: Partner[];
}

const PORTFOLIO_LOGOS = [
  {
    src: "/images/portfolio/logos/spido.png",
    alt: "Spido.ro",
  },
  {
    src: "/images/portfolio/logos/profit-bid.png",
    alt: "Profit Bid",
  },
  {
    src: "/images/portfolio/logos/bijuteriairis.png",
    alt: "Bijuteria Iris",
  },
  {
    src: "/images/portfolio/logos/mercana.png",
    alt: "Mercana",
  },
  {
    src: "/images/portfolio/logos/wootrack.png",
    alt: "WooTrack",
  },
  {
    src: "/images/portfolio/logos/clinicadronelor.png",
    alt: "Clinica Dronelor",
  },
];

const ResponsiveHeroBanner: React.FC<ResponsiveHeroBannerProps> = ({
  backgroundImageUrl = "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=2400&q=80",
  badgeLabel = "2026",
  badgeText = "Web, e-commerce, API & mentenanță",
  title = "ZeroBug",
  description = "Web, e-commerce, API & batch-uri, mobile și Google Ads — de la landing pages la platforme custom, cu mentenanță și facturare lunară.",
  primaryButtonText = "Vezi serviciile",
  primaryButtonHref = "/servicii",
  secondaryButtonText = "Pachete mentenanță",
  secondaryButtonHref = "/mentenanta",
  partnersTitle = "Stack-uri și platforme cu care lucrăm zilnic",
  partners = [
    {
      name: "Next.js",
      logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg",
    },
    {
      name: "WordPress",
      logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/wordpress/wordpress-plain.svg",
    },
    {
      name: "Shopify",
      logo: "https://cdn.simpleicons.org/shopify/95BF47",
    },
    {
      name: "WooCommerce",
      logo: "https://cdn.simpleicons.org/woocommerce/96588A",
    },
    {
      name: "Flutter",
      logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/flutter/flutter-original.svg",
    },
    {
      name: "Stripe",
      logo: "https://cdn.simpleicons.org/stripe/635BFF",
    },
    {
      name: "Google Ads",
      logo: "https://cdn.simpleicons.org/googleads/4285F4",
    },
  ],
}) => {
  return (
    <section className="relative min-h-screen w-full">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={backgroundImageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-zinc-950" />
        <div className="absolute inset-0 ring-1 ring-black/30" />
      </div>

      <div className="relative">
        <div className="mx-auto max-w-7xl px-6 pb-16 pt-28 sm:pt-32 md:pt-36 lg:pt-40">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-3 rounded-full bg-white/10 px-2.5 py-2 ring-1 ring-white/15 backdrop-blur animate-fade-slide-in-1">
              <span className="inline-flex items-center text-xs font-medium text-neutral-900 bg-[color:var(--brand)] rounded-full py-0.5 px-2 font-sans">
                {badgeLabel}
              </span>
              <span className="text-sm font-medium text-white/90 font-sans">
                {badgeText}
              </span>
            </div>

            <h1 className="sm:text-5xl md:text-6xl lg:text-7xl leading-tight text-4xl text-white font-semibold tracking-tight animate-fade-slide-in-2">
              {title}
              <br className="hidden sm:block" />
              <span className="mt-1 block text-[0.55em] font-semibold text-white/90 sm:mt-2 sm:text-[0.5em] md:text-[0.48em]">
                <LayoutTextFlip
                  text="Servicii IT care"
                  words={["scalează", "convertesc", "vând", "performează"]}
                  className="justify-center"
                />
              </span>
            </h1>

            <TextGenerateEffect
              words={description}
              className="sm:text-lg text-base text-white/80 max-w-2xl mt-6 mx-auto"
              duration={0.35}
            />

            <div className="flex flex-col sm:flex-row sm:gap-4 mt-10 gap-3 items-center justify-center animate-fade-slide-in-4">
              <Link
                href={primaryButtonHref}
                className="inline-flex items-center gap-2 hover:bg-white/15 text-sm font-medium text-white bg-white/10 ring-white/15 ring-1 rounded-full py-3 px-5 font-sans transition-colors"
              >
                {primaryButtonText}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
              <Link
                href={secondaryButtonHref}
                className="inline-flex items-center gap-2 rounded-full bg-transparent px-5 py-3 text-sm font-medium text-white/90 hover:text-white font-sans transition-colors"
              >
                {secondaryButtonText}
              </Link>
            </div>
          </div>

          <div className="mx-auto mt-16 max-w-5xl">
            <TextGenerateEffect
              words={partnersTitle}
              className="text-sm text-white/70 text-center"
              duration={0.3}
            />
            <div className="mt-4 flex flex-nowrap items-center justify-center gap-1.5 overflow-x-auto pb-1 animate-fade-slide-in-2 sm:gap-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {partners.map((partner) => (
                <div
                  key={partner.name}
                  className="flex w-24 shrink-0 flex-col items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-2 py-2 backdrop-blur-sm transition-colors hover:border-white/20 hover:bg-white/10 sm:w-28 sm:px-2.5 sm:py-2.5"
                >
                  {partner.logo ? (
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white p-1 shadow-sm sm:h-8 sm:w-8">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={partner.logo}
                        alt=""
                        className="h-full w-full object-contain"
                      />
                    </span>
                  ) : null}
                  <span className="text-center text-[10px] font-medium tracking-wide text-white/80 sm:text-[11px]">
                    {partner.name}
                  </span>
                </div>
              ))}
            </div>

            <div className="mx-auto mt-10 max-w-3xl">
              <p className="mb-3 text-center text-sm text-white/60">
                Clienți și proiecte livrate
              </p>
              <div className="h-px bg-white/10 [mask-image:linear-gradient(to_right,transparent,black,transparent)]" />
              <LogoCloud logos={PORTFOLIO_LOGOS} className="py-5" />
              <div className="h-px bg-white/10 [mask-image:linear-gradient(to_right,transparent,black,transparent)]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResponsiveHeroBanner;
