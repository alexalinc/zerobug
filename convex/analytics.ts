import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { requireAdminSession } from "./lib/adminGate";

const sourceValidator = v.union(
  v.literal("google_ads"),
  v.literal("organic"),
  v.literal("ai"),
  v.literal("social"),
  v.literal("referral"),
  v.literal("direct"),
  v.literal("email"),
  v.literal("other"),
);

const formTypeValidator = v.union(
  v.literal("contact"),
  v.literal("service_quote"),
  v.literal("maintenance"),
);

const quoteEventValidator = v.union(
  v.literal("view"),
  v.literal("start"),
  v.literal("step"),
  v.literal("field"),
  v.literal("abandon"),
  v.literal("submit"),
);

const MAX_EVENTS_PER_VISITOR_PER_HOUR = 200;
const MAX_PAGEVIEWS_QUERY = 4000;
const MAX_SESSIONS_QUERY = 3000;
const MAX_QUOTE_EVENTS_QUERY = 4000;

function clampStr(value: string | undefined, max: number): string | undefined {
  if (!value) return undefined;
  return value
    .replace(/[\0\r\n\u2028\u2029]/g, " ")
    .trim()
    .slice(0, max);
}

function normalizePath(path: string): string {
  const cleaned = clampStr(path, 300) || "/";
  if (cleaned.startsWith("/admin")) return "";
  if (cleaned.length > 1 && cleaned.endsWith("/")) {
    return cleaned.slice(0, -1);
  }
  return cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
}

async function rateLimitVisitor(
  ctx: MutationCtx,
  visitorId: string,
): Promise<boolean> {
  const hourAgo = Date.now() - 60 * 60 * 1000;
  const recent = await ctx.db
    .query("analyticsPageviews")
    .withIndex("by_entered", (q) => q.gte("enteredAt", hourAgo))
    .take(MAX_EVENTS_PER_VISITOR_PER_HOUR + 50);
  const forVisitor = recent.filter((r) => r.visitorId === visitorId);
  return forVisitor.length < MAX_EVENTS_PER_VISITOR_PER_HOUR;
}

export const startOrResumeSession = mutation({
  args: {
    visitorId: v.string(),
    sessionLocalId: v.string(),
    landingPath: v.string(),
    referrer: v.optional(v.string()),
    referrerHost: v.optional(v.string()),
    utmSource: v.optional(v.string()),
    utmMedium: v.optional(v.string()),
    utmCampaign: v.optional(v.string()),
    source: sourceValidator,
    existingSessionId: v.optional(v.id("analyticsSessions")),
  },
  returns: v.id("analyticsSessions"),
  handler: async (ctx, args) => {
    const visitorId = clampStr(args.visitorId, 80);
    if (!visitorId || visitorId.length < 8) {
      throw new Error("Invalid visitor");
    }
    const landingPath = normalizePath(args.landingPath);
    if (!landingPath) throw new Error("Invalid path");

    const ok = await rateLimitVisitor(ctx, visitorId);
    if (!ok) throw new Error("Rate limited");

    if (args.existingSessionId) {
      const existing = await ctx.db.get(args.existingSessionId);
      if (existing && existing.visitorId === visitorId) {
        await ctx.db.patch(args.existingSessionId, {
          lastSeenAt: Date.now(),
        });
        return args.existingSessionId;
      }
    }

    // Reuse recent open session for same visitor (30 min)
    const halfHourAgo = Date.now() - 30 * 60 * 1000;
    const recent = await ctx.db
      .query("analyticsSessions")
      .withIndex("by_visitor", (q) => q.eq("visitorId", visitorId))
      .order("desc")
      .take(5);
    const resumable = recent.find((s) => s.lastSeenAt >= halfHourAgo);
    if (resumable) {
      await ctx.db.patch(resumable._id, { lastSeenAt: Date.now() });
      return resumable._id;
    }

    return await ctx.db.insert("analyticsSessions", {
      visitorId,
      landingPath,
      referrer: clampStr(args.referrer, 500),
      referrerHost: clampStr(args.referrerHost, 200),
      utmSource: clampStr(args.utmSource, 100),
      utmMedium: clampStr(args.utmMedium, 100),
      utmCampaign: clampStr(args.utmCampaign, 150),
      source: args.source,
      startedAt: Date.now(),
      lastSeenAt: Date.now(),
      exitPath: landingPath,
      pageCount: 0,
      quoteStarted: false,
      quoteSubmitted: false,
    });
  },
});

