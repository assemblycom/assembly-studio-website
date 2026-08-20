"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { FOOTER_COLUMNS, type FooterGroup, type NavLink } from "@/lib/constants";
import { DiaGradient } from "@/components/ui/dia-gradient";
import type { ThemePreference } from "@/components/theme/theme-provider";

// V71's brand aurora (from hero-iterations) — green + blue on a near-black
// base, rising into blue → mint → lime and fading to transparent. Lives at the
// bottom of the reveal footer itself (one sheet, not a separate layer).
export const BRAND_AURORA = [
  { offset: 0, color: "#0a0e1c" },
  { offset: 0.16, color: "#243c9e" },
  { offset: 0.33, color: "#4f6bf9" },
  { offset: 0.48, color: "#8ea2f4" },
  { offset: 0.62, color: "#9fd6c4" },
  { offset: 0.76, color: "#c6e84f" },
  { offset: 0.88, color: "#d9ed92" },
  { offset: 1, color: "#d9ed9200" },
];

// Always-visible brand aurora at the bottom of the footer — a mobile band (fills
// more of its container) and a desktop band, each rising on mount. Exported so
// the proposal page can end in the same aurora without inheriting the footer's
// link columns (that page carries no navigation).
export function FooterAurora() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none relative -mt-44 h-[42vh] md:hidden"
        style={{
          maskImage: "linear-gradient(to bottom, transparent 0%, #000 18%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 18%)",
        }}
      >
        <div className="footer-aurora absolute inset-x-0 bottom-0 h-full">
          {/* Half the bars of the desktop band, because the viewBox is squashed to
              a quarter of its width here: at 14 the striations landed ~27px apart
              on screen (vs ~100px on a desktop) and read as grain rather than as
              aurora texture. Fewer, wider bars keep the pitch closer to desktop's,
              and the extra horizontal blur softens what's left. */}
          <DiaGradient stops={BRAND_AURORA} bars={9} blur={30} blurX={40} peak={0.96} valley={0.7} riseMs={1300} />
        </div>
      </div>
      <div
        aria-hidden
        className="pointer-events-none relative -mt-40 hidden h-[38vh] md:block"
        style={{
          maskImage: "linear-gradient(to bottom, transparent 0%, #000 8%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 8%)",
        }}
      >
        <div className="footer-aurora absolute inset-x-0 bottom-0 h-full">
          <DiaGradient stops={BRAND_AURORA} bars={14} blur={30} peak={0.98} valley={0.45} riseMs={1300} />
        </div>
      </div>
    </>
  );
}

// The footer's link set: the nav's own shelves (Product, Resources, Legal, from
// FOOTER_GROUPS) plus the socials. Kept in constants.ts so the nav and the
// footer cannot drift apart the way the old hand-maintained pair did.

// Social links point off-site, so they keep opening in a new tab (newTab).
const CONNECT: NavLink[] = [
  { label: "X", href: "https://x.com/assemblycom", external: true, newTab: true },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/assemblycom",
    external: true,
    newTab: true,
  },
  { label: "Instagram", href: "https://instagram.com/assembly", external: true, newTab: true },
  { label: "YouTube", href: "https://www.youtube.com/@assembly", external: true, newTab: true },
];

// The socials are the last column. They live here rather than in constants
// because nothing but the footer shows them.
const COLUMNS: FooterGroup[][] = [
  ...FOOTER_COLUMNS,
  [{ label: "Connect", links: CONNECT }],
];

function FooterLink({
  link,
  className,
}: {
  link: NavLink;
  className: string;
}) {
  return link.external ? (
    <a
      href={link.href}
      target={link.newTab ? "_blank" : undefined}
      rel={link.newTab ? "noopener noreferrer" : undefined}
      className={className}
    >
      {link.label}
    </a>
  ) : (
    <Link href={link.href} className={className}>
      {link.label}
    </Link>
  );
}

// Theme control (moved out of the nav into the footer). A three-way segmented
// switch — system / light / dark, like Cursor — reflecting the stored
// preference rather than just the resolved theme.
type ThemeToggle = {
  preference: ThemePreference;
  onSelect: (preference: ThemePreference) => void;
};

const THEME_OPTIONS: {
  value: ThemePreference;
  label: string;
  icon: ReactNode;
}[] = [
  {
    value: "system",
    label: "System theme",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    value: "light",
    label: "Light theme",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
    ),
  },
  {
    value: "dark",
    label: "Dark theme",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    ),
  },
];

function ThemeSwitch({
  toggle,
  onDark,
  frosted = false,
}: {
  toggle: ThemeToggle;
  onDark: boolean;
  // Frosted surface for when the switch sits over the footer aurora — a
  // translucent, blurred chip so it stays legible on the gradient.
  frosted?: boolean;
}) {
  // Light mode fills the active thumb with a grey wash rather than white: on a
  // near-white frosted bed a white thumb had only its shadow to separate it,
  // and the selection was easy to miss. Dark mode is untouched.
  const seg = (active: boolean) =>
    `flex size-7 items-center justify-center rounded-md transition-colors ${
      active
        ? onDark
          ? "bg-white/20 text-white"
          : "bg-foreground/[0.10] text-foreground"
        : onDark
          ? "text-white/65 hover:text-white"
          : "text-muted-foreground hover:text-foreground"
    }`;
  return (
    <div
      role="group"
      aria-label="Appearance"
      // Light mode drops the flat gray border: a hard outline over the colourful
      // aurora read as a pasted-on box. A soft ring plus a lift shadow makes it
      // sit on the gradient instead, and the higher white opacity stops the
      // aurora tinting the chip green.
      className={`inline-flex items-center gap-0.5 rounded-lg p-0.5 ${
        onDark ? "border border-white/25" : "ring-1 ring-black/[0.05]"
      } ${
        frosted
          ? onDark
            ? "bg-black/30 backdrop-blur-md"
            : "bg-white/85 shadow-[0_4px_16px_-8px_rgba(16,24,40,0.25)] backdrop-blur-md"
          : ""
      }`}
    >
      {THEME_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => toggle.onSelect(opt.value)}
          aria-pressed={toggle.preference === opt.value}
          aria-label={opt.label}
          title={opt.label}
          className={seg(toggle.preference === opt.value)}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  );
}

