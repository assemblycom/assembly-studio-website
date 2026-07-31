import { GetStartedSheet } from "@/components/get-started/signup-sheet";

// Intercepts /get-started when it's opened from inside the site: the page you
// came from stays mounted and this renders over it, so the composer keeps what
// you typed and dismissing is a history step rather than a fresh page.
export default function GetStartedModal() {
  return <GetStartedSheet withBackdrop={false} />;
}
