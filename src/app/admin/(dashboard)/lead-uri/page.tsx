"use client";

import {
  useAdminSessionToken,
  withAdminToken,
} from "@/components/admin-session-provider";

import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Id } from "@convex/_generated/dataModel";
import { MAINTENANCE_PLANS } from "@/lib/services";
import { cn } from "@/lib/utils";
import {
  Building2,
  CheckCircle2,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  RefreshCw,
  Reply,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const TYPE_LABEL: Record<string, string> = {
  service_quote: "Ofertă serviciu",
  contact: "Contact",
  maintenance: "Mentenanță",
};

const ADS_STATUS_LABEL: Record<string, string> = {
  pending: "în așteptare",
  sent: "trimis",
  skipped: "sărit",
  failed: "eșuat",
};

const STATUS_STYLE: Record<"new" | "contacted" | "won" | "lost", string> = {
  new: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  contacted: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  won: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  lost: "border-zinc-500/30 bg-zinc-500/10 text-zinc-400",
};

const STATUS_ACTIONS = ["contacted", "won", "lost"] as const;

type LeadFilter =
  | "all"
  | "new"
  | "contacted"
  | "answered"
  | "won"
  | "lost";

const LEAD_FILTERS: Array<{
  id: LeadFilter;
  label: string;
  hint?: string;
}> = [
  { id: "all", label: "Toate" },
  { id: "new", label: "New" },
  { id: "contacted", label: "Contacted" },
  {
    id: "answered",
    label: "Answered",
    hint: "Clientul a răspuns la emailul nostru",
  },
  { id: "won", label: "Won" },
  { id: "lost", label: "Lost" },
];

type LeadRow = {
  _id: Id<"leads">;
  type: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  serviceCategory?: string;
  serviceName?: string;
  planKey?: string;
  complexity?: string;
  addons?: string[];
  message?: string;
  budget?: number;
  quoteDetails?: string;
  status: "new" | "contacted" | "won" | "lost";
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  googleAdsStatus?: "pending" | "sent" | "skipped" | "failed";
  googleAdsError?: string;
  googleAdsSyncedAt?: number;
  googleAdsRequestId?: string;
  googleAdsHttpStatus?: number;
  googleAdsApiResponse?: string;
  marketingConsent?: boolean;
  unreadReplyCount?: number;
  lastInboundAt?: number;
  createdAt: number;
};

function leadHasClientReply(lead: LeadRow) {
  return lead.lastInboundAt != null || (lead.unreadReplyCount ?? 0) > 0;
}

type LeadMessage = {
  _id: Id<"leadMessages">;
  leadId: Id<"leads">;
  direction: "outbound" | "inbound";
  subject: string;
  bodyText: string;
  fromEmail: string;
  toEmail: string;
  createdAt: number;
  readAt?: number;
};

function formatBudget(budget?: number) {
  if (budget == null) return null;
  return `${budget.toLocaleString("ro-RO")} lei`;
}

function planLabel(planKey?: string) {
  if (!planKey) return null;
  const plan = MAINTENANCE_PLANS.find((p) => p.id === planKey);
  return plan ? plan.name : planKey;
}

function defaultReplySubject(lead: LeadRow) {
  const tip = TYPE_LABEL[lead.type] ?? "cererea";
  return `Re: ${tip} — ZeroBug`;
}

const REPLY_SIGNATURE = `Alin - CEO ZeroBug
0773 319 554`;

function defaultReplyBody(lead: LeadRow) {
  if (lead.status !== "new") {
    return `\n${REPLY_SIGNATURE}`;
  }

  const first = lead.name.trim().split(/\s+/)[0] || "";
  return `Mulțumim pentru mesaj${first ? `, ${first}` : ""}!

Am primit cererea ta și revenim în curând cu detalii / o ofertă clară.

Dacă vrei, ne poți răspunde la acest email cu orice detalii suplimentare.

O zi bună,
${REPLY_SIGNATURE}`;
}

function StatusPill({ status }: { status: LeadRow["status"] }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize",
        STATUS_STYLE[status],
      )}
    >
      {status}
    </span>
  );
}

