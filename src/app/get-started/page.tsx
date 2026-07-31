import { GetStartedSheet } from "@/components/get-started/signup-sheet";

// The standalone screen — a shared link, or a refresh while the modal is open, so
// it draws the page behind the sheet itself. Opened from the site,
// `app/@modal/(.)get-started` intercepts this route and renders the same sheet
// over the page that is already mounted: nothing unmounts, so there's no blink on
// the way in or out.
export default function GetStartedPage() {
  return <GetStartedSheet />;
}
