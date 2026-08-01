import type { MetadataRoute } from "next";
import { PROPOSAL_CREATOR_PATH, PROPOSAL_PATH, SITE_URL } from "@/lib/constants";

// Crawl policy for production. Non-production (preview) deployments are held
// back from indexing by the X-Robots-Tag header in next.config.ts.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Personalized proposals and the internal tool that makes them: sent to
      // one person, never listed. Both routes are noindex in their own metadata
      // too, so a link that gets shared onward still isn't indexable.
      disallow: [PROPOSAL_PATH, PROPOSAL_CREATOR_PATH],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
