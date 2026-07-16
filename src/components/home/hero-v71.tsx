"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { APP_URL } from "@/lib/constants";
import { getFeaturedTemplates, TEMPLATES, type Template } from "@/lib/templates";
import { IconArrow } from "./icons";
import { V66Composer } from "./hero-v66";
import { TemplateMock } from "./template-preview";

// ─────────────────────────────────────────────────────────────────────────
// HERO V69 — V64's composition (left headline, tall composer, poster template
// row) on a vertical blue→green→white gradient, with a ToDesktop-style nav:
// wide and transparent at the top, collapsing into a compact centered frosted
// pill on scroll. Text + UI stay dark so they read over the light gradient.
// ─────────────────────────────────────────────────────────────────────────

const MONO = '"ABC Diatype Mono", ui-monospace, SFMono-Regular, Menlo, monospace';
const NAV_LINKS = ["Solutions", "Resources", "Pricing", "Products"];

// Type scale — modeled on Linear / Devin Desktop / Bird: large display at
// MEDIUM weight (never bold), tight negative tracking that grows with size,
// tight leading on the display, and muted supporting text. Tailwind classes:
//   display  text-[34px] md:text-[50px]  font-medium  tracking-[-0.03em]  leading-[1.03]
//   lead     text-[18px]                 font-normal  tracking-[-0.01em]  leading-[1.5]  (muted)
//   label    text-[15px]                 font-normal  tracking-[-0.01em]                 (nav / CTA)
//   title    text-[15px]                 font-medium  tracking-[-0.01em]  leading-[1.25] (card title)
//   meta     text-[13px]                 font-normal  tracking-[-0.005em]                (muted)
//   eyebrow  text-[12px]                 font-normal  tracking-[0.01em]   (mono, normal case)
const T = {
  display: "text-[34px] font-medium leading-[1.03] tracking-[-0.03em] md:text-[50px]",
  label: "text-[15px] tracking-[-0.01em]",
  title: "text-[13px] font-normal leading-[1.3] tracking-[-0.01em]",
  meta: "text-[11px] tracking-[-0.005em]",
  eyebrow: "text-[12px] tracking-[0.01em]",
};