export function Footer({
  reveal = false,
  light = false,
  themeToggle,
}: {
  reveal?: boolean;
  // Light-toned reveal footer for content pages in light mode — the dark aurora
  // sheet stays reserved for the landing page (and dark mode). Composition is
  // identical, just re-toned.
  light?: boolean;
  themeToggle?: ThemeToggle;
}) {
  // The reveal variant (landing + content pages) is a dark sheet that ends in
  // the brand aurora. Composition (koto): the logo mark anchors the left; the
  // labelled link rows stack on the right, split by hairlines, over a slim
  // bottom bar carrying the copyright + theme switch.
  if (reveal) {
    // inline-block + vertical padding keeps each row a comfortable tap target
    // on touch screens — the bare 15px text line was easy to miss-tap.
    const linkCls = light
      ? "inline-block py-1 text-[15px] text-foreground transition-colors hover:text-muted-foreground"
      : "inline-block py-1 text-[15px] text-white transition-colors hover:text-white/70";
    // The dark face runs on the page's own ground rather than its own #101010,
    // which sat a clear step lighter than the #0a0a0a everything above it uses.
    // Only ever taken in dark mode (light={!dark} at the call site), so
    // bg-background is the dark ground here, never white.
    return (
      <footer
        className={`footer-reveal relative overflow-hidden ${
          light ? "bg-background text-foreground" : "bg-background text-white"
        }`}
      >
        {/* Container matches the nav rail (max-w-[1600px] px-6 md:px-10) so the
            first column's left edge lines up with the nav logo. */}
        {/* Container matches the nav rail (max-w-[1600px] px-6 md:px-10) so the
            first column's left edge lines up with the nav logo. */}
        {/* Full-bleed hairline divider at the footer's top edge — spans the
            full page width, and the home content rails connect into it with no
            gap. */}
        <div className={`border-t ${light ? "border-border" : "border-[#383838]"}`} />

        <div className="mx-auto max-w-[1600px] px-6 pb-12 md:px-10 md:pb-16">
          <div className="relative z-10 mt-10 md:mt-12">
            {/* Six tracks, kept from when a video card held the last two: the
                links now run the full width, and the switch keeps the far right
                corner. */}
            <div className="flex flex-col gap-10 lg:grid lg:grid-cols-6 lg:items-start lg:gap-x-10">
              <div className="grid grid-cols-2 gap-x-8 gap-y-10 lg:col-span-6 lg:grid-cols-5 lg:gap-x-6">
                {COLUMNS.map((column) => (
                  // A column can hold more than one group; the second sits under
                  // the first with its own label, the way a long shelf is split
                  // rather than left to run twice its neighbours' height.
                  <div
                    key={column[0].label}
                    className="flex flex-col gap-8 sm:min-w-32"
                  >
                    {column.map((group) => (
                      <div key={group.label}>
                        {/* Set in PP Mori at link size, greyed back: the label
                            reads as a quiet category marker above its items rather
                            than a mono eyebrow competing with them. */}
                        <p className={`text-[15px] ${light ? "text-muted-foreground" : "text-white/45"}`}>
                          {group.label}
                        </p>
                        <ul className="mt-4 flex flex-col gap-1.5">
                          {group.links.map((link) => (
                            <li key={link.label}>
                              <FooterLink link={link} className={linkCls} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              {themeToggle && (
                <div className="flex shrink-0 items-center gap-4 lg:col-span-6 lg:justify-self-end">
                  <ThemeSwitch toggle={themeToggle} onDark={!light} frosted />
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Brand aurora, always visible — carries the lower half of the footer
            now that the wordmark is gone (the footer keeps its generous height). */}
        <FooterAurora />
      </footer>
    );
  }

  // Plain variant (demo, error screens): compact neutral footer.
  return (
    <footer className="bg-background">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-6">
          <div className="col-span-2 md:col-span-1">
            <Image
              src="/images/logo-mark.svg"
              alt="Assembly"
              width={28}
              height={28}
            />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              The platform firms run on and build on.
            </p>
            {themeToggle && (
              <div className="mt-5">
                <ThemeSwitch toggle={themeToggle} onDark={!light} />
              </div>
            )}
          </div>
          {COLUMNS.map((column) => (
            <div key={column[0].label} className="flex flex-col gap-6">
              {column.map((section) => (
                <div key={section.label}>
                  <p className="text-sm font-normal">{section.label}</p>
                  <ul className="mt-3 flex flex-col gap-2">
                    {section.links.map((link) => (
                      <li key={link.label}>
                        <FooterLink
                          link={link}
                          className="inline-block py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
