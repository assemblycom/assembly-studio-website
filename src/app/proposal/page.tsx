import type { Metadata } from "next";
import { ProposalPage } from "@/components/proposal/proposal-page";
import { proposalTitle } from "@/lib/proposal-title";
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
//
// generateMetadata rather than a static object because the title names the app
// and its recipient, and both live in the query string. That makes the route
// dynamic, which costs nothing here: it is noindex, uncrawled, and reached one
// link at a time.
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const params = await searchParams;
  const one = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };
  const title = proposalTitle({
    for: one("for"),
    name: one("name"),
    template: one("template"),
  });

  const base = pageMetadata(PAGE_SEO.proposal);
  return {
    ...base,
    // Absolute so the tab reads "Client intake for Véronique" rather than
    // wearing the root layout's "Assembly Studio | %s" template. The document is
    // the client's, and the brand is already all over the page itself.
    title: { absolute: title },
    openGraph: { ...base.openGraph, title },
    twitter: { ...base.twitter, title },
    robots: { index: false, follow: false },
  };
}

export default function Page() {
  return <ProposalPage />;
}
