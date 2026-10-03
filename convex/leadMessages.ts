import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { requireAdminSession } from "./lib/adminGate";

const messageValidator = v.object({
  _id: v.id("leadMessages"),
  leadId: v.id("leads"),
  direction: v.union(v.literal("outbound"), v.literal("inbound")),
  subject: v.string(),
  bodyText: v.string(),
  fromEmail: v.string(),
  toEmail: v.string(),
  resendEmailId: v.optional(v.string()),
  createdAt: v.number(),
  readAt: v.optional(v.number()),
});

function normalizeEmail(raw: string): string {
  const angle = raw.match(/<([^>]+)>/);
  const email = (angle?.[1] || raw).trim().toLowerCase();
  return email.replace(/[\r\n\0\s]/g, "").slice(0, 254);
}

export const listForLead = query({
  args: {
    sessionToken: v.string(),
    leadId: v.id("leads"),
  },
  returns: v.array(messageValidator),
  handler: async (ctx, args) => {
    await requireAdminSession(args.sessionToken);
    const rows = await ctx.db
      .query("leadMessages")
      .withIndex("by_lead_created", (q) => q.eq("leadId", args.leadId))
      .order("asc")
      .take(100);
    return rows.map((m) => ({
      _id: m._id,
      leadId: m.leadId,
      direction: m.direction,
      subject: m.subject,
      bodyText: m.bodyText,
      fromEmail: m.fromEmail,
      toEmail: m.toEmail,
      resendEmailId: m.resendEmailId,
      createdAt: m.createdAt,
      readAt: m.readAt,
    }));
  },
});

export const unreadTotal = query({
  args: { sessionToken: v.string() },
  returns: v.number(),
  handler: async (ctx, args) => {
    await requireAdminSession(args.sessionToken);
    const leads = await ctx.db.query("leads").order("desc").take(200);
    return leads.reduce((sum, l) => sum + (l.unreadReplyCount ?? 0), 0);
  },
});

export const markLeadRead = mutation({
  args: {
    sessionToken: v.string(),
    leadId: v.id("leads"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdminSession(args.sessionToken);
    const now = Date.now();
    const messages = await ctx.db
      .query("leadMessages")
      .withIndex("by_lead_created", (q) => q.eq("leadId", args.leadId))
      .take(100);
    for (const m of messages) {
      if (m.direction === "inbound" && m.readAt == null) {
        await ctx.db.patch(m._id, { readAt: now });
      }
    }
    await ctx.db.patch(args.leadId, { unreadReplyCount: 0 });
    return null;
  },
});

export const getByResendInternal = internalQuery({
  args: { resendEmailId: v.string() },
  returns: v.union(v.id("leadMessages"), v.null()),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("leadMessages")
      .withIndex("by_resend", (q) => q.eq("resendEmailId", args.resendEmailId))
      .unique();
    return existing?._id ?? null;
  },
});

export const findLeadByEmailInternal = internalQuery({
  args: { email: v.string() },
  returns: v.union(v.id("leads"), v.null()),
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email);
    if (!email.includes("@")) return null;
    const matches = await ctx.db
      .query("leads")
      .withIndex("by_email", (q) => q.eq("email", email))
      .order("desc")
      .take(20);
    if (matches.length === 0) return null;
    // Prefer open leads (new/contacted), else newest
    const open = matches.find(
      (l) => l.status === "new" || l.status === "contacted",
    );
    return (open ?? matches[0])!._id;
  },
});

export const recordOutboundInternal = internalMutation({
  args: {
    leadId: v.id("leads"),
    subject: v.string(),
    bodyText: v.string(),
    fromEmail: v.string(),
    toEmail: v.string(),
    resendEmailId: v.optional(v.string()),
  },
  returns: v.id("leadMessages"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("leadMessages", {
      leadId: args.leadId,
      direction: "outbound",
      subject: args.subject,
      bodyText: args.bodyText,
      fromEmail: normalizeEmail(args.fromEmail),
      toEmail: normalizeEmail(args.toEmail),
      resendEmailId: args.resendEmailId,
      createdAt: Date.now(),
      readAt: Date.now(),
    });
  },
});

export const recordInboundInternal = internalMutation({
  args: {
    leadId: v.id("leads"),
    subject: v.string(),
    bodyText: v.string(),
    fromEmail: v.string(),
    toEmail: v.string(),
    resendEmailId: v.string(),
    createdAt: v.optional(v.number()),
  },
  returns: v.union(v.id("leadMessages"), v.null()),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("leadMessages")
      .withIndex("by_resend", (q) => q.eq("resendEmailId", args.resendEmailId))
      .unique();
    if (existing) return existing._id;

    const createdAt = args.createdAt ?? Date.now();
    const id = await ctx.db.insert("leadMessages", {
      leadId: args.leadId,
      direction: "inbound",
      subject: args.subject.slice(0, 300),
      bodyText: args.bodyText.slice(0, 12000),
      fromEmail: normalizeEmail(args.fromEmail),
      toEmail: normalizeEmail(args.toEmail),
      resendEmailId: args.resendEmailId,
      createdAt,
    });

    const lead = await ctx.db.get(args.leadId);
    if (lead) {
      await ctx.db.patch(args.leadId, {
        unreadReplyCount: (lead.unreadReplyCount ?? 0) + 1,
        lastInboundAt: createdAt,
        status: lead.status === "new" ? "contacted" : lead.status,
      });
    }
    return id;
  },
});

export const deleteForLeadInternal = internalMutation({
  args: { leadId: v.id("leads") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("leadMessages")
      .withIndex("by_lead_created", (q) => q.eq("leadId", args.leadId))
      .take(200);
    for (const row of rows) {
      await ctx.db.delete(row._id);
    }
    return null;
  },
});
