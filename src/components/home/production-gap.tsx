"use client";

import { useEffect, useState } from "react";
import {
  IconCard,
  IconChecks,
  IconChevronDown,
  IconFolder,
  IconGrid,
  IconList,
  IconPen,
} from "@/components/home/mock-icons";

// ─────────────────────────────────────────────────────────────────────────
// THE PRODUCTION GAP — the wedge. One app window shows at a time, rendered
// like the "How it works" mocks (Inter product UI, melting into the page at
// the bottom); a macOS-style dock swaps it. The dock is mostly plain gray
// tiles so it reads as a real dock, with two prominent tiles that actually
// switch — one carrying the Assembly mark. Assembly leads by default.
// ─────────────────────────────────────────────────────────────────────────

const QUESTIONS = [
  "Who logs in?",
  "Which client sees what?",
  "How does it know your clients?",
  "Whose brand is on it?",
  "Where does this live for your clients?",
];

const ANSWERS = [
  "Login built in, magic links",
  "Permissions scoped per client",
  "Knows your contacts, day one",
  "Your brand, automatically",
  "Lives where clients already log in",
];

// Bottom melt — the window dissolves into the page toward its base, matching
// the How it works mocks.
const MELT = "linear-gradient(to bottom, #000 84%, transparent 100%)";


function IconQuestion() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.4-3 3.9" />
      <path d="M12 17.5h.01" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

// The bare generated app: flat window, outlined placeholder fields, no depth —
// a scaffold, not a product.
function ElsewhereWindow() {
  return (
    <div className="flex h-[400px] flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
        <span className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-foreground/10" />
          <span className="size-2.5 rounded-full bg-foreground/10" />
          <span className="size-2.5 rounded-full bg-foreground/10" />
        </span>
        <span className="flex-1 truncate rounded-md bg-muted px-3 py-1.5 font-mono text-[13px] text-muted-foreground">
          onboarding-app-x7f2.vercel.app
        </span>
      </div>
      <div className="p-7 md:p-9">
        <p className="text-[18px] font-medium text-foreground">Client onboarding</p>
        <div className="mt-6 flex flex-col gap-3.5">
          <div className="rounded-lg border border-border px-4 py-4 text-[15px] text-muted-foreground">Full name</div>
          <div className="rounded-lg border border-border px-4 py-4 text-[15px] text-muted-foreground">Your goals</div>
        </div>
        <div className="mt-6 inline-flex rounded-lg border border-border px-5 py-3 text-[15px] text-muted-foreground">Continue</div>
      </div>
    </div>
  );
}

