"use client";

import React, { useState } from "react";
import Link from "next/link";

interface NavLink {
  label: string;
  href: string;
  isActive?: boolean;
}

interface Partner {
  name: string;
}

interface ResponsiveHeroBannerProps {
  logoText?: string;
  backgroundImageUrl?: string;
  navLinks?: NavLink[];
  ctaButtonText?: string;
  ctaButtonHref?: string;
  badgeText?: string;
  badgeLabel?: string;
  title?: string;
  titleLine2?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonHref?: string;
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
  partnersTitle?: string;
  partners?: Partner[];
}

const ResponsiveHeroBanner: React.FC<ResponsiveHeroBannerProps> = ({
  logoText = "ZeroBug",
  backgroundImageUrl = "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=2400&q=80",
  navLinks = [
    { label: "Servicii", href: "/servicii", isActive: true },
    { label: "AI 2026", href: "/servicii/ai-automatizari" },
    { label: "Mentenanță", href: "/mentenanta" },
    { label: "Despre", href: "/despre" },
    { label: "Contact", href: "/contact" },
  ],
  ctaButtonText = "Solicită ofertă",
  ctaButtonHref = "/contact",
  badgeLabel = "2026",
  badgeText = "Focus: AI & automatizări pentru firme",
  title = "ZeroBug",
  titleLine2 = "Servicii IT care scalează",
  description = "Web, e-commerce, API, mobile, AI și Google Ads — de la landing pages la platforme custom, cu mentenanță și facturare lunară.",
  primaryButtonText = "Vezi serviciile",
  primaryButtonHref = "/servicii",
  secondaryButtonText = "Pachete mentenanță",
  secondaryButtonHref = "/mentenanta",
  partnersTitle = "Stack-uri și platforme cu care lucrăm zilnic",
  partners = [
    { name: "Next.js" },
    { name: "WordPress" },
    { name: "Shopify" },
    { name: "WooCommerce" },
    { name: "Flutter" },
  ],
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <section className="w-full isolate min-h-screen overflow-hidden relative">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={backgroundImageUrl}
        alt=""
        className="w-full h-full object-cover absolute top-0 right-0 bottom-0 left-0"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-zinc-950" />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-black/30" />

      <header className="z-10 xl:top-4 relative">
        <div className="mx-6">
          <div className="flex items-center justify-between pt-4">
            <Link
              href="/"
              className="inline-flex items-center text-xl font-semibold tracking-tight text-white font-sans"
            >
              {logoText}
            </Link>

            <nav className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-full bg-white/5 px-1 py-1 ring-1 ring-white/10 backdrop-blur">
                {navLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.href}
                    className={`px-3 py-2 text-sm font-medium hover:text-white font-sans transition-colors ${
                      link.isActive ? "text-white/90" : "text-white/80"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href={ctaButtonHref}
                  className="ml-1 inline-flex items-center gap-2 rounded-full bg-cyan-300 px-3.5 py-2 text-sm font-medium text-neutral-900 hover:bg-cyan-200 font-sans transition-colors"
                >
                  {ctaButtonText}
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
                    <path d="M7 7h10v10" />
                    <path d="M7 17 17 7" />
                  </svg>
                </Link>
              </div>
            </nav>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 backdrop-blur"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle menu"
            >
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
                className="h-5 w-5 text-white/90"
              >
                <path d="M4 5h16" />
                <path d="M4 12h16" />
                <path d="M4 19h16" />
              </svg>
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden mt-3 rounded-2xl bg-black/70 ring-1 ring-white/10 backdrop-blur p-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-white/90 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href={ctaButtonHref}
                className="block text-cyan-300 py-2 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {ctaButtonText}
              </Link>
            </div>
          )}
        </div>
      </header>

      <div className="z-10 relative">
        <div className="sm:pt-28 md:pt-32 lg:pt-40 max-w-7xl mx-auto pt-28 px-6 pb-16">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-3 rounded-full bg-white/10 px-2.5 py-2 ring-1 ring-white/15 backdrop-blur animate-fade-slide-in-1">
              <span className="inline-flex items-center text-xs font-medium text-neutral-900 bg-cyan-300 rounded-full py-0.5 px-2 font-sans">
                {badgeLabel}
              </span>
              <span className="text-sm font-medium text-white/90 font-sans">
                {badgeText}
              </span>
            </div>

            <h1 className="sm:text-5xl md:text-6xl lg:text-7xl leading-tight text-4xl text-white tracking-tight font-[family-name:var(--font-serif)] font-normal animate-fade-slide-in-2">
              {title}
              <br className="hidden sm:block" />
              <span className="text-white/85">{titleLine2}</span>
            </h1>

            <p className="sm:text-lg animate-fade-slide-in-3 text-base text-white/80 max-w-2xl mt-6 mx-auto">
              {description}
            </p>

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

          <div className="mx-auto mt-20 max-w-5xl">
            <p className="animate-fade-slide-in-1 text-sm text-white/70 text-center">
              {partnersTitle}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 animate-fade-slide-in-2 text-white/80 mt-6 items-center justify-items-center gap-4">
              {partners.map((partner) => (
                <span
                  key={partner.name}
                  className="text-sm font-medium tracking-wide opacity-80 hover:opacity-100 transition-opacity"
                >
                  {partner.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResponsiveHeroBanner;
