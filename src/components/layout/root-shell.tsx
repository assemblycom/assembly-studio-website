"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AnnouncementBar } from "@/components/layout/announcement-bar";

// Bump the suffix to re-show the bar to everyone (e.g. for a new announcement).
const ANNOUNCE_KEY = "studio-ga-announcement-dismissed-v2";

/**
 * Home gets the Zoox-style treatment: the footer is a rounded sheet that lifts
 * to reveal a solid dark panel in the gap below. The footer sits OUTSIDE the
 * white content wrapper (as a sibling) so the dark panel — not white — shows
 * behind its rounded bottom corners. Every other page is a plain sticky footer.
 *
 * Also owns the GA announcement bar: when shown, the header drops below it and
 * content gains a matching top offset. Dismissal persists in localStorage.
 */
export function RootShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [announce, setAnnounce] = useState(true);
  useEffect(() => {
    if (localStorage.getItem(ANNOUNCE_KEY)) setAnnounce(false);
  }, []);
  const dismiss = () => {
    localStorage.setItem(ANNOUNCE_KEY, "1");
    setAnnounce(false);
  };

  const mainOffset = announce ? "pt-10" : "";

  const bar = announce ? <AnnouncementBar onDismiss={dismiss} /> : null;

  if (!isHome) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        {bar}
        <Header offsetTop={announce} />
        <main className={`flex-1 ${mainOffset}`}>{children}</main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      {bar}
      {/* Dark panel revealed below the footer. */}
      <div
        aria-hidden
        className="fixed inset-x-0 bottom-0 z-0 h-[45vh] overflow-hidden bg-[#101010]"
      />
      {/* White content wrapper (square bottom). */}
      <div className="relative z-10 flex min-h-screen flex-col bg-background">
        <Header offsetTop={announce} />
        <main className={`flex-1 ${mainOffset}`}>{children}</main>
      </div>
      {/* Footer as a sibling — rounded bottom corners reveal the dark panel. */}
      <div className="relative z-10">
        <Footer rounded />
      </div>
      {/* Gap that reveals the dark panel below the footer (lets the cursor
          reach the physics canvas underneath) */}
      <div aria-hidden className="pointer-events-none h-[30vh]" />
    </>
  );
}
