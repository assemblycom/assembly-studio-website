"use client";

import { memo, useEffect, useRef, useState } from "react";
import { APP_URL } from "@/lib/constants";
import { getFeaturedTemplates, TEMPLATES, type Template } from "@/lib/templates";
import { IconArrow } from "./icons";
import { V66Composer } from "./hero-v66";
import { V69CardMock } from "./hero-v71";
import { StudioNav } from "./studio-nav";
import { Card } from "@/components/ui/card";

// ─────────────────────────────────────────────────────────────────────────
// HERO V76 — V75 as the base, adding a SELECTOR FRAME around the template
// cards: one card is selected (framed) at a time, first by default, and the
// frame glides smoothly to whichever card you click. Themeable like V75.
// ─────────────────────────────────────────────────────────────────────────

const MONO = '"ABC Diatype Mono", ui-monospace, SFMono-Regular, Menlo, monospace';
const RAIL = "mx-auto max-w-[1600px] px-6 md:px-10";
const FRAME_PAD = 5; // a tight hug between the card and the selector ring

const V76_PROMPTS = [
  "Client intake form",
  "Client engagement dashboard",
  "Client project tracker",
  "Content approval flow",
  "Document collection checklist",
  "Proposal clients can e-sign",
];

const DEFAULT_PROMPT =
  "A client intake form that collects company details, the primary contact, and an e-signature, then creates a new client record";

const LEAD_SLUG = "client-engagement-dashboard";
const FEATURED = getFeaturedTemplates(6);
const CAROUSEL: Template[] = (() => {
  const ordered = [
    ...FEATURED,
    ...TEMPLATES.filter((t) => !FEATURED.some((f) => f.slug === t.slug)),
  ].slice(0, 12);
  return [
    ...ordered.filter((t) => t.slug === LEAD_SLUG),
    ...ordered.filter((t) => t.slug !== LEAD_SLUG),
  ];
})();

const SEE_ALL_STACK = [
  { slug: "content-approval-flow", z: "z-[1]", rest: "[transform:translate(-50%,-50%)_translateY(8px)_scale(0.9)]", hover: "group-hover:[transform:translate(-50%,-50%)_translateX(-24px)_translateY(-2px)_rotate(-7deg)]" },
  { slug: "client-project-tracker", z: "z-[2]", rest: "[transform:translate(-50%,-50%)_translateY(4px)_scale(0.95)]", hover: "group-hover:[transform:translate(-50%,-50%)_translateY(-8px)]" },
  { slug: "client-engagement-dashboard", z: "z-[3]", rest: "[transform:translate(-50%,-50%)]", hover: "group-hover:[transform:translate(-50%,-50%)_translateX(24px)_translateY(-2px)_rotate(7deg)]" },
];

function IconChevron({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

const TemplateCard = memo(function TemplateCard({
  template,
  index,
  selected,
  selectionActive,
  onSelect,
  dark,
}: {
  template: Template;
  index: number;
  selected: boolean;
  selectionActive: boolean;
  onSelect: (i: number) => void;
  dark: boolean;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      data-card={index}
      onClick={() => onSelect(index)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(index);
        }
      }}
      style={{ opacity: selectionActive && !selected ? 0.5 : 1 }}
      className="group w-[236px] shrink-0 origin-center cursor-pointer text-left outline-none transition-[transform,opacity] duration-200 ease-out [will-change:opacity]"
    >
      <Card
        size="sm"
        className={`gap-0 py-0 pb-0! ring-1 transition-[transform,box-shadow] duration-200 ease-out [will-change:transform] ${dark ? "ring-white/8 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.8)]" : "ring-black/[0.06] shadow-[0_10px_30px_-20px_rgba(16,24,40,0.25)]"}`}
      >
        <div data-slot="card-media" className={`h-[188px] w-full overflow-hidden [font-family:var(--font-inter),system-ui,sans-serif] ${dark ? "v72-mock-dark" : ""}`}>
          <div className="h-full w-full">
            <V69CardMock slug={template.slug} />
          </div>
        </div>
      </Card>
      <p className={`mt-3 line-clamp-2 text-[13px] font-medium leading-[1.3] ${dark ? "text-white" : "text-neutral-900"}`}>{template.title}</p>
      <p className={`mt-1 text-[11px] ${dark ? "text-white/50" : "text-neutral-500"}`}>{template.category}</p>
    </div>
  );
});

