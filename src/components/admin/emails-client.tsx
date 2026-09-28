"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Inbox,
  Trash2,
  Paperclip,
  RotateCcw,
  Loader2,
  Mail,
  RefreshCw,
  Download,
  ExternalLink,
  Send,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  AdminEmailDetail,
  AdminEmailListItem,
  EmailFolder,
} from "@/lib/email/resend-admin";

export type EmailsView = "inbox" | "sent" | "trash";

type TrashEntry = AdminEmailListItem & { trashed_at: string };

const TRASH_STORAGE_KEY = "zerobug-admin-email-trash";

const FOLDER_LINKS: Array<{
  view: EmailsView;
  href: string;
  label: string;
  icon: typeof Inbox;
}> = [
  { view: "inbox", href: "/admin/emails", label: "Inbox", icon: Inbox },
  { view: "sent", href: "/admin/emails/sent", label: "Trimise", icon: Send },
  { view: "trash", href: "/admin/emails/trash", label: "Coș", icon: Trash2 },
];

function readTrash(): TrashEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(TRASH_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is TrashEntry =>
        Boolean(item) &&
        typeof item === "object" &&
        typeof (item as TrashEntry).id === "string" &&
        ((item as TrashEntry).folder === "inbox" ||
          (item as TrashEntry).folder === "sent"),
    );
  } catch {
    return [];
  }
}

function writeTrash(entries: TrashEntry[]) {
  window.localStorage.setItem(TRASH_STORAGE_KEY, JSON.stringify(entries));
}

function formatAddresses(value: string | string[] | null | undefined): string {
  if (!value) return "—";
  if (Array.isArray(value)) return value.join(", ") || "—";
  return value;
}

