import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { requireBridgeSecret } from "./lib/adminGate";

const ALLOWED_STRIPE_EVENTS = new Set([
  "customer.subscription.created",
  "customer.subscription.updated",
  "invoice.paid",
]);

/**
 * Bridge from Next.js Stripe webhook → Convex.
 * Uses CONVEX_BRIDGE_SECRET (NOT the Stripe signing secret) so a leaked
 * webhook signing key alone cannot forge Convex billing mutations.
 */
export const process = action({
  args: {
    type: v.string(),
    data: v.any(),
    bridgeSecret: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    requireBridgeSecret(args.bridgeSecret, "CONVEX_BRIDGE_SECRET");
    if (!ALLOWED_STRIPE_EVENTS.has(args.type)) {
      return null;
    }
    if (args.data == null || typeof args.data !== "object") {
      throw new Error("Unauthorized");
    }
    await ctx.runAction(internal.stripe.handleWebhookEvent, {
      type: args.type,
      data: args.data,
    });
    return null;
  },
});
