"use client";

import {
  useAdminSessionToken,
  useAdminSession,
  withAdminToken,
} from "@/components/admin-session-provider";

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
  BarChart3,
  Mail,
  Menu,
  X,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/statistici", label: "Statistici", icon: BarChart3 },
  { href: "/admin/firme", label: "Firme", icon: Building2 },
  { href: "/admin/abonamente", label: "Abonamente", icon: CreditCard },
  { href: "/admin/facturi", label: "Facturi", icon: FileText },
  { href: "/admin/lead-uri", label: "Cereri ofertă", icon: Inbox },
  { href: "/admin/emails", label: "Emails", icon: Mail },
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

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="relative z-10 flex-1 space-y-0.5 overflow-y-auto">
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
            onClick={onNavigate}
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
  );
}

function SidebarBrand({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      href="/admin"
      onClick={onNavigate}
      className="relative z-10 px-2 text-lg font-semibold tracking-tight"
    >
      ZeroBug{" "}
      <span className="font-medium text-[color:var(--brand)]">Admin</span>
    </Link>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const token = useAdminSessionToken();
  const { clear: clearAdminSession } = useAdminSession();
  const issuer = useQuery(api.settings.getIssuer, withAdminToken(token));
  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null);
  const [pushing, setPushing] = useState(false);
  const [pushMsg, setPushMsg] = useState<string | null>(null);
  const [pushErr, setPushErr] = useState<string | null>(null);
  const [gitOpen, setGitOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const githubUrl =
    issuer?.githubRepoUrl &&
    /^https:\/\/(www\.)?github\.com\//i.test(issuer.githubRepoUrl)
      ? issuer.githubRepoUrl
      : "https://github.com/alexalinc/zerobug";

  const currentNav =
    NAV.find((item) =>
      item.href === "/admin"
        ? pathname === "/admin"
        : pathname.startsWith(item.href),
    ) ?? NAV[0];

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

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileNavOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileNavOpen]);

  async function logout() {
    await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    clearAdminSession();
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

  const sidebarInner = (onNavigate?: () => void) => (
    <>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(34,197,94,0.08),_transparent_55%)]" />
      <SidebarBrand onNavigate={onNavigate} />
      <div className="relative z-10 mt-8 flex min-h-0 flex-1 flex-col">
        <NavLinks pathname={pathname} onNavigate={onNavigate} />
      </div>
      <button
        type="button"
        onClick={() => {
          onNavigate?.();
          void logout();
        }}
        className="relative z-10 mt-4 flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-white"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </>
  );

  return (
    <div className="flex min-h-dvh bg-[#070709] text-zinc-100">
      {/* Desktop sidebar */}
      <aside className="relative hidden w-60 shrink-0 flex-col border-r border-white/[0.06] bg-zinc-950/80 p-4 md:flex">
        {sidebarInner()}
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 md:hidden",
          mobileNavOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!mobileNavOpen}
      >
        <button
          type="button"
          aria-label="Închide meniul"
          onClick={() => setMobileNavOpen(false)}
          className={cn(
            "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity",
            mobileNavOpen ? "opacity-100" : "opacity-0",
          )}
        />
        <aside
          className={cn(
            "absolute inset-y-0 left-0 flex w-[min(18rem,88vw)] flex-col border-r border-white/[0.06] bg-zinc-950 p-4 shadow-2xl transition-transform duration-200 ease-out",
            mobileNavOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(34,197,94,0.08),_transparent_55%)]" />
          <div className="relative z-10 flex items-center justify-between gap-2">
            <SidebarBrand onNavigate={() => setMobileNavOpen(false)} />
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 text-zinc-300 hover:bg-white/[0.04] hover:text-white"
              aria-label="Închide"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="relative z-10 mt-6 flex min-h-0 flex-1 flex-col">
            <NavLinks
              pathname={pathname}
              onNavigate={() => setMobileNavOpen(false)}
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setMobileNavOpen(false);
              void logout();
            }}
            className="relative z-10 mt-4 flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </aside>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-white/[0.06] bg-[#070709]/90 px-3 py-3 backdrop-blur-md md:hidden">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-zinc-200 hover:bg-white/[0.04]"
            aria-label="Deschide meniul"
            aria-expanded={mobileNavOpen}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {currentNav?.label ?? "Admin"}
            </p>
            <p className="truncate text-[11px] text-zinc-500">ZeroBug Admin</p>
          </div>
        </header>

        <main className="relative flex-1 overflow-x-hidden p-4 sm:p-5 md:p-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_at_top,_rgba(34,197,94,0.06),_transparent_60%)]" />
          <div className="relative mx-auto w-full max-w-[1400px]">{children}</div>
        </main>
      </div>

      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2 sm:bottom-6 sm:right-6">
        {gitOpen ? (
          <div className="w-[min(18rem,calc(100vw-2rem))] rounded-2xl border border-white/10 bg-zinc-950/95 p-3 shadow-xl backdrop-blur">
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
              <p className="mt-2 whitespace-pre-wrap text-xs text-red-400">
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
            setGitOpen((v) => !v);
            setPushErr(null);
            void refreshGitStatus();
          }}
          title="Push pe GitHub"
          className="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--brand)] text-zinc-950 shadow-lg shadow-[color:var(--brand)]/25 transition-colors hover:bg-[color:var(--brand-soft)]"
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
