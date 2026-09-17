import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ZeroBug — Servicii IT, AI & Mentenanță",
    template: "%s · ZeroBug",
  },
  description:
    "Web development, e-commerce, API, mobile, AI & automatizări, Google Ads tracking și mentenanță WordPress/WooCommerce.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ro"
      className={`${inter.variable} ${instrumentSerif.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 font-sans">
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
