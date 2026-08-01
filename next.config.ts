import type { NextConfig } from "next";

// Mintlify docs are hosted at assembly-ff8b9417.mintlify.site and proxied
// under /docs so they appear to live on this domain (Mintlify's
// subdirectory custom-domain setup: https://mintlify.com/docs/settings/custom-domain).
const MINTLIFY_SITE = "https://assembly-ff8b9417.mintlify.site";

const isProduction = process.env.VERCEL_ENV === "production";

// Safe, non-CSP security headers applied site-wide. CSP is intentionally left
// out until inline scripts and third-party origins are inventoried.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // Screenshots are text-dense, so the default quality (75) reads as blurry.
  // Whitelist higher steps (Next 16 requires listing any non-default value).
  images: {
    qualities: [75, 90, 100],
    // Template screenshots uploaded to Contentful are served from its CDN.
    remotePatterns: [{ protocol: "https", hostname: "images.ctfassets.net" }],
  },
  async rewrites() {
    return [
      {
        source: "/docs",
        destination: `${MINTLIFY_SITE}/docs`,
      },
      {
        source: "/docs/:path*",
        destination: `${MINTLIFY_SITE}/docs/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          ...securityHeaders,
          // Keep preview/staging deployments out of the index so they can't
          // compete with the production host. The production alias
          // (VERCEL_ENV=production) is left indexable.
          ...(isProduction
            ? []
            : [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]),
        ],
      },
    ];
  },
};

export default nextConfig;
