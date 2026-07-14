"use client";

import { memo, useEffect, useRef, useState } from "react";
import { APP_URL } from "@/lib/constants";
import { TEMPLATES, type Template } from "@/lib/templates";
import { IconArrow } from "./icons";
import { V66Composer } from "./hero-v66";
import { PROMPT_IDEAS } from "./prompt-ideas";
import { V69CardMock } from "./hero-v71";
import { StudioNav } from "./studio-nav";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/components/theme/theme-provider";

// ─────────────────────────────────────────────────────────────────────────
// HERO V76 — V75 as the base, adding a SELECTOR FRAME around the template
// cards: one card is selected (framed) at a time, first by default, and the
// frame glides smoothly to whichever card you click. Themeable like V75.
// ─────────────────────────────────────────────────────────────────────────

const MONO = '"ABC Diatype Mono", ui-monospace, SFMono-Regular, Menlo, monospace';
const RAIL = "mx-auto max-w-[1600px] px-6 md:px-10";
const FRAME_PAD = 6; // breathing room between the card and the selector ring

// Prompt Ideas data + seeded-composer behavior live in prompt-ideas.ts,
// shared with the bottom CTA so the two boxes read identically.

// Strip shows the most-used templates, ranked by real usage.
const STRIP_ORDER = [
  "onboarding-wizard",
  "client-project-tracker",
  "client-support-requests",
  "client-ai-assistant",
  "client-engagement-dashboard",
  "document-collection",
  "proposal-builder",
  "content-approval-flow",
];
const CAROUSEL: Template[] = STRIP_ORDER
  .map((slug) => TEMPLATES.find((t) => t.slug === slug))
  .filter((t): t is Template => Boolean(t));


