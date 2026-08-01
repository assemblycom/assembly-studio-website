import { GetStartedSheet } from "@/components/get-started/signup-sheet";

// Intercepts /get-started when it's opened from inside the site: the page you
// came from stays mounted underneath, so the composer keeps what you typed and
// dismissing is a history step rather than a fresh page.
//
// It must NOT draw its own backdrop: that backdrop is a second HeroV76, and
// with the real page already mounted underneath it paints an opaque copy of the
// hero over the top of the screen. The page behind is the backdrop here.
export default function GetStartedModal() {
  return <GetStartedSheet withBackdrop={false} asModal />;
}
