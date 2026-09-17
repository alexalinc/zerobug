import ResponsiveHeroBanner from "@/components/ui/responsive-hero-banner";
import {
  AiFocusSection,
  CategoryGrid,
  CtaBand,
  MaintenanceTeaser,
  SiteFooter,
} from "@/components/marketing-sections";

export default function HomePage() {
  return (
    <main>
      <ResponsiveHeroBanner />
      <AiFocusSection />
      <CategoryGrid />
      <MaintenanceTeaser />
      <CtaBand />
      <SiteFooter />
    </main>
  );
}