export const trackPageview = mutation({
  args: {
    visitorId: v.string(),
    sessionId: v.id("analyticsSessions"),
    path: v.string(),
    title: v.optional(v.string()),
    previousPath: v.optional(v.string()),
    source: sourceValidator,
    previousPageviewId: v.optional(v.id("analyticsPageviews")),
  },
  returns: v.object({
    pageviewId: v.id("analyticsPageviews"),
  }),
  handler: async (ctx, args) => {
    const visitorId = clampStr(args.visitorId, 80);
    if (!visitorId) throw new Error("Invalid visitor");
    const path = normalizePath(args.path);
    if (!path) throw new Error("Invalid path");

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.visitorId !== visitorId) {
      throw new Error("Invalid session");
    }

    const ok = await rateLimitVisitor(ctx, visitorId);
    if (!ok) throw new Error("Rate limited");

    const now = Date.now();

    if (args.previousPageviewId) {
      const prev = await ctx.db.get(args.previousPageviewId);
      if (prev && prev.sessionId === args.sessionId && !prev.leftAt) {
        await ctx.db.patch(args.previousPageviewId, {
          leftAt: now,
          durationMs: Math.max(0, now - prev.enteredAt),
          isExit: false,
        });
      }
    }

    const pageviewId = await ctx.db.insert("analyticsPageviews", {
      sessionId: args.sessionId,
      visitorId,
      path,
      title: clampStr(args.title, 200),
      previousPath: args.previousPath
        ? normalizePath(args.previousPath) || undefined
        : undefined,
      source: args.source,
      enteredAt: now,
      isExit: true,
    });

    await ctx.db.patch(args.sessionId, {
      lastSeenAt: now,
      exitPath: path,
      pageCount: session.pageCount + 1,
    });

    return { pageviewId };
  },
});

export const leavePageview = mutation({
  args: {
    visitorId: v.string(),
    pageviewId: v.id("analyticsPageviews"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const visitorId = clampStr(args.visitorId, 80);
    if (!visitorId) return null;
    const pv = await ctx.db.get(args.pageviewId);
    if (!pv || pv.visitorId !== visitorId || pv.leftAt) return null;
    const now = Date.now();
    await ctx.db.patch(args.pageviewId, {
      leftAt: now,
      durationMs: Math.max(0, now - pv.enteredAt),
      isExit: true,
    });
    await ctx.db.patch(pv.sessionId, {
      lastSeenAt: now,
      exitPath: pv.path,
    });
    return null;
  },
});

export const trackQuoteEvent = mutation({
  args: {
    visitorId: v.string(),
    sessionId: v.id("analyticsSessions"),
    formType: formTypeValidator,
    event: quoteEventValidator,
    step: v.optional(v.string()),
    stepLabel: v.optional(v.string()),
    field: v.optional(v.string()),
    path: v.string(),
    source: sourceValidator,
    durationMs: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const visitorId = clampStr(args.visitorId, 80);
    if (!visitorId) throw new Error("Invalid visitor");
    const path = normalizePath(args.path);
    if (!path) throw new Error("Invalid path");

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.visitorId !== visitorId) {
      throw new Error("Invalid session");
    }

    const now = Date.now();
    await ctx.db.insert("analyticsQuoteEvents", {
      sessionId: args.sessionId,
      visitorId,
      formType: args.formType,
      event: args.event,
      step: clampStr(args.step, 60),
      stepLabel: clampStr(args.stepLabel, 120),
      field: clampStr(args.field, 80),
      path,
      source: args.source,
      durationMs:
        args.durationMs != null &&
        args.durationMs >= 0 &&
        args.durationMs < 1000 * 60 * 60 * 6
          ? Math.floor(args.durationMs)
          : undefined,
      createdAt: now,
    });

    const patch: Partial<Doc<"analyticsSessions">> = {
      lastSeenAt: now,
      quoteFormType: args.formType,
    };

    if (args.event === "start" || args.event === "step" || args.event === "field") {
      patch.quoteStarted = true;
      patch.quoteAbandoned = session.quoteSubmitted ? false : true;
      if (args.step) patch.quoteLastStep = clampStr(args.step, 60);
    }
    if (args.event === "view" && args.step) {
      patch.quoteLastStep = clampStr(args.step, 60);
    }
    if (args.event === "abandon") {
      patch.quoteStarted = true;
      patch.quoteAbandoned = !session.quoteSubmitted;
      if (args.step) patch.quoteLastStep = clampStr(args.step, 60);
    }
    if (args.event === "submit") {
      patch.quoteStarted = true;
      patch.quoteSubmitted = true;
      patch.quoteAbandoned = false;
      if (args.step) patch.quoteLastStep = clampStr(args.step, 60);
    }

    await ctx.db.patch(args.sessionId, patch);
    return null;
  },
});

