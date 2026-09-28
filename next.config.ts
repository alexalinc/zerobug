import type { NextConfig } from "next";
import path from "path";

/**
 * CSP tuned for Next.js App Router + Convex + Stripe Checkout + Google Ads/OAuth.
 * 'unsafe-inline' / 'unsafe-eval' are required by Next.js runtime without nonces;
 * still blocks many XSS vectors via default-src / object-src / base-uri / frame-ancestors.
 */
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
<<<<<<< HEAD
  "img-src 'self' data: blob: https://images.unsplash.com https://cdn.jsdelivr.net https://*.stripe.com https://*.googleusercontent.com https://www.google.com https://www.googletagmanager.com",
=======
  "img-src 'self' data: blob: https://images.unsplash.com https://*.stripe.com https://*.googleusercontent.com https://www.google.com https://www.googletagmanager.com",
>>>>>>> origin/main
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.googletagmanager.com https://www.googleadservices.com https://www.google.com https://googleads.g.doubleclick.net",
  "connect-src 'self' https://*.convex.cloud https://*.convex.site wss://*.convex.cloud https://api.stripe.com https://www.google-analytics.com https://www.googletagmanager.com https://googleads.g.doubleclick.net https://www.google.com https://oauth2.googleapis.com https://accounts.google.com",
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://accounts.google.com https://www.google.com",
  "worker-src 'self' blob:",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: CONTENT_SECURITY_POLICY,
          },
        ],
      },
      {
        source: "/admin",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-store, max-age=0, must-revalidate",
          },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-store, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
