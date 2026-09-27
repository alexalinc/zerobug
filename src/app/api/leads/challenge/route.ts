import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/lib/admin-auth";
import { issueLeadFormToken } from "@/lib/lead-form-token";
import { persistentConsumeChallenge } from "@/lib/persistent-rate-limit";

export const runtime = "nodejs";

/**
 * Issues a short-lived form token required by Convex `leads:create`.
 * Rate-limited per IP via Convex (works across serverless instances).
 */
export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = await persistentConsumeChallenge(ip);
  if (!limit.ok) {
    return NextResponse.json(
      {
        error: "Prea multe cereri. Încearcă din nou mai târziu.",
        retryAfterSec: limit.retryAfterSec,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(limit.retryAfterSec ?? 60),
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const token = await issueLeadFormToken();
  return NextResponse.json(
    { token },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
