import type { NextConfig } from "next";

// Mintlify docs are hosted at assembly-ff8b9417.mintlify.site and proxied
// under /docs so they appear to live on this domain (Mintlify's
// subdirectory custom-domain setup: https://mintlify.com/docs/settings/custom-domain).
const MINTLIFY_SITE = "https://assembly-ff8b9417.mintlify.site";

const nextConfig: NextConfig = {
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
};

export default nextConfig;
