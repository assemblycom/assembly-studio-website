"use client";

import Link from "next/link";
import { memo, useEffect, useRef, useState } from "react";
import { APP_URL, templateSignupUrl } from "@/lib/constants";
import { type Template } from "@/lib/templates";
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
const CARD_RADIUS = 16; // the cards' rounded-2xl, in px — the ring adds its own gap on top

// Prompt Ideas data + seeded-composer behavior live in prompt-ideas.ts,
// shared with the bottom CTA so the two boxes read identically.

// Strip shows the most-used templates, ranked by real usage.
const STRIP_ORDER = [
  "client-onboarding-wizard",
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
// STRIP_ORDER is a preference, not the list. It is resolved against the catalogue
// the server hands down, so a template that leaves Contentful drops out without
// anyone editing the order above — and the strip then tops up from whatever else
// is listed, so it keeps its shape instead of collapsing to however many of these
// eight names happen to survive. Capped at eight, the length it was drawn for.
const STRIP_MAX = 8;
const carouselFrom = (templates: Template[]): Template[] => {
  const preferred = STRIP_ORDER.map((slug) =>
    templates.find((t) => t.slug === slug),
  ).filter((t): t is Template => Boolean(t));
  const rest = templates.filter(
    (t) => !preferred.some((p) => p.slug === t.slug),
  );
  return [...preferred, ...rest].slice(0, STRIP_MAX);
};


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
  href,
  onSelect,
}: {
  template: Template;
  index: number;
  href: string;
  // Hover (and keyboard focus) glides the selector frame to this card.
  onSelect: (i: number) => void;
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
      onMouseEnter={() => onSelect(index)}
      onFocus={() => onSelect(index)}
      // `group` drives the mock's hover animation on desktop; `data-card` lets
      // the mobile in-view observer replay the animation on scroll.
      // No outline of its own: the row is a scroller, so the global one was
      // cropped at whichever end the card sat against. The selector frame is
      // already the focus indicator here — onFocus moves it to this card, and it
      // draws outside the scroller's clip.
      className="group block w-[212px] shrink-0 origin-center text-left shadow-none outline-none"
    >
      <Card
        size="sm"
        className="gap-0 rounded-2xl py-0 pb-0! shadow-none ring-1 ring-black/[0.04] transition-[transform,box-shadow] duration-200 ease-out [will-change:transform] [[data-theme=dark]_&]:ring-0"
      >
        {(() => {
          const hue = CARD_HUE[template.slug];
          return (
            <div
              data-slot="card-media"
              className={`h-[212px] w-full overflow-hidden [font-family:var(--font-inter),system-ui,sans-serif] ${hue ? "v72-mock-color" : "v76-mock-auto"}`}
              style={hue ? { backgroundColor: hue } : undefined}
            >
              <div className="h-full w-full">
                <V69CardMock slug={template.slug} />
              </div>
            </div>
          );
        })()}
      </Card>
      {/* Clear of the selector ring, which stands 6px outside the cover: at
          mt-3 the title sat 6px under the ring's bottom edge and read as
          crowded by it. */}
      <p className="mt-4 line-clamp-2 text-[13px] font-normal leading-[1.3] text-neutral-900 [[data-theme=dark]_&]:text-white">{template.title}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{template.category}</p>
    </Link>
  );
});

