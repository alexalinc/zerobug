import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CITIES, getCityBySlug, cityHubPath } from "@/lib/cities";
import { CityHubTemplate } from "@/components/city-landing-templates";
import { pageMetadata } from "@/lib/page-seo";

type Props = { params: Promise<{ city: string }> };

export function generateStaticParams() {
  return CITIES.map((c) => ({ city: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) return { title: "Oraș" };
  return pageMetadata({
    title: `Servicii IT ${city.inLocative}`,
    description: `Dezvoltare web, magazin online și WordPress pentru firme ${city.from}. Ofertă ZeroBug.`,
    path: cityHubPath(city.slug),
  });
}

export default async function CityHubRoute({ params }: Props) {
  const { city: slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) notFound();
  return <CityHubTemplate city={city} />;
}
