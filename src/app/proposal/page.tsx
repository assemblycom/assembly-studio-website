import { ProposalPage } from "@/components/proposal/proposal-page";
import { PAGE_SEO, pageMetadata } from "@/lib/seo";

// A proposal is written for one person and sent to them directly, so it stays
// out of the index and off the sitemap. The recipient's name is in the URL;
// nothing about it should be searchable.
//
// noindex does NOT mean the social card can be skipped: a proposal is delivered
// as a link, so it gets unfurled in Slack and mail clients constantly even
// though no crawler will index it. Written as a bare { title, robots } this
// page inherited the root layout's openGraph wholesale and previewed as the
// marketing homepage — see pageMetadata.
export const metadata = {
  ...pageMetadata(PAGE_SEO.proposal),
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ProposalPage />;
}