function IconChevron({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

// Rail widgets render on the neutral light mock skin (white surface, grey wells,
// dark ink) — a calm, monochrome gallery rather than saturated colour tiles.
// Kept as an (empty) override map so a card can opt back into a full-bleed hue
// later without restructuring; today none do.
const CARD_HUE: Record<string, string> = {};

const TemplateCard = memo(function TemplateCard({
  template,
  index,
  onSelect,
  dark,
}: {
  template: Template;
  index: number;
  onSelect: (i: number) => void;
  dark: boolean;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      data-card={index}
      // Hover (and keyboard focus) glides the selector frame to this card;
      // the actual click is reserved for routing to the login/app (not wired
      // here — that's product logic for later).
      onMouseEnter={() => onSelect(index)}
      onFocus={() => onSelect(index)}
      className="group w-[212px] shrink-0 origin-center cursor-pointer text-left outline-none transition-transform duration-200 ease-out"
    >
      <Card
        size="sm"
        className={`gap-0 rounded-[20px] py-0 pb-0! ring-1 transition-[transform,box-shadow] duration-200 ease-out [will-change:transform] ${dark ? "ring-white/15 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.8)]" : "ring-black/[0.07] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_28px_-18px_rgba(16,24,40,0.20)]"}`}
      >
        {(() => {
          const hue = CARD_HUE[template.slug];
          return (
            <div
              data-slot="card-media"
              className={`h-[212px] w-full overflow-hidden [font-family:var(--font-inter),system-ui,sans-serif] ${hue ? "v72-mock-color" : dark ? "v72-mock-dark" : ""}`}
              style={hue ? { backgroundColor: hue } : undefined}
            >
              <div className="h-full w-full">
                <V69CardMock slug={template.slug} />
              </div>
            </div>
          );
        })()}
      </Card>
      <p className={`mt-3 line-clamp-2 text-[13px] font-normal leading-[1.3] ${dark ? "text-white" : "text-neutral-900"}`}>{template.title}</p>
      <p className={`mt-1 text-[11px] ${dark ? "text-white/50" : "text-neutral-500"}`}>{template.category}</p>
    </div>
  );
});

export function HeroV76({
  showPlus = true,
  showBody = false,
}: { showPlus?: boolean; showBody?: boolean } = {}) {
  // Theme is global now (persisted, applied to <html data-theme>), so the hero
  // reads it from context and the nav toggle drives the whole site.
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";

  // The box opens empty with the animated "Build …" typewriter placeholder;
  // typing or picking a Prompt Idea replaces it with the visitor's own text.
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [prompt, setPrompt] = useState("");

  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);
  const rowRef = useRef<HTMLDivElement>(null);
  const updateArrows = () => {
    const el = rowRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  // The selected card — framed by the selector ring, bright while the rest dim.
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [frame, setFrame] = useState({ x: 24 - FRAME_PAD, top: 24 - FRAME_PAD, w: 212 + 2 * FRAME_PAD, h: 212 + 2 * FRAME_PAD });
  // Gate the glide transition until after the first measure has painted, so the
  // frame snaps to the selected card on load instead of visibly sliding in from
  // its placeholder position.
  const [frameReady, setFrameReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setFrameReady(true)));
    return () => cancelAnimationFrame(id);
  }, []);

  // The selector frame + video CTA are a desktop experience; on mobile the
  // templates are just a plain swipeable row.
  const [isDesktop, setIsDesktop] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Set by the arrows (not hover): the next measure scrolls the card fully clear
  // of the edge fade so it never lands half-hidden under the mask. Hover keeps
  // its gentle in-view nudge untouched.
  const stepScrollRef = useRef(false);

  // Measure the selected card and glide the frame to it; keep it in view.
  // getBoundingClientRect (not offsetLeft) so it's independent of which
  // ancestor is the offsetParent; re-measured on layout via ResizeObserver.
  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const measure = () => {
      const cardEl = row.querySelector<HTMLElement>(`[data-card="${selectedIndex}"]`);
      const media = cardEl?.querySelector<HTMLElement>('[data-slot="card-media"]');
      if (!cardEl || !media) return;
      const rowRect = row.getBoundingClientRect();
      const mRect = media.getBoundingClientRect();
      if (mRect.width < 40 || mRect.height < 40) return; // not laid out yet
      setFrame({
        x: mRect.left - rowRect.left + row.scrollLeft - FRAME_PAD,
        top: mRect.top - rowRect.top - FRAME_PAD,
        w: mRect.width + 2 * FRAME_PAD,
        h: mRect.height + 2 * FRAME_PAD,
      });
      // Keep the selected card in view (horizontal scroll only). Measure the WHOLE
      // card — not just its media — so an arrow step lands the entire card fully
      // past the edge fade instead of clipping its trailing edge. Arrow steps ask
      // for a wider clearance (72px); hover keeps the gentle 24px nudge.
      const cRect = cardEl.getBoundingClientRect();
      const step = stepScrollRef.current;
      stepScrollRef.current = false;
      const edge = step ? 72 : 8;
      const clear = step ? 72 : 24;
      if (cRect.left < rowRect.left + edge) row.scrollBy({ left: cRect.left - rowRect.left - clear, behavior: "smooth" });
      else if (cRect.right > rowRect.right - edge) row.scrollBy({ left: cRect.right - rowRect.right + clear, behavior: "smooth" });
    };
    measure();
    const raf = requestAnimationFrame(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(row);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [selectedIndex]);

  useEffect(() => {
    updateArrows();
    const onResize = () => updateArrows();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Mobile: there's no hover, so each card's mock animation plays when the card
  // scrolls into view and replays if you scroll back to it (the `is-inview`
  // class drives the same animations hover does on desktop). Desktop keeps hover.
  useEffect(() => {
    if (isDesktop) return;
    const row = rowRef.current;
    if (!row) return;
    const cards = row.querySelectorAll<HTMLElement>("[data-card]");
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.classList.toggle("is-inview", entry.isIntersecting);
        }
      },
      { threshold: 0.6 },
    );
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [isDesktop]);
  // The arrows step the selected card (which glides the frame + tab and keeps
  // itself in view via the measure effect), so browsing and selecting are one
  // and the same gesture.
  const lastCardIndex = CAROUSEL.length - 1;
  const stepSelection = (dir: 1 | -1) => {
    stepScrollRef.current = true;
    setSelectedIndex((i) => Math.min(lastCardIndex, Math.max(0, i + dir)));
  };

  const FADE = 56;
  const rowMask = `linear-gradient(to right, transparent 0, #000 ${canLeft ? FADE : 0}px, #000 calc(100% - ${canRight ? FADE : 0}px), transparent 100%)`;

  const groundGradient = dark
    ? "linear-gradient(180deg, #141414 0%, #0d0d0d 55%, #0a0a0a 100%)"
    : "linear-gradient(180deg, #fcfcfd 0%, #f7f8fa 52%, #ffffff 100%)";
  const chevronCls = dark
    ? "bg-white/[0.06] text-white/70 ring-white/10 hover:bg-white/15 hover:text-white"
    : "bg-black/[0.02] text-neutral-400 ring-black/[0.05] hover:bg-black/[0.05] hover:text-neutral-700";
  const rowTokens: Record<string, string> = dark
    ? {
        "--card": "#1b1b1b",
        "--card-foreground": "#f2f3f5",
        "--foreground": "#ffffff",
        "--muted-foreground": "rgba(255,255,255,0.5)",
      }
    : {
        // Card faces take the ground tone instead of white, so the tiles read
        // as part of the page; wells step a notch darker to stay legible and
        // chips stay white so they pop against the gray face.
        "--card": "#f7f8fa",
        "--card-foreground": "#1a1a1a",
        "--foreground": "#111111",
        "--muted-foreground": "rgba(0,0,0,0.5)",
        "--v69-box": "#f7f8fa",
        "--v69-card": "#f7f8fa",
        "--v69-well": "#eaecef",
        "--v69-well-2": "#e1e4e9",
        "--v69-chip": "#ffffff",
        "--v69-chip-border": "rgba(16,24,40,0.1)",
        "--v69-ink": "#101828",
      };

  return (
    <>
      <StudioNav
        darkTop={dark}
        hideDemo
        maxWidthClass="max-w-[1600px]"
        restPaddingClass="px-6 md:px-10"
        themeToggle={{ theme, onToggle: toggleTheme }}
      />
      <section className={`relative -mt-14 pb-24 md:-mt-16 ${dark ? "bg-[#0a0a0a]" : "bg-white"}`}>
        <div className="relative overflow-hidden" style={{ background: groundGradient }}>
          <div aria-hidden className={`pointer-events-none absolute inset-x-0 top-0 h-px ${dark ? "bg-white/12" : "bg-black/[0.06]"}`} />

          <div className={`relative z-10 ${RAIL} pb-16 pt-36 md:pt-36 lg:pb-20`}>
            <div className="relative z-30 max-w-2xl">
              <h1 className={`type-display mx-auto max-w-xl text-center md:mx-0 md:text-left ${dark ? "text-white" : "text-neutral-900"}`}>
                The platform firms
                {/* Fixed two-line lockup on every breakpoint. */}
                <br />
                run on and build on
              </h1>

              {showBody && (
                <p className={`type-lead mx-auto mt-4 max-w-lg text-center md:mx-0 md:text-left ${dark ? "text-white/55" : "text-neutral-500"}`}>
                  Describe what you need in plain language and Assembly ships a polished, client-ready app — no code, no handoffs.
                </p>
              )}

              <div className="mx-auto mt-8 max-w-xl md:mx-0">
                <div className="v63-gradient-border relative rounded-[14px] md:rounded-[22px]">
                  <V66Composer
                    textareaRef={inputRef}
                    typewriter
                    // Always accented — the arrow routes to onboarding even
                    // with an empty box, so it never reads as disabled.
                    submitDisabled={false}
                    glow={false}
                    tone={theme}
                    compact
                    minimalControls
                    promptPicker
                    promptPickerLabel="Prompt Ideas"
                    promptPickerSide="left"
                    promptItems={PROMPT_IDEAS}
                    hidePlus={!showPlus}
                    hideHowTo
                    plusAsAttach
                    submitLabel="Start building"
                    value={prompt}
                    onValueChange={setPrompt}
                    accent="#7DA4FF"
                    surfaceRadiusClass="rounded-[14px] md:rounded-[22px]"
                    surfaceClassName={
                      dark
                        ? "bg-[#1b1b1b] ring-1 ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_24px_60px_-28px_rgba(0,0,0,0.8)]"
                        : "bg-transparent ring-1 ring-black/[0.05] shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
                    }
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 md:mt-1">
              <div className="flex items-center justify-end gap-4">
                <div className="hidden items-center md:flex">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => stepSelection(-1)}
                      disabled={selectedIndex === 0}
                      aria-label="Previous templates"
                      className={`flex size-9 items-center justify-center rounded-lg ring-1 transition-colors disabled:pointer-events-none disabled:opacity-30 ${chevronCls}`}
                    >
                      <IconChevron className="size-4 rotate-180" />
                    </button>
                    <button
                      type="button"
                      onClick={() => stepSelection(1)}
                      disabled={selectedIndex === lastCardIndex}
                      aria-label="More templates"
                      className={`flex size-9 items-center justify-center rounded-lg ring-1 transition-colors disabled:pointer-events-none disabled:opacity-30 ${chevronCls}`}
                    >
                      <IconChevron className="size-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div
                ref={rowRef}
                onScroll={updateArrows}
                style={{ maskImage: rowMask, WebkitMaskImage: rowMask, ...rowTokens } as React.CSSProperties}
                // pl is px-6 (24px) + FRAME_PAD (6px) so the selected card's
                // selector frame — which hugs 6px outside the card — lines its
                // left edge up with the hero title, prompt box, and logo. Top
                // padding only needs to clear the frame now the tab is gone,
                // which pulls the row up close to the arrows.
                className="v76-card-row relative -mx-6 mt-3 flex gap-4 overflow-x-auto pb-10 pl-[30px] pr-6 pt-3 md:pt-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {/* Selector frame — glides to the selected card. */}
                {isDesktop && (
                <div
                  aria-hidden
                  // Apple-style glide: a longer settle with no overshoot
                  // (0.32,0.72,0,1), kept on the compositor via will-change
                  // so the ring never stutters mid-flight.
                  className={`pointer-events-none absolute left-0 top-0 z-20 [will-change:transform] ${frameReady ? "transition-transform duration-[500ms] ease-[cubic-bezier(0.32,0.72,0,1)]" : ""}`}
                  style={{ transform: `translateX(${frame.x}px)`, top: frame.top, width: frame.w, height: frame.h }}
                >
                  {/* A plain bordered div, not an SVG path: CSS border-radius
                      renders true circular corners identical to the card's,
                      where the old Bézier approximation read slightly flat.
                      Radius stays concentric: card radius (20) + gap. */}
                  <div
                    className="absolute inset-0 border"
                    style={{
                      borderRadius: 20 + FRAME_PAD,
                      // Dark ring sits a notch above the cards' white/15 ring
                      // — present but quiet, not a bright halo.
                      borderColor: dark ? "rgba(255,255,255,0.3)" : "#e5e6ea",
                    }}
                  />
                </div>
                )}

                {CAROUSEL.map((t, i) => (
                  <TemplateCard
                    key={t.slug}
                    template={t}
                    index={i}
                    onSelect={setSelectedIndex}
                    dark={dark}
                  />
                ))}

                <a
                  href={APP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="See all templates"
                  className="group w-[212px] shrink-0 origin-center opacity-50 transition-opacity duration-200 ease-out hover:opacity-100"
                >
                  <Card
                    size="sm"
                    // Flat and page-toned (no shadow, face = ground color) so
                    // the empty tile recedes behind the real template cards.
                    className={`gap-0 rounded-[20px] py-0 pb-0! shadow-none ring-1 transition-transform duration-200 ease-out group-hover:-translate-y-0.5 ${dark ? "ring-white/15" : "ring-black/[0.07]"}`}
                  >
                    <div data-slot="card-media" className={`flex h-[212px] w-full items-center justify-center bg-[var(--card)] ${dark ? "text-white/35" : "text-neutral-400"}`}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden>
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </div>
                  </Card>
                  <p className={`mt-3 inline-flex items-center gap-1.5 text-[13px] font-normal ${dark ? "text-white" : "text-neutral-900"}`}>
                    See all templates
                    <IconArrow className={`size-3.5 transition-transform group-hover:translate-x-0.5 ${dark ? "text-white/50" : "text-neutral-400"}`} />
                  </p>
                  <p className={`mt-1 text-[11px] ${dark ? "text-white/50" : "text-neutral-500"}`}>{TEMPLATES.length - CAROUSEL.length} more</p>
                </a>
              </div>
            </div>
          </div>
        </div>

      </section>
    </>
  );
}
