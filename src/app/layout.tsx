import type { Metadata } from "next";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://zerobug.ro",
  ),
  title: {
    default: "ZeroBug — Servicii IT, AI & Mentenanță",
    template: "%s · ZeroBug",
  },
  description:
    "Web development, e-commerce, API, mobile, AI cu OpenAI & Claude, Google Ads tracking și mentenanță WordPress/WooCommerce.",
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
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
