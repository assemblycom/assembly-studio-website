"use client";

import { memo, useEffect, useRef, useState } from "react";
import { V69CardMock } from "@/components/home/hero-v71";
import { getFeaturedTemplates } from "@/lib/templates";

// ─────────────────────────────────────────────────────────────────────────
// SCROLL STORY — an exploration of the hero → How-it-works transition
// (Granola-style). The hero's composer is the one persistent object: as you
// scroll it glides right and becomes the agent chat, and the three
// How-it-works chapters (Build → Brand → Team) play out as a continuous
// conversation — each chapter sends a new prompt while the app window on the
// left transforms to match. The scroll then releases into the normal page.
//
// Everything is scrubbed off scroll progress (no timers after the initial
// typewriter), so scrolling back rewinds the story.
// ─────────────────────────────────────────────────────────────────────────

const ACCENT = "#7DA4FF";
const MONO = "var(--font-diatype-mono)";
const PROMPT = "Build me a dashboard that tracks client engagement over time";

interface Chapter {
  id: string;
  eyebrow: string;
  title: string;
  prompt: string;
  planLabel: string;
  items: string[];
  response: string;
  chip: string;
  crumb: string;
  status: string;
}

// Mirrors the real How-it-works steps (Build → Brand → Team).
const CHAPTERS: Chapter[] = [
  {
    id: "build",
    eyebrow: "Build",
    title: "Describe an app, ship it in minutes",
    prompt: `${PROMPT}.`,
    planLabel: "Created a build plan",
    items: [
      "Engagement score per client",
      "Weekly activity chart",
      "Client health breakdown",
      "Publish to your portal",
    ],
    response:
      "Added an engagement score, a weekly activity chart, and a health breakdown — published to your portal.",
    chip: "Live for clients",
    crumb: "Engagement",
    status: "building…",
  },
  {
    id: "brand",
    eyebrow: "Brand",
    title: "A branded portal your clients want to use",
    prompt: "Make the portal match our brand.",
    planLabel: "Applied your brand",
    items: ["Logo and colors", "Your own domain", "Client-facing folders"],
    response:
      "Applied your logo, colors, and domain, and grouped the apps into client-facing folders.",
    chip: "On your domain",
    crumb: "Branding",
    status: "branding…",
  },
  {
    id: "team",
    eyebrow: "Team",
    title: "Your team's command center",
    prompt: "Set the team up to run it.",
    planLabel: "Set up your team",
    items: [
      "CRM for contacts and companies",
      "Shared notification center",
      "Team view of every app",
    ],
    response:
      "Wired in a CRM for contacts and companies, plus a shared notification center for the team.",
    chip: "Team ready",
    crumb: "Team",
    status: "setting up…",
  },
];

// ── Global timeline (fractions of total scroll) ──────────────────────────
// Hero clears and the composer becomes the chat, then the three chapters
// play back-to-back with short crossfades between them.
const T = {
  cardsOut: [0.015, 0.055],
  heroOut: [0.02, 0.06],
  glide: [0.03, 0.1],
  composerFade: [0.075, 0.1],
  chatFade: [0.09, 0.12],
  appRise: [0.09, 0.13],
  // [start, end] of each chapter's local progress…
  chapters: [
    [0.1, 0.38],
    [0.46, 0.66],
    [0.72, 0.92],
  ],
  // …and the visibility crossfades that hand one chapter to the next.
  vis: [
    [null, [0.4, 0.44]],
    [[0.42, 0.46], [0.66, 0.7]],
    [[0.68, 0.72], null],
  ],
} as const;

// Scrub helpers — map a slice of overall progress to a local 0–1.
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const visibility = (p: number, fadeIn: readonly [number, number] | null, fadeOut: readonly [number, number] | null) => {
  const on = fadeIn ? easeInOut(seg(p, fadeIn[0], fadeIn[1])) : 1;
  const off = fadeOut ? 1 - easeInOut(seg(p, fadeOut[0], fadeOut[1])) : 1;
  return Math.min(on, off);
};

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

