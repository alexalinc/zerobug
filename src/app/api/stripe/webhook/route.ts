import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!secret || !stripeKey || !convexUrl) {
    console.error("Stripe/Convex not configured");
    return NextResponse.json(
      { error: "Stripe/Convex not configured" },
      { status: 500 },
    );
  }

  const stripe = new Stripe(stripeKey);
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    console.error("Stripe signature error", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid signature" },
      { status: 400 },
    );
  }

  try {
    const client = new ConvexHttpClient(convexUrl);
    await client.action(api.stripeWebhook.process, {
      type: event.type,
      data: event.data.object,
    });
  } catch (err) {
    console.error("Webhook processing failed", err);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