function TypePill({ type }: { type: string }) {
  return (
    <span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[11px] font-medium text-zinc-300">
      {TYPE_LABEL[type] ?? type}
    </span>
  );
}

function ServiceBlock({ lead }: { lead: LeadRow }) {
  return (
    <div className="space-y-1 text-sm">
      {lead.serviceCategory ? (
        <p className="text-[color:var(--brand)]">{lead.serviceCategory}</p>
      ) : null}
      {lead.serviceName ? (
        <p className="leading-relaxed text-zinc-300">{lead.serviceName}</p>
      ) : null}
      {lead.planKey ? (
        <p className="text-zinc-300">
          Plan sugerat:{" "}
          <span className="text-white">{planLabel(lead.planKey)}</span>
          {lead.complexity ? (
            <span className="text-zinc-500"> · {lead.complexity}</span>
          ) : null}
        </p>
      ) : null}
      {lead.addons && lead.addons.length > 0 ? (
        <p className="text-xs leading-relaxed text-zinc-500">
          Nevoi: {lead.addons.join(", ")}
        </p>
      ) : null}
      {lead.type === "maintenance" && lead.budget != null ? (
        <p className="font-medium text-white">
          Orientativ: {lead.budget.toLocaleString("ro-RO")} € + TVA /lună
        </p>
      ) : formatBudget(lead.budget) ? (
        <p className="font-medium text-white">
          Buget: {formatBudget(lead.budget)}
        </p>
      ) : null}
    </div>
  );
}

function GoogleAdsBlock({
  lead,
  token,
  onRetry,
}: {
  lead: LeadRow;
  token: string | null;
  onRetry: (leadId: Id<"leads">) => void;
}) {
  if (!lead.googleAdsStatus) {
    return <span className="text-zinc-600">—</span>;
  }

  const clickIds = [
    lead.gclid ? `gclid: ${lead.gclid}` : null,
    lead.gbraid ? `gbraid: ${lead.gbraid}` : null,
    lead.wbraid ? `wbraid: ${lead.wbraid}` : null,
  ].filter(Boolean);
  const canRetry =
    lead.marketingConsent !== false &&
    (lead.googleAdsStatus === "failed" || lead.googleAdsStatus === "skipped");

  return (
    <div className="space-y-1">
      <p
        className={cn(
          "text-sm",
          lead.googleAdsStatus === "sent" && "text-emerald-400",
          lead.googleAdsStatus === "failed" && "text-red-400",
          lead.googleAdsStatus === "pending" && "text-amber-300",
          lead.googleAdsStatus === "skipped" && "text-zinc-500",
        )}
      >
        {ADS_STATUS_LABEL[lead.googleAdsStatus] ?? lead.googleAdsStatus}
        {lead.googleAdsHttpStatus != null
          ? ` · HTTP ${lead.googleAdsHttpStatus}`
          : ""}
      </p>
      {clickIds.length > 0 ? (
        <p
          className="truncate text-[10px] text-zinc-500"
          title={clickIds.join("\n")}
        >
          {lead.gclid ? "gclid" : null}
          {lead.gclid && (lead.gbraid || lead.wbraid) ? " · " : null}
          {lead.gbraid ? "gbraid" : null}
          {lead.gbraid && lead.wbraid ? " · " : null}
          {lead.wbraid ? "wbraid" : null}
        </p>
      ) : (
        <p className="text-[10px] text-zinc-600">fără click ID</p>
      )}
      {lead.marketingConsent === false ? (
        <p className="text-[10px] text-zinc-600">fără consent</p>
      ) : null}
      {lead.googleAdsRequestId ? (
        <p
          className="truncate text-[10px] text-zinc-600"
          title={lead.googleAdsRequestId}
        >
          req:{" "}
          {lead.googleAdsRequestId.length > 18
            ? `${lead.googleAdsRequestId.slice(0, 14)}…`
            : lead.googleAdsRequestId}
        </p>
      ) : null}
      {lead.googleAdsError ? (
        <p
          className="line-clamp-3 text-[10px] leading-snug text-zinc-500"
          title={lead.googleAdsError}
        >
          {lead.googleAdsError}
        </p>
      ) : null}
      {lead.googleAdsApiResponse ? (
        <pre
          className="max-h-20 overflow-auto whitespace-pre-wrap break-all rounded bg-zinc-950/50 p-1 text-[9px] leading-snug text-zinc-500"
          title={lead.googleAdsApiResponse}
        >
          {lead.googleAdsApiResponse}
        </pre>
      ) : null}
      {canRetry ? (
        <Button
          size="sm"
          variant="outline"
          className="mt-1 h-7 text-xs"
          onClick={() => onRetry(lead._id)}
          disabled={!token}
        >
          Re-trimite
        </Button>
      ) : null}
    </div>
  );
}

