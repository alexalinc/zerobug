import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";
import {
  DEFAULT_ROBOTS_TXT,
  getSiteUrl,
  renderRobotsTxt,
} from "@/lib/seo";

export const revalidate = 3600;

async function loadRobotsTemplate(): Promise<string> {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return DEFAULT_ROBOTS_TXT;
  try {
    const client = new ConvexHttpClient(url);
    const doc = await client.query(api.seo.get, {});
    return doc?.robotsTxt?.trim() ? doc.robotsTxt : DEFAULT_ROBOTS_TXT;
  } catch {
    return DEFAULT_ROBOTS_TXT;
  }
}

export async function GET() {
  const body = renderRobotsTxt(await loadRobotsTemplate(), getSiteUrl());
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
