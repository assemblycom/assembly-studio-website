"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { StudioWordmark } from "@/components/layout/studio-wordmark";
import { FooterBars } from "@/components/layout/footer-bars";

/**
 * Home gets the Zoox-style treatment: the footer is a rounded sheet that lifts
 * to reveal a solid dark panel in the gap below. The footer sits OUTSIDE the
 * white content wrapper (as a sibling) so the dark panel — not white — shows
 * behind its rounded bottom corners. Every other page is a plain sticky footer.
 *
 * The announcement bar scrolls away in normal flow; the header is sticky and
 * pins to the top of the viewport once the bar scrolls past.
 */
export function RootShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isSecurity = pathname === "/security";

  // The announcement bar only runs on the landing page.
  const bar = <AnnouncementBar />;

  // Security leads with a dark hero and reuses the home reveal footer, but the
  // panel below shows the interactive bar field instead of the kinetic wordmark.
  if (isSecurity) {
    return (
      <>
        <div className="fixed inset-x-0 bottom-0 z-0 h-[60vh] overflow-hidden bg-[#7da4ff]">
          <FooterBars />
        </div>
        <div className="relative z-10 flex min-h-screen flex-col bg-background">
          <Header fullWidth darkTop />
          <main className="flex-1">{children}</main>
        </div>
        <div className="relative z-10">
          <Footer rounded />
        </div>
        <div aria-hidden className="pointer-events-none h-[42vh]" />
      </>
    );
  }

  if (!isHome) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      {/* Dark panel revealed below the footer — home for the kinetic wordmark. */}
      <div className="fixed inset-x-0 bottom-0 z-0 h-[60vh] overflow-hidden bg-[#7da4ff]">
        <StudioWordmark />
      </div>
      {/* White content wrapper (square bottom). The announcement bar scrolls
          away; the sticky header pins to the top as you scroll the hero box. */}
      <div className="relative z-10 flex min-h-screen flex-col bg-background">
        {bar}
        <Header fullWidth darkTop />
        <main className="flex-1">{children}</main>
      </div>
      {/* Footer as a sibling — rounded bottom corners reveal the dark panel. */}
      <div className="relative z-10">
        <Footer rounded />
      </div>
      {/* Gap that reveals the dark panel below the footer — its height is the
          visible dark strip the wordmark sits in. */}
      <div aria-hidden className="pointer-events-none h-[42vh]" />
    </>
  );
}
