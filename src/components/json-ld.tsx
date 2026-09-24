import { ISSUER_DEFAULTS } from "@/lib/services";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://zerobug.ro";

type JsonLdValue = Record<string, unknown> | Record<string, unknown>[];

export function JsonLd({ data }: { data: JsonLdValue }) {
  const graph = Array.isArray(data) ? data : [data];
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": graph,
        }),
      }}
    />
  );
}

export function organizationSchema() {
  return {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: ISSUER_DEFAULTS.brandName,
    legalName: ISSUER_DEFAULTS.companyName,
    url: SITE_URL,
    logo: `${SITE_URL}/images/logozerobug.png`,
    email: ISSUER_DEFAULTS.email,
    telephone: ISSUER_DEFAULTS.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: ISSUER_DEFAULTS.address,
      addressCountry: "RO",
    },
    taxID: ISSUER_DEFAULTS.cui,
    sameAs: [] as string[],
  };
}

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: "ZeroBug",
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "ro-RO",
  };
}

export function webPageSchema({
  path,
  name,
  description,
  type = "WebPage",
}: {
  path: string;
  name: string;
  description: string;
  type?: string;
}) {
  const url = `${SITE_URL}${path === "/" ? "" : path}`;
  return {
    "@type": type,
    "@id": `${url}/#webpage`,
    url,
    name,
    description,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "ro-RO",
  };
}

export function breadcrumbSchema(
  items: { name: string; path: string }[],
) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path === "/" ? "" : item.path}`,
    })),
  };
}

export function faqPageSchema(
  faqs: { question: string; answer: string }[],
) {
  return {
    "@type": "FAQPage",
    "@id": `${SITE_URL}/#faq`,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function serviceSchema({
  name,
  description,
  path,
  serviceType,
  image,
  areaServed,
}: {
  name: string;
  description: string;
  path: string;
  serviceType?: string;
  image?: string;
  areaServed?: { "@type": string; name: string };
}) {
  const url = `${SITE_URL}${path}`;
  return {
    "@type": "Service",
    "@id": `${url}/#service`,
    name,
    description,
    url,
    serviceType: serviceType ?? name,
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: areaServed ?? {
      "@type": "Country",
      name: "Romania",
    },
    ...(image
      ? {
          image: image.startsWith("http") ? image : `${SITE_URL}${image}`,
        }
      : {}),
  };
}

export function itemListSchema({
  name,
  path,
  items,
}: {
  name: string;
  path: string;
  items: { name: string; path: string }[];
}) {
  return {
    "@type": "ItemList",
    "@id": `${SITE_URL}${path}/#itemlist`,
    name,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: `${SITE_URL}${item.path}`,
    })),
  };
}

export function faqPageSchemaForPath(
  path: string,
  faqs: { question: string; answer: string }[],
) {
  const url = `${SITE_URL}${path}`;
  return {
    "@type": "FAQPage",
    "@id": `${url}/#faq`,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function webPageSchemaWithImage({
  path,
  name,
  description,
  type = "WebPage",
  image,
}: {
  path: string;
  name: string;
  description: string;
  type?: string;
  image?: string;
}) {
  const url = `${SITE_URL}${path === "/" ? "" : path}`;
  const imageUrl = image
    ? image.startsWith("http")
      ? image
      : `${SITE_URL}${image}`
    : undefined;
  return {
    "@type": type,
    "@id": `${url}/#webpage`,
    url,
    name,
    description,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "ro-RO",
    ...(imageUrl
      ? {
          primaryImageOfPage: {
            "@type": "ImageObject",
            url: imageUrl,
          },
        }
      : {}),
  };
}
