import type { MetadataRoute } from "next";
import { PROPOSAL_CREATOR_PATH, PROPOSAL_PATH, SITE_URL } from "@/lib/constants";

// Anything that is not the production alias — previews, and the staging host —
// is closed to crawlers outright. next.config.ts already bakes an
// X-Robots-Tag: noindex, nofollow header into those builds; this is the second
// half of the same rule, and both are keyed off VERCEL_ENV at BUILD time, so a
// staging artifact cannot be promoted into production carrying either one.
const isProduction = process.env.VERCEL_ENV === "production";

export default function robots(): MetadataRoute.Robots {
  if (!isProduction) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        // Personalized proposals and the internal tool that makes them: sent to
        // one person, never listed. Both routes are noindex in their own
        // metadata too, so a link that gets shared onward still isn't
        // indexable.
        PROPOSAL_PATH,
        PROPOSAL_CREATOR_PATH,
        // Route handlers, not pages. Nothing under here renders anything a
        // crawler can use.
        "/api/",
      ],
    },
    // The index only. It names every child sitemap, so listing them here as
    // well is the same set of URLs submitted twice — and the docs sitemap is in
    // the index too, which is the one place it belongs.
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
