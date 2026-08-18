"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import {
  NAV_ENTRIES,
  isNavGroup,
  APP_URL,
  SIGNUP_URL,
  LOGIN_URL,
  DEMO_URL,
  type NavGroup,
  type NavItem,
} from "@/lib/constants";
import { NavDropdown } from "@/components/layout/nav-dropdown";
import { useTheme } from "@/components/theme/theme-provider";

// Past this scroll distance the sticky header swaps from transparent to a
// frosted surface.
const SCROLL_THRESHOLD = 40;

export function StudioNav({
  fullWidth = false,
  darkTop = false,
  softGlass = false,
  maxWidthClass,
  restPaddingClass,
  narrowOnScroll = false,
  hideDemo = false,
  minimal = false,
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
  // Narrow the nav to the content rail once scrolled past the hero (home only);
  // other pages keep a constant width.
  narrowOnScroll?: boolean;
  // Hide the "Book a demo" CTA (both desktop and the mobile menu) — dropped for
  // launch on some heroes.
  hideDemo?: boolean;
  // Internal pages (the proposal creator): the same bar, same scroll behaviour
  // and same sizes, but the marketing links and account actions collapse to a
  // single way back to the site. There's no menu to open, so no burger either.
  minimal?: boolean;
  // Optional light/dark toggle rendered in the nav (used by themeable heroes).
  themeToggle?: { theme: "light" | "dark"; onToggle: () => void };
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // Signed-in visitors get a single "Open Assembly" action instead of the
  // Log in / Get started pair — mirrors www.assembly.com's signed-in nav.
  // The menu is portaled to <body>, so it needs the client to have mounted.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Honour prefers-reduced-motion for the nav's width/height easing, which we
  // drive with an inline transition (see rowTransition) rather than a Tailwind
  // class — so the class-based motion-reduce guard doesn't reach it.
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Home nav only: the nav narrows through the content, then widens back out
  // once the (wide) footer scrolls into view so it matches the footer width.
  const [atFooter, setAtFooter] = useState(false);
  useEffect(() => {
    if (!narrowOnScroll) return;
    const footer = document.querySelector("footer");
    if (!footer) return;
    // Fire only once the footer is clearly in view (30% up from the bottom),
    // not the instant its top grazes the viewport edge — otherwise tiny scroll
    // moves toggle it on/off and the width transition jitters.
    const io = new IntersectionObserver(
      ([entry]) => setAtFooter(entry.isIntersecting),
      { threshold: 0, rootMargin: "0px 0px -30% 0px" },
    );
    io.observe(footer);
    return () => io.disconnect();
  }, [narrowOnScroll]);

  // Close the mobile menu once the route actually changes, rather than on the
  // link's click. Keeping the overlay up until the new page is active means it
  // covers the navigation instead of vanishing to flash the old page first.
  const pathname = usePathname();
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // On the page the logo already points at, clicking it would be a no-op route
  // change, so scroll back to the top instead.
  const onLogoClick = (e: React.MouseEvent) => {
    if (pathname !== "/") return;
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Lock page scroll while the full-screen menu is open. The lock must not
  // move or freeze the scroll position (a fixed-body freeze made page
  // transitions jitter — the old scroll offset leaked onto the next page), so:
  // <html> gets overflow:hidden (stops wheel/keyboard scrolling), and a
  // non-passive touchmove guard on the overlay stops iOS touch scrolling,
  // while still allowing the menu's own list to scroll if it overflows.
  const menuScrollRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  // Handing focus back to the hamburger is right for a keyboard user and wrong
  // for a thumb: focusing it programmatically paints the focus ring, so the
  // trigger sat there looking pressed long after the menu had gone. Only the
  // closes that came from the keyboard ask for focus back.
  const restoreFocusRef = useRef(false);
  const closeMenu = (restoreFocus = false) => {
    restoreFocusRef.current = restoreFocus;
    setMobileMenuOpen(false);
  };
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const preventTouch = (e: TouchEvent) => {
      if (!menuScrollRef.current?.contains(e.target as Node)) e.preventDefault();
    };
    document.addEventListener("touchmove", preventTouch, { passive: false });
    return () => {
      document.documentElement.style.overflow = prev;
      document.removeEventListener("touchmove", preventTouch);
    };
  }, [mobileMenuOpen]);
  // The menu covers the page, so it has to behave like the modal it looks like:
  // focus moves into it, Tab cycles inside it, Escape closes it, and closing
  // hands focus back to the button that opened it. Without this the page behind
  // stayed in the tab order — 64 controls a keyboard user could tab into while
  // looking at a menu — and Escape did nothing.
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const menu = menuRef.current;
    if (!menu) return;
    // Captured now: by the time cleanup runs the ref may already point
    // somewhere else, and this is the button we owe focus back to.
    const trigger = menuTriggerRef.current;
    const SELECTOR =
      'a[href],button:not(:disabled),input,textarea,select,[tabindex]:not([tabindex="-1"])';
    const items = () =>
      [...menu.querySelectorAll<HTMLElement>(SELECTOR)].filter(
        (el) => el.getBoundingClientRect().width > 0,
      );
    // The dialog itself, not its first link. Focus has to come in here for the
    // trap and for Escape, but WebKit treats a programmatic focus as
    // keyboard-driven, so sending it to the logo painted the site's 2px
    // focus-visible ring around the mark on every tap. The container is
    // outline-none and invisible, and Tab from it still lands on the logo.
    menu.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu(true);
        return;
      }
      if (event.key !== "Tab") return;
      const list = items();
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement;
      // Focus parked on the container (the state it opens in) counts as "not on
      // an item": Tab takes the first, Shift+Tab the last, so the very first
      // keypress can't escape backwards out of the portal.
      if (!menu.contains(active) || active === menu) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      // Only when the menu itself closed — following a link navigates away, and
      // yanking focus back to the hamburger there would undo the navigation's
      // own focus handling.
      const active = document.activeElement;
      if (restoreFocusRef.current && (!active || active === document.body)) {
        trigger?.focus();
      }
      restoreFocusRef.current = false;
    };
  }, [mobileMenuOpen]);

  // The scrolled pill now matches the surface theme: a light capsule in light
  // contexts, a dark one over a dark hero/theme (darkTop). So contents are light
  // only in a dark context — dark otherwise, whether at rest or scrolled.
  const lightContent = softGlass ? false : darkTop;
  // Resolved site theme — the nav CTA turns lime in light mode only.
  const { theme } = useTheme();

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
  // Progressive frosted blur (à la Nothing's nav): a masked backdrop-blur that
  // fades out below the bar instead of ending on a hairline border. It extends
  // past the bar height so the blur eases off gradually over the content below.
  const darkSurface = !(softGlass || !darkTop);
  const navBlurStyle: CSSProperties = {
    backdropFilter: "blur(11px)",
    WebkitBackdropFilter: "blur(11px)",
    background: `linear-gradient(to bottom, ${
      darkSurface ? "rgba(14,14,16,0.5)" : "rgba(255,255,255,0.88)"
    } 0%, transparent 100%)`,
    maskImage:
      "linear-gradient(to bottom, #000 0%, #000 42%, transparent 100%)",
    WebkitMaskImage:
      "linear-gradient(to bottom, #000 0%, #000 42%, transparent 100%)",
  };

  // One shared easing/duration for the rest→pill transition so every animated
  // property (chrome, geometry, logo tint) settles together on the same soft
  // ease-out curve — no property snapping ahead of the others.
  const ease =
    "duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none";

  // The desktop nav's rail width changes by a large amount (320px) as it narrows
  // through the content and widens back out over the footer. The shared ease-out
  // curve front-loads that motion — most of the travel lands in the first ~100ms,
  // then it creeps to a stop, which reads as an aggressive lurch on a change this
  // big. So width gets its own gentle ease-in-out over a longer duration (it eases
  // in AND out, no lurch), while height keeps the snappy shared curve — the height
  // delta is only 8px, so it can settle quickly without drawing the eye.
  const rowTransition = reducedMotion
    ? "none"
    : "max-width 620ms cubic-bezier(0.65, 0, 0.35, 1), height 450ms cubic-bezier(0.22, 1, 0.36, 1)";

  // Wide at rest (matching the hero), then narrowing to the content rail
  // (1100px) once scrolled past the hero, so the nav settles in line with the
  // page content below.
  const maxWidth = fullWidth ? "max-w-none" : (maxWidthClass ?? "max-w-7xl");
  // On home, the nav narrows while scrolled through the content, then widens
  // back out over the (wide) footer. 1280 (not 1200) so the nav's own px-10
  // gutter lands its content exactly on the 1200px rail lines, aligning the
  // logo with the rails. Other pages keep maxWidth throughout.
  const narrowed = narrowOnScroll && !fullWidth && scrolled && !atFooter;
  const contentRail = `${narrowed ? "max-w-[1280px]" : maxWidth} ${fullWidth ? "px-8" : (restPaddingClass ?? "px-6")}`;

  // Content colors flip when the bar is on a dark surface. Light content always
  // sits over a dark surface (the scrolled dark pill or a dark hero/theme), so
  // it uses EXPLICIT white/ink rather than the background token — the token now
  // flips to dark in dark mode, which would make the light-content nav vanish.
  // The dark-content branch keeps the tokens so it tracks the theme correctly.
  // whitespace-nowrap keeps every label on one line so the pill never wraps.
  const darkLink = softGlass ? "text-foreground/90 hover:text-foreground" : "text-muted-foreground hover:text-foreground";
  const darkDisabled = softGlass ? "text-foreground/90" : "text-muted-foreground";
  const linkBase =
    "whitespace-nowrap rounded-full px-2 py-1.5 text-sm transition-colors lg:px-3";
  const linkRest = lightContent ? "text-white/70 hover:text-white" : darkLink;
  const linkCls = `${linkBase} ${linkRest}`;
  // The page you're on reads at full strength while the rest sit back — the
  // same contrast step the links already use for hover, so no new treatment.
  // Section pages count as their section (/templates/<slug> lights Templates).
  const isCurrent = (href: string) =>
    href.startsWith("/") &&
    (pathname === href || (href !== "/" && pathname.startsWith(`${href}/`)));
  // The colour token is SWAPPED, never appended: two text-* utilities on one
  // element are the same specificity, so stylesheet order decides the winner
  // and the muted one kept it.
  const navLinkCls = (href: string) =>
    `${linkBase} ${
      isCurrent(href) ? (lightContent ? "text-white" : "text-foreground") : linkRest
    }`;
  // A group reads as current while you're on any page inside it, so "Product"
  // stays lit through /templates.
  const groupTriggerCls = (group: NavGroup) =>
    `${linkBase} ${
      group.items.some((item) => isCurrent(item.href))
        ? lightContent
          ? "text-white"
          : "text-foreground"
        : linkRest
    }`;
  // One row of the mobile sheet. Picking a page dismisses the menu: a
  // client-side route change leaves this overlay mounted on its own, so
  // without it the new page loads silently behind a menu that looks like
  // nothing happened.
  //
  // The current page is marked the way the desktop nav marks it — full-strength
  // ink against muted siblings, not a heavier weight, since `font-medium` maps
  // to PP Mori SemiBold here. An off-site link stays muted: it is never the
  // page you are on, so at full ink it read as a second current page.
  const renderMenuLink = (link: NavItem) => {
    if (link.disabled) {
      return (
        <span aria-disabled="true" className={`block py-3 text-lg ${menuMuted}`}>
          {link.label}
        </span>
      );
    }
    if (link.external) {
      return (
        <a
          href={link.href}
          target={link.newTab ? "_blank" : undefined}
          rel={link.newTab ? "noopener noreferrer" : undefined}
          onClick={() => closeMenu()}
          className={`block py-3 text-lg ${menuMuted}`}
        >
          {link.label}
        </a>
      );
    }
    return (
      <Link
        href={link.href}
        aria-current={isCurrent(link.href) ? "page" : undefined}
        onClick={() => closeMenu()}
        className={`block py-3 text-lg ${
          isCurrent(link.href) ? menuInk : menuMuted
        }`}
      >
        {link.label}
      </Link>
    );
  };

  const disabledCls = `cursor-default whitespace-nowrap rounded-full px-2 py-1.5 text-sm lg:px-3 ${lightContent ? "text-white/50" : darkDisabled}`;
  const ctaCls = `whitespace-nowrap rounded-lg px-4 py-1.5 text-sm transition-[background-color,color,opacity] hover:opacity-90 ${
    theme === "light"
      ? "bg-neutral-900 text-white"
      : lightContent
        ? "bg-white text-neutral-900"
        : "bg-foreground text-background"
  }`;
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
    // Hysteresis (dead-zone around the threshold): the nav shrinks a touch on
    // scroll, which nudges layout right at the cutoff. With a single threshold
    // that nudge can re-cross it and flip the state back and forth — a visible
    // jitter/vibration. Requiring the scroll to move past a margin before
    // toggling in each direction stops the oscillation.
    const MARGIN = 24;
    const onScroll = () =>
      setScrolled((prev) =>
        prev
          ? window.scrollY > SCROLL_THRESHOLD - MARGIN
          : window.scrollY > SCROLL_THRESHOLD + MARGIN,
      );
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Mobile header — mirrors the desktop nav: transparent with light
          contents over the dark hero, settling into the same dark glass pill on
          scroll. Logo on the left, grid menu button on the right. */}
      {/* This bar stays MOUNTED AND VISIBLE while the menu is open, and rises
          above the overlay, so its logo is the only logo: the menu row is pixel-
          aligned to this one and used to redraw the same mark itself, which meant
          every open and close swapped one img element for another and the mark
          visibly blinked. Only the parts the menu replaces are hidden — the
          backdrop-filter layer (painting one under a fixed overlay flickers on
          iOS) and the trigger, whose place the close button takes.
          pointer-events pass through to the menu underneath; only the logo
          itself stays tappable. */}
      <header className={`${position} transition-colors ${ease} lg:hidden ${scrolled ? "bg-background" : ""} ${mobileMenuOpen ? "pointer-events-none z-[70]" : "z-50"}`}>
        {/* The frosted pane is the at-rest look over a hero. Once scrolled the
            bar is filled instead: on a phone the blur left page copy sliding
            under the logo, which reads as a hole in the page rather than glass —
            plainest of all above the post contents bar, which is opaque. */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 top-0 h-[135%] transition-opacity ${ease} opacity-0 ${mobileMenuOpen ? "invisible" : ""}`}
          style={navBlurStyle}
        />
        <div className={`relative z-10 flex items-center justify-between px-5 transition-[height] ${ease} ${scrolled ? "h-12" : "h-14"}`}>
          <Link
            href="/"
            onClick={(e) => {
              if (mobileMenuOpen) closeMenu();
              onLogoClick(e);
            }}
            className="pointer-events-auto flex items-center"
          >
            {logoMark}
          </Link>
          {/* The minimal bar carries nothing on mobile: at 375px the full-width
              "Back to homepage" button was the loudest thing on the screen, and
              the logo beside it already goes home. It stays on desktop, where
              there's room for it. */}
          {minimal ? null : (
          <button
            ref={menuTriggerRef}
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            className={`flex size-9 items-center justify-center transition-[color,opacity] ${ease} active:opacity-60 ${lightContent ? "text-white" : "text-foreground"} ${mobileMenuOpen ? "invisible" : ""}`}
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
          )}
        </div>
      </header>

      {/* Desktop header — full-bleed bar: transparent at the top, frosted
          full-width surface with a hairline bottom border on scroll */}
      <header className={`${position} z-50 hidden transition-colors ${ease} lg:block`}>
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 top-0 h-[135%] transition-opacity ${ease} ${scrolled ? "opacity-100" : "opacity-0"}`}
          style={navBlurStyle}
        />
        <div
          className={`relative z-10 mx-auto flex items-center ${contentRail} ${scrolled ? "h-14" : "h-16"}`}
          style={{ transition: rowTransition }}
        >
          {/* Three balanced columns keep the nav truly centred while the equal
              side columns guarantee it never crowds the logo or the actions. */}
          <div className="flex flex-1 items-center">
          <Link href="/" onClick={onLogoClick} className="flex items-center">
            {logoMark}
          </Link>
          </div>

          {/* Primary nav — centered between the two equal side columns */}
          <nav className={`flex shrink-0 justify-center ${minimal ? "hidden" : ""}`}>
            <ul className="flex items-center">
              {NAV_ENTRIES.map((entry) =>
                isNavGroup(entry) ? (
                  <li key={entry.label}>
                    <NavDropdown
                      group={entry}
                      triggerClassName={groupTriggerCls(entry)}
                      chevronClassName={
                        lightContent ? "text-white/50" : "text-foreground/40"
                      }
                    />
                  </li>
                ) : (
                  <li key={entry.href}>
                    {entry.disabled ? (
                      <span aria-disabled="true" className={disabledCls}>
                        {entry.label}
                      </span>
                    ) : entry.external ? (
                      <a
                        href={entry.href}
                        target={entry.newTab ? "_blank" : undefined}
                        rel={entry.newTab ? "noopener noreferrer" : undefined}
                        className={linkCls}
                      >
                        {entry.label}
                      </a>
                    ) : (
                      <Link
                        href={entry.href}
                        aria-current={isCurrent(entry.href) ? "page" : undefined}
                        className={navLinkCls(entry.href)}
                      >
                        {entry.label}
                      </Link>
                    )}
                  </li>
                ),
              )}
            </ul>
          </nav>

          {/* Account actions — right. */}
          <div className="flex flex-1 items-center justify-end gap-1.5">
            {themeToggle && (() => {
              const light = themeToggle.theme === "light";
              // A bare icon glyph (no ring — the outlined circle read heavy in
              // the nav). It shows the mode you'd switch TO: a moon in light, a
              // sun in dark, with only a soft hover fill like the nav links.
              // Shown whenever the centered desktop nav is (lg+). Below lg the
              // whole bar collapses to the hamburger, whose menu carries an
              // Appearance switch instead.
              const ink = lightContent
                ? "text-white/70 hover:text-white hover:bg-white/10"
                : "text-foreground/60 hover:text-foreground hover:bg-foreground/[0.06]";
              return (
                <button
                  type="button"
                  onClick={themeToggle.onToggle}
                  aria-label={light ? "Switch to dark theme" : "Switch to light theme"}
                  className={`mr-1.5 hidden size-8 items-center justify-center rounded-lg transition-colors lg:flex ${ink}`}
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
            {/* Both states ship in the markup and `data-authed` on <html>
                picks one before paint — see globals.css. `contents` so the
                wrapper doesn't become a flex item of its own. */}
            {minimal ? null : (
              <>
                <span className="contents auth-only">
                  <a href={APP_URL} className={ctaCls}>
                    Open Assembly
                  </a>
                </span>
                <span className="contents unauth-only">
                  {!hideDemo && (
                    <Link href={DEMO_URL} className={linkCls}>
                      Book a demo
                    </Link>
                  )}
                  <a href={LOGIN_URL} className={linkCls}>
                    Log in
                  </a>
                  <a href={SIGNUP_URL} className={ctaCls}>
                    Get started
                  </a>
                </span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile full-screen menu — portaled to <body> so it escapes the home
          content wrapper's stacking context (z-10) and paints above the nav. */}
      {mounted && mobileMenuOpen && createPortal(
        <div
          ref={menuRef}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          tabIndex={-1}
          className={`fixed inset-0 z-[60] flex flex-col outline-none lg:hidden ${menuSurface}`}
        >
          {/* Match the mobile header's padding (px-5) and height exactly so the
              logo stays put when the menu opens — it must not shift.
              The hairline lives on the panel below rather than as a border-b
              here: heights are border-box, so a border on this row shrank its
              content box to 55px and lifted both glyphs half a pixel against
              the header they're meant to replace. */}
          <div className={`flex shrink-0 items-center justify-between px-5 ${scrolled ? "h-12" : "h-14"}`}>
            {/* No logo here — the header's own one shows through from above (see
                the header comment). This just reserves its 22px so the close
                button lands exactly where the trigger was. */}
            <div aria-hidden className="w-[22px]" />
            <div className="flex items-center gap-4">
              <button
                // detail === 0 means the click came from Enter/Space rather
                // than a pointer, which is the case that wants focus back.
                onClick={(e) => closeMenu(e.detail === 0)}
                aria-label="Close menu"
                // Same size-9 box as the hamburger it replaces — without it the
                // glyph sat flush to the gutter and the icon visibly hopped 7px
                // sideways the moment the menu opened.
                className={`flex size-9 items-center justify-center ${menuInk}`}
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

          <div ref={menuScrollRef} className={`flex flex-1 flex-col overflow-y-auto overscroll-contain border-t px-5 pt-6 ${menuBorder}`}>
            <ul className="flex flex-col gap-1">
              {/* The sheet has the height the bar doesn't, so a group is a
                  labelled section with its pages under it rather than a second
                  thing to tap open. */}
              {NAV_ENTRIES.flatMap((entry, i) =>
                isNavGroup(entry)
                  ? [
                      <li key={entry.label} className="pt-5 first:pt-0">
                        <p
                          className={`font-mono text-xs uppercase tracking-wide ${menuMuted}`}
                        >
                          {entry.label}
                        </p>
                      </li>,
                      ...entry.items.map((item) => (
                        <li key={item.href}>{renderMenuLink(item)}</li>
                      )),
                    ]
                  : [
                      // The ungrouped links need air after a group's list, or
                      // they read as more of that group.
                      <li
                        key={entry.href}
                        className={
                          i > 0 && isNavGroup(NAV_ENTRIES[i - 1]) ? "pt-5" : ""
                        }
                      >
                        {renderMenuLink(entry)}
                      </li>,
                    ],
              )}
            </ul>

            {/* Appearance toggle — kept with the nav list (under Pricing)
                rather than pinned to the bottom of the sheet. */}
            {themeToggle && (() => {
              const light = themeToggle.theme === "light";
              const segCls = (active: boolean) =>
                `flex size-6 items-center justify-center rounded-full transition-colors ${active ? menuSegActive : menuMuted}`;
              return (
                <div className="mt-3">
                  <div className={`inline-flex items-center gap-0.5 rounded-full border p-0.5 ${menuBorder}`} role="group" aria-label="Appearance">
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
          </div>

          {/* Bottom actions — stacked full-width so both read the same size. */}
          <div className="flex flex-col gap-3 px-5 pb-8 pt-4">
            <span className="contents auth-only">
              <a
                href={APP_URL}
                className={`flex w-full items-center justify-center rounded-lg px-4 py-3 text-sm ${menuCta}`}
              >
                Open Assembly
              </a>
            </span>
            <span className="contents unauth-only">
              <a
                href={SIGNUP_URL}
                className={`flex w-full items-center justify-center rounded-lg px-4 py-3 text-sm ${menuCta}`}
              >
                Get started
              </a>
              <a
                href={LOGIN_URL}
                className={`flex w-full items-center justify-center rounded-lg border px-4 py-3 text-sm ${menuDemo}`}
              >
                Log in
              </a>
            </span>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
