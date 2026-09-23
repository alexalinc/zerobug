import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/seo";

/** Default social / featured image (site logo). */
export const DEFAULT_OG_IMAGE = "/images/logozerobug.png";

export type PageSeoInput = {
  title: string;
  description: string;
  path: string;
  /** Absolute path under /public, e.g. /images/... */
  image?: string;
  imageAlt?: string;
  noIndex?: boolean;
  type?: "website" | "article";
};

/**
 * Builds title, description, canonical, Open Graph and Twitter metadata
 * so every marketing page has a featured image for shares / previews.
 */
export function pageMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  imageAlt = "ZeroBug — Servicii IT, AI & Mentenanță",
  noIndex = false,
  type = "website",
}: PageSeoInput): Metadata {
  const site = getSiteUrl();
  const url = path === "/" ? site : `${site}${path}`;
  const imageUrl = image.startsWith("http") ? image : `${site}${image}`;
  const displayTitle = title.includes("ZeroBug") ? title : `${title} · ZeroBug`;
  // Root layout uses template "%s · ZeroBug" — absolute titles skip the template
  const titleField =
    title.includes("ZeroBug") || path === "/"
      ? { absolute: title }
      : title;

  return {
    title: titleField,
    description,
    alternates: { canonical: path === "/" ? "/" : path },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type,
      locale: "ro_RO",
      siteName: "ZeroBug",
      title: displayTitle,
      description,
      url,
      images: [
        {
          url: imageUrl,
          width: 1024,
          height: 1024,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: displayTitle,
      description,
      images: [imageUrl],
    },
  };
}

/** Central SEO copy for marketing routes */
export const PAGE_SEO = {
  home: {
    title: "ZeroBug — Servicii IT, AI & Mentenanță",
    description:
      "Agenție IT din România: dezvoltare web, e-commerce, API, mobile, AI (OpenAI & Claude), Google Ads tracking și mentenanță WordPress / WooCommerce.",
    path: "/",
    image: DEFAULT_OG_IMAGE,
  },
  servicii: {
    title: "Servicii IT & dezvoltare web",
    description:
      "Catalog ZeroBug: website-uri, magazine online, API & integrări, aplicații mobile, tracking Google Ads și mentenanță WordPress — cere o ofertă personalizată.",
    path: "/servicii",
    image: DEFAULT_OG_IMAGE,
  },
  mentenanta: {
    title: "Mentenanță website WordPress & Next.js",
    description:
      "Update-uri, backup, securitate și support lunar. Completează chestionarul ZeroBug și primești o estimare de preț pentru mentenanța site-ului tău.",
    path: "/mentenanta",
    image: DEFAULT_OG_IMAGE,
  },
  mentenantaSuccess: {
    title: "Abonament mentenanță confirmat",
    description:
      "Plata și abonamentul de mentenanță ZeroBug au fost confirmate. Vei primi factura pe email.",
    path: "/mentenanta/success",
    image: DEFAULT_OG_IMAGE,
    noIndex: true,
  },
  portofoliu: {
    title: "Portofoliu proiecte web & e-commerce",
    description:
      "Proiecte livrate de ZeroBug: Spido, Profit Bid, Bijuteria Iris, Mercana, WooTrack, Clinica Dronelor — magazine, SaaS și platforme custom.",
    path: "/portofoliu",
    image: "/images/portfolio/spido.jpg",
    imageAlt: "Portofoliu ZeroBug — proiecte web și e-commerce",
  },
  despre: {
    title: "Despre ZeroBug — agenție IT România",
    description:
      "Cine suntem: dezvoltare web, e-commerce, API, AI și mentenanță pentru business-uri din România. Livrabile în producție, tracking inclus, abonamente predictibile.",
    path: "/despre",
    image: DEFAULT_OG_IMAGE,
  },
  contact: {
    title: "Contact — ofertă web, AI & mentenanță",
    description:
      "Scrie-ne despre proiectul tău. ZeroBug răspunde de obicei în aceeași zi lucrătoare pentru web, e-commerce, AI și mentenanță website.",
    path: "/contact",
    image: DEFAULT_OG_IMAGE,
  },
  termeni: {
    title: "Termeni și condiții",
    description:
      "Termenii ZeroBug pentru oferte, dezvoltare, mentenanță lunară, facturare, plăți și anulare abonament.",
    path: "/termeni",
    image: DEFAULT_OG_IMAGE,
  },
  privacy: {
    title: "Politica de confidențialitate",
    description:
      "Cum prelucrează ZeroBug (SC AXP GLOBAL RETAIL SRL) datele personale din formulare, oferte și facturare — GDPR.",
    path: "/politica-confidentialitate",
    image: DEFAULT_OG_IMAGE,
  },
} as const;

export function serviceCategoryMetadata(input: {
  title: string;
  description: string;
  slug: string;
}): Metadata {
  return pageMetadata({
    title: `${input.title} — servicii IT`,
    description: input.description.slice(0, 160),
    path: `/servicii/${input.slug}`,
    image: DEFAULT_OG_IMAGE,
    imageAlt: `${input.title} · ZeroBug`,
  });
}