function StatusActions({
  lead,
  token,
  onUpdate,
}: {
  lead: LeadRow;
  token: string | null;
  onUpdate: (id: Id<"leads">, status: (typeof STATUS_ACTIONS)[number]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {STATUS_ACTIONS.map((s) => (
        <Button
          key={s}
          size="sm"
          variant={lead.status === s ? "default" : "outline"}
          className={cn(
            "h-8 capitalize",
            lead.status === s && "pointer-events-none opacity-90",
          )}
          onClick={() => onUpdate(lead._id, s)}
          disabled={!token || lead.status === s}
        >
          {s}
        </Button>
      ))}
    </div>
  );
}

function LeadActions({
  onReply,
  onDelete,
  deleting,
}: {
  onReply: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        size="sm"
        className="h-8 gap-1.5"
        onClick={onReply}
      >
        <Reply className="h-3.5 w-3.5" />
        Răspunde
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-8 gap-1.5 border-red-500/30 text-red-300 hover:bg-red-500/10 hover:text-red-200"
        onClick={onDelete}
        disabled={deleting}
      >
        {deleting ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Trash2 className="h-3.5 w-3.5" />
        )}
        Șterge
      </Button>
    </div>
  );
}

function ReplyModal({
  lead,
  open,
  sending,
  error,
  subject,
  body,
  onSubject,
  onBody,
  onClose,
  onSend,
}: {
  lead: LeadRow | null;
  open: boolean;
  sending: boolean;
  error: string | null;
  subject: string;
  body: string;
  onSubject: (v: string) => void;
  onBody: (v: string) => void;
  onClose: () => void;
  onSend: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !sending) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, sending, onClose]);

  if (!open || !lead) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Închide"
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
        onClick={() => !sending && onClose()}
      />
      <div className="relative z-10 flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-3xl border border-white/10 bg-zinc-950 shadow-2xl sm:mx-4 sm:rounded-3xl">
        <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-white">Răspunde</h2>
            <p className="mt-0.5 truncate text-sm text-zinc-400">
              Către {lead.name} · {lead.email}
            </p>
          </div>
          <button
            type="button"
            onClick={() => !sending && onClose()}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 text-zinc-400 hover:bg-white/[0.04] hover:text-white"
            aria-label="Închide"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
          {lead.message ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                Mesajul lor
              </p>
              <p className="mt-1.5 max-h-28 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-zinc-400">
                {lead.message}
              </p>
            </div>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="reply-subject">Subiect</Label>
            <Input
              id="reply-subject"
              value={subject}
              onChange={(e) => onSubject(e.target.value)}
              disabled={sending}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reply-body">Mesaj</Label>
            <Textarea
              id="reply-body"
              rows={8}
              value={body}
              onChange={(e) => onBody(e.target.value)}
              disabled={sending}
              className="min-h-[160px] resize-y"
            />
          </div>

          {error ? (
            <p className="text-sm text-red-400">{error}</p>
          ) : (
            <p className="text-xs text-zinc-500">
              Se trimite din ZeroBug via Resend. După trimitere, statusul trece
              pe <span className="text-zinc-300">contacted</span> dacă era new.
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-white/[0.06] px-4 py-4 sm:flex-row sm:justify-end sm:px-5">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={sending}
            className="w-full sm:w-auto"
          >
            Anulează
          </Button>
          <Button
            type="button"
            onClick={onSend}
            disabled={sending || !subject.trim() || !body.trim()}
            className="w-full gap-2 sm:w-auto"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
            {sending ? "Se trimite…" : "Trimite răspunsul"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ReplyBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[color:var(--brand)]/40 bg-[color:var(--brand)]/15 px-2 py-0.5 text-[11px] font-semibold text-[color:var(--brand)]">
      <MessageSquare className="h-3 w-3" />
      {count === 1 ? "Răspuns nou" : `${count} răspunsuri noi`}
    </span>
  );
}

function ThreadModal({
  lead,
  token,
  open,
  onClose,
  onReply,
}: {
  lead: LeadRow | null;
  token: string | null;
  open: boolean;
  onClose: () => void;
  onReply: () => void;
}) {
  const messages = useQuery(
    api.leadMessages.listForLead,
    open && token && lead
      ? withAdminToken(token, { leadId: lead._id })
      : "skip",
  ) as LeadMessage[] | undefined;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || !lead) return null;

  const initialMessage = lead.message?.trim();

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Închide"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-zinc-950 shadow-2xl sm:mx-4 sm:rounded-3xl">
        <div className="relative border-b border-white/[0.06] px-4 py-4 sm:px-5">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(34,197,94,0.1),_transparent_60%)]" />
          <div className="relative flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[11px] font-medium text-zinc-300">
                  <MessageSquare className="h-3 w-3" />
                  Conversație
                </span>
                <TypePill type={lead.type} />
                <StatusPill status={lead.status} />
                <ReplyBadge count={lead.unreadReplyCount ?? 0} />
              </div>
              <h2 className="mt-2 truncate text-lg font-semibold text-white">
                {lead.name}
              </h2>
              <p className="mt-0.5 truncate text-sm text-zinc-400">
                {lead.email}
                {lead.phone ? ` · ${lead.phone}` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 text-zinc-400 hover:bg-white/[0.04] hover:text-white"
              aria-label="Închide"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-5">
          {initialMessage ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-3.5 py-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                Cerere inițială ·{" "}
                {new Date(lead.createdAt).toLocaleString("ro-RO")}
              </p>
              <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
                {initialMessage}
              </p>
            </div>
          ) : null}

          {messages === undefined ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-zinc-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Se încarcă conversația…
            </div>
          ) : messages.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-10 text-center">
              <MessageSquare className="mx-auto h-8 w-8 text-zinc-600" />
              <p className="mt-3 text-sm text-zinc-400">
                Niciun email în thread încă.
              </p>
              <p className="mt-1 text-xs text-zinc-600">
                După ce răspunzi sau clientul reply-uiește, mesajele apar aici.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {messages.map((m) => {
                const inbound = m.direction === "inbound";
                return (
                  <li
                    key={m._id}
                    className={cn(
                      "flex",
                      inbound ? "justify-start" : "justify-end",
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[92%] rounded-2xl px-3.5 py-3 sm:max-w-[85%]",
                        inbound
                          ? "rounded-tl-md border border-[color:var(--brand)]/30 bg-[color:var(--brand)]/10"
                          : "rounded-tr-md border border-white/10 bg-white/[0.06]",
                      )}
                    >
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p
                          className={cn(
                            "text-[11px] font-semibold uppercase tracking-wide",
                            inbound
                              ? "text-[color:var(--brand)]"
                              : "text-zinc-400",
                          )}
                        >
                          {inbound ? "Client" : "ZeroBug"}
                        </p>
                        {inbound && !m.readAt ? (
                          <span className="rounded-full bg-[color:var(--brand)]/20 px-1.5 py-0.5 text-[10px] font-medium text-[color:var(--brand)]">
                            nou
                          </span>
                        ) : null}
                        <p className="text-[11px] text-zinc-600">
                          {new Date(m.createdAt).toLocaleString("ro-RO")}
                        </p>
                      </div>
                      <p className="mt-1 text-xs font-medium text-zinc-200">
                        {m.subject}
                      </p>
                      <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
                        {m.bodyText}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-white/[0.06] px-4 py-4 sm:flex-row sm:justify-end sm:px-5">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Închide
          </Button>
          <Button
            type="button"
            onClick={onReply}
            className="w-full gap-2 sm:w-auto"
          >
            <Reply className="h-4 w-4" />
            Răspunde
          </Button>
        </div>
      </div>
    </div>
  );
}

function LeadCard({
  lead,
  token,
  deleting,
  onOpenThread,
  onUpdate,
  onRetry,
  onReply,
  onDelete,
}: {
  lead: LeadRow;
  token: string | null;
  deleting: boolean;
  onOpenThread: () => void;
  onUpdate: (id: Id<"leads">, status: (typeof STATUS_ACTIONS)[number]) => void;
  onRetry: (leadId: Id<"leads">) => void;
  onReply: () => void;
  onDelete: () => void;
}) {
  const hasService =
    Boolean(lead.serviceCategory) ||
    Boolean(lead.serviceName) ||
    Boolean(lead.planKey) ||
    lead.budget != null ||
    Boolean(lead.addons?.length);
  const unread = lead.unreadReplyCount ?? 0;

  return (
    <article
      className={cn(
        "rounded-2xl border bg-white/[0.03] p-4",
        unread > 0
          ? "border-[color:var(--brand)]/35"
          : "border-white/[0.08]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <TypePill type={lead.type} />
            <StatusPill status={lead.status} />
            <ReplyBadge count={unread} />
          </div>
          <div>
            <h2 className="truncate text-base font-semibold text-white">
              {lead.name}
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              {new Date(lead.createdAt).toLocaleString("ro-RO")}
            </p>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          className="h-8 shrink-0 gap-1.5"
          onClick={onReply}
        >
          <Reply className="h-3.5 w-3.5" />
          Răspunde
        </Button>
      </div>

      <div className="mt-4 space-y-2 text-sm">
        <a
          href={`mailto:${lead.email}`}
          className="flex items-center gap-2 break-all text-zinc-300 hover:text-white"
        >
          <Mail className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
          {lead.email}
        </a>
        {lead.phone ? (
          <a
            href={`tel:${lead.phone}`}
            className="flex items-center gap-2 text-zinc-300 hover:text-white"
          >
            <Phone className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
            {lead.phone}
          </a>
        ) : null}
        {lead.company ? (
          <p className="flex items-center gap-2 text-zinc-400">
            <Building2 className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
            {lead.company}
          </p>
        ) : null}
      </div>

      {hasService ? (
        <div className="mt-4 border-t border-white/[0.06] pt-3">
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
            Servicii / plan
          </p>
          <ServiceBlock lead={lead} />
        </div>
      ) : null}

      {lead.message ? (
        <div className="mt-4 border-t border-white/[0.06] pt-3">
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
            Mesaj
          </p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-400">
            {lead.message}
          </p>
        </div>
      ) : null}

      <div className="mt-4 border-t border-white/[0.06] pt-3">
        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
          Google Ads
        </p>
        <GoogleAdsBlock lead={lead} token={token} onRetry={onRetry} />
      </div>

      <div className="mt-4 space-y-3 border-t border-white/[0.06] pt-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 border-white/10"
            onClick={onOpenThread}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Vezi conversația
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 border-red-500/30 text-red-300 hover:bg-red-500/10 hover:text-red-200"
            onClick={onDelete}
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            Șterge
          </Button>
        </div>
        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
            Status
          </p>
          <StatusActions lead={lead} token={token} onUpdate={onUpdate} />
        </div>
      </div>
    </article>
  );
}

export default function LeaduriPage() {
  const token = useAdminSessionToken() ?? null;
  const leads = useQuery(api.leads.list, withAdminToken(token)) as
    | LeadRow[]
    | undefined;
  const updateStatus = useMutation(api.leads.updateStatus);
  const removeLead = useMutation(api.leads.remove);
  const markLeadRead = useMutation(api.leadMessages.markLeadRead);
  const replyToLead = useAction(api.leadsActions.replyToLead);
  const syncInbound = useAction(api.leadsActions.syncInboundReplies);
  const retryGoogleAds = useMutation(api.googleAds.retryGoogleAdsSync);
  const loading = leads === undefined;

  const [replyLead, setReplyLead] = useState<LeadRow | null>(null);
  const [replySubject, setReplySubject] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [replySending, setReplySending] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<Id<"leads"> | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [threadLead, setThreadLead] = useState<LeadRow | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [filter, setFilter] = useState<LeadFilter>("all");

  const filterCounts = useMemo(() => {
    const rows = leads ?? [];
    const counts: Record<LeadFilter, number> = {
      all: rows.length,
      new: 0,
      contacted: 0,
      answered: 0,
      won: 0,
      lost: 0,
    };
    for (const lead of rows) {
      if (lead.status === "new") counts.new += 1;
      if (lead.status === "contacted") counts.contacted += 1;
      if (lead.status === "won") counts.won += 1;
      if (lead.status === "lost") counts.lost += 1;
      if (leadHasClientReply(lead)) counts.answered += 1;
    }
    return counts;
  }, [leads]);

  const filteredLeads = useMemo(() => {
    const rows = leads ?? [];
    if (filter === "all") return rows;
    if (filter === "answered") return rows.filter(leadHasClientReply);
    return rows.filter((l) => l.status === filter);
  }, [leads, filter]);

  function showToast(type: "success" | "error", message: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ type, message });
    toastTimer.current = setTimeout(() => setToast(null), 4500);
  }

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!token) return;
    void syncInbound({ sessionToken: token }).catch(() => {
      /* Receiving may not be configured yet */
    });
  }, [token, syncInbound]);

  function markRead(leadId: Id<"leads">) {
    if (!token) return;
    void markLeadRead({ sessionToken: token, leadId });
  }

  function openReply(lead: LeadRow) {
    setReplyLead(lead);
    setReplySubject(defaultReplySubject(lead));
    setReplyBody(defaultReplyBody(lead));
    setReplyError(null);
    markRead(lead._id);
  }

  function openThread(lead: LeadRow) {
    setThreadLead(lead);
    markRead(lead._id);
  }

  function closeThread() {
    setThreadLead(null);
  }

  async function onSync() {
    if (!token) return;
    setSyncing(true);
    try {
      const result = await syncInbound({ sessionToken: token });
      if (!result.ok) {
        showToast(
          "error",
          result.error || "Sync eșuat — verifică Receiving în Resend",
        );
      } else {
        showToast(
          "success",
          result.imported > 0
            ? `${result.imported} răspuns(uri) importate`
            : `Nimic nou (${result.scanned} emailuri scanate)`,
        );
      }
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Sync eșuat");
    } finally {
      setSyncing(false);
    }
  }

  function closeReply() {
    if (replySending) return;
    setReplyLead(null);
    setReplyError(null);
  }

  async function sendReply() {
    if (!token || !replyLead) return;
    const recipientName = replyLead.name;
    const recipientEmail = replyLead.email;
    setReplySending(true);
    setReplyError(null);
    try {
      const result = await replyToLead({
        sessionToken: token,
        leadId: replyLead._id,
        subject: replySubject,
        body: replyBody,
      });
      if (!result.ok) {
        setReplyError(result.error || "Trimiterea a eșuat");
        showToast("error", result.error || "Emailul nu a putut fi trimis");
        return;
      }
      setReplyLead(null);
      showToast(
        "success",
        `Email trimis cu succes către ${recipientName} (${recipientEmail})`,
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Trimiterea a eșuat";
      setReplyError(message);
      showToast("error", message);
    } finally {
      setReplySending(false);
    }
  }

  function onUpdate(
    id: Id<"leads">,
    status: (typeof STATUS_ACTIONS)[number],
  ) {
    if (!token) return;
    void updateStatus({ sessionToken: token, id, status });
  }

  function onRetry(leadId: Id<"leads">) {
    if (!token) return;
    void retryGoogleAds({ sessionToken: token, leadId }).catch(
      (err: unknown) => {
        alert(err instanceof Error ? err.message : "Retry eșuat");
      },
    );
  }

  async function onDelete(lead: LeadRow) {
    if (!token) return;
    const ok = window.confirm(
      `Ștergi cererea de la ${lead.name} (${lead.email})?`,
    );
    if (!ok) return;
    setDeletingId(lead._id);
    try {
      await removeLead({ sessionToken: token, id: lead._id });
      if (replyLead?._id === lead._id) setReplyLead(null);
      showToast("success", "Cererea a fost ștearsă");
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Ștergerea a eșuat",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Cereri ofertă
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Formularele de pe site apar aici. Răspunsurile clienților pe email
            (către contact@zerobug.ro) se leagă de lead — cu badge când e ceva
            nou.
          </p>
          {!loading ? (
            <p className="mt-2 text-xs text-zinc-500">
              {filteredLeads.length}
              {filter !== "all" ? ` / ${leads.length}` : ""}{" "}
              {filteredLeads.length === 1 ? "cerere" : "cereri"}
              {filter !== "all"
                ? ` · filtru ${LEAD_FILTERS.find((f) => f.id === filter)?.label}`
                : ""}
            </p>
          ) : null}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full gap-2 sm:w-auto"
          onClick={() => void onSync()}
          disabled={syncing || !token}
        >
          <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} />
          {syncing ? "Sync…" : "Sync reply-uri"}
        </Button>
      </div>

      {!loading && leads.length > 0 ? (
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
          {LEAD_FILTERS.map((item) => {
            const active = filter === item.id;
            const count = filterCounts[item.id];
            return (
              <button
                key={item.id}
                type="button"
                title={item.hint}
                onClick={() => setFilter(item.id)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? item.id === "answered"
                      ? "border-[color:var(--brand)]/50 bg-[color:var(--brand)]/15 text-[color:var(--brand)]"
                      : "border-white/20 bg-white/10 text-white"
                    : "border-white/10 text-zinc-400 hover:border-white/20 hover:text-white",
                )}
              >
                {item.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                    active ? "bg-white/10 text-current" : "bg-white/5 text-zinc-500",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            "fixed bottom-20 left-4 right-4 z-[70] mx-auto flex max-w-md items-start gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-md sm:bottom-8 sm:left-auto sm:right-6",
            toast.type === "success"
              ? "border-emerald-500/40 bg-emerald-950/95 text-emerald-100"
              : "border-red-500/40 bg-red-950/95 text-red-100",
          )}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
          ) : (
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">
              {toast.type === "success" ? "Succes" : "Eroare"}
            </p>
            <p className="mt-0.5 text-sm leading-snug text-current/90">
              {toast.message}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="shrink-0 rounded-lg p-1 opacity-70 hover:opacity-100"
            aria-label="Închide"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-zinc-500">Se încarcă…</p>
      ) : leads.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 px-4 py-12 text-center text-sm text-zinc-500">
          Nicio cerere încă.
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 px-4 py-12 text-center text-sm text-zinc-500">
          Nicio cerere pentru filtrul selectat.
        </div>
      ) : (
        <>
          <div className="space-y-3 lg:hidden">
            {filteredLeads.map((lead) => (
              <LeadCard
                key={lead._id}
                lead={lead}
                token={token}
                deleting={deletingId === lead._id}
                onOpenThread={() => openThread(lead)}
                onUpdate={onUpdate}
                onRetry={onRetry}
                onReply={() => openReply(lead)}
                onDelete={() => void onDelete(lead)}
              />
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-2xl border border-white/10 lg:block">
            <table className="w-full table-fixed text-sm">
              <thead className="border-b border-white/10 text-left text-zinc-400">
                <tr>
                  <th className="w-[12%] p-3 font-medium">Tip</th>
                  <th className="w-[16%] p-3 font-medium">Contact</th>
                  <th className="w-[16%] p-3 font-medium">Servicii / plan</th>
                  <th className="w-[22%] p-3 font-medium">Mesaj</th>
                  <th className="w-[12%] p-3 font-medium">Status</th>
                  <th className="w-[10%] p-3 font-medium">Google Ads</th>
                  <th className="w-[12%] p-3 font-medium">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((l) => {
                  const msg = l.message?.trim() || "";
                  const msgLong = msg.length > 90 || msg.includes("\n");
                  return (
                    <tr
                      key={l._id}
                      className={cn(
                        "border-b border-white/5 align-middle",
                        (l.unreadReplyCount ?? 0) > 0 &&
                          "bg-[color:var(--brand)]/[0.04]",
                      )}
                    >
                      <td className="p-3">
                        <div className="flex flex-col items-start gap-1.5">
                          <TypePill type={l.type} />
                          <ReplyBadge count={l.unreadReplyCount ?? 0} />
                          <p className="text-[11px] text-zinc-500">
                            {new Date(l.createdAt).toLocaleDateString("ro-RO", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 gap-1.5 border-white/10 px-2 text-xs"
                            onClick={() => openThread(l)}
                          >
                            <MessageSquare className="h-3 w-3" />
                            Thread
                          </Button>
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="truncate font-medium text-white">
                          {l.name}
                        </p>
                        <a
                          href={`mailto:${l.email}`}
                          className="block truncate text-zinc-400 hover:text-white"
                          title={l.email}
                        >
                          {l.email}
                        </a>
                        {l.phone ? (
                          <a
                            href={`tel:${l.phone}`}
                            className="mt-0.5 block truncate text-zinc-500 hover:text-white"
                          >
                            {l.phone}
                          </a>
                        ) : null}
                      </td>
                      <td className="p-3">
                        <div className="line-clamp-2 text-sm">
                          <ServiceBlock lead={l} />
                        </div>
                      </td>
                      <td className="p-3">
                        {msg ? (
                          <button
                            type="button"
                            onClick={() => openThread(l)}
                            title={msg}
                            className="group w-full text-left"
                          >
                            <p className="line-clamp-2 whitespace-normal text-zinc-400 group-hover:text-zinc-200">
                              {msg.replace(/\s+/g, " ")}
                            </p>
                            {msgLong ? (
                              <span className="mt-1 inline-block text-[11px] text-[color:var(--brand)]">
                                Vezi tot
                              </span>
                            ) : null}
                          </button>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="p-3">
                        <StatusPill status={l.status} />
                        <div className="mt-2">
                          <StatusActions
                            lead={l}
                            token={token}
                            onUpdate={onUpdate}
                          />
                        </div>
                      </td>
                      <td className="p-3">
                        <GoogleAdsBlock
                          lead={l}
                          token={token}
                          onRetry={onRetry}
                        />
                      </td>
                      <td className="p-3">
                        <LeadActions
                          onReply={() => openReply(l)}
                          onDelete={() => void onDelete(l)}
                          deleting={deletingId === l._id}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <ThreadModal
        lead={threadLead}
        token={token}
        open={Boolean(threadLead)}
        onClose={closeThread}
        onReply={() => {
          if (!threadLead) return;
          const lead = threadLead;
          closeThread();
          openReply(lead);
        }}
      />

      <ReplyModal
        lead={replyLead}
        open={Boolean(replyLead)}
        sending={replySending}
        error={replyError}
        subject={replySubject}
        body={replyBody}
        onSubject={setReplySubject}
        onBody={setReplyBody}
        onClose={closeReply}
        onSend={() => void sendReply()}
      />
    </div>
  );
}
