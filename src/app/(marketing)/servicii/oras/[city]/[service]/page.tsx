import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocalPage, getAllLocalStaticParams } from "@/lib/local-pages";
import { LocalServiceLandingTemplate } from "@/components/city-landing-templates";
import { pageMetadata } from "@/lib/page-seo";

type Props = { params: Promise<{ city: string; service: string }> };

export function generateStaticParams() {
  return getAllLocalStaticParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, service } = await params;
  const page = getLocalPage(city, service);
  if (!page) return { title: "Serviciu" };
  return pageMetadata({
    title: page.seoTitle,
    description: page.seoDescription,
    path: page.path,
    image: page.image,
    imageAlt: page.name,
  });
}

export default async function LocalServiceRoute({ params }: Props) {
  const { city, service } = await params;
  const page = getLocalPage(city, service);
  if (!page) notFound();
  return <LocalServiceLandingTemplate page={page} />;
}
