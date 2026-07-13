"use client";

import { memo, useEffect, useRef, useState } from "react";
import { V69CardMock } from "@/components/home/hero-v71";
import { getFeaturedTemplates } from "@/lib/templates";

// ─────────────────────────────────────────────────────────────────────────
// SCROLL STORY — an exploration of the hero → next-section transition
// (Granola-style). The hero's composer is the one persistent object: as you
// scroll, the headline and template cards clear away, the composer glides
// right and becomes the agent chat, the typed prompt "sends", and the app it
// describes assembles on the left while the agent's plan ticks off. The
// scroll then releases into the normal page flow.
//
// Everything is scrubbed off scroll progress (no timers after the initial
// typewriter), so scrolling back rewinds the story.
// ─────────────────────────────────────────────────────────────────────────

const ACCENT = "#7DA4FF";
const MONO = "var(--font-diatype-mono)";
const PROMPT = "Build me a dashboard that tracks client engagement over time";

const PLAN_ITEMS = [
  "Engagement score per client",
  "Weekly activity chart",
  "Client health breakdown",
  "Publish to your portal",
];

// Scrub helpers — every animated property maps a slice of overall progress
// (0–1 across the whole track) to a local 0–1.
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const CARDS = getFeaturedTemplates(5);

// The hero card row shares the light-mode mock tokens with the real hero.
const MOCK_TOKENS = {
  "--v69-box": "#ffffff",
  "--v69-card": "#ffffff",
  "--v69-well": "#f1f2f4",
  "--v69-well-2": "#e9eaee",
  "--v69-chip": "#ffffff",
  "--v69-chip-border": "rgba(16,24,40,0.1)",
  "--v69-ink": "#101828",
} as React.CSSProperties;

function IconArrowUp({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 19V5M6 11l6-6 6 6" />
    </svg>
  );
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m5 12.5 4.5 4.5L19 6.5" />
    </svg>
  );
}

// Memoized so the per-frame progress re-renders don't touch the card mocks
// (inline definitions would remount every frame and freeze their animations).
const HeroCard = memo(function HeroCard({ slug, title, category }: { slug: string; title: string; category: string }) {
  return (
    <div className="w-[236px] shrink-0">
      <div className="h-[188px] w-full overflow-hidden rounded-xl bg-white ring-1 ring-black/[0.07] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_28px_-18px_rgba(16,24,40,0.20)] [font-family:var(--font-inter),system-ui,sans-serif]">
        <V69CardMock slug={slug} />
      </div>
      <p className="mt-3 text-[13px] font-normal leading-[1.3] text-neutral-900">{title}</p>
      <p className="mt-1 text-[11px] text-neutral-500">{category}</p>
    </div>
  );
});

