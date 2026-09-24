import { CityIndexPage } from "@/components/city-landing-templates";
import { pageMetadata } from "@/lib/page-seo";

export const metadata = pageMetadata({
  title: "Servicii IT pe oraș",
  description:
    "Servicii ZeroBug pe orașe din România: creare magazin online, website, WordPress, Google Ads tracking.",
  path: "/servicii/oras",
});

export default function OraseIndexRoute() {
  return <CityIndexPage />;
}
