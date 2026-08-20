import { mainUrls } from "@/lib/sitemap-data";
import { urlSetXml, xmlResponse } from "@/lib/sitemap-xml";

// Pinned to build time, and not only for speed: mainUrls() walks src/app to find
// every static page, and src/ isn't shipped to the lambda. It is also the right
// answer — a hand-shipped page changes when the site is deployed.
export const dynamic = "force-static";

export async function GET() {
  return xmlResponse(urlSetXml(await mainUrls()));
}
