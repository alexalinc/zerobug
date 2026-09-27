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

async function regenerateAllSeo(auth: {
  sessionToken?: string;
  bridgeSecret?: string;
}) {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL lipsește");
  }

  const client = new ConvexHttpClient(url);

  await client.mutation(api.seo.upsert, {
    sessionToken: auth.sessionToken,
    bridgeSecret: auth.bridgeSecret,
    robotsTxt: DEFAULT_ROBOTS_TXT,
    llmsTxt: DEFAULT_LLMS_TXT,
  });
  await client.mutation(api.seo.markSitemapGenerated, {
    sessionToken: auth.sessionToken,
    bridgeSecret: auth.bridgeSecret,
  });

  revalidatePath("/sitemap.xml");
  revalidatePath("/robots.txt");
  revalidatePath("/llms.txt");
  revalidatePath("/servicii");
  revalidatePath("/servicii/oras");

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

  try {
    const result = await regenerateAllSeo({ sessionToken });
    return NextResponse.json(result);
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
  if (!secret || secret.length < 16) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 500 },
    );
  }
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await regenerateAllSeo({ bridgeSecret: secret });
    return NextResponse.json(result);
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
