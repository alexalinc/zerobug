"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import Link from "next/link";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatEur } from "@/lib/vat";

function StatCard({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: string;
  hint?: string;
  href?: string;
}) {
  const inner = (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 transition-colors hover:border-[color:var(--brand)]/30">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-zinc-500">{hint}</p> : null}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default function AdminOverviewPage() {
  const stats = useQuery(api.invoices.overviewStats);
  const loading = !stats;

  const chartData = stats?.byMonth ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Facturare, firme și venituri — ZeroBug Admin.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total facturat"
          value={loading ? "—" : formatEur(stats.totalGross)}
          hint={
            loading
              ? undefined
              : `Net ${formatEur(stats.totalNet)} · TVA ${formatEur(stats.totalVat)}`
          }
          href="/admin/facturi"
        />
        <StatCard
          label="TVA total"
          value={loading ? "—" : formatEur(stats.totalVat)}
          hint="Din facturile emise"
          href="/admin/facturi"
        />
        <StatCard
          label="MRR estimat"
          value={loading ? "—" : formatEur(stats.monthlyRecurringGross)}
          hint={
            loading
              ? undefined
              : `Net ${formatEur(stats.monthlyRecurringNet)} / lună`
          }
          href="/admin/firme"
        />
        <StatCard
          label="Firme active"
          value={loading ? "—" : String(stats.activeCompanies)}
          hint={
            loading ? undefined : `${stats.companies} total · ${stats.activeSubscriptions} abonamente`
          }
          href="/admin/firme"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Facturi"
          value={loading ? "—" : String(stats.invoices)}
          href="/admin/facturi"
        />
        <StatCard
          label="Abonamente"
          value={loading ? "—" : String(stats.activeSubscriptions)}
          href="/admin/abonamente"
        />
        <StatCard
          label="Lead-uri noi"
          value={loading ? "—" : String(stats.newLeads)}
          href="/admin/lead-uri"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
          <h2 className="text-sm font-medium text-white">
            Facturare pe lună (brut)
          </h2>
          <p className="mt-1 text-xs text-zinc-500">Ultimele 12 perioade</p>
          <div className="mt-4 h-64">
            {chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                Încă nu există facturi.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="grossFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "#71717a", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#71717a", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={48}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#18181b",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    formatter={(value) => [
                      formatEur(Number(value ?? 0)),
                      "Brut",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="gross"
                    stroke="#22c55e"
                    fill="url(#grossFill)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
          <h2 className="text-sm font-medium text-white">TVA pe lună</h2>
          <p className="mt-1 text-xs text-zinc-500">21% din facturile emise</p>
          <div className="mt-4 h-64">
            {chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                Încă nu există facturi.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "#71717a", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#71717a", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={48}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#18181b",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    formatter={(value) => [
                      formatEur(Number(value ?? 0)),
                      "TVA",
                    ]}
                  />
                  <Bar
                    dataKey="vat"
                    fill="#4ade80"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={36}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
