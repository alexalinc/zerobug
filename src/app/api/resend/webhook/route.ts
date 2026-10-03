import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";

export const runtime = "nodejs";

type ResendReceivedEvent = {
  type?: string;
  created_at?: string;
  data?: {
    email_id?: string;
    from?: string;
    to?: string[];
    subject?: string;
    created_at?: string;
  };
};

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET?.trim();
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const bridgeSecret = process.env.CONVEX_BRIDGE_SECRET;

  if (!convexUrl || !bridgeSecret || bridgeSecret.length < 24) {
    console.error("Resend webhook: Convex bridge not configured");
    return NextResponse.json(
      { error: "Bridge not configured" },
      { status: 500 },
    );
  }

  const body = await req.text();
  let event: ResendReceivedEvent;

  if (webhookSecret) {
    try {
      const wh = new Webhook(webhookSecret);
      event = wh.verify(body, {
        "svix-id": req.headers.get("svix-id") ?? "",
        "svix-timestamp": req.headers.get("svix-timestamp") ?? "",
        "svix-signature": req.headers.get("svix-signature") ?? "",
      }) as ResendReceivedEvent;
    } catch (err) {
      console.error("Resend webhook signature error", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  } else {
    // Dev / until RESEND_WEBHOOK_SECRET is set — still parse JSON
    try {
      event = JSON.parse(body) as ResendReceivedEvent;
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
  }

  if (event.type !== "email.received") {
    return NextResponse.json({ received: true, ignored: true });
  }

  const emailId = event.data?.email_id;
  if (!emailId) {
    return NextResponse.json({ error: "Missing email_id" }, { status: 400 });
  }

  try {
    const client = new ConvexHttpClient(convexUrl);
    await client.action(api.leadsActions.ingestReceivedWebhook, {
      bridgeSecret,
      emailId,
      from: event.data?.from,
      to: event.data?.to,
      subject: event.data?.subject,
      createdAt: event.data?.created_at ?? event.created_at,
    });
  } catch (err) {
    console.error("Resend inbound ingest failed", err);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
