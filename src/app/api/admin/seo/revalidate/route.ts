import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";
import {
  ADMIN_SESSION_COOKIE,
  isAdminAuthenticated,
} from "@/lib/admin-auth";
import {
  DEFAULT_LLMS_TXT,
  DEFAULT_ROBOTS_TXT,
  getSitemapEntries,
  getSiteUrl,
  renderLlmsTxt,
  renderRobotsTxt,
} from "@/lib/seo";
import { cookies } from "next/headers";

function revalidateSeoPaths() {
  revalidatePath("/sitemap.xml");
  revalidatePath("/robots.txt");
  revalidatePath("/llms.txt");
  revalidatePath("/servicii");
  revalidatePath("/servicii/oras");
}

function seoResult() {
  const siteUrl = getSiteUrl();
  const entries = getSitemapEntries();
  return {
    ok: true as const,
    regeneratedAt: Date.now(),
    urlCount: entries.length,
    robotsTxt: DEFAULT_ROBOTS_TXT,
    llmsTxt: DEFAULT_LLMS_TXT,
    robotsPreview: renderRobotsTxt(DEFAULT_ROBOTS_TXT, siteUrl),
    llmsPreview: renderLlmsTxt(DEFAULT_LLMS_TXT, siteUrl),
  };
}

/** Manual regenerate from Admin → SEO */
export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const jar = await cookies();
  const sessionToken = jar.get(ADMIN_SESSION_COOKIE)?.value;
  if (!sessionToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_CONVEX_URL lipsește" },
      { status: 500 },
    );
  }

  try {
    const client = new ConvexHttpClient(url);
    await client.mutation(api.seo.upsert, {
      sessionToken,
      robotsTxt: DEFAULT_ROBOTS_TXT,
      llmsTxt: DEFAULT_LLMS_TXT,
    });
    await client.mutation(api.seo.markSitemapGenerated, { sessionToken });
    revalidateSeoPaths();
    return NextResponse.json(seoResult());
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Regenerarea a eșuat",
      },
      { status: 500 },
    );
  }
}

/** Weekly cron (Vercel Cron) — always requires CRON_SECRET */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 24) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 500 },
    );
  }
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_CONVEX_URL lipsește" },
      { status: 500 },
    );
  }

  try {
    const client = new ConvexHttpClient(url);
    // Fixed templates only — no caller-controlled SEO body
    await client.mutation(api.seo.resetDefaultsFromCron, {
      bridgeSecret: secret,
    });
    revalidateSeoPaths();
    return NextResponse.json(seoResult());
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Regenerarea a eșuat",
      },
      { status: 500 },
    );
  }
}
