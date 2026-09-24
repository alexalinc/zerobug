import type { Metadata } from "next";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { GclidCapture } from "@/components/gclid-capture";
import { CookiePanel } from "@/components/ui/cookie-banner-1";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://zerobug.ro",
  ),
  title: {
    default: "ZeroBug — Servicii IT & Mentenanță",
    template: "%s · ZeroBug",
  },
  description:
    "Agenție IT din România: dezvoltare web, e-commerce, API & batch-uri, mobile, Google Ads tracking și mentenanță WordPress / WooCommerce.",
  openGraph: {
    type: "website",
    locale: "ro_RO",
    siteName: "ZeroBug",
    images: [
      {
        url: "/images/logozerobug.png",
        width: 1024,
        height: 1024,
        alt: "ZeroBug",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/images/logozerobug.png"],
  },
  icons: {
    icon: [{ url: "/images/logozerobug.png", type: "image/png" }],
    apple: [{ url: "/images/logozerobug.png", type: "image/png" }],
    shortcut: "/images/logozerobug.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 font-sans">
        <ConvexClientProvider>
          <GclidCapture />
          {children}
          <CookiePanel />
        </ConvexClientProvider>
      </body>
    </html>
  );
}
