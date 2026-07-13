"use client";

import Image from "next/image";
import Link from "next/link";
import { APP_URL, DOCS_URL, type NavLink } from "@/lib/constants";
import { DiaGradient } from "@/components/ui/dia-gradient";

// V71's brand aurora (from hero-iterations) — green + blue on a near-black
// base, rising into blue → mint → lime and fading to transparent. Lives at the
// bottom of the reveal footer itself (one sheet, not a separate layer).
const BRAND_AURORA = [
  { offset: 0, color: "#0a0e1c" },
  { offset: 0.16, color: "#243c9e" },
  { offset: 0.33, color: "#4f6bf9" },
  { offset: 0.48, color: "#8ea2f4" },
  { offset: 0.62, color: "#9fd6c4" },
  { offset: 0.76, color: "#c6e84f" },
  { offset: 0.88, color: "#d9ed92" },
  { offset: 1, color: "#d9ed9200" },
];

// Two-column link set for the reveal footer (IntegratedBio-style composition):
// site pages under "Navigate", socials under "Connect".
const NAVIGATE: NavLink[] = [
  { label: "Customers", href: "/customers" },
  { label: "Templates", href: "/templates" },
  { label: "Security", href: "/security" },
  { label: "Pricing", href: "/pricing" },
  { label: "Docs", href: DOCS_URL, external: true },
];

const CONNECT: NavLink[] = [
  { label: "X", href: "https://x.com/assemblycom", external: true },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/assemblycom",
    external: true,
  },
  { label: "Instagram", href: "https://instagram.com/assembly", external: true },
  { label: "YouTube", href: "https://www.youtube.com/@assembly", external: true },
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
      target="_blank"
      rel="noopener noreferrer"
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

export function Footer({ reveal = false }: { reveal?: boolean }) {
  // The reveal variant (landing + content pages) is a dark sheet that lifts to
  // reveal the gradient panel below. Composition: mission statement on the
  // left, Navigate/Connect columns + back-to-top on the right, and the brand
  // word set huge across the bottom.
  if (reveal) {
    const linkCls =
      "text-[15px] text-white/60 transition-colors hover:text-white";
    const monoLabel =
      "font-[family-name:var(--font-diatype-mono)] text-xs uppercase tracking-wide text-white/40";
    return (
      <footer className="footer-reveal overflow-hidden bg-[#101010] text-white">
        <div className="mx-auto max-w-7xl px-6 pt-16 md:pt-20">
          <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between md:gap-8">
            {/* Left cluster — mark, then Navigate + Connect beside it. */}
            <div className="flex flex-col items-start gap-10 md:flex-row md:gap-14">
              <Image
                src="/images/logo-mark.svg"
                alt="Assembly Studio"
                width={28}
                height={28}
                className="invert"
              />
              {/* Navigate */}
              <div className="md:border-l md:border-white/15 md:pl-8">
                <p className={monoLabel}>Navigate</p>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {NAVIGATE.map((link) => (
                    <li key={link.label}>
                      <FooterLink link={link} className={linkCls} />
                    </li>
                  ))}
                </ul>
              </div>
              {/* Connect */}
              <div className="md:border-l md:border-white/15 md:pl-8">
                <p className={monoLabel}>Connect</p>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {CONNECT.map((link) => (
                    <li key={link.label}>
                      <FooterLink link={link} className={linkCls} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right cluster — Ask AI column + back-to-top. */}
            <div className="flex items-start gap-10 md:gap-14">
              <div className="md:border-l md:border-white/15 md:pl-8">
                <p className={monoLabel}>Ask AI about Assembly</p>
                <div className="mt-4 flex items-center gap-2">
                  {[
                    { src: "/images/ai-chatgpt.svg", label: "ChatGPT" },
                    { src: "/images/ai-claude.svg", label: "Claude" },
                    { src: "/images/ai-gemini.svg", label: "Gemini" },
                    { src: "/images/ai-vector.svg", label: "Grok" },
                  ].map((ai) => (
                    <a
                      key={ai.label}
                      href={APP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Ask ${ai.label} about Assembly Studio`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-white transition-transform hover:-translate-y-0.5"
                    >
                      <Image
                        src={ai.src}
                        alt={ai.label}
                        width={18}
                        height={18}
                        className="h-[18px] w-[18px] object-contain"
                      />
                    </a>
                  ))}
                </div>
              </div>
              {/* Back to top — desktop only; on mobile the footer is compact
                  enough that the control is just clutter. */}
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                aria-label="Back to top"
                className="hidden size-10 shrink-0 items-center justify-center rounded-xl border border-white/15 text-white/70 transition-colors hover:border-white/40 hover:text-white md:flex"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M8 13V3M8 3L3.5 7.5M8 3l4.5 4.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Brand word — PP Mori Regular, slightly oversized past the viewport
              so the footer's overflow-hidden crops just the left and right
              edges. w-max + translate centers the word on the viewport exactly
              (text-align centering drifts with the font's side bearings), and
              it sits fully above the bottom edge — no vertical crop. */}
          <p
            aria-hidden
            className="relative left-1/2 mt-14 hidden w-max -translate-x-1/2 select-none whitespace-nowrap pb-4 text-[26vw] font-normal leading-[0.8] tracking-[-0.04em] text-white md:mt-16 md:block"
          >
            Assembly
          </p>
        </div>

        {/* Aurora — bottom of the same sheet (replaces the old fixed
            overscroll panel; same visible height as the reveal gap had).
            Shorter on mobile, where the wordmark is hidden and the footer
            should stay compact. */}
        <div
          aria-hidden
          className="pointer-events-none relative mt-10 h-[22vh] md:mt-0 md:h-[42vh]"
        >
          <div className="footer-aurora absolute inset-x-0 bottom-0 h-full">
            <DiaGradient
              stops={BRAND_AURORA}
              bars={11}
              blur={26}
              peak={0.72}
              valley={0.45}
              riseMs={1300}
            />
          </div>
        </div>
      </footer>
    );
  }

  // Plain variant (demo, error screens): compact neutral footer.
  return (
    <footer className="bg-background">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Image
              src="/images/logo-mark.svg"
              alt="Assembly Studio"
              width={28}
              height={28}
            />
          </div>
          {[
            { title: "Navigate", links: NAVIGATE },
            { title: "Connect", links: CONNECT },
          ].map((section) => (
            <div key={section.title}>
              <p className="text-sm font-normal">{section.title}</p>
              <ul className="mt-3 flex flex-col gap-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <FooterLink
                      link={link}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