type SourceKey =
  | "google_ads"
  | "organic"
  | "ai"
  | "social"
  | "referral"
  | "direct"
  | "email"
  | "other";

function emptySourceCounts(): Record<SourceKey, number> {
  return {
    google_ads: 0,
    organic: 0,
    ai: 0,
    social: 0,
    referral: 0,
    direct: 0,
    email: 0,
    other: 0,
  };
}

function pct(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.round((part / whole) * 1000) / 10;
}

const FORM_STEPS: Record<
  "contact" | "service_quote" | "maintenance",
  { id: string; label: string }[]
> = {
  contact: [
    { id: "view", label: "Văzut formular" },
    { id: "start", label: "Început completare" },
    { id: "contact", label: "Date contact" },
    { id: "submit", label: "Trimis" },
  ],
  service_quote: [
    { id: "view", label: "Văzut formular" },
    { id: "services", label: "Alegere servicii" },
    { id: "budget", label: "Buget" },
    { id: "contact", label: "Date contact" },
    { id: "submit", label: "Trimis" },
  ],
  maintenance: [
    { id: "view", label: "Văzut formular" },
    { id: "1", label: "Început completare" },
    { id: "submit", label: "Trimis" },
  ],
};

export const dashboard = query({
  args: {
    sessionToken: v.string(),
    days: v.optional(v.number()),
    /** Client clock — avoid Date.now() inside queries (breaks caching). */
    now: v.number(),
  },
  returns: v.object({
    days: v.number(),
    from: v.number(),
    to: v.number(),
    totals: v.object({
      sessions: v.number(),
      pageviews: v.number(),
      uniqueVisitors: v.number(),
      quoteViews: v.number(),
      quoteStarts: v.number(),
      quoteSubmits: v.number(),
      quoteAbandons: v.number(),
      startRate: v.number(),
      submitRate: v.number(),
      abandonRate: v.number(),
    }),
    bySource: v.array(
      v.object({
        source: sourceValidator,
        sessions: v.number(),
        pageviews: v.number(),
        quoteStarts: v.number(),
        quoteSubmits: v.number(),
        exitTop: v.array(
          v.object({ path: v.string(), count: v.number() }),
        ),
      }),
    ),
    topPages: v.array(
      v.object({
        path: v.string(),
        views: v.number(),
        exits: v.number(),
        avgDurationMs: v.number(),
      }),
    ),
    exitPages: v.array(
      v.object({ path: v.string(), exits: v.number() }),
    ),
    flows: v.array(
      v.object({
        from: v.string(),
        to: v.string(),
        count: v.number(),
      }),
    ),
    quoteFunnel: v.array(
      v.object({
        formType: formTypeValidator,
        steps: v.array(
          v.object({
            id: v.string(),
            label: v.string(),
            count: v.number(),
            dropOffPct: v.number(),
          }),
        ),
        views: v.number(),
        starts: v.number(),
        submits: v.number(),
        abandons: v.number(),
        avgTimeToSubmitMs: v.number(),
        avgTimeToAbandonMs: v.number(),
        complexity: v.object({
          score: v.union(
            v.literal("ok"),
            v.literal("attention"),
            v.literal("too_complex"),
          ),
          reasons: v.array(v.string()),
        }),
        stuckAt: v.array(
          v.object({
            step: v.string(),
            label: v.string(),
            abandons: v.number(),
          }),
        ),
      }),
    ),
    daily: v.array(
      v.object({
        day: v.string(),
        sessions: v.number(),
        pageviews: v.number(),
        quoteStarts: v.number(),
        quoteSubmits: v.number(),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    await requireAdminSession(args.sessionToken);
    const days = Math.min(90, Math.max(1, Math.floor(args.days ?? 30)));
    const to =
      typeof args.now === "number" &&
      args.now > 0 &&
      args.now < 4102444800000
        ? args.now
        : 0;
    if (!to) throw new Error("Invalid now");
    const from = to - days * 24 * 60 * 60 * 1000;

    const sessions = await ctx.db
      .query("analyticsSessions")
      .withIndex("by_started", (q) => q.gte("startedAt", from))
      .take(MAX_SESSIONS_QUERY);

    const pageviews = await ctx.db
      .query("analyticsPageviews")
      .withIndex("by_entered", (q) => q.gte("enteredAt", from))
      .take(MAX_PAGEVIEWS_QUERY);

    const quoteEvents = await ctx.db
      .query("analyticsQuoteEvents")
      .withIndex("by_created", (q) => q.gte("createdAt", from))
      .take(MAX_QUOTE_EVENTS_QUERY);

    const uniqueVisitors = new Set(sessions.map((s) => s.visitorId)).size;

    const quoteViews = quoteEvents.filter((e) => e.event === "view").length;
    const quoteStarts = quoteEvents.filter((e) => e.event === "start").length;
    const quoteSubmits = quoteEvents.filter((e) => e.event === "submit").length;
    const quoteAbandons = quoteEvents.filter(
      (e) => e.event === "abandon",
    ).length;

    const sourceSessions = emptySourceCounts();
    const sourcePageviews = emptySourceCounts();
    const sourceStarts = emptySourceCounts();
    const sourceSubmits = emptySourceCounts();
    const sourceExits = new Map<SourceKey, Map<string, number>>();

    for (const s of sessions) {
      sourceSessions[s.source] += 1;
      if (s.exitPath) {
        let m = sourceExits.get(s.source);
        if (!m) {
          m = new Map();
          sourceExits.set(s.source, m);
        }
        m.set(s.exitPath, (m.get(s.exitPath) ?? 0) + 1);
      }
      if (s.quoteStarted) sourceStarts[s.source] += 1;
      if (s.quoteSubmitted) sourceSubmits[s.source] += 1;
    }
    for (const pv of pageviews) {
      sourcePageviews[pv.source] += 1;
    }

    const bySource = (
      Object.keys(sourceSessions) as SourceKey[]
    )
      .map((source) => {
        const exits = sourceExits.get(source);
        const exitTop = exits
          ? [...exits.entries()]
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([path, count]) => ({ path, count }))
          : [];
        return {
          source,
          sessions: sourceSessions[source],
          pageviews: sourcePageviews[source],
          quoteStarts: sourceStarts[source],
          quoteSubmits: sourceSubmits[source],
          exitTop,
        };
      })
      .filter((r) => r.sessions > 0 || r.pageviews > 0)
      .sort((a, b) => b.sessions - a.sessions);

    const pageAgg = new Map<
      string,
      { views: number; exits: number; durationSum: number; durationN: number }
    >();
    for (const pv of pageviews) {
      const cur = pageAgg.get(pv.path) ?? {
        views: 0,
        exits: 0,
        durationSum: 0,
        durationN: 0,
      };
      cur.views += 1;
      if (pv.isExit) cur.exits += 1;
      if (pv.durationMs != null) {
        cur.durationSum += pv.durationMs;
        cur.durationN += 1;
      }
      pageAgg.set(pv.path, cur);
    }

    const topPages = [...pageAgg.entries()]
      .map(([path, a]) => ({
        path,
        views: a.views,
        exits: a.exits,
        avgDurationMs:
          a.durationN > 0 ? Math.round(a.durationSum / a.durationN) : 0,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 15);

    const exitCount = new Map<string, number>();
    for (const s of sessions) {
      if (!s.exitPath) continue;
      exitCount.set(s.exitPath, (exitCount.get(s.exitPath) ?? 0) + 1);
    }
    const exitPages = [...exitCount.entries()]
      .map(([path, exits]) => ({ path, exits }))
      .sort((a, b) => b.exits - a.exits)
      .slice(0, 12);

    const flowMap = new Map<string, number>();
    for (const pv of pageviews) {
      if (!pv.previousPath || pv.previousPath === pv.path) continue;
      const key = `${pv.previousPath}\0${pv.path}`;
      flowMap.set(key, (flowMap.get(key) ?? 0) + 1);
    }
    const flows = [...flowMap.entries()]
      .map(([key, count]) => {
        const [fromPath, toPath] = key.split("\0");
        return { from: fromPath!, to: toPath!, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    const formTypes = ["contact", "service_quote", "maintenance"] as const;
    const quoteFunnel = formTypes.map((formType) => {
      const events = quoteEvents.filter((e) => e.formType === formType);
      const stepDefs = FORM_STEPS[formType];
      const reached = new Map<string, Set<string>>();

      for (const step of stepDefs) {
        reached.set(step.id, new Set());
      }

      for (const e of events) {
        if (e.event === "view") {
          reached.get("view")?.add(e.sessionId);
        } else if (e.event === "start") {
          reached.get("start")?.add(e.sessionId);
          if (formType === "service_quote") {
            reached.get("services")?.add(e.sessionId);
          }
          if (formType === "maintenance" && e.step) {
            reached.get(e.step)?.add(e.sessionId);
          }
        } else if (e.event === "step" && e.step) {
          reached.get(e.step)?.add(e.sessionId);
          if (formType === "contact" && e.step === "contact") {
            reached.get("start")?.add(e.sessionId);
          }
        } else if (e.event === "field" && e.step) {
          reached.get(e.step)?.add(e.sessionId);
          reached.get("start")?.add(e.sessionId);
        } else if (e.event === "submit") {
          reached.get("submit")?.add(e.sessionId);
          // Completing implies all prior steps
          for (const s of stepDefs) {
            if (s.id !== "submit") reached.get(s.id)?.add(e.sessionId);
          }
        }
      }

      const steps = stepDefs.map((s, i) => {
        const count = reached.get(s.id)?.size ?? 0;
        const prev = i === 0 ? count : (reached.get(stepDefs[i - 1]!.id)?.size ?? 0);
        const dropOffPct = i === 0 ? 0 : pct(Math.max(0, prev - count), prev);
        return { id: s.id, label: s.label, count, dropOffPct };
      });

      const views = reached.get("view")?.size ?? 0;
      const starts =
        (reached.get("start")?.size ?? 0) ||
        (reached.get("services")?.size ?? 0) ||
        (reached.get("1")?.size ?? 0);
      const submits = reached.get("submit")?.size ?? 0;
      const abandons = events.filter((e) => e.event === "abandon").length;

      const submitTimes = events
        .filter((e) => e.event === "submit" && e.durationMs != null)
        .map((e) => e.durationMs!);
      const abandonTimes = events
        .filter((e) => e.event === "abandon" && e.durationMs != null)
        .map((e) => e.durationMs!);

      const avg = (arr: number[]) =>
        arr.length === 0
          ? 0
          : Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);

      // Stuck: last step before abandon
      const stuckMap = new Map<string, number>();
      const abandonBySession = new Map<string, Doc<"analyticsQuoteEvents">>();
      for (const e of events) {
        if (e.event !== "abandon") continue;
        const prev = abandonBySession.get(e.sessionId);
        if (!prev || e.createdAt > prev.createdAt) {
          abandonBySession.set(e.sessionId, e);
        }
      }
      for (const e of abandonBySession.values()) {
        const step = e.step || "unknown";
        stuckMap.set(step, (stuckMap.get(step) ?? 0) + 1);
      }
      const stuckAt = [...stuckMap.entries()]
        .map(([step, abandonsN]) => ({
          step,
          label:
            stepDefs.find((s) => s.id === step)?.label ??
            (step === "unknown" ? "Necunoscut" : step),
          abandons: abandonsN,
        }))
        .sort((a, b) => b.abandons - a.abandons)
        .slice(0, 6);

      const reasons: string[] = [];
      const startToSubmit = pct(submits, Math.max(starts, 1));

      // Mid-funnel drop: max drop between consecutive steps (excluding first)
      let maxDrop = 0;
      let maxDropLabel = "";
      for (let i = 1; i < steps.length; i++) {
        if (steps[i]!.dropOffPct > maxDrop) {
          maxDrop = steps[i]!.dropOffPct;
          maxDropLabel = steps[i]!.label;
        }
      }

      if (starts >= 5 && startToSubmit < 25) {
        reasons.push(
          `Doar ${startToSubmit}% din cei care încep trimit cererea — conversie slabă.`,
        );
      }
      if (maxDrop >= 40 && starts >= 5) {
        reasons.push(
          `Cădere mare la „${maxDropLabel}” (${maxDrop}% drop-off).`,
        );
      }
      if (
        formType === "service_quote" &&
        starts >= 5 &&
        (reached.get("contact")?.size ?? 0) < starts * 0.45
      ) {
        reasons.push(
          "Mulți aleg servicii / buget dar nu ajung la datele de contact.",
        );
      }
      if (avg(abandonTimes) > 0 && avg(abandonTimes) < 45_000 && starts >= 5) {
        reasons.push(
          "Abandon rapid (< 45s) — primul pas poate părea prea greu sau neclar.",
        );
      }
      if (
        avg(submitTimes) > 8 * 60_000 &&
        submits >= 3
      ) {
        reasons.push(
          `Timp mediu până la trimitere ~${Math.round(avg(submitTimes) / 60000)} min — formular lung.`,
        );
      }

      let score: "ok" | "attention" | "too_complex" = "ok";
      if (reasons.length >= 2 || (starts >= 8 && startToSubmit < 20)) {
        score = "too_complex";
      } else if (reasons.length === 1 || (starts >= 5 && startToSubmit < 35)) {
        score = "attention";
      }
      if (starts < 3 && views < 5) {
        score = "ok";
        if (reasons.length === 0) {
          reasons.push("Prea puține date încă pentru un verdict de complexitate.");
        }
      }

      return {
        formType,
        steps,
        views,
        starts,
        submits,
        abandons,
        avgTimeToSubmitMs: avg(submitTimes),
        avgTimeToAbandonMs: avg(abandonTimes),
        complexity: { score, reasons },
        stuckAt,
      };
    });

    // Daily series
    const dailyMap = new Map<
      string,
      {
        sessions: number;
        pageviews: number;
        quoteStarts: number;
        quoteSubmits: number;
      }
    >();
    const dayKey = (ts: number) => {
      const d = new Date(ts);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    };
    for (let i = 0; i < days; i++) {
      const ts = from + i * 24 * 60 * 60 * 1000;
      dailyMap.set(dayKey(ts), {
        sessions: 0,
        pageviews: 0,
        quoteStarts: 0,
        quoteSubmits: 0,
      });
    }
    // Ensure today exists
    dailyMap.set(dayKey(to), dailyMap.get(dayKey(to)) ?? {
      sessions: 0,
      pageviews: 0,
      quoteStarts: 0,
      quoteSubmits: 0,
    });

    for (const s of sessions) {
      const row = dailyMap.get(dayKey(s.startedAt));
      if (row) row.sessions += 1;
    }
    for (const pv of pageviews) {
      const row = dailyMap.get(dayKey(pv.enteredAt));
      if (row) row.pageviews += 1;
    }
    for (const e of quoteEvents) {
      const row = dailyMap.get(dayKey(e.createdAt));
      if (!row) continue;
      if (e.event === "start") row.quoteStarts += 1;
      if (e.event === "submit") row.quoteSubmits += 1;
    }

    const daily = [...dailyMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, row]) => ({ day, ...row }));

    return {
      days,
      from,
      to,
      totals: {
        sessions: sessions.length,
        pageviews: pageviews.length,
        uniqueVisitors,
        quoteViews,
        quoteStarts,
        quoteSubmits,
        quoteAbandons,
        startRate: pct(quoteStarts, Math.max(sessions.length, 1)),
        submitRate: pct(quoteSubmits, Math.max(quoteStarts, 1)),
        abandonRate: pct(quoteAbandons, Math.max(quoteStarts, 1)),
      },
      bySource,
      topPages,
      exitPages,
      flows,
      quoteFunnel,
      daily,
    };
  },
});
