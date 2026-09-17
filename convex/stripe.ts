"use node";

import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import Stripe from "stripe";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(key);
}

export const createCheckoutSession = action({
  args: {
    planKey: v.string(),
    companyName: v.string(),
    email: v.string(),
    cui: v.optional(v.string()),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    successUrl: v.string(),
    cancelUrl: v.string(),
  },
  returns: v.object({ url: v.union(v.string(), v.null()) }),
  handler: async (ctx, args) => {
    const plan = await ctx.runQuery(internal.subscriptions.getPlanByKey, {
      planKey: args.planKey,
    });
    if (!plan) throw new Error("Plan invalid");

    const stripe = getStripe();
    let priceId = plan.stripePriceId as string | undefined;

    if (!priceId) {
      const product = await stripe.products.create({
        name: `ZeroBug Mentenanță — ${plan.name}`,
        metadata: { planKey: args.planKey },
      });
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(plan.priceNet * 1.21 * 100),
        currency: "eur",
        recurring: { interval: "month" },
        tax_behavior: "inclusive",
        metadata: { planKey: args.planKey },
      });
      priceId = price.id;
      // Note: stripePriceId update requires mutation - schedule via upsert in webhook metadata
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: args.email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: args.successUrl,
      cancel_url: args.cancelUrl,
      metadata: {
        planKey: args.planKey,
        companyName: args.companyName,
        cui: args.cui ?? "",
        address: args.address ?? "",
        phone: args.phone ?? "",
      },
      subscription_data: {
        metadata: {
          planKey: args.planKey,
          companyName: args.companyName,
          cui: args.cui ?? "",
          address: args.address ?? "",
          phone: args.phone ?? "",
        },
      },
    });

    return { url: session.url };
  },
});

export const handleWebhookEvent = internalAction({
  args: {
    type: v.string(),
    data: v.any(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (
      args.type === "customer.subscription.created" ||
      args.type === "customer.subscription.updated" ||
      args.type === "invoice.paid"
    ) {
      const stripe = getStripe();

      if (args.type === "invoice.paid") {
        const invoice = args.data as {
          id: string;
          subscription?: string | null;
          customer_email?: string | null;
          customer?: string | null;
        };
        if (!invoice.subscription || typeof invoice.subscription !== "string") {
          return null;
        }
        const sub = await stripe.subscriptions.retrieve(invoice.subscription);
        const meta = sub.metadata || {};
        const planKey = meta.planKey || "starter";
        const status =
          sub.status === "active" || sub.status === "trialing"
            ? sub.status === "trialing"
              ? ("trialing" as const)
              : ("active" as const)
            : sub.status === "past_due"
              ? ("past_due" as const)
              : ("canceled" as const);

        const subAny = sub as unknown as {
          current_period_start?: number;
          current_period_end?: number;
          customer: string;
          id: string;
        };

        const result = await ctx.runMutation(
          internal.subscriptions.upsertFromStripe,
          {
            companyName: meta.companyName || "Client ZeroBug",
            email:
              invoice.customer_email ||
              (typeof sub.customer === "string" ? "" : "") ||
              "client@example.com",
            cui: meta.cui || undefined,
            address: meta.address || undefined,
            phone: meta.phone || undefined,
            planKey,
            stripeCustomerId:
              typeof sub.customer === "string" ? sub.customer : "",
            stripeSubscriptionId: sub.id,
            status: status === "canceled" ? "active" : status,
            currentPeriodStart: subAny.current_period_start
              ? subAny.current_period_start * 1000
              : undefined,
            currentPeriodEnd: subAny.current_period_end
              ? subAny.current_period_end * 1000
              : undefined,
          },
        );

        const plan = await ctx.runQuery(internal.subscriptions.getPlanByKey, {
          planKey,
        });
        if (plan) {
          await ctx.runAction(
            internal.invoicesBilling.generateForSubscription,
            {
              companyId: result.companyId,
              subscriptionId: result.subscriptionId,
              planName: plan.name,
              priceNet: plan.priceNet,
              stripeInvoiceId: invoice.id,
            },
          );
        }
        return null;
      }

      const sub = args.data as {
        id: string;
        customer: string;
        status: string;
        metadata?: Record<string, string>;
        current_period_start?: number;
        current_period_end?: number;
      };
      const meta = sub.metadata || {};
      const planKey = meta.planKey || "starter";
      let email = "client@example.com";
      try {
        const customer = await stripe.customers.retrieve(sub.customer);
        if (!customer.deleted && customer.email) email = customer.email;
      } catch {
        /* ignore */
      }

      const mapped =
        sub.status === "active"
          ? ("active" as const)
          : sub.status === "trialing"
            ? ("trialing" as const)
            : sub.status === "past_due"
              ? ("past_due" as const)
              : ("canceled" as const);

      await ctx.runMutation(internal.subscriptions.upsertFromStripe, {
        companyName: meta.companyName || "Client ZeroBug",
        email,
        cui: meta.cui || undefined,
        address: meta.address || undefined,
        phone: meta.phone || undefined,
        planKey,
        stripeCustomerId: sub.customer,
        stripeSubscriptionId: sub.id,
        status: mapped,
        currentPeriodStart: sub.current_period_start
          ? sub.current_period_start * 1000
          : undefined,
        currentPeriodEnd: sub.current_period_end
          ? sub.current_period_end * 1000
          : undefined,
      });
    }
    return null;
  },
});