function IconChevron({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}
// Polished, animated mocks for the first two card templates. Animations are
// triggered by the card's group-hover (cards stay mounted in the row), so the
// form fills in / the chart builds each time you hover.
function CardIntake() {
  // A minimal glimpse — two filled fields and the primary action. No in-card
  // title/badge: the template name lives in the caption beneath the card, so
  // repeating it here would only crowd the widget.
  const fields: [string, string][] = [
    ["Company", "Northwind Co."],
    ["Contact", "jane@northwind.com"],
  ];
  return (
    <div className="flex h-full flex-col justify-center gap-3 bg-[var(--v69-card)] p-4">
      {fields.map(([l, v], i) => (
        <div
          key={l}
          className="flex flex-col gap-1 [will-change:transform,opacity] group-hover:[animation:cardRowIn_0.45s_ease-out_both] group-[.is-inview]:[animation:cardRowIn_0.45s_ease-out_both]"
          style={{ animationDelay: `${i * 0.08}s` }}
        >
          <span className="text-[9px] leading-none text-neutral-400">{l}</span>
          <div className="flex h-[26px] items-center rounded-[6px] bg-[var(--v69-well)] px-2.5 text-[11px] text-neutral-800 shadow-[inset_0_0_0_1px_rgba(16,24,40,0.05)]">
            <span className="truncate">{v}</span>
          </div>
        </div>
      ))}
      {/* Muted secondary action — a quiet chip, not a stark white CTA. */}
      <button
        type="button"
        tabIndex={-1}
        className="mt-3 flex h-[26px] items-center justify-center rounded-[6px] text-[11px] font-medium text-white [will-change:transform,opacity] group-hover:[animation:cardRowIn_0.55s_ease-out_0.28s_both] group-[.is-inview]:[animation:cardRowIn_0.55s_ease-out_0.28s_both]"
        style={{ backgroundColor: INK_SOLID }}
      >
        Create client
      </button>
    </div>
  );
}

// ─── Neutral fill ladder ────────────────────────────────────────────────
// Every gray FILL in the mocks comes off this five-step scale, mixed from the
// skin's ink so both themes track automatically. Text keeps the neutral-400 →
// 900 type scale; fills use these. INK_SOLID caps selected/solid surfaces
// below full black so no element on the rail screams.
const ink = (pct: number) => `color-mix(in srgb, var(--v69-ink) ${pct}%, transparent)`;
const INK_FAINT = ink(16); // lightest data fill
const INK_MID = ink(38); // mid data fill
const INK_STRONG = ink(62); // strongest data fill
const INK_SOLID = ink(78); // solid surfaces: checks, bubbles, CTAs, selected radio

// Client engagement dashboard — a neutral Apple-widget: an eyebrow, a big goal
// fraction, and a weekday bar chart. Monochrome like the rest of the rail;
// magnitude reads by bar height, not hue.
const DASH_BAR = INK_STRONG;
function CardDashboard() {
  // Weekday engagement vs. the target line (~65%). Wed peaks, Tue dips —
  // mirrors the reference's shape.
  const days: [string, number][] = [
    ["Mon", 62],
    ["Tue", 30],
    ["Wed", 96],
    ["Thu", 72],
    ["Fri", 72],
    ["Sat", 46],
    ["Sun", 48],
  ];
  return (
    <div className="flex h-full flex-col gap-2 bg-[var(--v69-card)] p-3.5">
      <div className="text-[10px] font-medium text-neutral-400">Engagement</div>
      <div className="text-[19px] font-medium leading-none tracking-tight text-neutral-900">
        82<span className="text-neutral-400">/100</span>
      </div>
      {/* Fixed-height chart pinned to the bottom — letting it flex made the
          bars tower on the square card. */}
      <div className="mt-auto flex h-[124px] flex-col gap-1">
        <div className="relative flex flex-1 items-end gap-1.5">
          {days.map(([day, h], i) => (
            <div
              key={day}
              className="w-full origin-bottom rounded-t-[2px] group-hover:[animation:v69GrowY_0.6s_ease-out_both] group-[.is-inview]:[animation:v69GrowY_0.6s_ease-out_both]"
              style={{ height: `${h}%`, animationDelay: `${i * 0.05}s`, backgroundColor: DASH_BAR }}
            />
          ))}
        </div>
        <div className="flex gap-1.5">
          {days.map(([day]) => (
            <span key={day} className="w-full text-center text-[6.5px] leading-none text-neutral-400">
              {day}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function CardDataViz() {
  // Distinct from the engagement dashboard's dense histogram: a few thick
  // capsule bars, each a full-height track with a filled lower portion — reads
  // as an analytics readout. A headline metric anchors it as a revenue chart.
  const bars = [48, 30, 64, 42, 70, 92, 58];
  return (
    <div className="flex h-full flex-col gap-2 bg-[var(--v69-card)] px-3.5 pt-3.5">
      <div>
        <div className="text-[9px] text-neutral-400">Monthly revenue</div>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-[26px] font-medium leading-none tracking-tight text-neutral-900">$48.2K</span>
          <span className="rounded-full bg-[var(--v69-well)] px-2.5 py-1 text-[9px] font-medium leading-none text-neutral-400 group-hover:[animation:v69Pop_0.35s_ease-out_0.9s_both] group-[.is-inview]:[animation:v69Pop_0.35s_ease-out_0.9s_both]">+12%</span>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 items-end gap-1.5 pb-3.5 pt-1.5">
        {bars.map((h, i) => (
          <div key={i} className="relative flex h-full w-full items-end overflow-hidden rounded-full bg-[var(--v69-well)]">
            <div
              className="w-full origin-bottom rounded-full group-hover:[animation:v69GrowY_0.6s_ease-out_both] group-[.is-inview]:[animation:v69GrowY_0.6s_ease-out_both]"
              style={{ height: `${h}%`, animationDelay: `${i * 0.05}s`, backgroundColor: INK_STRONG }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// Time tracker — a day's logged time: a headline total over per-entry duration
// bars, so it actually reads as time tracking (not a billable-rate roster).
function CardTimeTracker() {
  // pct is each entry's duration relative to the longest, so the bars stay
  // proportional to the times shown.
  const rows = [
    { label: "Client work", time: "3h 10m", pct: 100 },
    { label: "Design review", time: "2h 05m", pct: 66 },
    { label: "Admin", time: "1h 05m", pct: 34 },
  ];
  return (
    <div className="flex h-full flex-col gap-2 bg-[var(--v69-card)] px-3.5 pt-3.5">
      <div>
        <div className="text-[9px] text-neutral-400">Tracked today</div>
        <div className="mt-1 text-[26px] font-medium leading-none tracking-tight text-neutral-900">6h 20m</div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col justify-center gap-3 pb-3.5">
        {rows.map((r, i) => (
          <div
            key={r.label}
            className="flex flex-col gap-1.5 [will-change:transform,opacity] group-hover:[animation:cardRowIn_0.4s_ease-out_both] group-[.is-inview]:[animation:cardRowIn_0.4s_ease-out_both]"
            style={{ animationDelay: `${i * 0.09}s` }}
          >
            <div className="flex items-center justify-between text-[10px] leading-none">
              <span className="text-neutral-700">{r.label}</span>
              <span className="tabular-nums text-neutral-400">{r.time}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[var(--v69-well)]">
              <div
                className="h-full origin-left rounded-full group-hover:[animation:v69GrowX_0.7s_ease-out_both] group-[.is-inview]:[animation:v69GrowX_0.7s_ease-out_both]"
                style={{ width: `${r.pct}%`, animationDelay: `${i * 0.09}s`, backgroundColor: INK_STRONG }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Goal tracker — visual removed for now (the donut read poorly at card size);
// the card face stays blank until a better composition lands.
function CardGoalTracker() {
  return <div className="h-full bg-[var(--v69-card)]" />;
}

// Static (non-animated) filling mocks for the remaining featured cards — rows
// centered with even gaps so the card reads composed, not top-clustered.
// Proposal builder — banking-widget composition (à la the iOS wallet card):
// a white panel carrying the proposal total up top, page dots, then a row of
// circular actions beneath. The chip/well tokens keep it dark-skin safe.
function CardProposal() {
  const actions: [string, React.ReactNode][] = [
    [
      "Add item",
      <svg key="i" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
        <path d="M12 5v14M5 12h14" />
      </svg>,
    ],
    [
      "E-sign",
      <svg key="i" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 19l7-7 3 3-7 7-3-3z" />
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      </svg>,
    ],
    [
      "Send",
      <svg key="i" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M5 12h14" />
        <path d="M13 6l6 6-6 6" />
      </svg>,
    ],
  ];
  return (
    <div className="flex h-full flex-col bg-[var(--v69-card)] p-3.5">
      {/* Balance-style panel: quiet label row, then the total with a
          detail-arrow — the proposal's "money moment" front and center. */}
      <div
        className="rounded-[16px] bg-[var(--v69-chip)] px-3.5 pb-4 pt-3 shadow-[0_1px_2px_rgba(16,24,40,0.06),inset_0_0_0_1px_rgba(16,24,40,0.03)] [will-change:transform,opacity] group-hover:[animation:cardRowIn_0.4s_ease-out_both] group-[.is-inview]:[animation:cardRowIn_0.4s_ease-out_both]"
      >
        <div className="flex items-center justify-between text-[8.5px] text-neutral-400">
          <span>Proposal</span>
          <span>Northwind</span>
        </div>
        <div className="mt-4 text-[24px] font-medium leading-none tracking-tight tabular-nums text-neutral-900">$18,500</div>
      </div>
      {/* Page dots. */}
      <div className="mt-3 flex items-center justify-center gap-1">
        <span className="h-[3px] w-[3px] rounded-full bg-[var(--v69-well-2)]" />
        <span className="h-[3px] w-3 rounded-full bg-neutral-400" />
        <span className="h-[3px] w-[3px] rounded-full bg-[var(--v69-well-2)]" />
      </div>
      {/* Circular actions, staggered in on hover. */}
      <div className="mt-auto flex items-start justify-between px-2 pb-1">
        {actions.map(([label, icon], i) => (
          <div
            key={label as string}
            className="flex flex-col items-center gap-1.5 [will-change:transform,opacity] group-hover:[animation:v69Pop_0.4s_ease-out_both] group-[.is-inview]:[animation:v69Pop_0.4s_ease-out_both]"
            style={{ animationDelay: `${0.15 + i * 0.08}s` }}
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-[var(--v69-well-2)] text-neutral-600">{icon}</span>
            <span className="text-[8.5px] text-neutral-600">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CardChat() {
  return (
    <div className="flex h-full flex-col bg-[var(--v69-card)] p-4 text-[11px]">
      {/* Thread hugs the top with the composer pinned at the bottom — how a
          real chat renders — so the bubbles read anchored, not floating. */}
      <div className="flex min-h-0 flex-1 flex-col justify-start gap-2 pt-1">
        <div className="max-w-[85%] rounded-xl rounded-tl-sm bg-[var(--v69-well-2)] px-3 py-2 text-neutral-700 shadow-[inset_0_0_0_1px_rgba(16,24,40,0.03)] [will-change:transform,opacity] group-hover:[animation:cardRowIn_0.4s_ease-out_both] group-[.is-inview]:[animation:cardRowIn_0.4s_ease-out_both]">When does my project kick off?</div>
        {/* Sent bubble: ink surface + card-toned text, so it inverts cleanly on
            the dark skin (white bubble, dark text) instead of vanishing. */}
        <div className="ml-auto max-w-[85%] rounded-xl rounded-tr-sm px-3 py-2 leading-relaxed text-white [will-change:transform,opacity] group-hover:[animation:cardRowIn_0.4s_ease-out_0.35s_both] group-[.is-inview]:[animation:cardRowIn_0.4s_ease-out_0.35s_both]" style={{ backgroundColor: INK_SOLID }}>Kickoff is Mon, Apr 8.</div>
      </div>
      <div className="flex h-7 shrink-0 items-center rounded-full bg-[var(--v69-well)] px-3 text-[10px] text-neutral-400 shadow-[inset_0_0_0_1px_rgba(16,24,40,0.04)]">
        <span>Ask a question…</span>
        <span className="ml-px h-3 w-px bg-neutral-500 opacity-0 group-hover:[animation:v69Blink_0.9s_steps(1)_0.7s_infinite] group-[.is-inview]:[animation:v69Blink_0.9s_steps(1)_0.7s_infinite]" />
      </div>
    </div>
  );
}

// Onboarding wizard — a single guided step: a segmented step-progress, a
// one-line title, and contact-detail fields mid-entry. Reads as a real
// wizard step, not an abstract meter. Ink accent — the active step reads as
// ink-on-card in the light skin and flips to white on the dark skin.
const ONBOARDING_ACCENT = "var(--v69-ink)";
function CardOnboarding() {
  // The identity step of the wizard's welcome → identity → goals flow, so
  // it sits early in the count.
  const STEP = 2;
  const TOTAL = 4;
  // Contact-detail fields a new client fills in mid-onboarding; the last one
  // is still empty so the step reads in-progress, not finished.
  const fields: [string, string][] = [
    ["Name", "Riley Chen"],
    ["Email", "riley@northwind.co"],
    ["Phone", ""],
  ];
  return (
    <div className="flex h-full flex-col justify-center gap-3.5 bg-[var(--v69-card)] p-4">
      {/* Segmented step progress. */}
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1">
          {Array.from({ length: TOTAL }, (_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full"
              style={{
                backgroundColor:
                  i < STEP - 1
                    ? INK_SOLID
                    : i === STEP - 1
                      ? `color-mix(in srgb, ${ONBOARDING_ACCENT} 45%, var(--v69-well-2))`
                      : "var(--v69-well-2)",
              }}
            />
          ))}
        </div>
        <span className="text-[8px] tabular-nums text-neutral-400">
          {STEP}/{TOTAL}
        </span>
      </div>
      {/* One-line title — short enough never to wrap at the card width.
          Regular weight: medium reads bold at this size. */}
      <div className="text-[12.5px] font-normal leading-tight text-neutral-900">
        Your contact details
      </div>
      <div className="flex flex-col gap-2">
        {fields.map(([label, value], i) => (
          <div
            key={label}
            className="flex items-baseline justify-between gap-2 rounded-md bg-[var(--v69-well)] px-2.5 py-2 [will-change:transform,opacity] group-hover:[animation:cardRowIn_0.4s_ease-out_both] group-[.is-inview]:[animation:cardRowIn_0.4s_ease-out_both]"
            style={{ animationDelay: `${i * 0.07}s` }}
          >
            <span className="text-[8.5px] text-neutral-400">{label}</span>
            {value ? (
              <span className="text-[10px] text-neutral-800">{value}</span>
            ) : (
              // The empty field carries a blinking caret so the step reads
              // as mid-entry (same device as the chat card's composer).
              <span className="ml-px inline-block h-3 w-px bg-neutral-500 opacity-0 group-hover:[animation:v69Blink_0.9s_steps(1)_0.5s_infinite] group-[.is-inview]:[animation:v69Blink_0.9s_steps(1)_0.5s_infinite]" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Document collection — an upload checklist where each requested doc checks off
// with a staggered pop on hover.
// Content approval — an app-like "slide to approve" control (à la iOS "slide
// to transfer"): the item under review sits in a soft panel, and on hover the
// white thumb glides across the track while the hint label fades out.
function CardApproval() {
  return (
    // Two queued items instead of one stretched panel, so every block keeps
    // its natural height. Tokens follow the sibling cards: well panels with
    // the checklist's inset ring, p-3.5 face padding, tracker-style header.
    <div className="flex h-full flex-col gap-2 bg-[var(--v69-card)] p-3.5">
      <div className="flex items-center text-[9px] text-neutral-400">
        <span>Waiting on you</span>
      </div>
      {(
        [
          ["March newsletter", "Draft v3 · from Sarah"],
          ["Launch announcement", "Draft v1 · from Alex"],
        ] as [string, string][]
      ).map(([title, meta], i) => (
        <div
          key={title}
          className="rounded-[10px] bg-[var(--v69-well)] px-3 py-2.5 shadow-[inset_0_0_0_1px_rgba(16,24,40,0.04)] [will-change:transform,opacity] group-hover:[animation:cardRowIn_0.4s_ease-out_both] group-[.is-inview]:[animation:cardRowIn_0.4s_ease-out_both]"
          style={{ animationDelay: `${i * 0.09}s` }}
        >
          <div className="text-[10.5px] font-medium leading-tight text-neutral-900">{title}</div>
          <div className="mt-0.5 text-[9px] text-neutral-500">{meta}</div>
        </div>
      ))}
      <div className="relative mt-auto h-9 shrink-0 overflow-hidden rounded-full bg-[var(--v69-well-2)] shadow-[inset_0_0_0_1px_rgba(16,24,40,0.04)]">
        {/* The label holds for ~700ms after hover so it can actually be read;
            it fades just as the thumb starts to travel over it. */}
        <span className="absolute inset-0 flex items-center justify-center text-[9.5px] text-neutral-500 transition-opacity duration-500 group-hover:opacity-0 group-hover:delay-[700ms] group-[.is-inview]:opacity-0 group-[.is-inview]:delay-[700ms]">
          Slide to approve
        </span>
        {/* Thumb travel: 184px track (212 − 2×14 padding) − 3px inset each
            side − 48px thumb = 130px, landing flush with the same 3px margin
            it starts with. A transition (not keyframes) with a hover-only
            delay: it waits ~700ms, glides slowly, and returns immediately on
            mouse-out. */}
        <span className="absolute bottom-[3px] left-[3px] top-[3px] flex w-12 items-center justify-center rounded-full bg-[var(--v69-knob)] text-[var(--v69-knob-ink)] shadow-[0_1px_2px_rgba(16,24,40,0.12)] transition-transform duration-[900ms] ease-[cubic-bezier(0.3,0.7,0.3,1)] group-hover:translate-x-[130px] group-hover:delay-[700ms] group-[.is-inview]:translate-x-[130px] group-[.is-inview]:delay-[700ms]">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12h14" />
            <path d="M13 6l6 6-6 6" />
          </svg>
        </span>
      </div>
    </div>
  );
}

function CardChecklist() {
  const docs: [string, boolean][] = [
    ["Signed contract", true],
    ["W-9 form", true],
    ["Brand assets", true],
    ["Logo files", false],
  ];
  return (
    // Items hug the top (like the sibling cards) instead of centering.
    <div className="flex h-full flex-col justify-start gap-2 bg-[var(--v69-card)] p-4 pt-5">
      <div className="flex flex-col gap-2">
        {docs.map(([label, done], i) => (
          <div key={label} className="flex items-center gap-2 rounded-md bg-[var(--v69-well)] px-2.5 py-1.5 shadow-[inset_0_0_0_1px_rgba(16,24,40,0.04)]">
            {/* The empty checkbox is always present; only the filled check pops
                IN (staggered) so the row reads as "getting checked" rather than
                the whole box appearing from nothing. */}
            <span className="relative flex size-3.5 shrink-0 items-center justify-center rounded-[4px] border border-black/10 bg-[var(--v69-chip)]">
              {done && (
                <span
                  className="absolute inset-[-1px] flex items-center justify-center rounded-[4px] opacity-0 group-hover:[animation:v69Pop_0.5s_cubic-bezier(0.22,1,0.36,1)_both] group-[.is-inview]:[animation:v69Pop_0.5s_cubic-bezier(0.22,1,0.36,1)_both]"
                  style={{ animationDelay: `${0.28 + i * 0.26}s`, backgroundColor: INK_SOLID, color: "var(--color-white)" }}
                >
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
              )}
            </span>
            <span className={`text-[10px] ${done ? "text-neutral-800" : "text-neutral-400"}`}>{label}</span>
            {!done && <span className="ml-auto text-[9px] text-neutral-400">Pending</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// PDF to digital intake — a source PDF chip that flows into a guided web form;
// the fields type in and a signature line draws itself on hover.
function CardPdf() {
  return (
    <div className="flex h-full flex-col justify-center gap-2 bg-[var(--v69-card)] p-4">
      <div className="flex flex-col gap-2">
        {([["Full name", "Jane Rivera"], ["Company", "Northwind Co."]] as [string, string][]).map(([l, v], i) => (
          <div key={l} className="flex flex-col gap-1">
            <span className="text-[9px] text-neutral-400">{l}</span>
            <div className="flex h-[22px] items-center overflow-hidden rounded-[6px] bg-[var(--v69-well)] px-2 shadow-[inset_0_0_0_1px_rgba(16,24,40,0.05)]">
              <span className="inline-block min-w-0 max-w-0 overflow-hidden whitespace-nowrap text-[9px] text-neutral-800 group-hover:[animation:v68Type_1.5s_steps(24)_both] group-[.is-inview]:[animation:v68Type_1.5s_steps(24)_both]" style={{ animationDelay: `${0.3 + i * 1.9}s` }}>
                {v}
              </span>
              <span className="ml-px h-3 w-px shrink-0 bg-neutral-700 opacity-0 group-hover:[animation:v68Caret_1.5s_ease-out_both] group-[.is-inview]:[animation:v68Caret_1.5s_ease-out_both]" style={{ animationDelay: `${0.3 + i * 1.9}s` }} />
            </div>
          </div>
        ))}
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] text-neutral-400">Signature</span>
          <div className="flex h-6 items-center rounded-md bg-[var(--v69-well)] px-2 shadow-[inset_0_0_0_1px_rgba(16,24,40,0.05)]" />
        </div>
      </div>
    </div>
  );
}

// Client performance dashboard — a radial goal gauge: an ~80% arc sweeps in on
// hover with the value + target read centred inside the ring. Monotone.
function CardMetrics() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 bg-[var(--v69-card)] p-4">
      <div className="relative flex items-center justify-center">
        <svg viewBox="0 0 84 84" className="size-[128px] -rotate-90">
          <circle cx="42" cy="42" r="37" fill="none" strokeWidth="6" className="stroke-neutral-500/15" />
          <circle
            cx="42"
            cy="42"
            r="37"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray="100"
            style={{ strokeDashoffset: 20 }}
            className="text-neutral-500 group-hover:[animation:v69Ring_1s_ease-out_both] group-[.is-inview]:[animation:v69Ring_1s_ease-out_both]"
          />
        </svg>
        <div className="absolute flex flex-col items-center leading-none">
          <span className="text-[26px] font-medium tracking-tight text-neutral-900">2.4k</span>
          <span className="mt-1.5 text-[10px] tabular-nums text-neutral-400">/ 3,000</span>
        </div>
      </div>
      <span className="text-[10px] font-medium text-neutral-600">May target</span>
    </div>
  );
}

// Retainer usage overview — a hours-used-vs-remaining bar that fills on hover.
function CardRetainer() {
  return (
    <div className="flex h-full flex-col justify-center bg-[var(--v69-card)] p-4">
      <div className="flex flex-col gap-3 rounded-lg bg-[var(--v69-well)] px-3.5 py-3.5 shadow-[inset_0_0_0_1px_rgba(16,24,40,0.04)]">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[22px] font-medium leading-none tracking-tight text-neutral-900">33.5</span>
          <span className="text-[10px] text-neutral-400">/ 40 hrs used</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="h-2 overflow-hidden rounded-full bg-black/[0.06]">
            <div className="h-full w-[84%] origin-left rounded-full bg-neutral-500 group-hover:[animation:v69GrowX_1s_ease-out_both] group-[.is-inview]:[animation:v69GrowX_1s_ease-out_both]" />
          </div>
          <div className="flex justify-between text-[9px] text-neutral-400">
            <span>84% used</span>
            <span className="tabular-nums">6.5 hrs remaining</span>
          </div>
        </div>
        <div className="flex flex-col gap-1 border-t border-black/[0.06] pt-2 text-[9px]">
          {([["Design & build", "20.0h"], ["Client meetings", "13.5h"]] as [string, string][]).map(([l, v]) => (
            <div key={l} className="flex items-center justify-between">
              <span className="text-neutral-500">{l}</span>
              <span className="tabular-nums text-neutral-600">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Monthly client report — a branded, read-only report: a "Published" badge pops
// in, a sparkline draws, and the summary lines rise in on hover.
function CardReport() {
  const stats: [string, string][] = [
    ["Revenue", "$42.0k"],
    ["Hours", "33.5"],
  ];
  const line = "M2,44 C22,40 34,26 54,28 C74,30 84,12 104,16 C124,20 136,30 156,22 C176,15 188,9 198,7";
  return (
    <div className="flex h-full flex-col justify-center gap-2 bg-[var(--v69-card)] p-4">
      <div className="flex gap-1.5">
        {stats.map(([l, v]) => (
          <div key={l} className="flex-1 rounded-md bg-[var(--v69-well)] px-2 py-1 shadow-[inset_0_0_0_1px_rgba(16,24,40,0.04)]">
            <div className="text-[9px] text-neutral-400">{l}</div>
            <div className="text-[13px] font-medium leading-tight text-neutral-900">{v}</div>
          </div>
        ))}
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-neutral-400">Revenue trend</span>
          <span className="text-[9px] font-medium text-neutral-500">+12%</span>
        </div>
        <div className="relative min-h-0 flex-1">
          <svg viewBox="0 0 200 52" preserveAspectRatio="none" className="h-full w-full text-neutral-500">
            <defs>
              <linearGradient id="v69report" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={`${line} L200,52 L0,52 Z`} fill="url(#v69report)" />
            <path
              d={line}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              pathLength={1}
              style={{ strokeDasharray: 1 }}
              className="group-hover:[animation:v69Draw_1s_ease-out_both] group-[.is-inview]:[animation:v69Draw_1s_ease-out_both]"
            />
          </svg>
        </div>
        <div className="flex justify-between text-[9px] text-neutral-400">
          <span>Wk 1</span>
          <span>Wk 2</span>
          <span>Wk 3</span>
          <span>Wk 4</span>
        </div>
      </div>
    </div>
  );
}

// Tail card — matches the sibling poster structure (a 188px preview tile + a
// title/meta caption beneath) so it reads as one of the row rather than a
// heavier standalone box. The preview is a small stack of template thumbnails
// that fans out on hover.
function CardInfo() {
  // Fan offsets are kept small (≤24px shift, ≤7° rotate) relative to the
  // 146×116 thumbnails so the whole stack stays inside the 236×188 tile at rest
  // and on hover — nothing clips at the edges. Each thumbnail is a real card mock
  // rendered at its native 236×188 and scaled down (0.618) so it reads as a true
  // mini-screenshot rather than an overflowing, clipped fragment.
  const stack = [
    { slug: "content-approval-flow", z: "z-[1]", rest: "[transform:translate(-50%,-50%)_translateY(8px)_scale(0.9)]", hover: "group-hover:[transform:translate(-50%,-50%)_translateX(-24px)_translateY(-2px)_rotate(-7deg)]" },
    { slug: "client-project-tracker", z: "z-[2]", rest: "[transform:translate(-50%,-50%)_translateY(4px)_scale(0.95)]", hover: "group-hover:[transform:translate(-50%,-50%)_translateY(-8px)]" },
    { slug: "client-engagement-dashboard", z: "z-[3]", rest: "[transform:translate(-50%,-50%)]", hover: "group-hover:[transform:translate(-50%,-50%)_translateX(24px)_translateY(-2px)_rotate(7deg)]" },
  ];
  return (
    <a
      href={APP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="See all templates"
      className="group flex w-[236px] shrink-0 flex-col"
    >
      <div className="relative h-[188px] overflow-hidden rounded-xl border border-dashed border-black/15 bg-white/40 transition-transform duration-300 group-hover:-translate-y-1">
        {stack.map((t) => (
          <div
            key={t.slug}
            className={`absolute left-1/2 top-1/2 h-[116px] w-[146px] origin-center overflow-hidden rounded-md border border-black/[0.06] bg-white shadow-[0_6px_16px_-8px_rgba(16,24,40,0.35)] transition-transform duration-300 ease-out ${t.z} ${t.rest} ${t.hover}`}
          >
            <div className="h-[188px] w-[236px] origin-top-left scale-[0.6186]">
              <V69CardMock slug={t.slug} />
            </div>
          </div>
        ))}
      </div>
      <p className={`mt-3 inline-flex items-center gap-1.5 text-[#181d24] ${T.title}`}>
        See all templates
        <IconArrow className="size-4 text-neutral-900/50 transition-transform group-hover:translate-x-0.5" />
      </p>
      <p className={`mt-1 text-neutral-900/55 ${T.meta}`}>{TEMPLATES.length - CAROUSEL.length} more</p>
    </a>
  );
}

// Client project tracker — a GitHub-style contribution heatmap: a headline
// count over a weekday × week grid of neutral cells whose intensity encodes
// daily task activity, tapering to empty in the "future" weeks on the right.
const TRACKER_INK = "var(--v69-ink)";
const TRACKER_COLS = 15;
const TRACKER_ROWS = 7;
// Deterministic 0–3 intensity per cell (no Math.random, so it can't flicker
// between renders): a hash gives organic variation, the last few columns are
// forced empty to read as upcoming weeks, and the first column ramps in.
// Thresholds lean heavily on empty/light cells — a dense all-gray grid read
// as one gray slab rather than an activity pattern.
function trackerLevel(r: number, c: number): number {
  if (c >= TRACKER_COLS - 2) return 0;
  const h = (r * 5 + c * 11 + r * c * 7 + c * c * 3) % 13;
  let lvl = h < 6 ? 0 : h < 9 ? 1 : h < 11 ? 2 : 3;
  if (c === 0 && r < 2) lvl = 0; // ragged start, like a mid-week first day
  return lvl;
}
const TRACKER_ROW_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
function CardTracker() {
  const cellFill = (lvl: number) =>
    lvl === 0
      ? "var(--v69-well)"
      : lvl === 1
        ? `color-mix(in srgb, ${TRACKER_INK} 16%, var(--v69-well))`
        : lvl === 2
          ? INK_MID
          : INK_STRONG;
  return (
    <div className="flex h-full flex-col gap-2 bg-[var(--v69-card)] p-3.5">
      {/* One quiet label + one big number — matches the hierarchy of the
          sibling metric cards (label never competes with the value). */}
      <div>
        <div className="text-[9px] text-neutral-400">Tasks completed</div>
        <div className="mt-1 text-[27px] font-medium leading-none tracking-tight text-neutral-900">96</div>
      </div>
      {/* Fixed-height grid pinned above the month labels — flexing it made
          the cells stretch into tall pills on the square card. */}
      <div className="mt-auto flex h-[112px] gap-1">
        {/* Weekday labels. */}
        <div className="flex shrink-0 flex-col justify-between py-[1px] text-[5.5px] leading-none text-neutral-400">
          {TRACKER_ROW_LABELS.map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
        {/* Week columns. */}
        <div className="flex min-w-0 flex-1 gap-[2px]">
          {Array.from({ length: TRACKER_COLS }, (_, c) => (
            <div key={c} className="flex flex-1 flex-col gap-[2px]">
              {Array.from({ length: TRACKER_ROWS }, (_, r) => {
                const lvl = trackerLevel(r, c);
                // A sheen sweeps the whole grid left to right (slight row
                // offset makes it diagonal) — cells lighten and settle back
                // in place rather than popping in.
                return (
                  <div
                    key={r}
                    className="flex-1 rounded-[1.5px] group-hover:[animation:v69Shimmer_0.6s_ease-in-out_both] group-[.is-inview]:[animation:v69Shimmer_0.6s_ease-in-out_both]"
                    style={{
                      backgroundColor: cellFill(lvl),
                      animationDelay: `${c * 45 + r * 12}ms`,
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {/* Month labels — spread across the grid. */}
      <div className="flex pl-[14px] text-[6.5px] leading-none text-neutral-400">
        {["Jan", "Feb", "Mar", "Apr"].map((m) => (
          <span key={m} className="flex-1">{m}</span>
        ))}
      </div>
    </div>
  );
}

// Client support requests — a status summary: a request count, a segmented
// distribution bar, and a legend with per-status counts. An aggregate read,
// distinct from the plain status-pill list.
// Status reads by brightness (dark → light) off the shared fill ladder.
const SUPPORT_SEGMENTS: { label: string; count: number; color: string }[] = [
  { label: "Open", count: 5, color: INK_STRONG },
  { label: "In progress", count: 4, color: INK_MID },
  { label: "Resolved", count: 3, color: INK_FAINT },
];
function CardSupport() {
  const total = SUPPORT_SEGMENTS.reduce((n, s) => n + s.count, 0);
  // The bar fills left→right as ONE motion: each segment's duration is
  // proportional to its width and it starts the moment the previous segment
  // finishes — not three segments growing in parallel.
  const FILL_S = 0.9;
  let elapsed = 0;
  return (
    <div className="flex h-full flex-col gap-3 bg-[var(--v69-card)] p-4">
      {/* Headline + bar share one outlined block so the number reads WITH its
          chart instead of floating above it; statuses follow underneath. */}
      <div className="flex flex-col gap-3 rounded-xl p-3.5 ring-1 ring-[var(--v69-chip-border)]">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[24px] font-medium leading-none tracking-tight text-neutral-900">{total}</span>
          <span className="text-[10px] text-neutral-400">requests this week</span>
        </div>
        {/* Distribution bar. */}
        <div className="flex h-2 gap-0.5 overflow-hidden">
          {SUPPORT_SEGMENTS.map((s, i) => {
            const duration = (s.count / total) * FILL_S;
            const delay = elapsed;
            elapsed += duration;
            return (
              <div
                key={s.label}
                className={`h-full origin-left ${i === 0 ? "rounded-l-full" : ""} ${i === SUPPORT_SEGMENTS.length - 1 ? "rounded-r-full" : ""} group-hover:[animation:v69GrowX_0.7s_linear_both] group-[.is-inview]:[animation:v69GrowX_0.7s_linear_both]`}
                style={{ width: `${(s.count / total) * 100}%`, backgroundColor: s.color, animationDuration: `${duration}s`, animationDelay: `${delay}s` }}
              />
            );
          })}
        </div>
      </div>
      {/* Statuses spread through the space under the grouped chart so the
          square face carries no dead zone at the bottom. */}
      <div className="flex flex-1 flex-col justify-evenly px-1.5 py-1">
        {SUPPORT_SEGMENTS.map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-[10.5px]">
            <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-neutral-700">{s.label}</span>
            <span className="ml-auto tabular-nums text-neutral-400">{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function V69CardMock({ slug }: { slug: string }) {
  if (slug === "new-client-intake") return <CardIntake />;
  if (slug === "client-engagement-dashboard") return <CardDashboard />;
  if (slug === "data-visualization") return <CardDataViz />;
  if (slug === "time-tracker") return <CardTimeTracker />;
  if (slug === "goal-tracker") return <CardGoalTracker />;
  if (slug === "client-support-requests") return <CardSupport />;
  if (slug === "client-project-tracker") return <CardTracker />;
  if (slug === "content-approval-flow") return <CardApproval />;
  if (slug === "proposal-builder") return <CardProposal />;
  if (slug === "client-ai-assistant") return <CardChat />;
  if (slug === "onboarding-wizard") return <CardOnboarding />;
  if (slug === "document-collection") return <CardChecklist />;
  if (slug === "pdf-to-digital-intake") return <CardPdf />;
  if (slug === "client-performance-dashboard") return <CardMetrics />;
  if (slug === "retainer-usage-overview") return <CardRetainer />;
  if (slug === "monthly-client-report") return <CardReport />;
  return <TemplateMock slug={slug} />;
}

const FEATURED = getFeaturedTemplates(6);
const CAROUSEL: Template[] = [
  ...FEATURED,
  ...TEMPLATES.filter((t) => !FEATURED.some((f) => f.slug === t.slug)),
].slice(0, 12);

// V70 nav — a slightly squarish frosted pill that shortens into a compact
// centered pill on scroll, so it stops spanning awkwardly across the blue hero
// gradient once you move down the page.
function V71Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock background scroll while the full-screen menu is open.
  useEffect(() => {
    if (!menuOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [menuOpen]);

  return (
    <div className="fixed inset-x-0 top-0 z-50">
      {/* Full-width off-white announcement bar. */}
      <div className="flex h-9 w-full items-center justify-center gap-2 bg-[#f2f1e8] px-4 text-[13px] text-neutral-600">
        <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] font-normal text-white">New</span>
        <span className="truncate">Assembly Studio builds client-facing apps in minutes.</span>
      </div>
      <div className="flex justify-center px-4 pt-4">
        <nav
        className={`relative flex w-full items-center justify-between gap-6 rounded-[20px] border transition-all duration-300 ease-out backdrop-blur-xl ${
          scrolled
            ? "max-w-3xl border-black/[0.06] bg-[#f4f4ec]/78 py-1.5 pl-4 pr-1.5 shadow-[0_12px_34px_-14px_rgba(40,50,90,0.22)]"
            : "max-w-[1600px] border-black/[0.05] bg-[#f4f4ec]/62 py-2 pl-4 pr-2 shadow-[0_8px_24px_-16px_rgba(40,50,90,0.16)]"
        }`}
      >
        <Link href="/" aria-label="Assembly" className="flex shrink-0 items-center transition-opacity hover:opacity-80">
          <Image src="/images/logo-mark.svg" alt="Assembly" width={24} height={24} priority />
        </Link>

        {/* Links — absolutely centered in the bar, independent of side widths. */}
        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 md:flex">
          {NAV_LINKS.map((l) => (
            <a key={l} href={APP_URL} target="_blank" rel="noopener noreferrer" className={`whitespace-nowrap text-neutral-900/65 transition-colors hover:text-neutral-900 ${T.label}`}>
              {l}
            </a>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <a href={APP_URL} target="_blank" rel="noopener noreferrer" className={`hidden rounded-full px-3 py-2 text-neutral-900/70 transition-colors hover:text-neutral-900 sm:inline ${T.label}`}>
            Log in
          </a>
          <a
            href={APP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`rounded-full bg-neutral-900 px-4 py-1.5 font-normal text-white transition-[opacity,transform] hover:opacity-90 active:scale-[0.98] ${T.label}`}
          >
            Start trial
          </a>
          {/* Mobile menu button — v62's 3×3 grid-dots glyph. */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="flex size-9 items-center justify-center rounded-full text-neutral-900/70 transition-colors hover:bg-black/[0.05] hover:text-neutral-900 md:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
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
        </nav>
      </div>

      {/* Mobile full-screen menu — full-bleed frosted panel in the same tone as
          the nav, with the links, Log in, and a Start trial CTA. */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-[#f4f4ec]/95 backdrop-blur-2xl md:hidden">
          <div className="flex items-center justify-between px-5 pt-6">
            <Link href="/" aria-label="Assembly" onClick={() => setMenuOpen(false)} className="flex items-center">
              <Image src="/images/logo-mark.svg" alt="Assembly" width={24} height={24} />
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="flex size-9 items-center justify-center rounded-full text-neutral-900/70 transition-colors hover:bg-black/[0.05] hover:text-neutral-900"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
                <path d="M6 6l12 12M6 18L18 6" />
              </svg>
            </button>
          </div>

          <div className="flex flex-1 flex-col gap-1 px-5 pt-10">
            {NAV_LINKS.map((l) => (
              <a
                key={l}
                href={APP_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="rounded-2xl px-2 py-3 text-[28px] font-normal tracking-[-0.02em] text-neutral-900 transition-colors hover:bg-black/[0.03]"
              >
                {l}
              </a>
            ))}
            <a
              href={APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="rounded-2xl px-2 py-3 text-[28px] font-normal tracking-[-0.02em] text-neutral-900/60 transition-colors hover:bg-black/[0.03]"
            >
              Log in
            </a>
          </div>

          <div className="px-5 pb-8">
            <a
              href={APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="flex h-12 items-center justify-center rounded-2xl bg-neutral-900 text-[15px] font-normal text-white transition-opacity active:opacity-90"
            >
              Start trial
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export function HeroV71() {
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
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, []);
  const scrollRow = (dir: 1 | -1) => rowRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });

  return (
    <>
      <V71Nav />
      <section className="overflow-x-clip pb-24">
        <div className="relative px-6 pb-28 pt-40 md:px-10 md:pt-48">
          <div className="relative mx-auto max-w-[1600px]">
            {/* V71 — full-bleed brand-blue gradient with NO shape restriction:
                spans the full viewport width and runs from behind the nav down
                into the template row, fading out (unlike V70's rounded panel). */}
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-[-11rem] z-0 h-[900px] w-screen -translate-x-1/2 md:top-[-12rem]"
              style={{
                background:
                  "linear-gradient(180deg, #8ea2f4 0%, #a9bbf3 28%, #cfd9f6 54%, rgba(207,217,246,0) 90%)",
              }}
            />
            <h1 className={`relative z-10 mx-auto max-w-3xl text-center text-[#181d24] ${T.display}`}>
              The AI app builder
              {/* Mobile breaks after "builder" (so "for" starts line 2); desktop
                  keeps the break after "for". */}
              <br className="md:hidden" />{" "}
              for
              <br className="hidden md:block" />{" "}
              client-facing experiences
            </h1>

            {/* Composer — sits on the blue panel; its light surface reads against it. */}
            <div className="relative z-10 mx-auto mt-8 max-w-xl">
              <V66Composer glow={false} typewriter mutedControls submitLabel="Start Building" submitDark surfaceClassName="v69-composer bg-[var(--v69-box)] ring-1 ring-black/[0.10]" minHeightClass="min-h-[148px]" />
            </div>

            {/* Template row — poster-style cards. Extra top margin gives the
                composer room to breathe before the templates begin. */}
            <div className="relative z-10 mt-10">
              <div className="flex items-center justify-end">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => scrollRow(-1)}
                    disabled={!canLeft}
                    aria-label="Previous templates"
                    className="flex size-7 items-center justify-center rounded-full text-neutral-900/40 transition-colors hover:bg-black/[0.06] hover:text-neutral-900 disabled:pointer-events-none disabled:opacity-25"
                  >
                    <IconChevron className="size-4 rotate-180" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollRow(1)}
                    disabled={!canRight}
                    aria-label="More templates"
                    className="flex size-7 items-center justify-center rounded-full text-neutral-900/40 transition-colors hover:bg-black/[0.06] hover:text-neutral-900 disabled:pointer-events-none disabled:opacity-25"
                  >
                    <IconChevron className="size-4" />
                  </button>
                </div>
              </div>

              {/* Full-bleed: the row breaks out of the content column to span the
                  whole viewport, so cards peek off both edges instead of being
                  hard-cut mid-page. Inset padding keeps the first card aligned. */}
              <div className="relative left-1/2 mt-1 w-screen -translate-x-1/2">
              <div
                ref={rowRef}
                onScroll={updateArrows}
                className="flex gap-4 overflow-x-auto pb-2 pl-6 pr-6 pt-3 md:pl-10 md:pr-10 lg:pl-[max(2.5rem,calc((100vw-1600px)/2))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&:has(a:hover)>a:not(:hover)]:opacity-45"
              >
                {CAROUSEL.map((t) => (
                  <a
                    key={t.slug}
                    href={APP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex w-[236px] shrink-0 origin-center flex-col transition-[transform,opacity] duration-300 ease-out"
                  >
                    <div className="relative h-[188px] overflow-hidden rounded-xl border border-black/[0.06] bg-[var(--v69-card)] shadow-[0_6px_20px_-14px_rgba(40,50,90,0.16)] transition-[transform,border-color,box-shadow] duration-300 [will-change:transform] group-hover:-translate-y-1 group-hover:border-black/[0.12] group-hover:shadow-[0_14px_32px_-18px_rgba(40,50,90,0.26)]">
                      <div className="h-full w-full transition-transform duration-[600ms] ease-out [will-change:transform] group-hover:scale-[1.04]">
                        <V69CardMock slug={t.slug} />
                      </div>
                    </div>
                    <p className={`mt-3 line-clamp-2 text-[#181d24] ${T.title}`}>{t.title}</p>
                    <p className={`mt-1 text-neutral-900/55 ${T.meta}`}>{t.category}</p>
                  </a>
                ))}

                {/* Tail — info card: stacked previews that fan out on hover. */}
                <CardInfo />
              </div>
              </div>
            </div>
          </div>
        </div>

        {/* Logos carousel — on the white base below the gradient. */}
        <div className="mx-auto mt-20 max-w-7xl px-6 md:mt-24">
          <p className={`mb-8 text-center text-muted-foreground ${T.eyebrow}`} style={{ fontFamily: MONO }}>
            Trusted by teams at
          </p>
          <div className="mx-auto max-w-2xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
            <div className="flex w-max animate-marquee items-center gap-12">
              {["Capital One", "Collective", "Ditto", "Heritage Law", "Waymaker", "Aura", "CoverPanda", "Northwind"]
                .concat(["Capital One", "Collective", "Ditto", "Heritage Law", "Waymaker", "Aura", "CoverPanda", "Northwind"])
                .map((name, i) => (
                  <span key={i} className="shrink-0 text-base font-medium text-muted-foreground">
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
