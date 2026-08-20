import { templateUrls } from "@/lib/sitemap-data";
import { urlSetXml, xmlResponse } from "@/lib/sitemap-xml";

// Revalidated rather than pinned to the build: this reads its source (Ghost,
// Contentful) at request time, so new content reaches the sitemap without a
// redeploy. An hour is the window the pages that render it already use.
export const revalidate = 3600;

export async function GET() {
  return xmlResponse(urlSetXml(await templateUrls()));
}