function IconLock({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
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

// ── Chapter 1 — the dashboard assembling in layers (local t 0–1). ────────
function DashboardContent({ t }: { t: number }) {
  const sidebar = seg(t, 0.05, 0.3);
  const tiles = seg(t, 0.25, 0.55);
  const chart = easeInOut(seg(t, 0.45, 0.78));
  const published = seg(t, 0.85, 0.93);

  const stats: { label: string; target: number }[] = [
    { label: "Engagement score", target: 8.4 },
    { label: "Active clients", target: 32 },
    { label: "At risk", target: 3 },
  ];

  const CHART_W = 520;
  const CHART_H = 150;
  const points = [128, 116, 122, 96, 104, 78, 84, 58, 66, 40, 46, 24];
  const path = points
    .map((y, i) => `${i === 0 ? "M" : "L"} ${(i / (points.length - 1)) * CHART_W} ${y}`)
    .join(" ");
  const PATH_LEN = 700;

  return (
    <div className="flex">
      <div className="w-[148px] shrink-0 space-y-1 border-r border-black/[0.06] p-3">
        {["Overview", "Clients", "Reports", "Settings"].map((item, i) => {
          const s = seg(sidebar, i * 0.22, i * 0.22 + 0.34);
          return (
            <div
              key={item}
              className={`rounded-md px-2.5 py-1.5 text-[12px] ${i === 0 ? "bg-[#f1f2f4] text-neutral-900" : "text-neutral-500"}`}
              style={{ opacity: s, transform: `translateY(${lerp(6, 0, s)}px)` }}
            >
              {item}
            </div>
          );
        })}
      </div>
      <div className="min-w-0 flex-1 p-4">
        <div className="grid grid-cols-3 gap-3">
          {stats.map((s, i) => {
            const u = easeInOut(seg(tiles, i * 0.18, i * 0.18 + 0.5));
            const isFloat = s.target % 1 !== 0;
            const value = isFloat ? (s.target * u).toFixed(1) : Math.round(s.target * u).toString();
            return (
              <div
                key={s.label}
                className="rounded-lg bg-[#f7f8fa] px-3 py-2.5 ring-1 ring-black/[0.04]"
                style={{ opacity: u, transform: `translateY(${lerp(8, 0, u)}px)` }}
              >
                <p className="text-[11px] text-neutral-500">{s.label}</p>
                <p className="mt-1 text-[18px] font-medium leading-none text-neutral-900 tabular-nums">{value}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-3 rounded-lg bg-[#f7f8fa] p-3 ring-1 ring-black/[0.04]" style={{ opacity: seg(tiles, 0.3, 0.8) }}>
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-neutral-500">Engagement over time</p>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] leading-none"
              style={{
                opacity: published,
                background: "color-mix(in srgb, #7DA4FF 14%, white)",
                color: "#3d61b8",
              }}
            >
              Published
            </span>
          </div>
          <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="mt-2 h-auto w-full" fill="none" aria-hidden>
            {[0.25, 0.5, 0.75].map((f) => (
              <line key={f} x1="0" x2={CHART_W} y1={CHART_H * f} y2={CHART_H * f} stroke="rgba(16,24,40,0.05)" strokeWidth="1" />
            ))}
            <path d={`${path} L ${CHART_W} ${CHART_H} L 0 ${CHART_H} Z`} fill="url(#story-chart-fill)" style={{ opacity: chart * 0.9 }} />
            <path d={path} stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeDasharray={PATH_LEN} strokeDashoffset={PATH_LEN * (1 - chart)} />
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
  );
}

// ── Chapter 2 — branding washes over the portal (local t 0–1). ───────────
function BrandContent({ t }: { t: number }) {
  const identity = easeInOut(seg(t, 0, 0.22));
  const wash = easeInOut(seg(t, 0.15, 0.5));
  const folders = seg(t, 0.35, 0.75);
  const domain = easeInOut(seg(t, 0.78, 0.92));

  const FOLDERS = [
    { label: "Onboarding", locked: false, active: true },
    { label: "Documents", locked: false, active: false },
    { label: "Billing", locked: true, active: false },
    { label: "Reports", locked: true, active: false },
  ];

  return (
    <div>
      {/* Firm identity bar — the brand arriving is the moment. */}
      <div
        className="flex items-center gap-2.5 border-b border-black/[0.06] px-4 py-3"
        style={{ background: `color-mix(in srgb, ${ACCENT} ${Math.round(wash * 8)}%, white)` }}
      >
        <span
          className="flex size-6 items-center justify-center rounded-md text-[11px] text-white"
          style={{ opacity: identity, transform: `scale(${lerp(0.6, 1, identity)})`, background: "#101828" }}
        >
          N
        </span>
        <span className="text-[13px] font-medium text-neutral-900" style={{ opacity: identity }}>
          Northgate Advisory
        </span>
        <span
          className="ml-auto rounded-full px-2.5 py-1 text-[11px] leading-none"
          style={{
            opacity: domain,
            transform: `translateY(${lerp(4, 0, domain)}px)`,
            background: "color-mix(in srgb, #7DA4FF 14%, white)",
            color: "#3d61b8",
          }}
        >
          portal.northgate.com
        </span>
      </div>
      <div className="flex">
        <div className="w-[168px] shrink-0 space-y-1 border-r border-black/[0.06] p-3">
          {FOLDERS.map((f, i) => {
            const s = seg(folders, i * 0.2, i * 0.2 + 0.36);
            return (
              <div
                key={f.label}
                className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[12px]"
                style={{
                  opacity: s,
                  transform: `translateY(${lerp(6, 0, s)}px)`,
                  background: f.active ? `color-mix(in srgb, ${ACCENT} ${Math.round(wash * 16)}%, #f1f2f4)` : undefined,
                  color: f.active ? "#101828" : "rgba(16,24,40,0.55)",
                }}
              >
                {f.label}
                {f.locked && <IconLock className="ml-auto size-3 text-neutral-400" />}
              </div>
            );
          })}
        </div>
        <div className="min-w-0 flex-1 space-y-2 p-4">
          {["Welcome packet", "Engagement letter", "Kickoff checklist"].map((row, i) => {
            const s = seg(folders, 0.15 + i * 0.2, 0.15 + i * 0.2 + 0.36);
            return (
              <div
                key={row}
                className="flex items-center gap-3 rounded-lg bg-[#f7f8fa] px-3 py-2.5 ring-1 ring-black/[0.04]"
                style={{ opacity: s, transform: `translateY(${lerp(8, 0, s)}px)` }}
              >
                <span className="size-6 rounded-md" style={{ background: `color-mix(in srgb, ${ACCENT} ${Math.round(wash * 22)}%, #e9eaee)` }} />
                <span className="text-[12.5px] text-neutral-800">{row}</span>
                <span className="ml-auto text-[11px] text-neutral-400">Shared</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Chapter 3 — the team command center wires in (local t 0–1). ──────────
function TeamContent({ t }: { t: number }) {
  const crm = seg(t, 0.05, 0.5);
  const feed = seg(t, 0.4, 0.85);

  const CONTACTS = [
    { name: "Riley Chen", company: "Coverpanda", tone: "#101828" },
    { name: "Sam Ortiz", company: "Waymaker", tone: "#5b6472" },
    { name: "Ana Whitfield", company: "Aura", tone: "#8a93a3" },
  ];
  const NOTES = [
    "Riley signed the engagement letter",
    "New intake form submitted — Waymaker",
    "Invoice #204 paid",
  ];

  return (
    <div className="grid grid-cols-[1.2fr_1fr]">
      <div className="border-r border-black/[0.06] p-4">
        <p className="text-[11px] text-neutral-500">Contacts</p>
        <div className="mt-2 space-y-1.5">
          {CONTACTS.map((c, i) => {
            const s = seg(crm, i * 0.22, i * 0.22 + 0.4);
            return (
              <div
                key={c.name}
                className="flex items-center gap-2.5 rounded-lg bg-[#f7f8fa] px-3 py-2 ring-1 ring-black/[0.04]"
                style={{ opacity: s, transform: `translateY(${lerp(8, 0, s)}px)` }}
              >
                <span className="flex size-6 items-center justify-center rounded-full text-[10px] text-white" style={{ background: c.tone }}>
                  {c.name.split(" ").map((w) => w[0]).join("")}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[12.5px] leading-tight text-neutral-900">{c.name}</span>
                  <span className="block text-[10.5px] leading-tight text-neutral-500">{c.company}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="p-4">
        <p className="text-[11px] text-neutral-500">Notifications</p>
        <div className="mt-2 space-y-1.5">
          {NOTES.map((n, i) => {
            const s = seg(feed, i * 0.22, i * 0.22 + 0.4);
            return (
              <div key={n} className="flex items-start gap-2 rounded-lg px-1 py-1.5" style={{ opacity: s, transform: `translateY(${lerp(8, 0, s)}px)` }}>
                <span className="mt-[5px] size-1.5 shrink-0 rounded-full" style={{ background: ACCENT }} />
                <span className="text-[12px] leading-[1.4] text-neutral-700">{n}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// One chapter's slice of the conversation (local t 0–1).
function ChatThread({ t, chapter }: { t: number; chapter: Chapter }) {
  const bubble = easeInOut(seg(t, 0, 0.09));
  const planHead = seg(t, 0.11, 0.17);
  // Finish comfortably before t=1 so the chapter's payoff holds on screen
  // instead of landing on the last scroll pixel before the crossfade.
  const response = seg(t, 0.72, 0.8);
  const chip = seg(t, 0.83, 0.9);

  return (
    <div className="space-y-3">
      <div
        className="ml-auto max-w-[88%] rounded-2xl rounded-br-md bg-[#f1f2f4] px-3.5 py-2.5 text-[13.5px] leading-[1.45] text-neutral-900"
        style={{ opacity: bubble, transform: `translateY(${lerp(10, 0, bubble)}px)` }}
      >
        {chapter.prompt}
      </div>

      <div style={{ opacity: planHead, transform: `translateY(${lerp(8, 0, planHead)}px)` }}>
        <p className="text-[12px] text-neutral-500">{chapter.planLabel}</p>
        <div className="mt-2 space-y-1 rounded-xl bg-white p-2 ring-1 ring-black/[0.06]">
          {chapter.items.map((item, i) => {
            const start = 0.2 + i * 0.09;
            const s = seg(t, start, start + 0.07);
            return (
              <div key={item} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
                <span
                  className="flex size-4 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: s > 0.5 ? ACCENT : "transparent",
                    boxShadow: `inset 0 0 0 1px ${s > 0.5 ? ACCENT : "rgba(16,24,40,0.18)"}`,
                  }}
                >
                  <IconCheck className="size-2.5 text-white" />
                </span>
                <span className="text-[13px] leading-none" style={{ color: s > 0.5 ? "#101828" : "rgba(16,24,40,0.45)" }}>
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
        {chapter.response}
      </p>

      <div
        className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px]"
        style={{
          opacity: chip,
          transform: `translateY(${lerp(6, 0, chip)}px)`,
          background: "color-mix(in srgb, #7DA4FF 12%, white)",
          color: "#3d61b8",
        }}
      >
        <IconCheck className="size-3" />
        {chapter.chip}
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
      if (next > 0.01) startedRef.current = true;
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
  const heroOut = easeInOut(seg(effP, T.heroOut[0], T.heroOut[1]));
  const cardsOut = easeInOut(seg(effP, T.cardsOut[0], T.cardsOut[1]));
  const glide = easeInOut(seg(effP, T.glide[0], T.glide[1]));
  const composerFade = 1 - seg(effP, T.composerFade[0], T.composerFade[1]);
  const chatFade = seg(effP, T.chatFade[0], T.chatFade[1]);
  const appRise = easeInOut(seg(effP, T.appRise[0], T.appRise[1]));
  const hint = 1 - seg(effP, 0.005, 0.03);

  // Per-chapter local progress + crossfade visibility.
  const q = CHAPTERS.map((_, i) => seg(effP, T.chapters[i][0], T.chapters[i][1]));
  const vis = CHAPTERS.map((_, i) => visibility(effP, T.vis[i][0], T.vis[i][1]));
  // For reduced motion, land on the final chapter fully played.
  const active = reduced ? CHAPTERS.length - 1 : vis.indexOf(Math.max(...vis));

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
        <div className="mt-10 space-y-10">
          {CHAPTERS.map((c, i) => (
            <div key={c.id}>
              <p className="text-[13px] text-neutral-400" style={{ fontFamily: MONO }}>
                {c.eyebrow}
              </p>
              <h2 className="mt-1 text-[22px] font-medium leading-[1.2] text-neutral-900">{c.title}</h2>
              <div className="mt-4 overflow-hidden rounded-xl bg-white ring-1 ring-black/[0.07] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_20px_48px_-28px_rgba(16,24,40,0.24)]">
                <div className="flex items-center gap-2 border-b border-black/[0.06] px-4 py-3">
                  <span className="text-[13px] text-neutral-900">Client portal</span>
                  <span className="text-[13px] text-neutral-400">/ {c.crumb}</span>
                </div>
                {i === 0 ? <DashboardContent t={1} /> : i === 1 ? <BrandContent t={1} /> : <TeamContent t={1} />}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <div ref={trackRef} className="relative" style={{ height: reduced ? "100vh" : "1000vh" }}>
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
              {/* Step text — one block per chapter, crossfaded in place. */}
              <div className="relative h-[92px]" style={{ opacity: appRise }}>
                {CHAPTERS.map((c, i) => (
                  <div
                    key={c.id}
                    className="absolute inset-x-0 top-0"
                    style={{ opacity: vis[i], transform: `translateY(${lerp(10, 0, vis[i])}px)` }}
                  >
                    <p className="text-[13px] text-neutral-400" style={{ fontFamily: MONO }}>
                      {c.eyebrow}
                    </p>
                    <h2 className="mt-2 max-w-md text-[28px] font-medium leading-[1.15] tracking-[-0.01em] text-neutral-900 [text-wrap:balance]">
                      {c.title}
                    </h2>
                  </div>
                ))}
              </div>

              {/* The app window persists; its crumb and contents swap per chapter. */}
              <div className="mt-6" style={{ opacity: appRise, transform: `translateY(${lerp(48, 0, appRise)}px)` }}>
                <div className="overflow-hidden rounded-xl bg-white ring-1 ring-black/[0.07] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_24px_56px_-32px_rgba(16,24,40,0.28)]">
                  <div className="flex items-center gap-2 border-b border-black/[0.06] px-4 py-3">
                    <span className="text-[13px] text-neutral-900">Client portal</span>
                    <span className="relative text-[13px] text-neutral-400">
                      {CHAPTERS.map((c, i) => (
                        <span key={c.id} className={i === 0 ? "" : "absolute left-0 top-0"} style={{ opacity: vis[i] }}>
                          / {c.crumb}
                        </span>
                      ))}
                    </span>
                    <span className="ml-auto flex gap-1.5">
                      <span className="size-2 rounded-full bg-black/10" />
                      <span className="size-2 rounded-full bg-black/10" />
                    </span>
                  </div>
                  {/* Contents crossfade in a fixed-height stage so the window
                      never jumps between chapters. */}
                  <div className="relative h-[300px]">
                    <div className="absolute inset-0" style={{ opacity: vis[0] }}>
                      <DashboardContent t={q[0]} />
                    </div>
                    <div className="absolute inset-0" style={{ opacity: vis[1] }}>
                      <BrandContent t={q[1]} />
                    </div>
                    <div className="absolute inset-0" style={{ opacity: vis[2] }}>
                      <TeamContent t={q[2]} />
                    </div>
                  </div>
                </div>
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
              {/* Chat face — header, per-chapter thread, input. */}
              <div className="absolute inset-0 flex flex-col" style={{ opacity: chatFade, pointerEvents: chatFade > 0.5 ? "auto" : "none" }}>
                <div className="flex items-center gap-2 border-b border-black/[0.05] px-4 py-3">
                  <span className="size-2 rounded-full" style={{ background: ACCENT }} />
                  <span className="text-[13px] text-neutral-900">Assembly agent</span>
                  <span className="relative ml-auto text-[11px] text-neutral-400" style={{ fontFamily: MONO }}>
                    {CHAPTERS.map((c, i) => (
                      <span key={c.id} className={i === 0 ? "" : "absolute right-0 top-0 whitespace-nowrap"} style={{ opacity: vis[i] }}>
                        {c.status}
                      </span>
                    ))}
                  </span>
                </div>
                <div className="relative min-h-0 flex-1 overflow-hidden">
                  {CHAPTERS.map((c, i) => (
                    <div key={c.id} className="absolute inset-0 px-4 py-4" style={{ opacity: vis[i] }}>
                      <ChatThread t={reduced && i === active ? 1 : q[i]} chapter={c} />
                    </div>
                  ))}
                </div>
                <div className="mx-3 mb-3 flex items-center gap-2 rounded-xl bg-[#f7f8fa] px-3 py-2.5 ring-1 ring-black/[0.05]">
                  <span className="flex-1 text-[13px] text-neutral-400">Ask for a change…</span>
                  <span className="flex size-6 items-center justify-center rounded-full bg-neutral-900 text-white">
                    <IconArrowUp className="size-3" />
                  </span>
                </div>
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
