"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import Link from "next/link";

export default function AdminOverviewPage() {
  const stats = useQuery(api.invoices.overviewStats);

  const cards = [
    { label: "Firme", value: stats?.companies ?? "—", href: "/admin/firme" },
    {
      label: "Abonamente active",
      value: stats?.activeSubscriptions ?? "—",
      href: "/admin/abonamente",
    },
    { label: "Facturi", value: stats?.invoices ?? "—", href: "/admin/facturi" },
    {
      label: "Lead-uri noi",
      value: stats?.newLeads ?? "—",
      href: "/admin/lead-uri",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-[family-name:var(--font-serif)]">Overview</h1>
      <p className="mt-2 text-zinc-400 text-sm">
        Panou ZeroBug — firme, abonamente și facturare.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="border border-white/10 p-5 hover:border-cyan-300/40 transition-colors"
          >
            <p className="text-sm text-zinc-400">{c.label}</p>
            <p className="mt-2 text-3xl tracking-tight">{c.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
