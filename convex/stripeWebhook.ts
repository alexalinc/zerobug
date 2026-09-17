import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

export const process = action({
  args: {
    type: v.string(),
    data: v.any(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.runAction(internal.stripe.handleWebhookEvent, args);
    return null;
  },
});
