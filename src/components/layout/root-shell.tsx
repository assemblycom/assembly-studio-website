"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { StudioNav } from "@/components/home/studio-nav";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Footer } from "@/components/layout/footer";
import { useTheme } from "@/components/theme/theme-provider";

/**
 * Every page in this shell ends in the reveal footer — a single black sheet
 * closing on the brand aurora (the gradient lives inside the footer itself,
 * not a separate fixed layer). The proposal pair renders its own chrome and
 * returns before any of this.
 */
export function RootShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, preference, setPreference } = useTheme();
  const dark = theme === "dark";
  const isHome = pathname === "/";
  // Every page this shell renders gets the reveal footer. It used to be an
  // allowlist of known routes, which meant anything not on it — in practice
  // only the 404 — fell through to a plain footer that ended flat, with no
  // aurora and no bottom bar. That was the allowlist going stale rather than a
  // decision, and it would have caught every future route too. The pages that
  // genuinely want no footer (the proposal pair) return before this.

  // In light mode every reveal page (including the landing) gets a light-toned
  // footer — but it still ends in the brand aurora (dark-based), so the bottom
  // overscroll zone stays dark for all reveal pages.
  const revealFooterLight = !dark;

  // Tell CSS which footer tone the page's BOTTOM edge (the aurora) ends in, so
  // the overscroll / iOS toolbar zone matches — see globals.css. Always dark
  // now: every page here closes on the aurora, and the proposal page renders
  // its own footer but ends in the same one.
  useEffect(() => {
    document.documentElement.setAttribute("data-footer", "dark");
  }, []);

  // The shared nav never shows "Book a demo" (it's a demo-page/pricing-hero
  // CTA, not a nav item). The theme toggle now lives in the footer instead of
  // the nav. Contents ride light over the dark theme and dark over the light.
  // The home hero renders its own sticky nav, so the global header is omitted
  // there to avoid a duplicate bar.
  const nav = isHome ? null : (
    <StudioNav
      hideDemo
      darkTop={dark}
      // Match the home hero's nav rail exactly so the logo/links don't shift
      // horizontally when navigating between home and the content pages.
      maxWidthClass="max-w-[1600px]"
      restPaddingClass="px-6 md:px-10"
    />
  );

  const themeToggle = { preference, onSelect: setPreference };

  // Focused, chrome-light pages: a personalized proposal (one thing to do on it,
  // so no nav at all) and the internal tool that composes one. Each renders its
  // own header, if any. (Placed after all hooks so the hook order stays stable.)
  if (pathname === "/proposal" || pathname === "/proposal-creator") {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  // Short pages (the demo form) keep the reveal footer in normal flow so it
  // rises to the bottom of the content instead of sitting a full screen below.
  if (pathname === "/demo") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <AnnouncementBar />
        {nav}
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer reveal light={revealFooterLight} themeToggle={themeToggle} />
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-screen flex-col bg-background">
        <AnnouncementBar />
        {nav}
        <main id="main" className="flex-1">
          {children}
        </main>
      </div>
      <Footer reveal light={revealFooterLight} themeToggle={themeToggle} />
    </>
  );
}
