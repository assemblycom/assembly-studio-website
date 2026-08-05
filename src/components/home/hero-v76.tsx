"use client";

import Link from "next/link";
import { memo, useEffect, useRef, useState } from "react";
import { APP_URL, templateSignupUrl } from "@/lib/constants";
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

// Prompt Ideas data + seeded-composer behavior live in prompt-ideas.ts,
// shared with the bottom CTA so the two boxes read identically.

// Strip shows the most-used templates, ranked by real usage.
const STRIP_ORDER = [
  "onboarding-wizard",
  "client-project-tracker",
  "client-support-requests",
  // Retainer usage overview is deliberately not here — it stays a gallery-only
  // card. This slot replaces the engagement dashboard, which left the gallery.
  "time-tracker",
  "client-ai-assistant",
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
  dark,
  href,
}: {
  template: Template;
  index: number;
  dark: boolean;
  href: string;
}) {
  return (
    // next/link, not a bare <a>: the sign-up sheet renders this same page behind
    // it, and a document load blanked the screen and rebuilt the hero from
    // scratch on the way there. A client transition keeps the page up and the
    // sheet just arrives on top of it. The quick-look modal that used to open
    // here was a stop on the way to the same place, and it made the card feel
    // like it opened a preview rather than starting the thing.
    <Link
      href={href}
      prefetch
      data-card={index}
      // `group` drives the mock's hover animation on desktop; `data-card` lets
      // the mobile in-view observer replay the animation on scroll.
      className="group block w-[212px] shrink-0 origin-center text-left"
    >
      <Card
        size="sm"
        className={`gap-0 rounded-2xl py-0 pb-0! shadow-none transition-[transform,box-shadow] duration-200 ease-out [will-change:transform] ${dark ? "ring-0" : "ring-1 ring-black/[0.04]"}`}
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
      <p className="mt-1 text-[11px] text-muted-foreground">{template.category}</p>
    </Link>
  );
});

