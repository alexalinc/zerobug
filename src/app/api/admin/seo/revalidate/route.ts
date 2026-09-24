import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  DEFAULT_LLMS_TXT,
  DEFAULT_ROBOTS_TXT,
  getSitemapEntries,
  getSiteUrl,
  renderLlmsTxt,
  renderRobotsTxt,
} from "@/lib/seo";

async function regenerateAllSeo() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL lipsește");
  }

  const client = new ConvexHttpClient(url);

  // Reset templates to current site defaults (categories, intents, cities, spokes)
  await client.mutation(api.seo.upsert, {
    robotsTxt: DEFAULT_ROBOTS_TXT,
    llmsTxt: DEFAULT_LLMS_TXT,
  });
  await client.mutation(api.seo.markSitemapGenerated, {});

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

/** Manual regenerate from Admin → SEO: sitemap + robots + llms from live site */
export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await regenerateAllSeo();
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

/** Weekly cron (Vercel Cron) — protect with CRON_SECRET if set */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await regenerateAllSeo();
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
