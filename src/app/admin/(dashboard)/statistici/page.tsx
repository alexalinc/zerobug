"use client";

import { useState } from "react";
import {
  useAdminSessionToken,
  withAdminToken,
} from "@/components/admin-session-provider";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TRAFFIC_SOURCE_LABELS, type TrafficSource } from "@/lib/traffic-source";
import { cn } from "@/lib/utils";

const SOURCE_COLORS: Record<TrafficSource, string> = {
  google_ads: "#22c55e",
  organic: "#38bdf8",
  ai: "#a78bfa",
  social: "#f472b6",
  referral: "#fbbf24",
  direct: "#94a3b8",
  email: "#fb923c",
  other: "#71717a",
};

const FORM_LABEL: Record<string, string> = {
  contact: "Contact",
  service_quote: "Ofertă serviciu",
  maintenance: "Mentenanță",
};

const COMPLEXITY_LABEL = {
  ok: { text: "OK", className: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
  attention: {
    text: "Atenție",
    className: "text-amber-300 border-amber-500/30 bg-amber-500/10",
  },
  too_complex: {
    text: "Prea complexă",
    className: "text-red-300 border-red-500/30 bg-red-500/10",
  },
} as const;

function formatDuration(ms: number) {
  if (!ms) return "—";
  if (ms < 1000) return `${ms} ms`;
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return rem ? `${m}m ${rem}s` : `${m}m`;
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-zinc-500">{hint}</p> : null}
    </div>
  );
}