export function HeroV76({
  showPlus = true,
  showVideo = true,
  showBody = false,
}: { showPlus?: boolean; showVideo?: boolean; showBody?: boolean } = {}) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const dark = theme === "dark";
  useEffect(() => {
    document.body.dataset.v76Theme = theme;
    return () => {
      delete document.body.dataset.v76Theme;
    };
  }, [theme]);

  const [prompt, setPrompt] = useState("");
  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setPrompt(DEFAULT_PROMPT);
      return;
    }
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      i += 1;
      setPrompt(DEFAULT_PROMPT.slice(0, i));
      if (i < DEFAULT_PROMPT.length) timer = setTimeout(tick, 26);
    };
    timer = setTimeout(tick, 450);
    return () => clearTimeout(timer);
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

  // The selected card — framed by the selector ring, bright while the rest dim.
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [frame, setFrame] = useState({ x: 24 - FRAME_PAD, top: 24 - FRAME_PAD, w: 236 + 2 * FRAME_PAD, h: 188 + 2 * FRAME_PAD });

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

  // Measure the selected card and glide the frame to it; keep it in view.
  // getBoundingClientRect (not offsetLeft) so it's independent of which
  // ancestor is the offsetParent; re-measured on layout via ResizeObserver.
  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const measure = () => {
      const media = row
        .querySelector<HTMLElement>(`[data-card="${selectedIndex}"]`)
        ?.querySelector<HTMLElement>('[data-slot="card-media"]');
      if (!media) return;
      const rowRect = row.getBoundingClientRect();
      const mRect = media.getBoundingClientRect();
      if (mRect.width < 40 || mRect.height < 40) return; // not laid out yet
      setFrame({
        x: mRect.left - rowRect.left + row.scrollLeft - FRAME_PAD,
        top: mRect.top - rowRect.top - FRAME_PAD,
        w: mRect.width + 2 * FRAME_PAD,
        h: mRect.height + 2 * FRAME_PAD,
      });
      // Keep the selected card in view (horizontal scroll only).
      if (mRect.left < rowRect.left + 8) row.scrollBy({ left: mRect.left - rowRect.left - 24, behavior: "smooth" });
      else if (mRect.right > rowRect.right - 8) row.scrollBy({ left: mRect.right - rowRect.right + 24, behavior: "smooth" });
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
  const scrollRow = (dir: 1 | -1) => rowRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });

  const FADE = 56;
  const rowMask = `linear-gradient(to right, transparent 0, #000 ${canLeft ? FADE : 0}px, #000 calc(100% - ${canRight ? FADE : 0}px), transparent 100%)`;

  const groundGradient = dark
    ? "linear-gradient(180deg, #141416 0%, #0d0d0e 55%, #0a0a0b 100%)"
    : "linear-gradient(180deg, #ffffff 0%, #f7f7f8 42%, #eff0f2 70%, #ffffff 100%)";
  const chevronCls = dark
    ? "bg-white/[0.06] text-white/70 ring-white/10 hover:bg-white/15 hover:text-white"
    : "bg-black/[0.04] text-neutral-600 ring-black/[0.08] hover:bg-black/[0.08] hover:text-neutral-900";
  const rowTokens: Record<string, string> = dark
    ? {
        "--card": "#1b1b1b",
        "--card-foreground": "#f2f3f5",
        "--foreground": "#ffffff",
        "--muted-foreground": "rgba(255,255,255,0.5)",
      }
    : {
        "--card": "#ffffff",
        "--card-foreground": "#1a1a1a",
        "--foreground": "#111111",
        "--muted-foreground": "rgba(0,0,0,0.5)",
        "--v69-box": "#ffffff",
        "--v69-card": "#ffffff",
        "--v69-well": "#f1f2f4",
        "--v69-well-2": "#e9eaee",
        "--v69-chip": "#ffffff",
        "--v69-chip-border": "rgba(16,24,40,0.1)",
        "--v69-ink": "#101828",
      };

  return (
    <>
      <StudioNav
        darkTop={dark}
        hideDemo
        logoVideo={dark ? "/liquid-metal.webm" : undefined}
        maxWidthClass="max-w-[1600px]"
        restPaddingClass="px-6 md:px-10"
        themeToggle={{ theme, onToggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")) }}
      />
      <section className={`relative -mt-14 pb-24 md:-mt-16 ${dark ? "bg-[#0a0a0b]" : "bg-white"}`}>
        <div className="relative overflow-hidden" style={{ background: groundGradient }}>
          <div aria-hidden className={`pointer-events-none absolute inset-x-0 top-0 h-px ${dark ? "bg-white/12" : "bg-black/[0.06]"}`} />

          <div className={`relative z-10 ${RAIL} pb-16 pt-36 md:pt-36 lg:pb-20`}>
            <div className="relative z-30 max-w-2xl">
              <h1 className={`max-w-xl text-3xl font-medium leading-[1.08] tracking-tight md:text-[46px] ${dark ? "text-white" : "text-neutral-900"}`}>
                The AI app builder for
                <br />
                client-facing experiences
              </h1>

              {showBody && (
                <p className={`mt-4 max-w-lg text-[17px] leading-relaxed ${dark ? "text-white/55" : "text-neutral-500"}`}>
                  Describe what you need in plain language and Assembly ships a polished, client-ready app — no code, no handoffs.
                </p>
              )}

              <div className="mt-8 max-w-xl">
                <div className="v63-gradient-border relative rounded-[14px] md:rounded-[22px]">
                  <V66Composer
                    glow={false}
                    tone={theme}
                    compact
                    minimalControls
                    promptPicker
                    promptPickerLabel="Prompt Ideas"
                    promptPickerSide="left"
                    promptItems={V76_PROMPTS}
                    howToLabel="Watch video"
                    howToSide="right"
                    hidePlus={!showPlus}
                    hideHowTo={!showVideo || !isDesktop}
                    plusAsAttach
                    submitLabel="Start building"
                    value={prompt}
                    onValueChange={setPrompt}
                    accent="#7DA4FF"
                    surfaceRadiusClass="rounded-[14px] md:rounded-[22px]"
                    surfaceClassName={
                      dark
                        ? "bg-[#1b1b1b] ring-1 ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_24px_60px_-28px_rgba(0,0,0,0.8)]"
                        : "bg-white ring-1 ring-black/[0.06] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_24px_60px_-30px_rgba(16,24,40,0.18)]"
                    }
                  />
                </div>
              </div>
            </div>

            <div className="mt-1">
              <div className="flex items-center justify-end gap-4">
                <div className="hidden items-center md:flex">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => scrollRow(-1)}
                      disabled={!canLeft}
                      aria-label="Previous templates"
                      className={`flex size-9 items-center justify-center rounded-full ring-1 transition-colors disabled:pointer-events-none disabled:opacity-30 ${chevronCls}`}
                    >
                      <IconChevron className="size-4 rotate-180" />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollRow(1)}
                      disabled={!canRight}
                      aria-label="More templates"
                      className={`flex size-9 items-center justify-center rounded-full ring-1 transition-colors disabled:pointer-events-none disabled:opacity-30 ${chevronCls}`}
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
                className="relative -mx-6 mt-3 flex gap-4 overflow-x-auto px-6 pb-10 pt-3 md:pt-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {/* Selector frame — glides to the selected card. */}
                {isDesktop && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute left-0 top-0 z-20 transition-transform duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{ transform: `translateX(${frame.x}px)`, top: frame.top, width: frame.w, height: frame.h }}
                >
                  {(() => {
                    // Frame + tab drawn as ONE continuous outline (tab filled),
                    // with the tab flush to the frame's right edge — the right
                    // border flows straight up into it.
                    const W = frame.w;
                    const H = frame.h;
                    const T = 30; // tab height above the frame
                    const R = 17; // frame corner radius = card radius (12) + gap (5) so corners run parallel
                    const K = 10; // tab corner radius
                    const TAB_W = 120;
                    const tabRight = W - R; // inset from the corner so the right base can flare
                    const tabLeft = tabRight - TAB_W;
                    // Softer/dimmer grey on dark (near-white read too bright);
                    // keep the light grey on light mode.
                    const c = dark ? "#8e8e94" : "#c4c4ca";
                    const f = 8; // concave fillet where the tab flares off the top edge (both bases)
                    const outline = `M ${R} ${T} H ${tabLeft - f} Q ${tabLeft} ${T} ${tabLeft} ${T - f} V ${K} Q ${tabLeft} 0 ${tabLeft + K} 0 H ${tabRight - K} Q ${tabRight} 0 ${tabRight} ${K} V ${T - f} Q ${tabRight} ${T} ${tabRight + f} ${T} H ${W - R} Q ${W} ${T} ${W} ${T + R} V ${T + H - R} Q ${W} ${T + H} ${W - R} ${T + H} H ${R} Q 0 ${T + H} 0 ${T + H - R} V ${T + R} Q 0 ${T} ${R} ${T} Z`;
                    const tabFill = `M ${tabLeft - f} ${T + 1} L ${tabLeft - f} ${T} Q ${tabLeft} ${T} ${tabLeft} ${T - f} V ${K} Q ${tabLeft} 0 ${tabLeft + K} 0 H ${tabRight - K} Q ${tabRight} 0 ${tabRight} ${K} V ${T - f} Q ${tabRight} ${T} ${tabRight + f} ${T} L ${tabRight + f} ${T + 1} Z`;
                    return (
                      <>
                        <svg width={W} height={T + H} viewBox={`0 0 ${W} ${T + H}`} fill="none" className="absolute left-0 overflow-visible" style={{ top: -T }}>
                          <path d={tabFill} fill={c} />
                          <path d={outline} stroke={c} strokeWidth="1.5" />
                        </svg>
                        <span
                          className="absolute flex items-center justify-center text-[12.5px] font-medium leading-none text-neutral-900"
                          style={{ left: tabLeft, top: -T, width: TAB_W, height: T }}
                        >
                          Or use a template
                        </span>
                      </>
                    );
                  })()}
                </div>
                )}

                {CAROUSEL.map((t, i) => (
                  <TemplateCard
                    key={t.slug}
                    template={t}
                    index={i}
                    selected={selectedIndex === i}
                    selectionActive={isDesktop}
                    onSelect={setSelectedIndex}
                    dark={dark}
                  />
                ))}

                <a
                  href={APP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="See all templates"
                  className="group w-[236px] shrink-0 origin-center opacity-50 transition-opacity duration-200 ease-out hover:opacity-100"
                >
                  <Card
                    size="sm"
                    className={`gap-0 py-0 ring-1 transition-[transform,box-shadow] duration-200 ease-out group-hover:-translate-y-0.5 ${dark ? "ring-white/8 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.8)] group-hover:shadow-[0_14px_34px_-22px_rgba(0,0,0,0.85)]" : "ring-black/[0.06] shadow-[0_10px_30px_-20px_rgba(16,24,40,0.25)] group-hover:shadow-[0_14px_34px_-22px_rgba(16,24,40,0.26)]"}`}
                  >
                    <div data-slot="card-media" className={`relative h-[188px] w-full overflow-hidden ${dark ? "" : "bg-[#eef0f2]"}`}>
                      {SEE_ALL_STACK.map((t) => (
                        <div
                          key={t.slug}
                          style={
                            dark
                              ? ({
                                  "--v69-card": "#c4c6ca",
                                  "--v69-well": "#b6b8bd",
                                  "--v69-well-2": "#acaeb3",
                                  "--v69-chip": "#cccdd1",
                                } as React.CSSProperties)
                              : undefined
                          }
                          className={`absolute left-1/2 top-1/2 h-[116px] w-[146px] origin-center overflow-hidden rounded-md border border-black/[0.08] shadow-[0_12px_28px_-10px_rgba(0,0,0,0.9)] transition-transform duration-300 ease-out [font-family:var(--font-inter),system-ui,sans-serif] ${dark ? "bg-[#c4c6ca]" : "bg-white"} ${t.z} ${t.rest} ${t.hover}`}
                        >
                          <div className="h-[188px] w-[236px] origin-top-left scale-[0.6186]">
                            <V69CardMock slug={t.slug} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                  <p className={`mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium ${dark ? "text-white" : "text-neutral-900"}`}>
                    See all templates
                    <IconArrow className={`size-3.5 transition-transform group-hover:translate-x-0.5 ${dark ? "text-white/50" : "text-neutral-400"}`} />
                  </p>
                  <p className={`mt-1 text-[11px] ${dark ? "text-white/50" : "text-neutral-500"}`}>+{TEMPLATES.length - CAROUSEL.length} more</p>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Logos carousel. */}
        <div className="mx-auto mt-24 max-w-7xl px-6 md:mt-28">
          <p className={`mb-8 text-center text-xs tracking-wider ${dark ? "text-white/40" : "text-neutral-400"}`} style={{ fontFamily: MONO }}>
            Trusted by teams at
          </p>
          <div className="mx-auto max-w-2xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
            <div className="flex w-max animate-marquee items-center gap-12">
              {["Capital One", "Collective", "Ditto", "Heritage Law", "Waymaker", "Aura", "CoverPanda", "Northwind"]
                .concat(["Capital One", "Collective", "Ditto", "Heritage Law", "Waymaker", "Aura", "CoverPanda", "Northwind"])
                .map((name, i) => (
                  <span key={i} className={`shrink-0 text-base font-medium ${dark ? "text-white/55" : "text-neutral-500"}`}>
                    {name}
                  </span>
                ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
