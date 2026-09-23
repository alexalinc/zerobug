import { ContactSection } from "@/components/contact-section";
import {
  JsonLd,
  breadcrumbSchema,
  webPageSchema,
} from "@/components/json-ld";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactează ZeroBug — web, e-commerce, AI, mentenanță. Revenim de obicei în aceeași zi lucrătoare.",
};

export default function ContactPage() {
  return (
    <main className="bg-zinc-950 text-white">
      <JsonLd
        data={[
          webPageSchema({
            path: "/contact",
            name: "Contact · ZeroBug",
            description:
              "Contactează ZeroBug pentru web, e-commerce, AI și mentenanță.",
            type: "ContactPage",
          }),
          breadcrumbSchema([
            { name: "Acasă", path: "/" },
            { name: "Contact", path: "/contact" },
          ]),
        ]}
      />
      <ContactSection />
    </main>
  );
}
