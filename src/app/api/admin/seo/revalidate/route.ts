import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";
import { isAdminAuthenticated } from "@/lib/admin-auth";

async function regenerateSitemap() {
  revalidatePath("/sitemap.xml");
  revalidatePath("/robots.txt");
  revalidatePath("/llms.txt");

  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (url) {
    const client = new ConvexHttpClient(url);
    await client.mutation(api.seo.markSitemapGenerated, {});
  }

  return {
    ok: true as const,
    regeneratedAt: Date.now(),
  };
}

/** Manual regenerate from Admin → SEO */
export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await regenerateSitemap();
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
    const result = await regenerateSitemap();
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
