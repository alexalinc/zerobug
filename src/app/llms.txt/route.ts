import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";
import {
  DEFAULT_LLMS_TXT,
  getSiteUrl,
  renderLlmsTxt,
} from "@/lib/seo";

export const revalidate = 3600;

async function loadLlmsTemplate(): Promise<string> {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return DEFAULT_LLMS_TXT;
  try {
    const client = new ConvexHttpClient(url);
    const doc = await client.query(api.seo.get, {});
    return doc?.llmsTxt?.trim() ? doc.llmsTxt : DEFAULT_LLMS_TXT;
  } catch {
    return DEFAULT_LLMS_TXT;
  }
}

export async function GET() {
  const body = renderLlmsTxt(await loadLlmsTemplate(), getSiteUrl());
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
