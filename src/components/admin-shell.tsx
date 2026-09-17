"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FolderGit2 } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/firme", label: "Firme" },
  { href: "/admin/abonamente", label: "Abonamente" },
  { href: "/admin/facturi", label: "Facturi" },
  { href: "/admin/lead-uri", label: "Lead-uri" },
  { href: "/admin/setari", label: "Setări" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const issuer = useQuery(api.settings.getIssuer);

  async function logout() {
    await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    router.push("/admin/login");
    router.refresh();
  }

  const githubUrl =
    issuer?.githubRepoUrl || "https://github.com/zerobug-ro/zerobug";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
      <aside className="w-56 border-r border-white/10 p-4 hidden md:flex flex-col">
        <Link href="/admin" className="font-semibold tracking-tight text-lg">
          ZeroBug Admin
        </Link>
        <nav className="mt-8 space-y-1 flex-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-md px-3 py-2 text-sm",
                pathname === item.href
                  ? "bg-cyan-300/10 text-cyan-300"
                  : "text-zinc-400 hover:text-white hover:bg-white/5",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={logout}
          className="text-left text-sm text-zinc-500 hover:text-white px-3 py-2"
        >
          Logout
        </button>
      </aside>
      <div className="flex-1 min-w-0">
        <header className="md:hidden border-b border-white/10 px-4 py-3 flex gap-3 overflow-x-auto text-sm">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="whitespace-nowrap">
              {item.label}
            </Link>
          ))}
        </header>
        <main className="p-6 md:p-8">{children}</main>
      </div>

      <a
        href={githubUrl}
        target="_blank"
        rel="noreferrer"
        title="Push / sync pe GitHub"
        className="fixed bottom-6 right-6 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-cyan-300 text-zinc-950 shadow-lg shadow-cyan-300/20 hover:bg-cyan-200 transition-colors"
      >
        <FolderGit2 className="h-6 w-6" />
        <span className="sr-only">Push pe GitHub</span>
      </a>
    </div>
  );
}
