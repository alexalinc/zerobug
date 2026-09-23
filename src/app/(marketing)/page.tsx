import ResponsiveHeroBanner from "@/components/ui/responsive-hero-banner";
import ClientFeedback from "@/components/ui/testimonial";
import {
  CategoryGrid,
  CtaBand,
  MaintenanceTeaser,
} from "@/components/marketing-sections";
import { PortfolioTeaser } from "@/components/portfolio-grid";
import { TechBentoGrid } from "@/components/tech-bento-grid";
import { StatsTicker } from "@/components/stats-ticker";
import { CodeThinking } from "@/components/code-thinking";
import { FAQ } from "@/components/ui/faq-tabs";
import { FAQ_CATEGORIES, FAQ_DATA, getAllFaqItems } from "@/lib/faq";
import {
  JsonLd,
  faqPageSchema,
  webPageSchema,
} from "@/components/json-ld";

export default function HomePage() {
  return (
    <main>
      <JsonLd
        data={[
          webPageSchema({
            path: "/",
            name: "ZeroBug — Servicii IT, AI & Mentenanță",
            description:
              "Web development, e-commerce, API, mobile, AI cu OpenAI & Claude, Google Ads tracking și mentenanță WordPress/WooCommerce.",
          }),
          faqPageSchema(getAllFaqItems()),
        ]}
      />
      <ResponsiveHeroBanner />
      <StatsTicker />
      <TechBentoGrid />
      <CodeThinking />
      <ClientFeedback />
      <PortfolioTeaser />
      <CategoryGrid />
      <MaintenanceTeaser />
      <FAQ
        title="Răspunsuri clare, fără jargon inutil"
        subtitle="Întrebări frecvente"
        categories={FAQ_CATEGORIES}
        faqData={FAQ_DATA}
      />
      <CtaBand />
    </main>
  );
}