export default function StatisticiPage() {
  const token = useAdminSessionToken();
  const [days, setDays] = useState(30);
  const [now] = useState(() => Date.now());
  const data = useQuery(
    api.analytics.dashboard,
    withAdminToken(token, { days, now }),
  );
  const loading = !data;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Statistici
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            Trafic pe surse (Google Ads, organic, AI, social…), pagini vizitate,
            unde ies vizitatorii și funnel-ul cererilor de ofertă — unde se
            blochează și dacă formularul pare prea complex.
          </p>
        </div>
        <div className="inline-flex w-fit gap-1 rounded-xl border border-white/10 p-1">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDays(d)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                days === d
                  ? "bg-[color:var(--brand)]/20 text-[color:var(--brand)]"
                  : "text-zinc-400 hover:text-white",
              )}
            >
              {d} zile
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Sesiuni"
          value={loading ? "—" : String(data.totals.sessions)}
          hint={
            loading
              ? undefined
              : `${data.totals.uniqueVisitors} vizitatori unici`
          }
        />
        <StatCard
          label="Pageviews"
          value={loading ? "—" : String(data.totals.pageviews)}
        />
        <StatCard
          label="Au început cererea"
          value={loading ? "—" : String(data.totals.quoteStarts)}
          hint={
            loading
              ? undefined
              : `${data.totals.startRate}% din sesiuni`
          }
        />
        <StatCard
          label="Au trimis cererea"
          value={loading ? "—" : String(data.totals.quoteSubmits)}
          hint={
            loading
              ? undefined
              : `${data.totals.submitRate}% din cei care au început · ${data.totals.abandonRate}% abandon`
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
          <h2 className="text-sm font-medium text-white">Trafic pe sursă</h2>
          <p className="mt-1 text-xs text-zinc-500">
            De unde vin vizitatorii în perioada selectată
          </p>
          <div className="mt-4 h-64">
            {loading || data.bySource.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                {loading ? "Se încarcă…" : "Încă nu există date de trafic."}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.bySource.map((r) => ({
                    ...r,
                    label: TRAFFIC_SOURCE_LABELS[r.source],
                  }))}
                >
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "#71717a", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tick={{ fill: "#71717a", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={36}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#18181b",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="sessions" name="Sesiuni" radius={[6, 6, 0, 0]} maxBarSize={40}>
                    {data.bySource.map((r) => (
                      <Cell key={r.source} fill={SOURCE_COLORS[r.source]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
          <h2 className="text-sm font-medium text-white">Trend zilnic</h2>
          <p className="mt-1 text-xs text-zinc-500">Sesiuni și cereri începute</p>
          <div className="mt-4 h-64">
            {loading || data.daily.every((d) => d.sessions === 0) ? (
              <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                {loading ? "Se încarcă…" : "Încă nu există date."}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.daily}>
                  <defs>
                    <linearGradient id="sessFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: "#71717a", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: string) => v.slice(5)}
                  />
                  <YAxis
                    tick={{ fill: "#71717a", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={36}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#18181b",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sessions"
                    name="Sesiuni"
                    stroke="#22c55e"
                    fill="url(#sessFill)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="quoteStarts"
                    name="Cereri începute"
                    stroke="#38bdf8"
                    fill="transparent"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
        <h2 className="text-sm font-medium text-white">Surse — detalii</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 text-left text-zinc-400">
              <tr>
                <th className="p-2 font-medium">Sursă</th>
                <th className="p-2 font-medium">Sesiuni</th>
                <th className="p-2 font-medium">Pageviews</th>
                <th className="p-2 font-medium">Start ofertă</th>
                <th className="p-2 font-medium">Trimis</th>
                <th className="p-2 font-medium">Top ieșiri</th>
              </tr>
            </thead>
            <tbody>
              {(data?.bySource ?? []).map((r) => (
                <tr key={r.source} className="border-b border-white/[0.04]">
                  <td className="p-2">
                    <span
                      className="mr-2 inline-block h-2 w-2 rounded-full"
                      style={{ background: SOURCE_COLORS[r.source] }}
                    />
                    {TRAFFIC_SOURCE_LABELS[r.source]}
                  </td>
                  <td className="p-2 tabular-nums">{r.sessions}</td>
                  <td className="p-2 tabular-nums">{r.pageviews}</td>
                  <td className="p-2 tabular-nums">{r.quoteStarts}</td>
                  <td className="p-2 tabular-nums">{r.quoteSubmits}</td>
                  <td className="p-2 text-xs text-zinc-400">
                    {r.exitTop.length === 0
                      ? "—"
                      : r.exitTop
                          .slice(0, 3)
                          .map((e) => `${e.path} (${e.count})`)
                          .join(" · ")}
                  </td>
                </tr>
              ))}
              {!loading && (data?.bySource.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-zinc-500">
                    Nicio sesiune încă. Datele apar după ce vizitatorii acceptă
                    cookie-urile de analytics.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
          <h2 className="text-sm font-medium text-white">Pagini populare</h2>
          <p className="mt-1 text-xs text-zinc-500">Unde stau vizitatorii</p>
          <ul className="mt-4 space-y-2">
            {(data?.topPages ?? []).map((p) => (
              <li
                key={p.path}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="truncate text-zinc-200">{p.path}</span>
                <span className="shrink-0 text-xs text-zinc-500">
                  {p.views} views · {p.exits} exit ·{" "}
                  {formatDuration(p.avgDurationMs)}
                </span>
              </li>
            ))}
            {!loading && (data?.topPages.length ?? 0) === 0 ? (
              <li className="text-sm text-zinc-500">Nicio pagină încă.</li>
            ) : null}
          </ul>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
          <h2 className="text-sm font-medium text-white">Unde ies</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Ultima pagină din sesiune (exit)
          </p>
          <ul className="mt-4 space-y-2">
            {(data?.exitPages ?? []).map((p) => (
              <li
                key={p.path}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="truncate text-zinc-200">{p.path}</span>
                <span className="shrink-0 tabular-nums text-zinc-400">
                  {p.exits}
                </span>
              </li>
            ))}
            {!loading && (data?.exitPages.length ?? 0) === 0 ? (
              <li className="text-sm text-zinc-500">Nicio ieșire încă.</li>
            ) : null}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
        <h2 className="text-sm font-medium text-white">Flux între pagini</h2>
        <p className="mt-1 text-xs text-zinc-500">
          De pe ce pagină pe ce pagină merg cel mai des
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 text-left text-zinc-400">
              <tr>
                <th className="p-2 font-medium">De pe</th>
                <th className="p-2 font-medium">Spre</th>
                <th className="p-2 font-medium">Count</th>
              </tr>
            </thead>
            <tbody>
              {(data?.flows ?? []).map((f) => (
                <tr
                  key={`${f.from}->${f.to}`}
                  className="border-b border-white/[0.04]"
                >
                  <td className="p-2 text-zinc-300">{f.from}</td>
                  <td className="p-2 text-zinc-300">{f.to}</td>
                  <td className="p-2 tabular-nums">{f.count}</td>
                </tr>
              ))}
              {!loading && (data?.flows.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-zinc-500">
                    Nu există încă navigări între pagini.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold tracking-tight text-white">
          Funnel cerere ofertă
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Unde încep, unde se blochează și dacă formularul e prea greu
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {(data?.quoteFunnel ?? []).map((funnel) => {
            const badge = COMPLEXITY_LABEL[funnel.complexity.score];
            return (
              <div
                key={funnel.formType}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-medium text-white">
                      {FORM_LABEL[funnel.formType] ?? funnel.formType}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500">
                      {funnel.views} văzut · {funnel.starts} început ·{" "}
                      {funnel.submits} trimis · {funnel.abandons} abandon
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
                      badge.className,
                    )}
                  >
                    {badge.text}
                  </span>
                </div>

                <ol className="mt-4 space-y-2">
                  {funnel.steps.map((s) => (
                    <li key={s.id} className="text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-zinc-300">{s.label}</span>
                        <span className="tabular-nums text-zinc-400">
                          {s.count}
                          {s.dropOffPct > 0 ? (
                            <span className="ml-1 text-xs text-red-400/90">
                              −{s.dropOffPct}%
                            </span>
                          ) : null}
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full bg-[color:var(--brand)]/70"
                          style={{
                            width: `${Math.min(
                              100,
                              funnel.steps[0]?.count
                                ? (s.count / Math.max(funnel.steps[0].count, 1)) *
                                    100
                                : 0,
                            )}%`,
                          }}
                        />
                      </div>
                    </li>
                  ))}
                </ol>

                <div className="mt-4 space-y-1 border-t border-white/10 pt-3 text-xs text-zinc-500">
                  <p>
                    Timp mediu până la trimitere:{" "}
                    <span className="text-zinc-300">
                      {formatDuration(funnel.avgTimeToSubmitMs)}
                    </span>
                  </p>
                  <p>
                    Timp mediu până la abandon:{" "}
                    <span className="text-zinc-300">
                      {formatDuration(funnel.avgTimeToAbandonMs)}
                    </span>
                  </p>
                </div>

                {funnel.stuckAt.length > 0 ? (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-zinc-400">
                      Se blochează la
                    </p>
                    <ul className="mt-1 space-y-1 text-xs text-zinc-500">
                      {funnel.stuckAt.map((s) => (
                        <li key={s.step}>
                          {s.label}:{" "}
                          <span className="text-zinc-300">
                            {s.abandons} abandonuri
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {funnel.complexity.reasons.length > 0 ? (
                  <ul className="mt-3 space-y-1.5 border-t border-white/10 pt-3 text-xs leading-relaxed text-zinc-400">
                    {funnel.complexity.reasons.map((r) => (
                      <li key={r}>• {r}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
