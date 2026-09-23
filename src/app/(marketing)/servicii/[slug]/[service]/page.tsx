import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/lib/services";
import {
  getAllServiceStaticParams,
  getServicePage,
  servicePath,
} from "@/lib/service-pages";
import { ServiceLandingTemplate } from "@/components/service-landing-template";
import { pageMetadata } from "@/lib/page-seo";

type Props = {
  params: Promise<{ slug: string; service: string }>;
};

export async function generateStaticParams() {
  return getAllServiceStaticParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, service } = await params;
  const page = getServicePage(slug, service);
  if (!page) return { title: "Serviciu" };
  return pageMetadata({
    title: page.seoTitle,
    description: page.seoDescription,
    path: servicePath(page.categorySlug, page.slug),
    image: page.image,
    imageAlt: page.name,
  });
}

export default async function ServiceSpokePage({ params }: Props) {
  const { slug, service } = await params;
  const category = getCategoryBySlug(slug);
  const page = getServicePage(slug, service);
  if (!category || !page) notFound();

  return <ServiceLandingTemplate page={page} category={category} />;
}
