"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { NAV_LINKS, APP_URL, DEMO_URL } from "@/lib/constants";

// The announcement bar's height — once we've scrolled past it the header is
// pinned to the top, so it swaps from transparent to a frosted surface.
const SCROLL_THRESHOLD = 40;

export function StudioNav({
  fullWidth = false,
  darkTop = false,
  softGlass = false,
  maxWidthClass,
  restPaddingClass,
  hideDemo = false,
  themeToggle,
}: {
  fullWidth?: boolean;
  // When the page leads with a dark hero, the bar sits over it at rest — so its
  // contents (logo, links, CTA) need to be light even before the pill appears.
  darkTop?: boolean;
  // For soft, light heroes (V64): the scrolled pill is a light frosted capsule
  // rather than the dark slab, so its contents stay dark throughout.
  softGlass?: boolean;
  // Override the nav's rail width so it can line up with a wider hero (V63).
  maxWidthClass?: string;
  // Override the at-rest horizontal padding so the nav clears a rounded hero
  // panel's edge on narrower layouts (V63).
  restPaddingClass?: string;
  // Hide the "Book a demo" CTA (both desktop and the mobile menu) — dropped for
  // launch on some heroes.
  hideDemo?: boolean;
  // Optional light/dark toggle rendered in the nav (used by themeable heroes).
  themeToggle?: { theme: "light" | "dark"; onToggle: () => void };
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // The menu is portaled to <body>, so it needs the client to have mounted.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  // The scrolled pill now matches the surface theme: a light capsule in light
  // contexts, a dark one over a dark hero/theme (darkTop). So contents are light
  // only in a dark context — dark otherwise, whether at rest or scrolled.
  const lightContent = softGlass ? false : darkTop;

  // Sticky so the nav follows you down. At the top it's a transparent, dark-on-
  // light bar; once scrolled it settles into a floating capsule ("pill") with
  // light contents, à la Superpower.
  // Sticks to the top; the announcement bar above it scrolls away in flow.
  const position = "sticky top-0";
  // Full-bleed bar (Linear-style): transparent at the top, then a full-width
  // frosted surface with a hairline bottom border on scroll — no floating pill,
  // no side gutters, no drop shadow. Tracks the surface: a light near-opaque
  // glass in light contexts and a dark one over a dark hero/theme. Kept
  // near-opaque so it doesn't smear as the bar crosses a section boundary.
  // The border is split out from the surface (see the header border-b below):
  // it lives at rest as a transparent hairline so scrolling only transitions its
  // COLOR (transparent → hairline) — never its width, and never from the
  // inherited currentColor, which flashed a bright line for a frame.
  const scrolledSurface =
    softGlass || !darkTop
      ? "bg-white/80 backdrop-blur-xl"
      : "bg-[#0e0e10]/85 backdrop-blur-xl";
  const scrolledBorder =
    softGlass || !darkTop ? "border-black/[0.07]" : "border-white/10";

  // One shared easing/duration for the rest→pill transition so every animated
  // property (chrome, geometry, logo tint) settles together on the same soft
  // ease-out curve — no property snapping ahead of the others.
  const ease =
    "duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none";

  // Keep the same rail width at rest and when scrolled so the capsule doesn't
  // visibly shrink. The scrolled outer gutter (px-6) sits just inside the hero
  // box gutter (px-4) so the pill doesn't touch the box edges.
  const maxWidth = fullWidth ? "max-w-none" : (maxWidthClass ?? "max-w-7xl");
  // Inner content rail — same width/padding at rest and scrolled so nothing
  // shifts horizontally; only the bar height eases down a touch on scroll.
  const contentRail = `${maxWidth} ${fullWidth ? "px-8" : (restPaddingClass ?? "px-6")}`;

  // Content colors flip when the bar is on a dark surface. Light content always
  // sits over a dark surface (the scrolled dark pill or a dark hero/theme), so
  // it uses EXPLICIT white/ink rather than the background token — the token now
  // flips to dark in dark mode, which would make the light-content nav vanish.
  // The dark-content branch keeps the tokens so it tracks the theme correctly.
  // whitespace-nowrap keeps every label on one line so the pill never wraps.
  const darkLink = softGlass ? "text-foreground/90 hover:text-foreground" : "text-muted-foreground hover:text-foreground";
  const darkDisabled = softGlass ? "text-foreground/90" : "text-muted-foreground";
  const linkCls = `whitespace-nowrap rounded-full px-2 py-1.5 text-sm transition-colors lg:px-3 ${lightContent ? "text-white/70 hover:text-white" : darkLink}`;
  const disabledCls = `cursor-default whitespace-nowrap rounded-full px-2 py-1.5 text-sm lg:px-3 ${lightContent ? "text-white/50" : darkDisabled}`;
  const ctaCls = `whitespace-nowrap rounded-lg px-4 py-1.5 text-sm transition-[background-color,color,opacity] hover:opacity-90 ${lightContent ? "bg-white text-neutral-900" : "bg-foreground text-background"}`;
  const logoInvert = lightContent ? "brightness-0 invert" : "";

  // Over a dark surface the full-screen mobile menu stays dark rather than
  // flashing a white overlay. Use the site's canonical dark background (#0a0a0b,
  // the dark --background token) so the menu reads as the exact same black as the
  // page behind it, not a lighter charcoal.
  const menuSurface = darkTop ? "bg-[#0a0a0b] text-white" : "bg-background";
  const menuBorder = darkTop ? "border-white/10" : "border-border";
  const menuMuted = darkTop ? "text-white/50" : "text-muted-foreground";
  const menuInk = darkTop ? "text-white" : "text-foreground";
  const menuCta = darkTop ? "bg-white text-neutral-900" : "bg-foreground text-background";
  const menuDemo = darkTop ? "border-white/20 text-white" : "border-foreground/20 text-foreground";
  const menuLogoInvert = darkTop ? "brightness-0 invert" : "";
  // The selected segment of the in-menu Appearance switch — a soft fill that
  // reads on either menu ground, mirroring the desktop toggle's knob.
  const menuSegActive = darkTop ? "bg-white/10 text-white" : "bg-foreground/[0.06] text-foreground";

  // The nav logo — a clean white SVG mark.
  const logoMark = (
    <Image
      src="/images/logo-mark.svg"
      alt="Assembly Studio"
      width={22}
      height={22}
      priority
      className={`transition-[filter] ${ease} ${logoInvert}`}
    />
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock background scroll while the mobile menu overlay is open.
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Mobile header — mirrors the desktop nav: transparent with light
          contents over the dark hero, settling into the same dark glass pill on
          scroll. Logo on the left, grid menu button on the right. */}
      <header className={`${position} z-50 border-b transition-colors ${ease} md:hidden ${scrolled ? `${scrolledSurface} ${scrolledBorder}` : "border-transparent"}`}>
        <div className={`flex items-center justify-between px-5 transition-[height] ${ease} ${scrolled ? "h-12" : "h-14"}`}>
          <Link href="/" className="flex items-center">
            {logoMark}
          </Link>
          <button
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
            className={`flex size-9 items-center justify-center transition-[color,opacity] ${ease} active:opacity-60 ${lightContent ? "text-white" : "text-foreground"}`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <circle cx="5" cy="5" r="1.6" />
              <circle cx="12" cy="5" r="1.6" />
              <circle cx="19" cy="5" r="1.6" />
              <circle cx="5" cy="12" r="1.6" />
              <circle cx="12" cy="12" r="1.6" />
              <circle cx="19" cy="12" r="1.6" />
              <circle cx="5" cy="19" r="1.6" />
              <circle cx="12" cy="19" r="1.6" />
              <circle cx="19" cy="19" r="1.6" />
            </svg>
          </button>
        </div>
      </header>

      {/* Desktop header — full-bleed bar: transparent at the top, frosted
          full-width surface with a hairline bottom border on scroll */}
      <header className={`${position} z-50 hidden border-b transition-colors ${ease} md:block ${scrolled ? `${scrolledSurface} ${scrolledBorder}` : "border-transparent"}`}>
        <div className={`relative mx-auto flex items-center ${contentRail} transition-[height] ${ease} ${scrolled ? "h-14" : "h-16"}`}>
          {/* Three balanced columns keep the nav truly centred while the equal
              side columns guarantee it never crowds the logo or the actions. */}
          <div className="flex flex-1 items-center">
          <Link href="/" className="flex items-center">
            {logoMark}
          </Link>
          </div>

          {/* Primary nav — centered between the two equal side columns */}
          <nav className="flex shrink-0 justify-center">
            <ul className="flex items-center">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  {link.disabled ? (
                    <span
                      aria-disabled="true"
                      className={disabledCls}
                    >
                      {link.label}
                    </span>
                  ) : link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkCls}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className={linkCls}
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Account actions — right. */}
          <div className="flex flex-1 items-center justify-end gap-1.5">
            {themeToggle && (() => {
              const light = themeToggle.theme === "light";
              // A single round icon button (not a two-segment toggle — that ate
              // too much nav width). It shows the mode you'd switch TO: a moon in
              // light, a sun in dark. Hidden below xl where the nav gets crammed;
              // the mobile menu still carries an Appearance switch.
              const ring = lightContent ? "ring-white/25" : "ring-foreground/15";
              const ink = lightContent
                ? "text-white/70 hover:text-white hover:bg-white/10"
                : "text-foreground/60 hover:text-foreground hover:bg-foreground/[0.06]";
              return (
                <button
                  type="button"
                  onClick={themeToggle.onToggle}
                  aria-label={light ? "Switch to dark theme" : "Switch to light theme"}
                  className={`mr-1.5 hidden size-8 items-center justify-center rounded-full ring-1 transition-colors xl:flex ${ring} ${ink}`}
                >
                  {light ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <circle cx="12" cy="12" r="4" />
                      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                    </svg>
                  )}
                </button>
              );
            })()}
            {!hideDemo && (
              <Link href={DEMO_URL} className={linkCls}>
                Book a demo
              </Link>
            )}
            <a
              href={APP_URL}
              className={linkCls}
            >
              Log in
            </a>
            <a href={APP_URL} className={ctaCls}>
              Get started
            </a>
          </div>
        </div>
      </header>

      {/* Mobile full-screen menu — portaled to <body> so it escapes the home
          content wrapper's stacking context (z-10) and paints above the
          announcement bar (z-40); otherwise the bar covers the overlay top. */}
      {mounted && mobileMenuOpen && createPortal(
        <div className={`fixed inset-0 z-[60] flex flex-col md:hidden ${menuSurface}`}>
          {/* Match the mobile header's padding (px-5) and height exactly so the
              logo stays put when the menu opens — it must not shift. */}
          <div className={`flex items-center justify-between border-b px-5 ${scrolled ? "h-12" : "h-14"} ${menuBorder}`}>
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center"
            >
              <Image
                src="/images/logo-mark.svg"
                alt="Assembly Studio"
                width={22}
                height={22}
                className={menuLogoInvert}
              />
            </Link>
            <div className="flex items-center gap-4">
              <a
                href={APP_URL}
                className={`text-sm ${menuMuted}`}
              >
                Log in
              </a>
              <a
                href={APP_URL}
                className={`rounded-lg px-4 py-2 text-sm ${menuCta}`}
              >
                Get started
              </a>
              <button
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                className={menuInk}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M6 6l12 12M6 18L18 6" />
                </svg>
              </button>
            </div>
          </div>

          <ul className="flex flex-1 flex-col gap-1 px-6 pt-6">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                {link.disabled ? (
                  <span
                    aria-disabled="true"
                    className={`block py-3 text-lg ${menuMuted}`}
                  >
                    {link.label}
                  </span>
                ) : link.external ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block py-3 text-lg ${menuInk}`}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    href={link.href}
                    className={`block py-3 text-lg ${menuInk}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          {themeToggle && (() => {
            const light = themeToggle.theme === "light";
            // Compact icon-only segments (sun / moon) — no labels; each targets an
            // explicit theme so only the inactive one acts on tap.
            const segCls = (active: boolean) =>
              `flex size-8 items-center justify-center rounded-full transition-colors ${active ? menuSegActive : menuMuted}`;
            return (
              <div className={`mt-auto flex justify-end border-t px-6 py-5 ${menuBorder}`}>
                <div className={`flex items-center gap-1 rounded-full border p-1 ${menuBorder}`} role="group" aria-label="Appearance">
                  <button
                    type="button"
                    onClick={() => { if (!light) themeToggle.onToggle(); }}
                    aria-pressed={light}
                    aria-label="Light theme"
                    className={segCls(light)}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <circle cx="12" cy="12" r="4" />
                      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => { if (light) themeToggle.onToggle(); }}
                    aria-pressed={!light}
                    aria-label="Dark theme"
                    className={segCls(!light)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })()}

          {!hideDemo && (
            <div className={`border-t px-6 py-6 ${menuBorder}`}>
              <Link
                href={DEMO_URL}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex w-full items-center justify-center rounded-lg border px-4 py-3 text-sm ${menuDemo}`}
              >
                Book a demo
              </Link>
            </div>
          )}
        </div>,
        document.body,
      )}
    </>
  );
}