// The dashboard the agent "builds" — assembled in layers by scroll progress.
function BuiltApp({ p }: { p: number }) {
  const chrome = seg(p, 0.24, 0.3);
  const sidebar = seg(p, 0.3, 0.42);
  const tiles = seg(p, 0.4, 0.58);
  const chart = easeInOut(seg(p, 0.54, 0.75));
  const published = seg(p, 0.82, 0.88);

  const stats: { label: string; target: number; suffix?: string }[] = [
    { label: "Engagement score", target: 8.4 },
    { label: "Active clients", target: 32 },
    { label: "At risk", target: 3 },
  ];

  // One smooth line, drawn left-to-right by the scrub.
  const CHART_W = 520;
  const CHART_H = 150;
  const points = [128, 116, 122, 96, 104, 78, 84, 58, 66, 40, 46, 24];
  const path = points
    .map((y, i) => `${i === 0 ? "M" : "L"} ${(i / (points.length - 1)) * CHART_W} ${y}`)
    .join(" ");
  const PATH_LEN = 700; // generous overestimate; dashoffset just needs to cover it

  return (
    <div
      className="overflow-hidden rounded-xl bg-white ring-1 ring-black/[0.07] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_24px_56px_-32px_rgba(16,24,40,0.28)]"
      style={{ opacity: chrome }}
    >
      <div className="flex items-center gap-2 border-b border-black/[0.06] px-4 py-3">
        <span className="text-[13px] text-neutral-900">Client portal</span>
        <span className="text-[13px] text-neutral-400">/ Engagement</span>
        <span
          className="ml-auto rounded-full px-2.5 py-1 text-[11px] leading-none"
          style={{
            opacity: published,
            transform: `translateY(${lerp(4, 0, published)}px)`,
            background: "color-mix(in srgb, #7DA4FF 14%, white)",
            color: "#3d61b8",
          }}
        >
          Published
        </span>
      </div>
      <div className="flex">
        <div className="w-[148px] shrink-0 space-y-1 border-r border-black/[0.06] p-3">
          {["Overview", "Clients", "Reports", "Settings"].map((item, i) => {
            const t = seg(sidebar, i * 0.22, i * 0.22 + 0.34);
            return (
              <div
                key={item}
                className={`rounded-md px-2.5 py-1.5 text-[12px] ${i === 0 ? "bg-[#f1f2f4] text-neutral-900" : "text-neutral-500"}`}
                style={{ opacity: t, transform: `translateY(${lerp(6, 0, t)}px)` }}
              >
                {item}
              </div>
            );
          })}
        </div>
        <div className="min-w-0 flex-1 p-4">
          <div className="grid grid-cols-3 gap-3">
            {stats.map((s, i) => {
              const t = easeInOut(seg(tiles, i * 0.18, i * 0.18 + 0.5));
              const isFloat = s.target % 1 !== 0;
              const value = isFloat
                ? (s.target * t).toFixed(1)
                : Math.round(s.target * t).toString();
              return (
                <div
                  key={s.label}
                  className="rounded-lg bg-[#f7f8fa] px-3 py-2.5 ring-1 ring-black/[0.04]"
                  style={{ opacity: t, transform: `translateY(${lerp(8, 0, t)}px)` }}
                >
                  <p className="text-[11px] text-neutral-500">{s.label}</p>
                  <p className="mt-1 text-[18px] font-medium leading-none text-neutral-900 tabular-nums">
                    {value}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="mt-3 rounded-lg bg-[#f7f8fa] p-3 ring-1 ring-black/[0.04]" style={{ opacity: seg(tiles, 0.3, 0.8) }}>
            <p className="text-[11px] text-neutral-500">Engagement over time</p>
            <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="mt-2 h-auto w-full" fill="none" aria-hidden>
              {[0.25, 0.5, 0.75].map((f) => (
                <line key={f} x1="0" x2={CHART_W} y1={CHART_H * f} y2={CHART_H * f} stroke="rgba(16,24,40,0.05)" strokeWidth="1" />
              ))}
              <path
                d={`${path} L ${CHART_W} ${CHART_H} L 0 ${CHART_H} Z`}
                fill="url(#story-chart-fill)"
                style={{ opacity: chart * 0.9 }}
              />
              <path
                d={path}
                stroke={ACCENT}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={PATH_LEN}
                strokeDashoffset={PATH_LEN * (1 - chart)}
              />
              <defs>
                <linearGradient id="story-chart-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ACCENT} stopOpacity="0.18" />
                  <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

// Chat contents shown inside the morphing frame once the prompt has "sent".
function ChatContents({ p }: { p: number }) {
  const bubble = easeInOut(seg(p, 0.22, 0.28));
  const planHead = seg(p, 0.29, 0.34);
  const response = seg(p, 0.75, 0.81);
  const publish = seg(p, 0.83, 0.89);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-2 border-b border-black/[0.05] px-4 py-3">
        <span className="size-2 rounded-full" style={{ background: ACCENT }} />
        <span className="text-[13px] text-neutral-900">Assembly agent</span>
        <span className="ml-auto text-[11px] text-neutral-400" style={{ fontFamily: MONO }}>
          building…
        </span>
      </div>

      <div className="flex-1 space-y-3 overflow-hidden px-4 py-4">
        <div
          className="ml-auto max-w-[88%] rounded-2xl rounded-br-md bg-[#f1f2f4] px-3.5 py-2.5 text-[13.5px] leading-[1.45] text-neutral-900"
          style={{ opacity: bubble, transform: `translateY(${lerp(10, 0, bubble)}px)` }}
        >
          {PROMPT}.
        </div>

        <div style={{ opacity: planHead, transform: `translateY(${lerp(8, 0, planHead)}px)` }}>
          <p className="text-[12px] text-neutral-500">Created a build plan</p>
          <div className="mt-2 space-y-1 rounded-xl bg-white p-2 ring-1 ring-black/[0.06]">
            {PLAN_ITEMS.map((item, i) => {
              const start = 0.34 + i * 0.06;
              const t = seg(p, start, start + 0.05);
              return (
                <div key={item} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
                  <span
                    className="flex size-4 shrink-0 items-center justify-center rounded-full ring-1 transition-colors"
                    style={{
                      background: t > 0.5 ? ACCENT : "transparent",
                      // ring via boxShadow so it can crossfade with the fill
                      boxShadow: `inset 0 0 0 1px ${t > 0.5 ? ACCENT : "rgba(16,24,40,0.18)"}`,
                    }}
                  >
                    <IconCheck className="size-2.5 text-white" />
                  </span>
                  <span
                    className="text-[13px] leading-none"
                    style={{ color: t > 0.5 ? "#101828" : "rgba(16,24,40,0.45)" }}
                  >
                    {item}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <p
          className="max-w-[92%] text-[13.5px] leading-[1.5] text-neutral-700"
          style={{ opacity: response, transform: `translateY(${lerp(8, 0, response)}px)` }}
        >
          Added an engagement score, a weekly activity chart, and a health breakdown — published to your portal.
        </p>

        <div
          className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px]"
          style={{
            opacity: publish,
            transform: `translateY(${lerp(6, 0, publish)}px)`,
            background: "color-mix(in srgb, #7DA4FF 12%, white)",
            color: "#3d61b8",
          }}
        >
          <IconCheck className="size-3" />
          Live for clients
        </div>
      </div>

      <div className="mx-3 mb-3 flex items-center gap-2 rounded-xl bg-[#f7f8fa] px-3 py-2.5 ring-1 ring-black/[0.05]">
        <span className="flex-1 text-[13px] text-neutral-400">Ask for a change…</span>
        <span className="flex size-6 items-center justify-center rounded-full bg-neutral-900 text-white">
          <IconArrowUp className="size-3" />
        </span>
      </div>
    </div>
  );
}

type Rect = { x: number; y: number; w: number; h: number };

export function ScrollStory() {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const heroAnchorRef = useRef<HTMLDivElement>(null);
  const chatAnchorRef = useRef<HTMLDivElement>(null);

  const [p, setP] = useState(0);
  const [anchors, setAnchors] = useState<{ hero: Rect; chat: Rect } | null>(null);
  const [isDesktop, setIsDesktop] = useState(true);
  const [reduced, setReduced] = useState(false);

  // Typewriter for the hero prompt — time-based only until the story starts,
  // then scroll owns everything. Scrubbing back keeps the prompt complete.
  const [typed, setTyped] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setIsDesktop(mq.matches);
      setReduced(rm.matches);
    };
    sync();
    mq.addEventListener("change", sync);
    rm.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      rm.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (reduced) return; // rendered fully-typed via effTyped below
    let i = 0;
    const id = setInterval(() => {
      if (startedRef.current) {
        setTyped(PROMPT.length);
        clearInterval(id);
        return;
      }
      i += 1;
      setTyped(i);
      if (i >= PROMPT.length) clearInterval(id);
    }, 34);
    return () => clearInterval(id);
  }, [reduced]);

  // Scroll scrub + anchor measuring. Transform-only animations keep the two
  // anchor slots at stable layout positions, so we only re-measure on resize.
  useEffect(() => {
    const measure = () => {
      const stage = stageRef.current;
      const hero = heroAnchorRef.current;
      const chat = chatAnchorRef.current;
      if (!stage || !hero || !chat) return;
      const s = stage.getBoundingClientRect();
      const toRect = (el: HTMLElement): Rect => {
        const r = el.getBoundingClientRect();
        return { x: r.left - s.left, y: r.top - s.top, w: r.width, h: r.height };
      };
      setAnchors({ hero: toRect(hero), chat: toRect(chat) });
    };
    // No rAF gating — scroll events already fire once per frame, and React
    // batches the setState; deferring to rAF only adds a frame of lag (and
    // stalls entirely in hidden/backgrounded documents).
    const onScroll = () => {
      const track = trackRef.current;
      if (!track) return;
      const r = track.getBoundingClientRect();
      const range = r.height - window.innerHeight;
      const next = range > 0 ? clamp01(-r.top / range) : 0;
      if (next > 0.02) startedRef.current = true;
      setP(next);
    };
    measure();
    onScroll();
    const ro = new ResizeObserver(measure);
    if (stageRef.current) ro.observe(stageRef.current);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [isDesktop]);

  const effP = reduced ? 1 : p;
  const effTyped = reduced ? PROMPT.length : typed;

  // Hero elements clear out as the story starts — and the story layer arrives
  // while they leave, so the stage is never empty between the two.
  const heroOut = easeInOut(seg(effP, 0.04, 0.14));
  const cardsOut = easeInOut(seg(effP, 0.02, 0.11));
  // The composer frame glides from its hero slot to the chat slot.
  const glide = easeInOut(seg(effP, 0.06, 0.22));
  // Composer contents swap to chat contents right as the frame arrives.
  const composerFade = 1 - seg(effP, 0.16, 0.22);
  const chatFade = seg(effP, 0.21, 0.27);
  // Left column: step text, then the app assembling underneath it.
  const stepIn = easeInOut(seg(effP, 0.16, 0.24));
  const appRise = easeInOut(seg(effP, 0.2, 0.3));
  const hint = 1 - seg(effP, 0.01, 0.05);

  const frame: React.CSSProperties | undefined = anchors
    ? {
        transform: `translate(${lerp(anchors.hero.x, anchors.chat.x, glide)}px, ${lerp(anchors.hero.y, anchors.chat.y, glide)}px)`,
        width: lerp(anchors.hero.w, anchors.chat.w, glide),
        height: lerp(anchors.hero.h, anchors.chat.h, glide),
      }
    : undefined;

  const ground = "linear-gradient(180deg, #fcfcfd 0%, #f7f8fa 52%, #ffffff 100%)";

  // ── Mobile / small screens: the same story as a simple static sequence. ──
  if (!isDesktop) {
    return (
      <section className="px-6 pb-20 pt-24" style={{ background: ground }}>
        <h1 className="type-display text-neutral-900">
          The AI app builder for client-facing experiences
        </h1>
        <div className="mt-8 overflow-hidden rounded-[18px] bg-white ring-1 ring-black/[0.06] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_20px_48px_-28px_rgba(16,24,40,0.24)]">
          <div className="h-[440px]">
            <ChatContents p={1} />
          </div>
        </div>
        <div className="mt-6">
          <BuiltApp p={1} />
        </div>
      </section>
    );
  }

  return (
    <div ref={trackRef} className="relative" style={{ height: reduced ? "100vh" : "460vh" }}>
      <div ref={stageRef} className="sticky top-0 h-screen overflow-hidden" style={{ background: ground }}>
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-black/[0.06]" />

        <div className="relative mx-auto h-full max-w-[1240px] px-10">
          {/* ── Hero layer ── */}
          <div
            className="pt-28"
            style={{ opacity: 1 - heroOut, transform: `translateY(${lerp(0, -32, heroOut)}px)` }}
          >
            <h1 className="type-display max-w-xl text-neutral-900">
              The AI app builder for
              <br /> client-facing experiences
            </h1>
          </div>

          {/* Composer anchor — where the frame rests in the hero. */}
          <div ref={heroAnchorRef} className="mt-8 h-[128px] max-w-xl" />

          {/* Template cards clear out downward as the story starts. */}
          <div
            className="mt-14 flex gap-4 overflow-hidden [mask-image:linear-gradient(to_right,#000_82%,transparent)]"
            style={{ ...MOCK_TOKENS, opacity: 1 - cardsOut, transform: `translateY(${lerp(0, 40, cardsOut)}px)` }}
          >
            {CARDS.map((t) => (
              <HeroCard key={t.slug} slug={t.slug} title={t.title} category={t.category} />
            ))}
          </div>

          {/* ── Story layer: step text + app on the left, chat slot right. ── */}
          <div className="pointer-events-none absolute inset-x-10 top-0 grid h-full grid-cols-[1fr_400px] items-center gap-12">
            <div>
              <div style={{ opacity: stepIn, transform: `translateY(${lerp(16, 0, stepIn)}px)` }}>
                <p className="text-[13px] text-neutral-400" style={{ fontFamily: MONO }}>
                  How it works
                </p>
                <h2 className="mt-2 max-w-md text-[28px] font-medium leading-[1.15] tracking-[-0.01em] text-neutral-900 [text-wrap:balance]">
                  Describe an app, ship it in minutes
                </h2>
              </div>
              <div className="mt-6" style={{ opacity: appRise, transform: `translateY(${lerp(48, 0, appRise)}px)` }}>
                <BuiltApp p={effP} />
              </div>
            </div>
            {/* Chat anchor — where the frame docks. */}
            <div ref={chatAnchorRef} className="h-[min(560px,calc(100vh-11rem))]" />
          </div>

          {/* ── The persistent frame: composer that becomes the chat. ── */}
          {frame && (
            <div
              className="absolute left-0 top-0 overflow-hidden rounded-[18px] bg-white ring-1 ring-black/[0.06] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_20px_48px_-28px_rgba(16,24,40,0.24)] [will-change:transform]"
              style={frame}
            >
              {/* Composer face */}
              <div className="absolute inset-0 flex flex-col p-4" style={{ opacity: composerFade, pointerEvents: composerFade > 0.5 ? "auto" : "none" }}>
                <p className="text-[15px] leading-[1.45] text-neutral-500">
                  {PROMPT.slice(0, effTyped)}
                  {effTyped < PROMPT.length && <span className="ml-px inline-block h-[1.1em] w-px translate-y-[3px] bg-neutral-400" />}
                </p>
                <div className="mt-auto flex items-center">
                  <span className="rounded-full px-3 py-1.5 text-[12.5px] text-neutral-500 ring-1 ring-black/[0.07]">
                    Prompt ideas
                  </span>
                  <span className="ml-auto flex items-center gap-1.5 rounded-full bg-neutral-900 px-3.5 py-1.5 text-[12.5px] text-white">
                    Start building
                  </span>
                </div>
              </div>
              {/* Chat face */}
              <div className="absolute inset-0" style={{ opacity: chatFade, pointerEvents: chatFade > 0.5 ? "auto" : "none" }}>
                <ChatContents p={effP} />
              </div>
            </div>
          )}

          {/* Scroll hint */}
          <p
            className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[12px] text-neutral-400"
            style={{ fontFamily: MONO, opacity: hint }}
          >
            Scroll to build
          </p>
        </div>
      </div>
    </div>
  );
}