export function HeroV76({
  showPlus = true,
  showBody = false,
}: { showPlus?: boolean; showBody?: boolean } = {}) {
  // Theme is global now (persisted, applied to <html data-theme>), so the hero
  // reads it from context and the nav toggle drives the whole site.
  const { theme } = useTheme();
  const dark = theme === "dark";

  // The box opens empty with the animated "Build …" typewriter placeholder;
  // typing or picking a Prompt Idea replaces it with the visitor's own text.
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [prompt, setPrompt] = useState("");

  // Dismissing the sign-up sheet lands back here with ?prompt=… , so the composer
  // is still holding what you typed rather than opening empty. Read on the client
  // so the server-rendered markup and the first paint agree, and deferred with a
  // timer rather than a frame — a frame never arrives in a backgrounded tab.
  useEffect(() => {
    const carried = new URLSearchParams(window.location.search)
      .get("prompt")
      ?.trim();
    if (!carried) return;
    const id = setTimeout(() => setPrompt(carried), 0);
    return () => clearTimeout(id);
  }, []);

  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);
  const rowRef = useRef<HTMLDivElement>(null);
  const updateArrows = () => {
    const el = rowRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateArrows();
    const onResize = () => updateArrows();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Touch devices have no hover, so the card mocks would never play their
  // animations at all — the `group-[.is-inview]:` hooks in the mocks stay dead
  // without something to add the class. This supplies it on hover-less pointers
  // only, so desktop hover behaviour is untouched.
  //
  // Only the card in focus animates: on landing that's the first one, and the
  // next card waits until the visitor scrolls it into view. An
  // IntersectionObserver ratio can't express that on its own — it mixes both
  // axes, so a card two-thirds scrolled in and a full card clipped by a short
  // viewport look identical to it. Measuring the horizontal share separately is
  // what keeps the second card still while the first one plays.
  //
  // Hysteresis matters just as much: the class only comes off once the card has
  // left completely, so jitter around the boundary can't restart the animation
  // in a loop, and a card animates once per pass.
  useEffect(() => {
    // Match either a hover-less pointer (real phones/tablets) OR the mobile
    // layout width. Width matters too: a narrow desktop window still reports
    // hover, but shows the mobile strip, and is how this gets checked.
    const mq = window.matchMedia("(hover: none), (max-width: 767px)");
    if (!mq.matches) return;
    const row = rowRef.current;
    if (!row) return;
    const cards = [...row.querySelectorAll<HTMLElement>("[data-card]")];

    // Near-full rather than exactly full, so a card that lands a pixel or two
    // past the edge still counts as the one being looked at.
    const FOCUSED = 0.9;
    const update = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // Every rect is read before any class is written — interleaving the two
      // would force a reflow per card on each scroll event.
      const focused = cards.map((card) => {
        const r = card.getBoundingClientRect();
        const shown =
          Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0)) / r.width;
        const onScreen = r.bottom > 0 && r.top < vh;
        return onScreen && shown >= FOCUSED ? true : !onScreen || shown === 0 ? false : null;
      });
      focused.forEach((state, i) => {
        if (state !== null) cards[i].classList.toggle("is-inview", state);
      });
    };

    update();
    row.addEventListener("scroll", update, { passive: true });
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      row.removeEventListener("scroll", update);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  // Arrows scroll the strip by roughly a screenful of cards.
  const scrollRow = (dir: 1 | -1) => {
    const el = rowRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };


  const groundGradient = dark
    ? "linear-gradient(180deg, #141414 0%, #0d0d0d 55%, #0a0a0a 100%)"
    : "linear-gradient(180deg, #fcfcfd 0%, #f7f8fa 52%, #ffffff 100%)";
  const chevronCls = dark
    ? "bg-white/[0.06] text-white/70 ring-white/10 hover:bg-white/15 hover:text-white"
    : "bg-black/[0.05] text-neutral-600 ring-black/[0.08] hover:bg-black/[0.09] hover:text-neutral-900";
  const rowTokens: Record<string, string> = dark
    ? {
        "--card": "#1b1b1b",
        "--card-foreground": "#f2f3f5",
        "--foreground": "#ffffff",
        "--muted-foreground": "rgba(255,255,255,0.5)",
        // Dark equivalents of the mock skin tokens — neutral grays stepping up
        // from the card face so wells/panels/chips lift instead of staying the
        // light values (which rendered as bright white boxes in dark mode).
        "--v69-box": "#1b1b1b",
        "--v69-card": "#1f1f1f",
        "--v69-inner": "#242424",
        "--v69-well": "#2b2b2b",
        "--v69-well-2": "#333333",
        "--v69-tracker-empty": "#242424",
        "--v69-chip": "#2e2e2e",
        "--v69-chip-border": "rgba(255,255,255,0.12)",
        "--v69-ink": "#f2f3f5",
      }
    : {
        // Card faces take the warm off-white every hand-tuned card on this
        // rail already uses (F5F5F0) instead of the original cool grey, so
        // every OTHER reused card mock — the ones nobody has re-tuned by hand
        // yet — picks up the same warm family for free. Wells step a notch
        // darker/warmer to stay legible and chips stay white so they still
        // pop against the face.
        "--card": "#f5f5f0",
        "--card-foreground": "#1a1a1a",
        "--foreground": "#111111",
        "--muted-foreground": "rgba(0,0,0,0.5)",
        "--v69-box": "#f5f5f0",
        // Three-step ladder, one job each: the widget's ground (--v69-card,
        // the mock's own face), the surfaces that sit on it (--v69-inner —
        // panels, rows, bubbles, fields), and the recess for anything nested
        // inside a surface (--v69-well). Each step is darker than the last, so
        // depth always reads the same way round on every card.
        "--v69-card": "#f5f5f0",
        "--v69-inner": "#e7e7de",
        "--v69-well": "#dcdcd0",
        "--v69-well-2": "#cfcfc0",
        // Tracker heatmap's lightest (empty) cell reads a touch more neutral
        // than the shared well tone; dark mode falls back to --v69-well-2.
        "--v69-tracker-empty": "#e3e3d6",
        "--v69-chip": "#ffffff",
        "--v69-chip-border": "rgba(20,20,10,0.09)",
        "--v69-ink": "#262626",
      };

  return (
    <>
      <StudioNav
        darkTop={dark}
        hideDemo
        maxWidthClass="max-w-[1600px]"
        narrowOnScroll
        restPaddingClass="px-6 md:px-10"
      />
      <section className={`relative -mt-14 pb-24 md:-mt-16 ${dark ? "bg-[#0a0a0a]" : "bg-white"}`}>
        <div className="relative overflow-hidden" style={{ background: groundGradient }}>

          <div className={`relative z-10 ${RAIL} pb-16 pt-36 md:pt-36 lg:pb-20`}>
            <div className="relative z-30 max-w-2xl">
              <h1 className={`type-display mx-auto max-w-xl text-center md:mx-0 md:text-left ${dark ? "text-white" : "text-neutral-900"}`}>
                The platform firms
                {/* Fixed two-line lockup on every breakpoint. */}
                <br />
                run on and build on
              </h1>

              {showBody && (
                <p className="type-lead mx-auto mt-4 max-w-lg text-center text-muted-foreground md:mx-0 md:text-left">
                  Describe what you need in plain language and Assembly ships a polished, client-ready app — no code, no handoffs.
                </p>
              )}

              <div className="mx-auto mt-8 max-w-xl md:mx-0">
                <div className="v63-gradient-border v63-ring-solid relative rounded-[18px] md:rounded-[22px]">
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
                    promptPickerLabel="Ideas"
                    promptPickerSide="left"
                    promptItems={PROMPT_IDEAS}
                    hidePlus={!showPlus}
                    hideHowTo
                    splitFooter
                    plusAsAttach
                    submitLabel="Get started"
                    // Light mode uses a solid black submit button; dark keeps
                    // the accent fill.
                    submitDark={!dark}
                    value={prompt}
                    onValueChange={setPrompt}
                    accent={dark ? "#7DA4FF" : "#D9ED92"}
                    surfaceRadiusClass="rounded-[18px] md:rounded-[22px]"
                    surfaceClassName={
                      dark
                        ? "bg-transparent shadow-[0_24px_60px_-28px_rgba(0,0,0,0.8)]"
                        : "bg-transparent shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
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
                      onClick={() => scrollRow(-1)}
                      disabled={!canLeft}
                      aria-label="Previous templates"
                      className={`flex size-9 items-center justify-center rounded-lg ring-1 transition-colors disabled:pointer-events-none disabled:opacity-30 ${chevronCls}`}
                    >
                      <IconChevron className="size-4 rotate-180" />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollRow(1)}
                      disabled={!canRight}
                      aria-label="More templates"
                      className={`flex size-9 items-center justify-center rounded-lg ring-1 transition-colors disabled:pointer-events-none disabled:opacity-30 ${chevronCls}`}
                    >
                      <IconChevron className="size-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Relative wrapper (bleeds to the screen edge) so the edge blur
                  overlays can pin to the row's visible sides without scrolling. */}
              <div className="relative -mx-6">
              <div
                ref={rowRef}
                onScroll={updateArrows}
                // The two fade switches drive the row's edge mask (see
                // .v76-card-row): a side only dissolves while there's still
                // something to scroll to on it, so the first and last card sit
                // crisp at the ends.
                style={{
                  ...rowTokens,
                  "--v76-fade-l": canLeft ? 1 : 0,
                  "--v76-fade-r": canRight ? 1 : 0,
                } as React.CSSProperties}
                // Card left edge lines up with the hero title/prompt box: pl-6
                // brings the first card back to the title's left edge.
                className="v76-card-row mt-1 flex gap-4 overflow-x-auto pb-10 pl-6 pr-6 pt-3 md:mt-3 md:pt-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {CAROUSEL.map((t, i) => (
                  <TemplateCard
                    key={t.slug}
                    template={t}
                    index={i}
                    dark={dark}
                    href={templateSignupUrl(t)}
                  />
                ))}

                <a
                  href="/templates"
                  aria-label="See all templates"
                  className="group w-[212px] shrink-0 origin-center transition-opacity duration-200 ease-out"
                >
                  <Card
                    size="sm"
                    // Flat and page-toned (no shadow, face = ground color) so
                    // the empty tile recedes behind the real template cards.
                    // No outline in dark — the tile's own face already separates
                    // it from the page there, and the hairline was the brightest
                    // edge in the row.
                    className={`gap-0 rounded-2xl py-0 pb-0! shadow-none transition-transform duration-200 ease-out group-hover:-translate-y-0.5 ${dark ? "ring-0" : "ring-1 ring-black/[0.04]"}`}
                  >
                    <div data-slot="card-media" className="flex h-[212px] w-full items-center justify-center bg-[var(--card)]">
                      {/* Light mode is the bare glyph — the tile is already
                          outlined, so a second box around the plus read as a
                          frame inside a frame. Dark mode keeps a filled chip,
                          since an unframed hairline glyph all but disappears
                          against the dark card face. */}
                      <span className={`flex size-11 items-center justify-center rounded-xl transition-colors ${dark ? "bg-white/12 text-white/70 group-hover:bg-white/20" : "text-neutral-400 group-hover:text-neutral-600"}`}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden>
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </span>
                    </div>
                  </Card>
                  <p className={`mt-3 inline-flex items-center gap-1.5 text-[13px] font-normal ${dark ? "text-white" : "text-neutral-900"}`}>
                    See all templates
                    <IconArrow className={`size-3.5 transition-transform group-hover:translate-x-0.5 ${dark ? "text-white/50" : "text-neutral-400"}`} />
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{TEMPLATES.length - CAROUSEL.length} more</p>
                </a>
              </div>
              {/* Progressive blur over the same edges the row's mask fades —
                  the blur softens the card before the mask takes its alpha, so
                  the two together read as a dissolve rather than a crop. Kept
                  narrow and gentle, and dialed back further on small screens
                  where a wide mask reads as too heavy. Always mounted and
                  cross-faded, since mounting a blur on the first scroll pixel
                  popped. */}
              <div
                aria-hidden
                className={`pointer-events-none absolute inset-y-0 left-0 w-20 transition-opacity duration-300 ease-out md:w-36 [-webkit-mask-image:linear-gradient(to_right,#000_0%,rgba(0,0,0,0.5)_40%,transparent_90%)] [mask-image:linear-gradient(to_right,#000_0%,rgba(0,0,0,0.5)_40%,transparent_90%)] [-webkit-backdrop-filter:blur(5px)] [backdrop-filter:blur(5px)] md:[-webkit-backdrop-filter:blur(8px)] md:[backdrop-filter:blur(8px)] motion-reduce:transition-none ${canLeft ? "opacity-100" : "opacity-0"}`}
              />
              <div
                aria-hidden
                className={`pointer-events-none absolute inset-y-0 right-0 w-20 transition-opacity duration-300 ease-out md:w-36 [-webkit-mask-image:linear-gradient(to_left,#000_0%,rgba(0,0,0,0.5)_40%,transparent_90%)] [mask-image:linear-gradient(to_left,#000_0%,rgba(0,0,0,0.5)_40%,transparent_90%)] [-webkit-backdrop-filter:blur(5px)] [backdrop-filter:blur(5px)] md:[-webkit-backdrop-filter:blur(8px)] md:[backdrop-filter:blur(8px)] motion-reduce:transition-none ${canRight ? "opacity-100" : "opacity-0"}`}
              />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
