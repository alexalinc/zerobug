import { ContactSection } from "@/components/contact-section";
import {
  JsonLd,
  breadcrumbSchema,
  webPageSchema,
} from "@/components/json-ld";
import { PAGE_SEO, pageMetadata } from "@/lib/page-seo";

export const metadata = pageMetadata(PAGE_SEO.contact);

export default function ContactPage() {
  return (
    <main className="bg-zinc-950 text-white">
      <JsonLd
        data={[
          webPageSchema({
            path: PAGE_SEO.contact.path,
            name: `${PAGE_SEO.contact.title} · ZeroBug`,
            description: PAGE_SEO.contact.description,
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