// A sidebar row matching the How it works mocks — icon + label, active row
// filled — but scaled up to this larger window.
function NavRow({
  icon,
  label,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex h-9 items-center gap-2.5 rounded-lg px-2 text-[14px] ${
        active ? "bg-border/50 font-medium text-foreground" : "text-muted-foreground"
      }`}
    >
      <span className="[&>svg]:size-[16px] flex shrink-0 items-center justify-center">
        {icon}
      </span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </div>
  );
}

// The same app inside the firm's client experience, dressed like the How it
// works mocks: a workspace switcher, icon nav, and an Open Portal footer.
function OnAssemblyWindow() {
  return (
    <div className="flex h-[400px] overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex w-[34%] max-w-[230px] shrink-0 flex-col border-r border-border bg-muted/60 px-3 py-4">
        {/* Workspace switcher */}
        <div className="flex items-center gap-2 px-2 pb-4">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-foreground text-[11px] font-medium leading-none text-background">
            B
          </span>
          <span className="min-w-0 flex-1 truncate text-[14px] leading-none text-foreground">
            BrandMages
          </span>
          <IconChevronDown className="size-3 shrink-0 text-muted-foreground" />
        </div>

        <div className="flex flex-col gap-0.5">
          <NavRow icon={<IconList />} label="Onboarding" active />
          <NavRow icon={<IconChecks />} label="Approvals" />
          <NavRow icon={<IconFolder />} label="Files" />
          <NavRow icon={<IconCard />} label="Billing" />
        </div>
      </div>
      {/* Main content is a neutral placeholder for now — real app view swaps
          in here later. */}
      <div className="flex-1 p-7 md:p-9">
        <div className="h-5 w-40 rounded bg-muted" />
        <div className="mt-6 flex flex-col gap-3.5">
          <div className="h-12 rounded-lg bg-muted" />
          <div className="h-12 rounded-lg bg-muted" />
        </div>
        <div className="mt-6 h-10 w-28 rounded-lg bg-muted" />
      </div>
    </div>
  );
}

// ── Mobile phone screens ──────────────────────────────────────────────────
// The same two apps, rendered as portrait phone screens for the mobile
// breakpoint (where the desktop window + side-floating list can't fit).

// The bare generated app, seen in a mobile browser: a raw vercel URL and
// outlined placeholder fields — a scaffold, not a product.
function ElsewherePhone() {
  return (
    <div className="flex h-full flex-col bg-background pt-7">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
        <span className="flex-1 truncate rounded-md bg-muted px-2.5 py-1.5 text-center font-mono text-[11px] text-muted-foreground">
          onboarding-app-x7f2.vercel.app
        </span>
      </div>
      <div className="p-5">
        <p className="text-[15px] font-medium text-foreground">
          Client onboarding
        </p>
        <div className="mt-4 flex flex-col gap-3">
          <div className="rounded-lg border border-border px-3 py-3 text-[13px] text-muted-foreground">
            Full name
          </div>
          <div className="rounded-lg border border-border px-3 py-3 text-[13px] text-muted-foreground">
            Your goals
          </div>
        </div>
        <div className="mt-4 inline-flex rounded-lg border border-border px-4 py-2.5 text-[13px] text-muted-foreground">
          Continue
        </div>
      </div>
    </div>
  );
}

// The same app as a branded mobile portal: workspace header up top, a bottom
// tab bar carrying the nav — the app your clients actually use, on their phone.
function AssemblyPhone() {
  return (
    <div className="flex h-full flex-col bg-background pt-7">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-foreground text-[11px] font-medium leading-none text-background">
          B
        </span>
        <span className="min-w-0 flex-1 truncate text-[13px] leading-none text-foreground">
          BrandMages
        </span>
        <IconChevronDown className="size-3 shrink-0 text-muted-foreground" />
      </div>
      <div className="flex-1 p-4">
        <div className="h-4 w-28 rounded bg-muted" />
        <div className="mt-4 flex flex-col gap-3">
          <div className="h-11 rounded-lg bg-muted" />
          <div className="h-11 rounded-lg bg-muted" />
          <div className="h-11 rounded-lg bg-muted" />
        </div>
      </div>
      <div className="mt-auto flex items-center justify-around border-t border-border px-2 py-3 [&>svg]:size-[18px] [&_span]:flex [&_span]:size-[18px] [&_span]:items-center [&_span]:justify-center">
        <span className="text-foreground">
          <IconList />
        </span>
        <span className="text-muted-foreground">
          <IconChecks />
        </span>
        <span className="text-muted-foreground">
          <IconFolder />
        </span>
        <span className="text-muted-foreground">
          <IconCard />
        </span>
      </div>
    </div>
  );
}

// Shorter copy for the mobile sheet, so each row fits on one line.
const QUESTIONS_SHORT = [
  "Who logs in?",
  "Which client sees what?",
  "How does it know clients?",
  "Whose brand is on it?",
  "Where does it live?",
];

const ANSWERS_SHORT = [
  "Login built in",
  "Permissions per client",
  "Knows your contacts",
  "Your brand, automatically",
  "Lives where clients log in",
];

const CARDS = [
  {
    key: "elsewhere",
    label: "Elsewhere — an app that exists",
    labelShort: "Elsewhere",
    Window: ElsewhereWindow,
    Phone: ElsewherePhone,
    items: QUESTIONS,
    itemsShort: QUESTIONS_SHORT,
    Icon: IconQuestion,
    // Theme-aware: the detail surface follows the page theme (light window in
    // light mode, dark in dark). Questions read dimmer than answers.
    iconClassName: "text-muted-foreground/70",
    listClassName: "text-muted-foreground",
  },
  {
    key: "assembly",
    label: "On Assembly — an app your clients use",
    labelShort: "On Assembly",
    Window: OnAssemblyWindow,
    Phone: AssemblyPhone,
    items: ANSWERS,
    itemsShort: ANSWERS_SHORT,
    Icon: IconCheck,
    iconClassName: "text-foreground",
    listClassName: "text-foreground",
  },
];

export function ProductionGap() {
  // Assembly leads by default.
  const [active, setActive] = useState(1);
  const current = CARDS[active];

  // The note's timestamp, à la Apple Notes. Computed on the client after mount
  // so it stays current without a server/client hydration mismatch.
  const [noteDate, setNoteDate] = useState("");
  useEffect(() => {
    const now = new Date();
    const day = now.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const time = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    setNoteDate(`${day} at ${time}`);
  }, []);

  return (
    <section id="production-gap" className="py-20 md:py-28">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10">
        <h2 className="type-h2 mx-auto max-w-xl text-center text-foreground">
          Generation is the easy part
        </h2>
        <p className="type-lead mx-auto mt-5 max-w-lg text-center text-muted-foreground">
          The hard part comes after: deployment, authentication, permissions,
          notifications, branding. Assembly Studio handles all of it inside your
          unified client experience.
        </p>

        <div className="mx-auto mt-12 flex max-w-[1200px] flex-col md:mt-16">
          {/* Window stage (desktop) — one app at a time, melting into the page
              at its base. Active app is in normal flow (the box hugs it); the
              other is an absolute cross-fade overlay. Mobile uses the phone
              stage below instead. */}
          <div className="relative hidden md:block">
            {CARDS.map((card, i) => {
              const { Window } = card;
              const isActive = active === i;
              return (
                <div
                  key={card.key}
                  aria-hidden={!isActive}
                  className={`[font-family:var(--font-inter),system-ui,sans-serif] transition-opacity duration-500 ease-out ${
                    isActive
                      ? "relative opacity-100"
                      : "pointer-events-none absolute inset-x-0 top-0 opacity-0"
                  }`}
                  style={{ maskImage: MELT, WebkitMaskImage: MELT }}
                >
                  <Window />
                </div>
              );
            })}

            {/* Detail list as a pop-up window floating over the visual — its
                own elevated surface with a hairline outline, title bar, and
                soft shadow, à la a macOS window. */}
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden items-center pr-8 md:flex lg:pr-12">
              {/* Fixed height so the window is the same size on either toggle
                  state (Elsewhere / On Assembly), independent of how the lines
                  wrap. The surface follows the theme (bg-card). */}
              <div className="flex h-[300px] w-[320px] flex-col overflow-hidden rounded-2xl border border-black/[0.07] bg-card/90 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_28px_-10px_rgba(16,24,40,0.14),0_40px_72px_-28px_rgba(16,24,40,0.30)] backdrop-blur-xl dark:border-white/[0.08]">
                {/* Notes-style toolbar — macOS traffic lights on the left, a
                    faint cluster of Notes editing glyphs on the right. */}
                <div className="flex items-center border-b border-border/60 px-4 py-2.5">
                  <span className="flex gap-[7px]">
                    <span className="size-3 rounded-full bg-foreground/[0.13]" />
                    <span className="size-3 rounded-full bg-foreground/[0.13]" />
                    <span className="size-3 rounded-full bg-foreground/[0.13]" />
                  </span>
                  <span className="ml-auto flex items-center gap-3 text-muted-foreground/40">
                    <IconPen className="size-4" />
                    <span className="text-[13px] font-medium leading-none">Aa</span>
                    <IconChecks className="size-4" />
                    <IconGrid className="size-4" />
                  </span>
                </div>
                {/* Note body — centered timestamp, a bold first-line title with
                    the signature yellow Notes caret, then the checklist. */}
                <div className="flex flex-1 flex-col px-6 py-4">
                  <p className="type-caption min-h-[1.2em] text-center text-muted-foreground/70">
                    {noteDate}
                  </p>
                  <p className="mt-3 flex items-center text-[15px] font-medium text-foreground">
                    {current.labelShort}
                    <span
                      aria-hidden
                      className="ml-px inline-block h-[18px] w-[2px] animate-pulse rounded-full bg-[#e8b923]"
                    />
                  </p>
                  {/* Terser copy (the mobile set) so every line stays on one
                      row and the checklist never overflows the window. */}
                  <ul className={`mt-3 flex flex-col gap-2.5 ${current.listClassName}`}>
                    {current.itemsShort.map((item) => {
                      const { Icon } = current;
                      return (
                        <li key={item} className="type-body flex items-center gap-2.5">
                          <span className={`shrink-0 ${current.iconClassName}`}>
                            <Icon />
                          </span>
                          {item}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile — the app shown as a complete phone with the detail list
              docked inside it as an iOS-style bottom sheet (the desktop
              side-by-side window + floating card can't fit on a narrow screen).
              No device melt here: the sheet is the bottom of the screen, so a
              melt would only dissolve the list. */}
          <div className="mt-10 md:hidden">
            <div className="relative mx-auto w-full max-w-[320px]">
              {/* Phone frame */}
              <div className="relative overflow-hidden rounded-[46px] border border-white/12 bg-[#0d0d0d] p-2.5 shadow-[0_28px_80px_-24px_rgba(0,0,0,0.85)]">
                <div className="relative h-[520px] overflow-hidden rounded-[36px] bg-background [font-family:var(--font-inter),system-ui,sans-serif]">
                  {/* Dynamic-island status pill, matching the How it works phone. */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex h-7 items-center justify-center">
                    <span className="h-[16px] w-[54px] rounded-full bg-white/10" />
                  </div>
                  {CARDS.map((card, i) => {
                    const { Phone } = card;
                    const isActive = active === i;
                    return (
                      <div
                        key={card.key}
                        aria-hidden={!isActive}
                        className={`absolute inset-0 transition-opacity duration-500 ease-out ${
                          isActive ? "opacity-100" : "pointer-events-none opacity-0"
                        }`}
                      >
                        <Phone />
                      </div>
                    );
                  })}

                  {/* Detail list — an iOS-style bottom sheet docked to the base
                      of the screen: grabber, rounded top, and a theme-aware
                      surface (light in light mode, dark in dark) separated from
                      the app by a top border + shadow. Clipped by the screen's
                      rounded corners. */}
                  <div className="absolute inset-x-0 bottom-0 z-10">
                    <div className="rounded-t-[26px] border-t border-border bg-card px-5 pb-6 pt-2.5 shadow-[0_-16px_44px_-12px_rgba(16,24,40,0.16)]">
                      <div className="mx-auto mb-3 h-[5px] w-9 rounded-full bg-foreground/20" />
                      <p className="type-caption mb-3 text-muted-foreground">
                        {current.labelShort}
                      </p>
                      <ul className={`flex flex-col gap-2.5 ${current.listClassName}`}>
                        {current.itemsShort.map((item) => {
                          const { Icon } = current;
                          return (
                            <li
                              key={item}
                              className="flex items-start gap-2.5 text-[13px] leading-snug"
                            >
                              <span className={`mt-0.5 shrink-0 ${current.iconClassName}`}>
                                <Icon />
                              </span>
                              {item}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Segmented control — a clear, labeled two-way switch (matches the
              pricing billing toggle) with a sliding indicator. Sits directly
              under the intro copy (order-first), above the visual, on all
              breakpoints. */}
          <div className="order-first flex justify-center md:mb-10">
            <div
              role="tablist"
              aria-label="Compare the two apps"
              className="relative grid grid-cols-2 rounded-lg border border-border bg-muted/40 p-1 text-sm"
            >
              {/* Sliding thumb. */}
              <span
                aria-hidden
                className={`absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-md bg-foreground transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  active === 1 ? "translate-x-full" : ""
                }`}
              />
              {CARDS.map((card, i) => (
                <button
                  key={card.key}
                  type="button"
                  role="tab"
                  aria-selected={active === i}
                  onClick={() => setActive(i)}
                  className={`relative whitespace-nowrap px-5 py-1.5 transition-colors duration-300 ${
                    active === i
                      ? "text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {card.labelShort}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
