import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

// Crawl policy for production. Non-production (preview) deployments are held
// back from indexing by the X-Robots-Tag header in next.config.ts.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
