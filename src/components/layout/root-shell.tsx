"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { StudioNav } from "@/components/home/studio-nav";
import { Footer } from "@/components/layout/footer";
import { useTheme } from "@/components/theme/theme-provider";

/**
 * Home and the content pages share the reveal footer — a single black sheet
 * that ends in the brand aurora (the gradient lives inside the footer itself,
 * not a separate fixed layer). Other pages get the plain footer.
 *
 * The announcement bar scrolls away in normal flow; the header is sticky and
 * pins to the top of the viewport once the bar scrolls past.
 */
export function RootShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";
  const isHome = pathname === "/";
  // Pages that share the landing page's reveal footer.
  const usesRevealFooter =
    isHome ||
    pathname === "/security" ||
    pathname === "/customers" ||
    pathname.startsWith("/customers/") ||
    pathname === "/pricing" ||
    pathname === "/templates" ||
    pathname.startsWith("/templates/");

  // Tell CSS which footer tone this page ends in, so the bottom overscroll /
  // iOS toolbar zone can match it (dark under the reveal footer, light under
  // the plain one) — see the html/body background rules in globals.css.
  useEffect(() => {
    document.documentElement.setAttribute(
      "data-footer",
      usesRevealFooter ? "dark" : "light",
    );
  }, [usesRevealFooter]);

  // The shared nav carries the site theme toggle and never shows "Book a demo"
  // (it's a demo-page/pricing-hero CTA, not a nav item). Its contents ride
  // light over the dark theme and dark over the light theme.
  // The home hero renders its own sticky nav, so the global header is omitted
  // there to avoid a duplicate bar.
  const nav = isHome ? null : (
    <StudioNav
      hideDemo
      darkTop={dark}
      themeToggle={{ theme, onToggle: toggleTheme }}
    />
  );

  if (usesRevealFooter) {
    return (
      <>
        <div className="flex min-h-screen flex-col bg-background">
          {nav}
          <main className="flex-1">{children}</main>
        </div>
        <Footer reveal />
      </>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {nav}
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
