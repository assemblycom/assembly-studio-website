import type { Metadata } from "next";
import { ProposalCreator } from "@/components/proposal/proposal-creator";

// An internal tool, not a marketing page: kept off the sitemap and out of the
// index. The link it produces (/proposal) is noindex for the same reason — a
// proposal is for one person, not for search.
export const metadata: Metadata = {
  title: "Proposal creator",
  robots: { index: false, follow: false },
};

export default function ProposalCreatorPage() {
  return <ProposalCreator />;
}
