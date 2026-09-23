"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  DEFAULT_LLMS_TXT,
  DEFAULT_ROBOTS_TXT,
  getSitemapEntries,
  getSiteUrl,
  renderLlmsTxt,
  renderRobotsTxt,
} from "@/lib/seo";
import { ExternalLink, RefreshCw } from "lucide-react";

export default function SeoAdminPage() {
  const seo = useQuery(api.seo.get);
  const upsert = useMutation(api.seo.upsert);
  const seed = useMutation(api.seo.seedDefaults);

  const [robotsTxt, setRobotsTxt] = useState(DEFAULT_ROBOTS_TXT);
  const [llmsTxt, setLlmsTxt] = useState(DEFAULT_LLMS_TXT);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const siteUrl = useMemo(() => {
    if (typeof window !== "undefined") {
      return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
        window.location.origin;
    }
    return getSiteUrl();
  }, []);

  const entries = useMemo(() => getSitemapEntries(), []);

  useEffect(() => {
    void seed({}).catch(() => undefined);
  }, [seed]);

  useEffect(() => {
    if (seo) {
      setRobotsTxt(seo.robotsTxt || DEFAULT_ROBOTS_TXT);
      setLlmsTxt(seo.llmsTxt || DEFAULT_LLMS_TXT);
    }
  }, [seo]);

  const robotsPreview = renderRobotsTxt(robotsTxt, siteUrl);
  const llmsPreview = renderLlmsTxt(llmsTxt, siteUrl);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await upsert({ robotsTxt, llmsTxt });
      setSaved(true);
      setMessage("robots.txt și llms.txt salvate.");
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Salvarea a eșuat");
    } finally {
      setSaving(false);
    }
  }

  async function onRegenerate() {
    setRegenerating(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/seo/revalidate", { method: "POST" });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Regenerarea a eșuat");
      }
      setMessage("Sitemap regenerat (cache invalidat).");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Regenerarea a eșuat");
    } finally {
      setRegenerating(false);
    }
  }

  const lastGen = seo?.sitemapLastGeneratedAt
    ? new Date(seo.sitemapLastGeneratedAt).toLocaleString("ro-RO")
    : "Încă nu a fost regenerat manual";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">SEO</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Sitemap (regenerare săptămânală), robots.txt și llms.txt pentru
            crawler-e și AI.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={regenerating}
          onClick={() => void onRegenerate()}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${regenerating ? "animate-spin" : ""}`}
          />
          {regenerating ? "Se regenerează…" : "Regenerează sitemap"}
        </Button>
      </div>

      {message ? (
        <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {error}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <SeoLinkCard
          title="sitemap.xml"
          href={`${siteUrl}/sitemap.xml`}
          hint={`${entries.length} URL-uri · weekly cron`}
        />
        <SeoLinkCard
          title="robots.txt"
          href={`${siteUrl}/robots.txt`}
          hint="Editabil mai jos"
        />
        <SeoLinkCard
          title="llms.txt"
          href={`${siteUrl}/llms.txt`}
          hint="Pentru agenți AI"
        />
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-white">Sitemap</p>
            <p className="mt-1 text-xs text-zinc-500">
              Ultima regenerare: {lastGen}. Se regenerează automat în fiecare
              luni 03:00 UTC (Vercel Cron) și la fiecare 7 zile prin cache.
            </p>
          </div>
        </div>
        <div className="max-h-56 overflow-auto rounded-xl border border-white/10 bg-zinc-950/60 p-3 font-mono text-[11px] text-zinc-400">
          {entries.map((e) => (
            <p key={e.path}>
              {siteUrl}
              {e.path === "/" ? "" : e.path}{" "}
              <span className="text-zinc-600">
                · {e.changeFrequency} · p{e.priority}
              </span>
            </p>
          ))}
        </div>
      </div>

      <form onSubmit={onSave} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
            <Label>robots.txt</Label>
            <p className="text-[11px] text-zinc-500">
              Folosește {"{{SITE_URL}}"} — se înlocuiește automat.
            </p>
            <textarea
              value={robotsTxt}
              onChange={(e) => setRobotsTxt(e.target.value)}
              rows={12}
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 font-mono text-xs text-zinc-200 outline-none focus:border-[color:var(--brand)]/40"
            />
            <p className="text-[11px] font-medium text-zinc-500">Preview</p>
            <pre className="max-h-40 overflow-auto rounded-xl border border-white/10 bg-zinc-950/80 p-3 text-[11px] text-zinc-400 whitespace-pre-wrap">
              {robotsPreview}
            </pre>
          </div>

          <div className="space-y-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
            <Label>llms.txt</Label>
            <p className="text-[11px] text-zinc-500">
              Placeholders: {"{{SITE_URL}}"}, {"{{SERVICE_LINKS}}"},{" "}
              {"{{SERVICE_SPOKE_LINKS}}"}.
            </p>
            <textarea
              value={llmsTxt}
              onChange={(e) => setLlmsTxt(e.target.value)}
              rows={12}
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 font-mono text-xs text-zinc-200 outline-none focus:border-[color:var(--brand)]/40"
            />
            <p className="text-[11px] font-medium text-zinc-500">Preview</p>
            <pre className="max-h-40 overflow-auto rounded-xl border border-white/10 bg-zinc-950/80 p-3 text-[11px] text-zinc-400 whitespace-pre-wrap">
              {llmsPreview}
            </pre>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? "Se salvează…" : "Salvează robots + llms"}
          </Button>
          {saved ? (
            <span className="text-sm text-emerald-400">Salvat.</span>
          ) : null}
        </div>
      </form>
    </div>
  );
}

function SeoLinkCard({
  title,
  href,
  hint,
}: {
  title: string;
  href: string;
  hint: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 transition-colors hover:border-[color:var(--brand)]/30"
    >
      <p className="flex items-center gap-2 text-sm font-medium text-white">
        {title}
        <ExternalLink className="h-3.5 w-3.5 text-zinc-500" />
      </p>
      <p className="mt-1 text-xs text-zinc-500">{hint}</p>
    </a>
  );
}
