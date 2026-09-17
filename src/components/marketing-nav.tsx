"use client";

import Link from "next/link";
import { useState } from "react";

export function MarketingNav() {
  const [open, setOpen] = useState(false);
  const links = [
    { href: "/servicii", label: "Servicii" },
    { href: "/servicii/ai-automatizari", label: "AI" },
    { href: "/mentenanta", label: "Mentenanță" },
    { href: "/despre", label: "Despre" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight text-white">
          ZeroBug
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-300">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-white">
              {l.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="rounded-full bg-cyan-300 text-zinc-950 px-3.5 py-1.5 font-medium hover:bg-cyan-200"
          >
            Ofertă
          </Link>
        </nav>
        <button
          className="md:hidden text-white"
          onClick={() => setOpen(!open)}
          aria-label="Meniu"
        >
          ☰
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-white/10 px-6 py-3 space-y-2 bg-zinc-950">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block text-zinc-300 py-1"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
