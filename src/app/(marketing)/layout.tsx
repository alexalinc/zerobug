import { MarketingNav } from "@/components/marketing-nav";
import { SiteFooter } from "@/components/marketing-sections";
import {
  JsonLd,
  organizationSchema,
  websiteSchema,
} from "@/components/json-ld";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={[organizationSchema(), websiteSchema()]} />
      <MarketingNav />
      {children}
      <SiteFooter />
    </>
  );
}
