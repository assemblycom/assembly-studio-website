import type { Metadata } from "next";
import { ProposalPage } from "@/components/proposal/proposal-page";

// A proposal is written for one person and sent to them directly, so it stays
// out of the index and off the sitemap. The recipient's name is in the URL;
// nothing about it should be searchable.
export const metadata: Metadata = {
  title: "Your proposal",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ProposalPage />;
}
