"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FolderGit2,
  LayoutDashboard,
  Building2,
  CreditCard,
  FileText,
  Inbox,
  Settings,
  Search,
  LogOut,
  Loader2,
  Upload,
  ExternalLink,
  Check,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/firme", label: "Firme", icon: Building2 },
  { href: "/admin/abonamente", label: "Abonamente", icon: CreditCard },
  { href: "/admin/facturi", label: "Facturi", icon: FileText },
  { href: "/admin/lead-uri", label: "Cereri ofertă", icon: Inbox },
  { href: "/admin/seo", label: "SEO", icon: Search },
  { href: "/admin/setari", label: "Setări", icon: Settings },
];

type GitStatus = {
  dirty?: boolean;
  dirtyCount?: number;
  branch?: string;
  ahead?: number;
  remote?: string;
};

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const issuer = useQuery(api.settings.getIssuer, {});
  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null);
  const [pushing, setPushing] = useState(false);
  const [pushMsg, setPushMsg] = useState<string | null>(null);
  const [pushErr, setPushErr] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const githubUrl =
    issuer?.githubRepoUrl || "https://github.com/alexalinc/zerobug";

  async function refreshGitStatus() {
    try {
      const res = await fetch("/api/admin/git");
      if (!res.ok) return;
      const data = (await res.json()) as GitStatus;
      setGitStatus(data);
    } catch {
      /* ignore — local only */
    }
  }

  useEffect(() => {
    void refreshGitStatus();
  }, [pathname]);

  async function logout() {
    await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    router.push("/admin/login");
    router.refresh();
  }

  async function pushToGithub() {
    setPushing(true);
    setPushErr(null);
    setPushMsg(null);
    try {
      const res = await fetch("/api/admin/git", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Admin push ${new Date().toLocaleString("ro-RO")}`,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        message?: string;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setPushErr(data.error || "Push eșuat");
        return;
      }
      setPushMsg(data.message || "Push reușit pe GitHub");
      await refreshGitStatus();
      setTimeout(() => setPushMsg(null), 4000);
    } catch (e) {
      setPushErr(e instanceof Error ? e.message : "Push eșuat");
    } finally {
      setPushing(false);
    }
  }

  const needsPush =
    (gitStatus?.dirtyCount ?? 0) > 0 || (gitStatus?.ahead ?? 0) > 0;

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 flex">
      <aside className="relative hidden w-60 shrink-0 flex-col border-r border-white/[0.06] bg-zinc-950/80 p-4 md:flex">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(34,197,94,0.08),_transparent_55%)]" />
        <Link
          href="/admin"
          className="relative z-10 px-2 text-lg font-semibold tracking-tight"
        >
          ZeroBug{" "}
          <span className="text-[color:var(--brand)] font-medium">Admin</span>
        </Link>
        <nav className="relative z-10 mt-8 flex-1 space-y-0.5">
          {NAV.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-[color:var(--brand)]/12 text-[color:var(--brand)]"
                    : "text-zinc-400 hover:bg-white/[0.04] hover:text-white",
                )}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-80" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={logout}
          className="relative z-10 flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex gap-2 overflow-x-auto border-b border-white/[0.06] px-4 py-3 text-sm md:hidden [scrollbar-width:none]">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-full border border-white/10 px-3 py-1 text-zinc-300"
            >
              {item.label}
            </Link>
          ))}
        </header>
        <main className="relative flex-1 p-5 md:p-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_at_top,_rgba(34,197,94,0.06),_transparent_60%)]" />
          <div className="relative">{children}</div>
        </main>
      </div>

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {open ? (
          <div className="w-72 rounded-2xl border border-white/10 bg-zinc-950/95 p-3 shadow-xl backdrop-blur">
            <p className="text-sm font-medium text-white">Push pe GitHub</p>
            <p className="mt-1 text-xs text-zinc-500">
              {gitStatus?.branch
                ? `Branch ${gitStatus.branch}`
                : "Status git…"}
              {gitStatus?.dirtyCount
                ? ` · ${gitStatus.dirtyCount} fișiere nestocate`
                : null}
              {(gitStatus?.ahead ?? 0) > 0
                ? ` · ${gitStatus?.ahead} commit(uri) înainte`
                : null}
            </p>
            {pushMsg ? (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
                <Check className="h-3.5 w-3.5" />
                {pushMsg}
              </p>
            ) : null}
            {pushErr ? (
              <p className="mt-2 text-xs text-red-400 whitespace-pre-wrap">
                {pushErr}
              </p>
            ) : null}
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                disabled={pushing}
                onClick={() => void pushToGithub()}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[color:var(--brand)] px-3 py-2 text-xs font-medium text-zinc-950 disabled:opacity-60"
              >
                {pushing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
                {pushing ? "Se face push…" : "Commit + Push"}
              </button>
              <a
                href={githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-xl border border-white/10 px-3 py-2 text-zinc-300 hover:bg-white/[0.04]"
                title="Deschide repo"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => {
            setOpen((v) => !v);
            setPushErr(null);
            void refreshGitStatus();
          }}
          title="Push pe GitHub"
          className={cn(
            "relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--brand)] text-zinc-950 shadow-lg shadow-[color:var(--brand)]/25 transition-colors hover:bg-[color:var(--brand-soft)]",
          )}
        >
          <FolderGit2 className="h-5 w-5" />
          {needsPush ? (
            <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-amber-400 ring-2 ring-zinc-950" />
          ) : null}
          <span className="sr-only">Push pe GitHub</span>
        </button>
      </div>
    </div>
  );
}
