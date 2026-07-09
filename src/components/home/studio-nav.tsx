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
  logoVideo,
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
  // Optional animated logo (e.g. a .webm). When set, replaces the static mark
  // with a looping video and skips the invert tint (the video carries color).
  logoVideo?: string;
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
  // The scrolled pill is a single dark capsule on every surface, so its contents
  // are light whenever the pill is showing. At rest, contents are light only on a
  // dark-hero page (darkTop); over a white page they stay dark. The soft-glass
  // pill is light, so contents stay dark even when scrolled.
  const lightContent = softGlass ? false : scrolled || darkTop;

  // Sticky so the nav follows you down. At the top it's a transparent, dark-on-
  // light bar; once scrolled it settles into a floating capsule ("pill") with
  // light contents, à la Superpower.
  // Sticks to the top; the announcement bar above it scrolls away in flow.
  const position = "sticky top-0";
  // One consistent floating capsule on every surface: a near-opaque dark pill.
  // A translucent fill takes on whatever is behind it and visibly smears as the
  // bar crosses a light/dark boundary (e.g. the white composer over the dark
  // hero), so we keep it dark and near-solid — legible on the hero via its ring,
  // clean over white content below.
  const pill = softGlass
    ? "rounded-full bg-white/65 ring-1 ring-black/[0.06] shadow-[0_10px_30px_-16px_rgba(70,80,140,0.4)] backdrop-blur-xl"
    : "rounded-full bg-[#141414]/90 ring-1 ring-white/12 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.45)] backdrop-blur-xl";

  // One shared easing/duration for the rest→pill transition so every animated
  // property (chrome, geometry, logo tint) settles together on the same soft
  // ease-out curve — no property snapping ahead of the others.
  const ease =
    "duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none";

  // Keep the same rail width at rest and when scrolled so the capsule doesn't
  // visibly shrink. The scrolled outer gutter (px-6) sits just inside the hero
  // box gutter (px-4) so the pill doesn't touch the box edges.
  const maxWidth = fullWidth ? "max-w-none" : (maxWidthClass ?? "max-w-7xl");
  const restInner = `h-16 ${maxWidth} ${fullWidth ? "px-8" : (restPaddingClass ?? "px-6")}`;
  // Left keeps a small inset for the logo mark; the right is tightened so the
  // rounded end of the "Get started" capsule nests concentrically inside the
  // pill's rounded end (gap ≈ pill radius − button radius) instead of floating.
  const scrolledInner = `h-12 ${maxWidth} pl-4 pr-1.5 ${pill}`;

  // Content colors flip when the bar is on a dark surface. whitespace-nowrap
  // keeps every label on one line so the scrolled pill never wraps its actions.
  // The soft-glass nav sits on a light tinted gradient where muted grey reads
  // too faint, so its dark-content links use a stronger ink tone.
  const darkLink = softGlass ? "text-foreground/90 hover:text-foreground" : "text-muted-foreground hover:text-foreground";
  const darkDisabled = softGlass ? "text-foreground/90" : "text-muted-foreground";
  const linkCls = `whitespace-nowrap rounded-full px-2 py-1.5 text-sm transition-colors lg:px-3 ${lightContent ? "text-background/70 hover:text-background" : darkLink}`;
  const disabledCls = `cursor-default whitespace-nowrap rounded-full px-2 py-1.5 text-sm lg:px-3 ${lightContent ? "text-background/50" : darkDisabled}`;
  const ctaCls = `whitespace-nowrap rounded-full px-4 py-1.5 text-sm transition-[background-color,color,opacity] hover:opacity-90 ${lightContent ? "bg-background text-foreground" : "bg-foreground text-background"}`;
  const logoInvert = lightContent ? "brightness-0 invert" : "";

  // On a dark-hero page (e.g. V72) the full-screen mobile menu stays dark to
  // match the hero ground, rather than flashing a white overlay. Mirrors V72's
  // ground (#0a0a0b), white ink, and white/10 hairlines.
  const menuSurface = darkTop ? "bg-[#0a0a0b] text-white" : "bg-background";
  const menuBorder = darkTop ? "border-white/10" : "border-border";
  const menuMuted = darkTop ? "text-white/50" : "text-muted-foreground";
  const menuInk = darkTop ? "text-white" : "text-foreground";
  const menuCta = darkTop ? "bg-white text-neutral-900" : "bg-foreground text-background";
  const menuDemo = darkTop ? "border-white/20 text-white" : "border-foreground/20 text-foreground";
  const menuLogoInvert = darkTop ? "brightness-0 invert" : "";

  // The nav logo — a clean white mark at rest, swapping to the animated metal
  // video once the bar condenses into its pill on scroll.
  const logoMark = logoVideo && scrolled ? (
    // eslint-disable-next-line jsx-a11y/media-has-caption
    <video
      src={logoVideo}
      autoPlay
      loop
      muted
      playsInline
      aria-label="Assembly Studio"
      className="size-9 rounded-md object-cover"
    />
  ) : (
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
      <header className={`${position} z-50 transition-[padding] ${ease} md:hidden ${scrolled ? "px-3 pt-2" : ""}`}>
        <div className={`flex items-center justify-between transition-[height,padding,background-color,box-shadow,border-radius,backdrop-filter] ${ease} ${scrolled ? `h-12 px-4 ${pill}` : "h-14 px-5"}`}>
          <Link href="/" className="flex items-center">
            {logoMark}
          </Link>
          <button
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
            className={`flex size-9 items-center justify-center transition-[color,opacity] ${ease} active:opacity-60 ${lightContent ? "text-background" : "text-foreground"}`}
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

      {/* Desktop header — full-width bar at the top, floating dark pill on scroll */}
      <header className={`${position} z-50 hidden transition-[padding] ${ease} md:block ${scrolled ? "px-6 pt-2" : ""}`}>
        <div className={`relative mx-auto flex items-center transition-[height,padding,background-color,box-shadow,border-radius,backdrop-filter] ${ease} ${scrolled ? scrolledInner : restInner}`}>
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

          {/* Account actions — right */}
          <div className="flex flex-1 items-center justify-end gap-1">
            {themeToggle && (() => {
              const light = themeToggle.theme === "light";
              const track = lightContent ? "ring-background/25" : "ring-foreground/15";
              const knob = lightContent ? "bg-background/15" : "bg-foreground/10";
              const activeInk = lightContent ? "text-background" : "text-foreground";
              const idleInk = lightContent ? "text-background/45" : "text-foreground/40";
              return (
                <button
                  type="button"
                  role="switch"
                  aria-checked={!light}
                  onClick={themeToggle.onToggle}
                  aria-label={light ? "Switch to dark theme" : "Switch to light theme"}
                  className={`mr-1.5 flex items-center gap-0.5 rounded-full p-0.5 ring-1 transition-colors ${track}`}
                >
                  <span className={`flex size-6 items-center justify-center rounded-full transition-colors ${light ? `${knob} ${activeInk}` : idleInk}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <circle cx="12" cy="12" r="4" />
                      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                    </svg>
                  </span>
                  <span className={`flex size-6 items-center justify-center rounded-full transition-colors ${!light ? `${knob} ${activeInk}` : idleInk}`}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                  </span>
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
          <div className={`flex h-14 items-center justify-between border-b px-6 ${menuBorder}`}>
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
                className={`rounded-full px-4 py-2 text-sm ${menuCta}`}
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

          {!hideDemo && (
            <div className={`border-t px-6 py-6 ${menuBorder}`}>
              <Link
                href={DEMO_URL}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex w-full items-center justify-center rounded-full border px-4 py-3 text-sm ${menuDemo}`}
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