function formatDateShort(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function lastEventLabel(event: string | null | undefined): string | null {
  if (!event) return null;
  const map: Record<string, string> = {
    delivered: "Livrat",
    opened: "Deschis",
    clicked: "Click",
    bounced: "Bounce",
    complained: "Spam",
    delivery_delayed: "Întârziat",
    failed: "Eșuat",
    sent: "Trimis",
    queued: "În coadă",
    scheduled: "Programat",
    canceled: "Anulat",
    suppressed: "Suppressed",
  };
  return map[event] ?? event;
}

function formatAttachmentSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function attachmentUrl(
  emailId: string,
  attachmentId: string,
  folder: EmailFolder,
  disposition: "inline" | "attachment",
): string {
  const params = new URLSearchParams({ folder, disposition });
  return `/api/admin/emails/${encodeURIComponent(emailId)}/attachments/${encodeURIComponent(attachmentId)}?${params}`;
}

function apiFolder(view: EmailsView): EmailFolder | null {
  if (view === "inbox" || view === "sent") return view;
  return null;
}

export function AdminEmailsClient({ view }: { view: EmailsView }) {
  const [emails, setEmails] = useState<AdminEmailListItem[]>([]);
  const [trash, setTrash] = useState<TrashEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminEmailDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const trashIds = useMemo(() => new Set(trash.map((t) => t.id)), [trash]);

  const visibleEmails = useMemo(() => {
    if (view === "trash") {
      return [...trash].sort(
        (a, b) =>
          new Date(b.trashed_at).getTime() - new Date(a.trashed_at).getTime(),
      );
    }
    return emails.filter((email) => !trashIds.has(email.id));
  }, [view, trash, emails, trashIds]);

  const selectedMeta = useMemo(
    () => visibleEmails.find((e) => e.id === selectedId) ?? null,
    [visibleEmails, selectedId],
  );

  const loadList = useCallback(
    async (opts?: { after?: string; append?: boolean }) => {
      const folder = apiFolder(view);
      if (!folder) {
        setLoading(false);
        setHasMore(false);
        return;
      }

      if (opts?.append) setLoadingMore(true);
      else setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          folder,
          limit: "50",
        });
        if (opts?.after) params.set("after", opts.after);

        const res = await fetch(`/api/admin/emails?${params.toString()}`);
        const body = (await res.json().catch(() => ({}))) as {
          emails?: AdminEmailListItem[];
          has_more?: boolean;
          error?: string;
        };

        if (!res.ok) {
          throw new Error(body.error || "Nu am putut încărca emailurile");
        }

        const next = body.emails ?? [];
        setEmails((prev) => (opts?.append ? [...prev, ...next] : next));
        setHasMore(Boolean(body.has_more));
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Eroare la încărcare";
        setError(message);
        if (!opts?.append) setEmails([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [view],
  );

  useEffect(() => {
    setTrash(readTrash());
  }, []);

  useEffect(() => {
    setSelectedId(null);
    setDetail(null);
    setEmails([]);
    void loadList();
  }, [loadList]);

  useEffect(() => {
    if (!selectedId || !selectedMeta) {
      setDetail(null);
      return;
    }

    let cancelled = false;
    setDetailLoading(true);

    void (async () => {
      try {
        const params = new URLSearchParams({ folder: selectedMeta.folder });
        const res = await fetch(
          `/api/admin/emails/${encodeURIComponent(selectedId)}?${params}`,
        );
        const body = (await res.json().catch(() => ({}))) as {
          email?: AdminEmailDetail;
          error?: string;
        };
        if (!res.ok) {
          throw new Error(body.error || "Nu am putut încărca emailul");
        }
        if (!cancelled) setDetail(body.email ?? null);
      } catch (err) {
        if (!cancelled) {
          setDetail(null);
          setFlash(
            err instanceof Error
              ? err.message
              : "Eroare la deschiderea emailului",
          );
          setTimeout(() => setFlash(null), 4000);
        }
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedId, selectedMeta]);

  function moveToTrash(email: AdminEmailListItem) {
    const next: TrashEntry[] = [
      { ...email, trashed_at: new Date().toISOString() },
      ...trash.filter((t) => t.id !== email.id),
    ];
    writeTrash(next);
    setTrash(next);
    if (selectedId === email.id) {
      setSelectedId(null);
      setDetail(null);
    }
    setFlash("Mutat în coș");
    setTimeout(() => setFlash(null), 2500);
  }

  function restoreFromTrash(email: TrashEntry) {
    const next = trash.filter((t) => t.id !== email.id);
    writeTrash(next);
    setTrash(next);
    if (selectedId === email.id) {
      setSelectedId(null);
      setDetail(null);
    }
    setFlash("Restaurat");
    setTimeout(() => setFlash(null), 2500);
  }

  function emptyTrash() {
    writeTrash([]);
    setTrash([]);
    setSelectedId(null);
    setDetail(null);
    setFlash("Coș golit");
    setTimeout(() => setFlash(null), 2500);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Mail className="h-7 w-7 text-[color:var(--brand)]" />
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              Emails
            </h1>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-zinc-500">
            Inbox = emailuri primite (Resend Receiving). Trimise = notificări
            lead / facturi. Pentru{" "}
            <span className="text-zinc-300">contact@zerobug.ro</span>, activează
            Receiving în Resend și forward din mailbox — fără a muta MX-ul
            principal dacă ai deja mail pe domeniu.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {view !== "trash" ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2 border-white/10 bg-transparent text-zinc-300 hover:bg-white/[0.04] hover:text-white"
              onClick={() => void loadList()}
              disabled={loading}
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              Reîncarcă
            </Button>
          ) : trash.length > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2 border-red-500/30 bg-transparent text-red-300 hover:bg-red-500/10"
              onClick={emptyTrash}
            >
              <Trash2 className="h-4 w-4" />
              Golește coșul
            </Button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {FOLDER_LINKS.map(({ view: folderView, href, label, icon: Icon }) => (
          <Link
            key={folderView}
            href={href}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
              view === folderView
                ? "border-[color:var(--brand)]/40 bg-[color:var(--brand)]/10 text-[color:var(--brand)]"
                : "border-white/10 text-zinc-400 hover:bg-white/[0.04] hover:text-white",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
            {folderView === "trash" && trash.length > 0 ? (
              <span className="rounded-full bg-white/10 px-1.5 text-[11px] text-zinc-300">
                {trash.length}
              </span>
            ) : null}
          </Link>
        ))}
      </div>

      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}
      {flash ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {flash}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-zinc-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Se încarcă…
            </div>
          ) : visibleEmails.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-zinc-500">
              {view === "inbox"
                ? "Niciun email primit încă. Activează Receiving în Resend și forward către inbox-ul Resend."
                : view === "sent"
                  ? "Niciun email trimis încă prin Resend."
                  : "Coșul este gol."}
            </div>
          ) : (
            <ul className="max-h-[70vh] divide-y divide-white/[0.06] overflow-y-auto">
              {visibleEmails.map((email) => {
                const active = email.id === selectedId;
                return (
                  <li key={`${email.folder}-${email.id}`}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(email.id)}
                      className={cn(
                        "w-full px-4 py-3 text-left transition-colors hover:bg-white/[0.04]",
                        active && "bg-white/[0.06]",
                      )}
                    >
                      <p className="truncate text-sm font-medium text-white">
                        {view === "sent"
                          ? formatAddresses(email.to)
                          : email.from}
                      </p>
                      <p className="mt-0.5 truncate text-sm text-zinc-300">
                        {email.subject}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <span className="text-xs text-zinc-500">
                          {formatDateShort(email.created_at)}
                        </span>
                        {email.has_attachments ? (
                          <Paperclip className="h-3.5 w-3.5 text-zinc-500" />
                        ) : null}
                        {email.last_event ? (
                          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-zinc-300">
                            {lastEventLabel(email.last_event)}
                          </span>
                        ) : null}
                        {view === "trash" ? (
                          <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-zinc-400">
                            {email.folder === "inbox" ? "Inbox" : "Trimise"}
                          </span>
                        ) : null}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {hasMore && view !== "trash" ? (
            <div className="border-t border-white/[0.06] p-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full text-zinc-300 hover:bg-white/[0.04] hover:text-white"
                disabled={loadingMore || emails.length === 0}
                onClick={() => {
                  const last = emails[emails.length - 1];
                  if (last) void loadList({ after: last.id, append: true });
                }}
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Se încarcă…
                  </>
                ) : (
                  "Încarcă mai multe"
                )}
              </Button>
            </div>
          ) : null}
        </div>

        <div className="min-h-[320px] overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]">
          {!selectedId ? (
            <div className="flex h-full min-h-[320px] items-center justify-center px-6 text-center text-sm text-zinc-500">
              Selectează un email pentru a vedea conținutul.
            </div>
          ) : detailLoading ? (
            <div className="flex min-h-[320px] items-center justify-center gap-2 text-sm text-zinc-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Se deschide emailul…
            </div>
          ) : !detail ? (
            <div className="flex min-h-[320px] items-center justify-center px-6 text-center text-sm text-zinc-500">
              Nu am putut încărca conținutul.
            </div>
          ) : (
            <div className="flex h-full flex-col">
              <div className="space-y-3 border-b border-white/[0.06] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold leading-snug text-white">
                    {detail.subject}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {view === "trash" && selectedMeta ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="gap-1.5 border-white/10 bg-transparent text-zinc-300"
                        onClick={() =>
                          restoreFromTrash({
                            ...(selectedMeta as TrashEntry),
                            trashed_at:
                              (selectedMeta as TrashEntry).trashed_at ??
                              new Date().toISOString(),
                          })
                        }
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Restaurează
                      </Button>
                    ) : selectedMeta ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="gap-1.5 border-red-500/30 bg-transparent text-red-300"
                        onClick={() => moveToTrash(selectedMeta)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Mută în coș
                      </Button>
                    ) : null}
                  </div>
                </div>
                <dl className="grid gap-1 text-sm text-zinc-400">
                  <div>
                    <span className="font-medium text-zinc-200">De la:</span>{" "}
                    {detail.from}
                  </div>
                  <div>
                    <span className="font-medium text-zinc-200">Către:</span>{" "}
                    {formatAddresses(detail.to)}
                  </div>
                  {detail.cc?.length ? (
                    <div>
                      <span className="font-medium text-zinc-200">Cc:</span>{" "}
                      {formatAddresses(detail.cc)}
                    </div>
                  ) : null}
                  <div>
                    <span className="font-medium text-zinc-200">Data:</span>{" "}
                    {formatDateShort(detail.created_at)}
                  </div>
                  {detail.last_event ? (
                    <div>
                      <span className="font-medium text-zinc-200">Status:</span>{" "}
                      {lastEventLabel(detail.last_event)}
                    </div>
                  ) : null}
                </dl>
                {detail.attachments && detail.attachments.length > 0 ? (
                  <div className="space-y-2 pt-1">
                    <p className="text-sm font-medium text-zinc-200">
                      Atașamente ({detail.attachments.length})
                    </p>
                    <ul className="space-y-2">
                      {detail.attachments.map((file) => {
                        const name = file.filename || "atașament";
                        const sizeLabel = formatAttachmentSize(file.size);
                        const openHref = attachmentUrl(
                          detail.id,
                          file.id,
                          detail.folder,
                          "inline",
                        );
                        const downloadHref = attachmentUrl(
                          detail.id,
                          file.id,
                          detail.folder,
                          "attachment",
                        );
                        return (
                          <li
                            key={file.id}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2"
                          >
                            <div className="flex min-w-0 items-center gap-2">
                              <Paperclip className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-white">
                                  {name}
                                </p>
                                <p className="text-xs text-zinc-500">
                                  {[file.content_type, sizeLabel]
                                    .filter(Boolean)
                                    .join(" · ") || "fișier"}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              <a
                                href={openHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                  buttonVariants({
                                    variant: "outline",
                                    size: "sm",
                                  }),
                                  "h-8 gap-1.5 border-white/10 bg-transparent text-zinc-300",
                                )}
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                Deschide
                              </a>
                              <a
                                href={downloadHref}
                                download={name}
                                className={cn(
                                  buttonVariants({
                                    variant: "outline",
                                    size: "sm",
                                  }),
                                  "h-8 gap-1.5 border-white/10 bg-transparent text-zinc-300",
                                )}
                              >
                                <Download className="h-3.5 w-3.5" />
                                Descarcă
                              </a>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : null}
              </div>
              <div className="min-h-0 flex-1 overflow-auto bg-[#070709] p-4">
                {detail.html ? (
                  <iframe
                    title={detail.subject}
                    sandbox=""
                    className="min-h-[420px] w-full rounded-xl border border-white/10 bg-white"
                    srcDoc={detail.html}
                  />
                ) : detail.text ? (
                  <pre className="whitespace-pre-wrap rounded-xl border border-white/10 bg-white/[0.03] p-4 font-sans text-sm text-zinc-300">
                    {detail.text}
                  </pre>
                ) : (
                  <p className="text-sm text-zinc-500">
                    Acest email nu are conținut text/HTML disponibil.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
