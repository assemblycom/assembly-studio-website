"use client";

import { usePathname } from "next/navigation";
import { StudioNav } from "@/components/home/studio-nav";
import { Footer } from "@/components/layout/footer";
import { StudioWordmark } from "@/components/layout/studio-wordmark";
import { FooterBars } from "@/components/layout/footer-bars";
import { useTheme } from "@/components/theme/theme-provider";

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
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";
  const isHome = pathname === "/";
  const isSecurity = pathname === "/security";
  // Content pages that share the landing page's kinetic-wordmark reveal footer.
  // Templates is included so it gets the exact same footer as home instead of
  // its own gooey path-relax panel.
  const usesWordmarkFooter =
    pathname === "/customers" ||
    pathname.startsWith("/customers/") ||
    pathname === "/pricing" ||
    pathname === "/templates" ||
    pathname.startsWith("/templates/");

  // The shared nav carries the site theme toggle and never shows "Book a demo"
  // (it's a demo-page/pricing-hero CTA, not a nav item). Its contents ride
  // light over the dark theme and dark over the light theme.
  const nav = (
    <StudioNav
      hideDemo
      darkTop={dark}
      themeToggle={{ theme, onToggle: toggleTheme }}
    />
  );

  // Security leads with a hero and reuses the home reveal footer, but the panel
  // below shows the interactive bar field instead of the kinetic wordmark. It
  // follows the site theme like every other page.
  if (isSecurity) {
    return (
      <>
        <div className="fixed inset-x-0 bottom-0 z-0 h-[60vh] overflow-hidden bg-[#7da4ff]">
          <FooterBars />
        </div>
        <div className="relative z-10 flex min-h-screen flex-col bg-background">
          {nav}
          <main className="flex-1">{children}</main>
        </div>
        <div className="relative z-10">
          <Footer reveal />
        </div>
        <div aria-hidden className="pointer-events-none h-[42vh]" />
      </>
    );
  }

  // Customers, pricing, and templates reuse the landing page's reveal footer —
  // the rounded footer over the kinetic wordmark panel — with a standard header.
  if (usesWordmarkFooter) {
    return (
      <>
        <div className="fixed inset-x-0 bottom-0 z-0 h-[60vh] overflow-hidden bg-[#7da4ff]">
          <StudioWordmark />
        </div>
        <div className="relative z-10 flex min-h-screen flex-col bg-background">
          {nav}
          <main className="flex-1">{children}</main>
        </div>
        <div className="relative z-10">
          <Footer reveal />
        </div>
        <div aria-hidden className="pointer-events-none h-[42vh]" />
      </>
    );
  }

  if (!isHome) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        {nav}
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
          away; the hero renders its own sticky nav (with the theme toggle), so
          the global header is omitted here to avoid a duplicate bar. */}
      <div className="relative z-10 flex min-h-screen flex-col bg-background">
        <main className="flex-1">{children}</main>
      </div>
      {/* Footer as a sibling — rounded bottom corners reveal the dark panel. */}
      <div className="relative z-10">
        <Footer reveal />
      </div>
      {/* Gap that reveals the dark panel below the footer — its height is the
          visible dark strip the wordmark sits in. */}
      <div aria-hidden className="pointer-events-none h-[42vh]" />
    </>
  );
}
