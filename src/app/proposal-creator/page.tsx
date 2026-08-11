import type { Metadata } from "next";
import { ProposalCreator } from "@/components/proposal/proposal-creator";
import { getCatalogueTemplates } from "@/lib/visible-templates";

// An internal tool, not a marketing page: kept off the sitemap and out of the
// index. The link it produces (/proposal) is noindex for the same reason — a
// proposal is for one person, not for search.
export const metadata: Metadata = {
  title: "Proposal creator",
  robots: { index: false, follow: false },
};

// Re-resolved against Contentful every few minutes rather than only at deploy.
// Prerendered once, an editor hiding a template in the CMS had no effect until
// somebody happened to ship — which is not what "the CMS is the catalogue" can
// mean in practice. Five minutes is short enough that a change lands while the
// person who made it is still looking, and long enough that crawlers aren't
// re-running the query on every hit.
export const revalidate = 300;

export default async function ProposalCreatorPage() {
  return <ProposalCreator templates={await getCatalogueTemplates()} />;
}
