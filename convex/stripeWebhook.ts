import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { requireBridgeSecret } from "./lib/adminGate";

/**
 * Bridge from Next.js Stripe webhook → Convex.
 * Requires STRIPE_WEBHOOK_SECRET so the public Convex action cannot be forged.
 */
export const process = action({
  args: {
    type: v.string(),
    data: v.any(),
    bridgeSecret: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    requireBridgeSecret(args.bridgeSecret, "STRIPE_WEBHOOK_SECRET");
    await ctx.runAction(internal.stripe.handleWebhookEvent, {
      type: args.type,
      data: args.data,
    });
    return null;
  },
});
