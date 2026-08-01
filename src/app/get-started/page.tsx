import type { Metadata } from "next";
import { GetStartedSheet } from "@/components/get-started/signup-sheet";

// Kept out of the index: with no copy of its own it inherited the homepage's
// title and description verbatim, which is two URLs competing on one snippet.
export const metadata: Metadata = {
  title: "Get started",
  robots: { index: false, follow: true },
};

// The standalone screen — a shared link, or a refresh while the modal is open, so
// it draws the page behind the sheet itself. Opened from the site,
// `app/@modal/(.)get-started` intercepts this route and renders the same sheet
// over the page that is already mounted: nothing unmounts, so there's no blink on
// the way in or out.
export default function GetStartedPage() {
  return <GetStartedSheet />;
}
