import { embedUrls } from "@/lib/sitemap-data";
import { urlSetXml, xmlResponse } from "@/lib/sitemap-xml";

// Revalidated rather than pinned to the build, like the other Contentful-backed
// sitemaps: a newly published embed reaches this without a redeploy.
export const revalidate = 3600;

export async function GET() {
  return xmlResponse(urlSetXml(await embedUrls()));
}