export function HeroV76({
  showPlus = true,
  showBody = false,
  // Passed by the page rather than imported: the visible set is resolved against
  // Contentful on the server, which a client component can't await.
  templates,
}: {
  showPlus?: boolean;
  showBody?: boolean;
  templates: Template[];
}) {
  const carousel = carouselFrom(templates);
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

  // The selected card — the one the selector frame is drawn around. Hover moves
  // it; on load it's the first card.
  const [selectedIndex, setSelectedIndex] = useState(0);
  // Read by the scroll handler, which is registered once and so can't close over
  // the state itself.
  const selectedRef = useRef(0);
  const [frame, setFrame] = useState({
    x: 24 - FRAME_PAD,
    top: 24 - FRAME_PAD,
    w: 212 + 2 * FRAME_PAD,
    h: 212 + 2 * FRAME_PAD,
  });
  // The placeholder above is the desktop layout's geometry, and it is what the
  // server renders — on a phone the real card sits 6px right and 16px lower, so
  // the ring painted misaligned until the measure below landed. Held invisible
  // until it has been measured once, so first paint never shows a ring around
  // nothing.
  const [frameMeasured, setFrameMeasured] = useState(false);
  // Gate the glide until after the first measure has painted, so the frame snaps
  // to the first card on load instead of visibly sliding in from its placeholder.
  const [frameReady, setFrameReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setFrameReady(true)),
    );
    return () => cancelAnimationFrame(id);
  }, []);


  // Measure the selected card and glide the frame to it. getBoundingClientRect
  // (not offsetLeft) so it's independent of which ancestor is the offsetParent;
  // re-measured on layout via ResizeObserver.
  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const measure = () => {
      const cardEl = row.querySelector<HTMLElement>(
        `[data-card="${selectedIndex}"]`,
      );
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
      setFrameMeasured(true);
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
  // Which card that is has hysteresis: the selection only moves once the NEXT
  // card is nearly full, so jitter around the boundary can't flip it back and
  // forth. The class itself then simply follows the selection (see the effect
  // below) — it used to have its own, looser rule, which is what left a card
  // animating after the strip had moved on to another one.
  // Re-read on change rather than only at mount: the match was evaluated once,
  // so a window narrowed into the mobile layout (or a tablet rotated) showed the
  // strip with nothing driving it — no card animations, and now no selector
  // frame either, since focus is what moves it here.
  const [mobileStrip, setMobileStrip] = useState(false);
  useEffect(() => {
    // Match either a hover-less pointer (real phones/tablets) OR the mobile
    // layout width. Width matters too: a narrow desktop window still reports
    // hover, but shows the mobile strip, and is how this gets checked.
    const mq = window.matchMedia("(hover: none), (max-width: 767px)");
    const sync = () => setMobileStrip(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!mobileStrip) return;
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
      const rects = cards.map((card) => card.getBoundingClientRect());
      const onScreen = rects.map((r) => r.bottom > 0 && r.top < vh);
      // The card in focus is the one the selector frame wraps, so swiping the
      // strip moves it the way hover does on desktop. First match rather than
      // last — swiping forward brings the next card into focus while the
      // previous one is still fully shown, and the frame should stay put until
      // it isn't.
      const inFocus = rects.findIndex((r, i) => {
        if (!onScreen[i]) return false;
        const shown =
          Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0)) / r.width;
        return shown >= FOCUSED;
      });
      if (inFocus !== -1) setSelectedIndex(inFocus);
      // Vertical visibility is the second half of the rule the effect below
      // states: the selected card stops animating while the hero is scrolled
      // off, so an infinite animation (the timer's blinking colon) isn't left
      // running out of sight — and replays when it comes back.
      const sel = inFocus !== -1 ? inFocus : selectedRef.current;
      cards.forEach((card, i) =>
        card.classList.toggle("is-inview", i === sel && onScreen[i]),
      );
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
  }, [mobileStrip]);

  // The animation hook follows the selection exactly: the card inside the frame
  // is the one that plays, and it is the only one. Two things fall out of that.
  // A card that the strip has moved past stops, instead of running on because it
  // was still partly on screen. And a card re-selected later plays AGAIN — the
  // class came off when it lost the frame, so putting it back applies the
  // animation anew rather than leaving a finished one sitting at its end state.
  useEffect(() => {
    selectedRef.current = selectedIndex;
    if (!mobileStrip) return;
    const row = rowRef.current;
    if (!row) return;
    const cards = [...row.querySelectorAll<HTMLElement>("[data-card]")];
    const vh = window.innerHeight;
    // Same two conditions the scroll handler applies — a card tapped or focused
    // while the rail is off-screen shouldn't spend its animation unseen.
    const rects = cards.map((card) => card.getBoundingClientRect());
    cards.forEach((card, i) =>
      card.classList.toggle(
        "is-inview",
        i === selectedIndex && rects[i].bottom > 0 && rects[i].top < vh,
      ),
    );
    // Also what clears the class when a narrow window is widened back into the
    // desktop layout, where hover drives the animations instead.
    return () => cards.forEach((card) => card.classList.remove("is-inview"));
  }, [mobileStrip, selectedIndex]);

  // Arrows scroll the strip by roughly a screenful of cards.
  const scrollRow = (dir: 1 | -1) => {
    const el = rowRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };


  // The rail's token ladder now lives in .v76-card-row (globals.css) and the
  // ground and chevrons take data-theme variants: all three were `dark ?`
  // ternaries, and `dark` only resolves after hydration, so the server sent the
  // light values to every visitor and a dark-mode phone painted a light hero
  // until the JS landed.
  //
  // Dark stays flat on the page ground: the gradient started at #141414, three
  // steps lighter than the #0a0a0a every other page opens on, so the landing
  // page read as a different shade of dark. Light keeps its lift — there the
  // ground is #ffffff and the gradient is what seats the hero.
  const chevronCls =
    "bg-black/[0.05] text-neutral-600 ring-black/[0.08] hover:bg-black/[0.09] hover:text-neutral-900 [[data-theme=dark]_&]:bg-white/[0.06] [[data-theme=dark]_&]:text-white/70 [[data-theme=dark]_&]:ring-white/10 [[data-theme=dark]_&]:hover:bg-white/15 [[data-theme=dark]_&]:hover:text-white";

  return (
    <>
      <StudioNav
        darkTop={dark}
        hideDemo
        maxWidthClass="max-w-[1600px]"
        restPaddingClass="px-6 md:px-10"
      />
      {/* Theme-dependent colour here is written as a data-theme variant, not as a
          `dark ? …` ternary: `dark` only resolves after hydration, so the server
          sent the light face to every visitor and a dark-mode phone painted a
          white hero until the JS landed. The pre-paint script sets the attribute,
          so a variant is correct on the first paint. */}
      <section className="relative -mt-14 bg-white pb-24 md:-mt-16 [[data-theme=dark]_&]:bg-[#0a0a0a]">
        <div className="relative overflow-hidden bg-[linear-gradient(180deg,#fcfcfd_0%,#f7f8fa_52%,#ffffff_100%)] [[data-theme=dark]_&]:bg-[var(--background)] [[data-theme=dark]_&]:bg-none">

          <div className={`relative z-10 ${RAIL} pb-16 pt-36 md:pt-36 lg:pb-20`}>
            <div className="relative z-30 max-w-2xl">
              <h1 className="type-display mx-auto max-w-xl text-center text-neutral-900 md:mx-0 md:text-left [[data-theme=dark]_&]:text-white">
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
                {/* The submit pill's two fills, as a custom property the
                    composer reads — near-black on the light page, the brand
                    periwinkle on the dark one. */}
                <div className="v63-gradient-border v63-ring-solid relative rounded-[18px] [--composer-submit:#171717] md:rounded-[22px] [[data-theme=dark]_&]:[--composer-submit:#7DA4FF]">
                  <V66Composer
                    textareaRef={inputRef}
                    typewriter
                    // Always accented — the arrow routes to onboarding even
                    // with an empty box, so it never reads as disabled.
                    submitDisabled={false}
                    glow={false}
                    tone={theme}
                    // The composer states both skins in CSS rather than taking
                    // the one `tone` resolves to after hydration — `tone` stays
                    // for the parts that aren't first paint.
                    themeAuto
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
                    // the accent fill. Both are handed over as one custom
                    // property so the swap happens in CSS, on the first paint.
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
                  "--v76-fade-l": canLeft ? 1 : 0,
                  "--v76-fade-r": canRight ? 1 : 0,
                } as React.CSSProperties}
                // Card left edge lines up with the hero title/prompt box: the
                // left pad is px-6 (24px) + FRAME_PAD, so it's the selector
                // frame — which hugs 6px outside the card — that lines up with
                // the title, not the card. The top pad clears the tab, on both
                // layouts now that mobile carries the frame too.
                className="v76-card-row relative mt-1 flex gap-4 overflow-x-auto pb-10 pl-[30px] pr-6 pt-9 md:mt-3 md:pt-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {/* Selector frame — a ring with a flush-right tab, wrapping the
                    hovered card on desktop and the card swiped into focus on
                    mobile. */}
                <div
                  aria-hidden
                    className={`pointer-events-none absolute left-0 top-0 z-20 ${frameMeasured ? "" : "opacity-0"} ${frameReady ? "transition-transform duration-[760ms] ease-[cubic-bezier(0.45,0,0.15,1)]" : ""}`}
                    style={{
                      transform: `translateX(${frame.x}px)`,
                      top: frame.top,
                      width: frame.w,
                      height: frame.h,
                    }}
                  >
                    {(() => {
                      // Ring and tab are one colour so they read as one piece.
                      // The tab sits flush on the ring's top edge — its bottom
                      // corners ease into that edge with a concave fillet, so
                      // the junction is a curve rather than a notch.
                      const W = frame.w;
                      const H = frame.h;
                      const T = 30; // tab height above the frame
                      // Concentric with the card: the ring's radius is the card's
                      // plus the gap it stands off by, so the two curves run
                      // parallel instead of crossing at the corners.
                      const R = CARD_RADIUS + FRAME_PAD;
                      const K = 10; // tab top-corner radius
                      const CR = 9; // concave fillet where tab meets the frame's top edge
                      const TAB_W = 84;
                      // One step down from the card face, in the same neutral
                      // grey family the rail's widgets use — the frame belongs
                      // to the card it wraps, so it can't be a stray tint.
                      // Dark takes an equal-RGB neutral rather than the cool
                      // #7a7a80 it had: that grey carried a blue cast nothing
                      // else in the dark skin has, and at that brightness the
                      // ring was the loudest edge on the page — louder than the
                      // cards it wraps. This sits in the same family as the
                      // covers' own surfaces. Both values ride on the element as
                      // data-theme variants rather than as a JS-picked attribute,
                      // so the ring isn't near-white on a dark first paint.
                      const selectorCls =
                        "stroke-[#eaeaea] [[data-theme=dark]_&]:stroke-[#4A4A4A]";
                      const tabFillCls =
                        "fill-[#eaeaea] [[data-theme=dark]_&]:fill-[#4A4A4A]";
                      // Inset from the rounded top-right corner so both of the
                      // tab's bases land on the straight run of the top edge.
                      const tabRight = W - R - CR;
                      const tabLeft = tabRight - TAB_W;
                      const ring = `M ${R} ${T} H ${W - R} Q ${W} ${T} ${W} ${T + R} V ${T + H - R} Q ${W} ${T + H} ${W - R} ${T + H} H ${R} Q 0 ${T + H} 0 ${T + H - R} V ${T + R} Q 0 ${T} ${R} ${T} Z`;
                      const tab = `M ${tabLeft - CR} ${T} Q ${tabLeft} ${T} ${tabLeft} ${T - CR} L ${tabLeft} ${K} Q ${tabLeft} 0 ${tabLeft + K} 0 H ${tabRight - K} Q ${tabRight} 0 ${tabRight} ${K} L ${tabRight} ${T - CR} Q ${tabRight} ${T} ${tabRight + CR} ${T} Z`;
                      return (
                        <>
                          <svg
                            width={W}
                            height={T + H}
                            viewBox={`0 0 ${W} ${T + H}`}
                            fill="none"
                            className="absolute left-0 overflow-visible"
                            style={{ top: -T }}
                          >
                            <path d={ring} className={selectorCls} strokeWidth="1.5" />
                            <path d={tab} className={tabFillCls} />
                          </svg>
                          <span
                            // The label inverts with the tab it sits on — the tab
                            // is a dark surface in dark mode, so near-black type
                            // has nothing left to hold there.
                            className="absolute flex items-center justify-center text-[12.5px] font-normal leading-none text-neutral-900 [[data-theme=dark]_&]:text-[#F2F2F2]"
                            style={{ left: tabLeft, top: -T, width: TAB_W, height: T }}
                          >
                            Template
                          </span>
                        </>
                      );
                    })()}
                </div>
                {carousel.map((t, i) => (
                  <TemplateCard
                    key={t.slug}
                    template={t}
                    index={i}
                    href={templateSignupUrl(t)}
                    onSelect={setSelectedIndex}
                  />
                ))}

                <a
                  href="/templates"
                  aria-label="See all templates"
                  // The selector frame never wraps this tile, so unlike the
                  // template cards it needs a ring of its own — inset, since the
                  // row clips whatever sits outside the last tile's edge.
                  className="group w-[212px] shrink-0 origin-center rounded-2xl outline-none transition-opacity duration-200 ease-out focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground/40"
                >
                  <Card
                    size="sm"
                    // Flat and page-toned (no shadow, face = ground color) so
                    // the empty tile recedes behind the real template cards.
                    // No outline in dark — the tile's own face already separates
                    // it from the page there, and the hairline was the brightest
                    // edge in the row.
                    className="gap-0 rounded-2xl py-0 pb-0! shadow-none ring-1 ring-black/[0.04] transition-transform duration-200 ease-out group-hover:-translate-y-0.5 [[data-theme=dark]_&]:ring-0"
                  >
                    <div data-slot="card-media" className="flex h-[212px] w-full items-center justify-center bg-[var(--card)]">
                      {/* The bare glyph in both themes — the plus is the whole
                          affordance, and the chip that used to sit behind it in
                          dark was a second box inside an already-square tile.
                          Hover brightens the glyph itself instead of the chip. */}
                      <span className="flex items-center justify-center text-neutral-400 transition-colors group-hover:text-neutral-600 [[data-theme=dark]_&]:text-white/70 [[data-theme=dark]_.group:hover_&]:text-white">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden>
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </span>
                    </div>
                  </Card>
                  <p className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-normal text-neutral-900 [[data-theme=dark]_&]:text-white">
                    See all templates
                    <IconArrow className="size-3.5 text-neutral-400 transition-transform group-hover:translate-x-0.5 [[data-theme=dark]_&]:text-white/50" />
                  </p>
                  {/* Only when there is a remainder. The strip now tops up from
                      the catalogue, so when it holds all of it this counted to
                      zero and the tile read "0 more". */}
                  {templates.length > carousel.length ? (
                    <p className="mt-1 text-[11px] text-muted-foreground">{templates.length - carousel.length} more</p>
                  ) : null}
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
