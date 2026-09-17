import { MarketingNav } from "@/components/marketing-nav";
import { SiteFooter } from "@/components/marketing-sections";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MarketingNav />
      {children}
      <SiteFooter />
    </>
  );
}
