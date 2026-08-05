"use client";

// ─────────────────────────────────────────────────────────────────────────
// STEP VISUALS — the "Idea to app, in four steps" mockups. Each step is the
// real product screen for that moment (Describe / Plan / Build / Iterate),
// zoomed in on a #7DA4FF panel, chrome and sidebar stripped away. The white
// screen floats centered on the panel with equal margin, and each plays its
// short looping animation. Decorative only, hidden from assistive tech. The
// floating screen is tokenised (--mk-*, via the shared .mock-ui class) so it
// re-themes to a dark surface in dark mode; the blue panel stays fixed.
//
// TYPE SCALE — these are mockups of a product UI, so they carry their own
// scale rather than the site's. Four steps, and nothing between them:
//
//   15 regular  a displayed number — a score, a total, a count
//   14 medium   the screen's greeting (one per screen)
//   12 regular  screen chrome: top-bar titles, section heads
//   11 regular  body: conversation, prompts, list titles, table rows, chips
//   10 regular  micro: meta lines, captions, status pills, table headers, the
//               composer's own controls, which sit under the text they frame
//
// The four steps share this ladder — they are cross-faded by the same tour, so
// a size that only one screen uses shows up as the type resizing mid-tour.
//
// Prose at 12 and 11 sets `leading-[1.5]`; anything on a single line sets
// `leading-none`. The phone screen runs one step up on its chrome — 14 for the
// title bar (regular) and the greeting (medium) — because its column is far
// narrower than the desktop card's, so the same size would read smaller there.
// ─────────────────────────────────────────────────────────────────────────

import { useId } from "react";
import {
  IconBrandMark,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconFilter,
  IconPlus,
} from "@/components/home/mock-icons";
import { TYPEWRITER_PREFIX } from "@/components/home/hero-v66";
import { CardDashboard } from "@/components/home/hero-v71";

const BLUE = "#7DA4FF";
const HAIRLINE = "var(--mk-hairline)";
// The visible border weight, for chrome that has to read as an edge rather than
// a whisper — hairline is a shade off the surface it sits on.
const MOCK_BORDER = "var(--mk-border)";

type Status = "Approved" | "Pending" | "Logged";
// Theme-aware status tokens (shared with the "Generation is the easy part" mock),
// so the pills re-theme for dark mode automatically.
const STATUS_STYLE: Record<Status, { bg: string; fg: string }> = {
  Approved: { bg: "var(--mock-positive-bg)", fg: "var(--mock-positive-fg)" },
  Pending: { bg: "var(--mock-warning-bg)", fg: "var(--mock-warning-fg)" },
  Logged: { bg: "var(--mk-fill)", fg: "var(--mk-muted)" },
};

function StatusPill({ status }: { status: Status }) {
  const s = STATUS_STYLE[status];
  return (
    <span
      className="inline-block rounded-full px-1.5 py-[3px] text-[10px] leading-none"
      style={{ backgroundColor: s.bg, color: s.fg }}
    >
      {status}
    </span>
  );
}

// The shared blue panel. The screen floats centered with equal blue margin all
// around (no bleed), all corners rounded, no shadow. The 16/9 window aspect is a
// desktop affordance only — on mobile the panel grows to fit its card so the
// content never clips inside a too-short landscape frame.
function BluePanel({ children }: { children: React.ReactNode }) {
  // h-full (not a fixed aspect): the how-it-works grid stacks all four steps in
  // one cell, so the cell sizes to the tallest step's content. Every panel then
  // fills that height and centers its content — consistent height across steps,
  // no empty gap under the shorter ones, no clipping, at every width.
  return (
    <div
      aria-hidden
      className="pointer-events-none h-full w-full select-none p-2 sm:p-2.5"
    >
      <div
        // Top-anchored on phones, where the child is a screen that runs off the
        // bottom edge — centring it split the overflow and pushed it down. From
        // sm up the child is a floating card again and wants to be centred.
        className="flex h-full w-full flex-col justify-start overflow-hidden rounded-xl p-5 sm:justify-center sm:p-7 lg:p-9 [font-family:var(--font-inter),system-ui,sans-serif]"
        style={{ backgroundColor: BLUE }}
      >
        {children}
      </div>
    </div>
  );
}

// White screen — contained width, centered, all corners rounded, no shadow.
function ScreenCard({
  children,
  maxW = 600,
  fill = false,
}: {
  children: React.ReactNode;
  maxW?: number;
  fill?: boolean;
}) {
  return (
    <div
      // max-h-full at every width (not just lg): the phone panel is height-capped
      // now, and without it the card outgrows the panel instead of cropping its
      // own content at the bottom like a window onto a taller screen.
      // Fills from sm — every width where the card is the visual. Left to size
      // to its own content, each step got a different height and the four read
      // as four different components; the grid row is sized by the tallest, so
      // stretching to it makes them uniform. It also gives Plan's
      // bottom-anchored questions card the free space it pushes against.
      className={`mock-ui relative mx-auto flex max-h-full w-full flex-col overflow-hidden rounded-[12px] bg-[var(--mk-surface)] ${
        fill ? "sm:h-full" : ""
      }`}
      style={{ maxWidth: maxW }}
    >
      {children}
    </div>
  );
}

function DarkButton({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-[22px] items-center gap-1 rounded-[4px] bg-[var(--mk-invert-bg)] px-2.5 text-[11px] leading-none text-[var(--mk-invert-fg)]">
      {children}
    </span>
  );
}

// The Iterate composer — the next request sitting ready in the field, caret
// after it. Shared by the phone and desktop screens so the two can't drift;
// `phone` is the narrower column's one-step-up scale.
function ChatComposer({
  text,
  phone = false,
}: {
  text: string;
  phone?: boolean;
}) {
  return (
    <div className="shrink-0 rounded-[8px] border border-[var(--mk-border)] p-2.5">
      <p
        className={`min-h-[15px] leading-[1.5] text-[var(--mk-fg-2)] ${
          phone ? "text-[12px]" : "text-[11px]"
        }`}
      >
        {text}
        <span className="ml-px inline-block h-[1em] w-[1.5px] animate-caret bg-[var(--mk-fg-2)] align-[-0.15em]" />
      </p>
      <div className="mt-2 flex items-center justify-between text-[var(--mk-muted)]">
        <IconPlus className={phone ? "size-[14px]" : "size-[13px]"} />
        <span
          className={`flex items-center justify-center rounded-[4px] bg-[var(--mk-invert-bg)] text-[var(--mk-invert-fg)] ${
            phone ? "size-[22px]" : "size-[20px]"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className={phone ? "size-[12px]" : "size-[11px]"}
          >
            <path d="M12 19V5M6 11l6-6 6 6" />
          </svg>
        </span>
      </div>
    </div>
  );
}

// The Assembly mark from public/images/logo-mark.svg, inlined so it can be
// filled and lit per theme. Debossed rather than tinted: the shape is a shade
// darker than the screen with a light lip beneath it, so it reads as pressed
// into the surface instead of printed on it.
// ── 1. DESCRIBE — the Add App blank slate, prompt typing itself in. ──────────
// The one prompt the how-it-works flow narrates end to end: it types in the
// Describe step and is the request the Plan step then plans. Shared so the two
// steps can never drift, and kept short enough to finish typing within the tab
// dwell (see how-it-works DWELL_MS).
const FLOW_PROMPT =
  "a time tracking app to log hours across clients and projects";

// The phone Add App screen. Not a narrower copy of the desktop card: just the
// greeting centred in the open space and the composer pinned to the bottom, the
// shape every assistant app uses at this width. The desktop's three-card rail
// was the wrong furniture here — chart tiles crowded a ~270px column, and the
// step's point is the prompt, which the empty screen puts all the weight on.
function DescribeComposer() {
  return (
    // Greeting and composer as one centred group, sitting above the middle
    // rather than pinned to the bottom: the pair is the whole screen at this
    // width, and against the bottom edge it read as a keyboard bar under an
    // empty page. The extra bottom padding is what lifts it off centre.
    <div className="relative isolate flex min-h-0 flex-1 flex-col justify-center gap-3 pb-12">
      {/* Aurora — phone only, since this composer is the phone screen's whole
          content. The blank slate under the field was a lot of empty white at
          this width; three soft blooms in the site's own gradient hues (the
          lime, periwinkle and blue the glow frame rotates through) give the
          bottom of the screen something to be without putting an object there.
          Behind the content via -z-10, so the greeting and the field stay
          crisp on top of it. */}
      <div
        aria-hidden
        // Dark mode gets its own treatment, and ONLY dark: light keeps
        // opacity-95 / blur-2xl / saturate-150 untouched. Over near-black those
        // three fight each other — pushing saturation on a pale lime turns it to
        // olive, and at 95% the blooms sit ON the surface like paint instead of
        // reading as light coming off it. So dark drops the saturation boost,
        // softens the falloff, pulls the opacity back, and blends with screen so
        // the hues ADD to the dark ground the way a glow does.
        // Taller than the glow needs to be, and masked to nothing across its
        // top third. The blooms used to run out inside a 176px box, so the blur
        // had a hard ceiling to stop against and the whole thing read as a
        // tinted rectangle with soft corners rather than as light. Giving it
        // height it never fills and dissolving the top means there is no edge
        // to find. Saturation is off the boost too: at 150% the lime turned
        // olive where it met the periwinkle, which is what made the middle of
        // the wash look muddy rather than clean.
        // Bled out of the column it lives in, by exactly the padding that
        // column carries: px-4 and pb-2.5. Sitting inside that padding the wash
        // stopped 16px short of each side and 10px short of the bottom, so it
        // read as a rectangle of colour floating on the screen rather than as
        // light in it. Out here the phone shell's own overflow clip is what
        // ends it, which leaves no edge of its own to see. The blooms are
        // anchored to this element's bottom, so it has to land ON the screen
        // edge, not past it — over-bleed and their brightest part falls
        // outside the frame.
        // Hues come through custom properties so dark can swap them without
        // touching light. Dark drops the lime: a pale yellow-green screened
        // over near-black turns olive, and that khaki smear against the blue
        // was what made the glow look cheap rather than lit. The dark wash
        // stays in the cool family — the periwinkle flanking the panel blue —
        // and runs quieter, because light coming off a dark surface reads at a
        // fraction of the strength the same wash needs on white.
        className="pointer-events-none absolute -inset-x-4 -bottom-2.5 -z-10 h-64 opacity-100 blur-2xl saturate-[1.35] [--aurora-1:#d9ed92] [--aurora-2:#9fb0e8] [--aurora-3:#7da4ff] [mask-image:linear-gradient(to_bottom,transparent_0%,#000_34%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,#000_34%)] [[data-theme=dark]_&]:opacity-45 [[data-theme=dark]_&]:blur-3xl [[data-theme=dark]_&]:saturate-100 [[data-theme=dark]_&]:mix-blend-screen [[data-theme=dark]_&]:[--aurora-1:#9fb0e8] [[data-theme=dark]_&]:[--aurora-2:#7da4ff] [[data-theme=dark]_&]:[--aurora-3:#9fb0e8]"
        style={{
          background: [
            // Held further out (82% rather than 70%) and blurred less, so each
            // hue keeps its own body instead of everything averaging to a pale
            // wash in the middle. The mask is what softens the top now, which
            // is why the blur no longer has to.
            "radial-gradient(64% 92% at 14% 100%, var(--aurora-1) 0%, transparent 82%)",
            "radial-gradient(58% 86% at 52% 100%, var(--aurora-2) 0%, transparent 82%)",
            "radial-gradient(64% 92% at 90% 100%, var(--aurora-3) 0%, transparent 82%)",
          ].join(", "),
        }}
      />

      {/* A step above the mock's body sizes and in the foreground ink, so it
          reads as the screen's greeting rather than a caption on the field. */}
      <p className="text-center text-[16px] leading-none text-[var(--mk-fg)]">
        Let&apos;s build, Margot
      </p>

      {/* Prompt box — the request types and re-types itself, ringed by the
          animated gradient border (same as the hero composer). Uses the
          solid-loop ring: the default sweep has a transparent arc, which at
          this small size reads as the ring breaking apart mid-rotation.
          Glass rather than solid: the aurora sits directly behind this, and a
          flat white panel read as a card pasted over the glow. A translucent
          fill over a blurred backdrop lets the colour register at the field's
          lower edge while the blur keeps the request crisp — an unfilled field
          was the version that let the glow run straight through the text. */}
      {/* 94, not 104: the field is justify-between, so the extra height landed
          as a 20px hole between the request and the controls under it. This
          leaves a 10px gap — the box now sizes to what it holds. */}
      <div className="v63-gradient-border v63-ring-solid relative flex min-h-[94px] flex-col justify-between rounded-[12px] bg-[var(--mk-surface)]/72 p-3 backdrop-blur-xl backdrop-saturate-150 [[data-theme=dark]_&]:bg-[var(--mk-elevated)]/72">
        <p className="text-[12px] leading-[1.5] text-[var(--mk-fg-2)]">
          {TYPEWRITER_PREFIX}
          {FLOW_PROMPT}
          <span className="ml-px inline-block h-[1em] w-[1.5px] animate-caret bg-[var(--mk-fg-2)] align-[-0.15em]" />
        </p>
        {/* Add and submit only. The desktop composer's "Ideas" affordance and
            model name are the first things to go at this width — the Iterate
            phone composer already carries just these two, and in a ~300px
            column the labels crowded the field they belong to. */}
        <div className="flex items-center justify-between text-[var(--mk-muted)]">
          <IconPlus className="size-[16px]" />
          <span className="flex size-[24px] items-center justify-center rounded-[4px] bg-[var(--mk-invert-bg)] text-[var(--mk-invert-fg)]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              className="size-[13px]"
            >
              <path d="M12 19V5M6 11l6-6 6 6" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}

// The handset's own status bar, above the app's chrome — the clock and the
// signal/wi-fi/battery cluster are what make a rounded white rectangle read as
// a phone rather than a narrow browser window. Traced from the supplied assets
// (54×20 and 78×13) and re-pointed at currentColor, so they take the mock's
// foreground instead of staying white on a light screen.
function PhoneStatusBar() {
  return (
    <div
      aria-hidden
      className="flex h-[26px] shrink-0 items-center justify-between px-4 pt-1 text-[var(--mk-fg)]"
    >
      <svg width="35" height="13" viewBox="0 0 54 20" fill="none">
        <path
          d="M14.8786 4.72314C12.2805 4.72314 10.4294 6.49951 10.4294 8.93164V8.94824C10.4294 11.2227 12.0397 12.8994 14.3391 12.8994C15.9826 12.8994 17.0285 12.061 17.4684 11.1147H17.6345C17.6345 11.2061 17.6262 11.2974 17.6262 11.3887C17.5349 13.6797 16.7297 15.5391 14.8288 15.5391C13.7746 15.5391 13.0358 14.9912 12.7204 14.1528L12.6955 14.0698H10.5871L10.6037 14.1611C10.9855 15.9956 12.6291 17.2988 14.8288 17.2988C17.842 17.2988 19.6599 14.9082 19.6599 10.874V10.8574C19.6599 6.54102 17.4352 4.72314 14.8786 4.72314ZM14.8703 11.2559C13.509 11.2559 12.5212 10.2598 12.5212 8.87354V8.85693C12.5212 7.52051 13.5754 6.46631 14.8952 6.46631C16.2233 6.46631 17.2609 7.53711 17.2609 8.90674V8.92334C17.2609 10.2764 16.2233 11.2559 14.8703 11.2559ZM23.0204 9.23877C23.7841 9.23877 24.3402 8.65771 24.3402 7.92725C24.3402 7.18848 23.7841 6.61572 23.0204 6.61572C22.265 6.61572 21.7006 7.18848 21.7006 7.92725C21.7006 8.65771 22.265 9.23877 23.0204 9.23877ZM23.0204 15.3979C23.7841 15.3979 24.3402 14.8252 24.3402 14.0864C24.3402 13.3477 23.7841 12.7749 23.0204 12.7749C22.265 12.7749 21.7006 13.3477 21.7006 14.0864C21.7006 14.8252 22.265 15.3979 23.0204 15.3979ZM32.1915 17H34.2418V14.7007H35.8522V12.9326H34.2418V5.02197H31.212C29.5851 7.49561 27.8834 10.2515 26.3312 12.9492V14.7007H32.1915V17ZM28.3233 12.9824V12.8579C29.4855 10.8242 30.8717 8.60791 32.1002 6.73193H32.2247V12.9824H28.3233ZM40.408 17H42.5496V5.02197H40.4163L37.2869 7.22168V9.23877L40.2669 7.13037H40.408V17Z"
          fill="currentColor"
        />
      </svg>
      <svg width="54" height="9" viewBox="0 0 78 13" fill="none">
        <path
          opacity="0.35"
          d="M54 0.5H71C72.933 0.5 74.5 2.067 74.5 4V9C74.5 10.933 72.933 12.5 71 12.5H54C52.067 12.5 50.5 10.933 50.5 9V4C50.5 2.067 52.067 0.5 54 0.5Z"
          stroke="currentColor"
        />
        <path
          opacity="0.4"
          d="M76 5V9.22034C76.8491 8.86291 77.4012 8.0314 77.4012 7.11017C77.4012 6.18894 76.8491 5.35744 76 5Z"
          fill="currentColor"
        />
        <path
          d="M52 4C52 2.89543 52.8954 2 54 2H71C72.1046 2 73 2.89543 73 4V9C73 10.1046 72.1046 11 71 11H54C52.8954 11 52 10.1046 52 9V4Z"
          fill="currentColor"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M34.5005 3.58753C36.967 3.58764 39.3393 4.55505 41.1269 6.28982C41.2615 6.42375 41.4766 6.42206 41.6092 6.28603L42.896 4.96045C42.9631 4.89146 43.0006 4.798 43 4.70076C42.9994 4.60353 42.9609 4.51052 42.893 4.44234C38.2011 -0.147446 30.7991 -0.147446 26.1072 4.44234C26.0392 4.51047 26.0006 4.60345 26 4.70069C25.9994 4.79792 26.0367 4.89141 26.1038 4.96045L27.391 6.28603C27.5235 6.42226 27.7388 6.42396 27.8733 6.28982C29.6612 4.55494 32.0337 3.58752 34.5005 3.58753ZM34.5359 7.58938C35.8911 7.58929 37.198 8.10346 38.2025 9.03199C38.3384 9.16376 38.5524 9.16091 38.6849 9.02555L39.9702 7.69997C40.0379 7.63044 40.0754 7.53611 40.0744 7.4381C40.0735 7.34008 40.034 7.24656 39.965 7.17844C36.9059 4.27385 32.1685 4.27385 29.1094 7.17844C29.0403 7.24656 29.0009 7.34013 29 7.43817C28.9991 7.53622 29.0368 7.63054 29.1046 7.69997L30.3895 9.02555C30.522 9.16091 30.736 9.16376 30.8719 9.03199C31.8758 8.10408 33.1816 7.58995 34.5359 7.58938ZM37.1496 10.1767C37.1515 10.275 37.1137 10.3698 37.0449 10.4386L34.8217 12.7289C34.7565 12.7962 34.6676 12.834 34.5749 12.834C34.4822 12.834 34.3933 12.7962 34.3282 12.7289L32.1045 10.4386C32.0358 10.3697 31.998 10.2749 32.0001 10.1766C32.0021 10.0783 32.0438 9.98527 32.1153 9.91938C33.5351 8.69354 35.6147 8.69354 37.0345 9.91938C37.106 9.98532 37.1476 10.0784 37.1496 10.1767Z"
          fill="currentColor"
        />
        <path
          d="M10 4C10 3.44772 10.4477 3 11 3H12C12.5523 3 13 3.44772 13 4V12C13 12.5523 12.5523 13 12 13H11C10.4477 13 10 12.5523 10 12V4Z"
          fill="currentColor"
        />
        <path
          d="M15 2C15 1.44772 15.4477 1 16 1H17C17.5523 1 18 1.44772 18 2V12C18 12.5523 17.5523 13 17 13H16C15.4477 13 15 12.5523 15 12V2Z"
          fill="currentColor"
        />
        <path
          d="M5 7.5C5 6.94772 5.44772 6.5 6 6.5H7C7.55228 6.5 8 6.94772 8 7.5V12C8 12.5523 7.55228 13 7 13H6C5.44772 13 5 12.5523 5 12V7.5Z"
          fill="currentColor"
        />
        <path
          d="M0 10C0 9.44772 0.447715 9 1 9H2C2.55228 9 3 9.44772 3 10V12C3 12.5523 2.55228 13 2 13H1C0.447715 13 0 12.5523 0 12V10Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}

// The screen runs to the bottom of the panel and is cut off by it, rather than
// stopping at a rounded edge — it reads as a screen that continues past the
// frame instead of a card floating on it. An inset shadow along that cut does
// the telling: a fade to the blue said "this is dissolving", a shadow says
// "this passes under something and there is more below it".
const PHONE_CUT_SHADOW = "inset 0 -22px 18px -14px rgba(16,24,40,0.16)";
// What a step holds back from the cut. Steps whose content is meant to run off
// the bottom (the entry list, the conversation, the Recommended rail) hold back
// nothing.
const ITERATE_INSET = 10;
// Plan runs its questions card into the cut so its last row washes out under
// the shadow — held clear of it, the card floated with dead space beneath and
// the screen stopped looking like it continued past the frame.
const PLAN_INSET = 0;

// Phone-width screen: the app as it looks on a phone, title bar and all. A
// desktop card shrunk into a phone column reads as a screenshot of something
// else; wrapped in its own chrome it reads as the product. Below sm only —
// from sm up the panel is wide enough for the card to sit as designed.
function PhoneScreen({
  children,
  title,
  gapClass = "gap-4",
  // Sparse content centres in the screen body; content that fills the screen
  // stays top-anchored and runs off the bottom.
  center = false,
  // Sparse steps hold their content clear of the dissolve. Steps that already
  // fill the screen leave this at 0 and run into it, the way a real screen
  // continues past the bottom of the frame.
  contentInset = 0,
}: {
  children: React.ReactNode;
  title: string;
  gapClass?: string;
  center?: boolean;
  contentInset?: number;
}) {
  return (
    <div
      // Taller than the panel's content box by exactly its bottom padding, so
      // the screen keeps the panel's inset at the top and its cut lands on the
      // frame's inner edge at the bottom. A negative margin can't do this — it
      // changes what the layout reserves, not where the element's edge falls.
      // Corners well past what concentricity with the 12px frame would ask for:
      // this has to read as a handset, and a phone's radius is the first thing
      // that says so. The status bar above the app's own chrome does the rest.
      // At the outer shell's own 20px, though — three nested edges at 16, 12 and
      // 22 read as three arbitrary curves; repeating the outermost value makes
      // the set a rhythm instead.
      className="mock-ui flex h-[calc(100%+20px)] w-full shrink-0 flex-col overflow-hidden rounded-t-[20px] bg-[var(--mk-surface)] sm:hidden"
      style={{ boxShadow: PHONE_CUT_SHADOW }}
    >
      <PhoneStatusBar />
      {/* Title bar — menu, the screen's name, and the panel toggle: the three
          controls the real app carries at this width. Bordered with --mk-border,
          not --mk-hairline: hairline is neutral-100, which on the neutral-0
          screen face is very nearly the same colour and reads as no border. */}
      <div
        className="flex h-[52px] shrink-0 items-center gap-3 px-3.5"
        style={{ borderBottom: `1px solid ${MOCK_BORDER}` }}
      >
        <span
          className="flex size-[26px] shrink-0 items-center justify-center rounded-[4px] text-[var(--mk-fg)]"
          style={{ border: `1px solid ${MOCK_BORDER}` }}
        >
          {/* Supplied marks, re-pointed at currentColor from their #212B36. */}
          <svg
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden
            className="size-[13px]"
          >
            <path d="M0 2.29464C0 1.81964 0.382143 1.4375 0.857143 1.4375H15.1429C15.6179 1.4375 16 1.81964 16 2.29464C16 2.76964 15.6179 3.15179 15.1429 3.15179H0.857143C0.382143 3.15179 0 2.76964 0 2.29464ZM0 8.00893C0 7.53393 0.382143 7.15179 0.857143 7.15179H15.1429C15.6179 7.15179 16 7.53393 16 8.00893C16 8.48393 15.6179 8.86607 15.1429 8.86607H0.857143C0.382143 8.86607 0 8.48393 0 8.00893ZM16 13.7232C16 14.1982 15.6179 14.5804 15.1429 14.5804H0.857143C0.382143 14.5804 0 14.1982 0 13.7232C0 13.2482 0.382143 12.8661 0.857143 12.8661H15.1429C15.6179 12.8661 16 13.2482 16 13.7232Z" />
          </svg>
        </span>
        <span className="min-w-0 flex-1 truncate text-[12px] text-[var(--mk-fg)]">
          {title}
        </span>
        <span
          className="flex size-[26px] shrink-0 items-center justify-center rounded-[4px] text-[var(--mk-fg)]"
          style={{ border: `1px solid ${MOCK_BORDER}` }}
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            aria-hidden
            className="size-[13px]"
          >
            <path d="M9.84245 1.80005V14.2M0.800781 4.90005C0.800781 3.18797 2.1887 1.80005 3.90078 1.80005H12.1674C13.8795 1.80005 15.2674 3.18797 15.2674 4.90005V11.1C15.2674 12.8121 13.8795 14.2 12.1674 14.2H3.90078C2.1887 14.2 0.800781 12.8121 0.800781 11.1V4.90005Z" />
          </svg>
        </span>
      </div>
      {/* Top-anchored, not centred: the free space belongs at the bottom where
          the screen dissolves, so centring pushed the content down into it and
          left a dead band under the title bar. Bottom padding clears the fade
          so nothing readable sits in the part that washes out. */}
      <div
        className={`flex min-h-0 flex-1 flex-col px-4 pt-6 ${gapClass} ${
          center ? "justify-center" : ""
        }`}
        style={{ paddingBottom: contentInset }}
      >
        {children}
      </div>
    </div>
  );
}

// ── Desktop Describe: the full Add App screen (Figma 25:4993) ────────────────
// Bar heights as a percentage of the tallest, taken from the design's series.
const ADD_APP_BARS = [
  60, 52, 43, 37, 33, 28, 26, 30, 35, 46, 54, 59, 67, 74, 91, 100, 100, 87,
];
// Every other bar of the same series. At phone width the full 18 collapse into a
// hatch of 2px slivers, so the rail thumbs plot half as many, twice as wide.
const ADD_APP_BARS_COMPACT = ADD_APP_BARS.filter((_, i) => i % 2 === 0);

// The same JUL/AUG dashboard the templates gallery shows for this template, so
// the recommendation here and the card there are one component. It is written
// against the gallery's --v69-* surfaces, whose dark values come from a
// .v72-mock-dark wrapper this screen doesn't have; remapping the four tokens it
// reads onto the mock's own means it re-themes with the rest of the screen
// instead of staying a white card on a dark face.
const V69_ON_MOCK = {
  "--v69-card": "var(--mk-well)",
  "--v69-well": "var(--mk-well)",
  "--v69-inner": "var(--mk-riser)",
  "--v69-ink": "var(--mk-fg)",
} as React.CSSProperties;

// `compact` is the phone rail, where the thumb is 88px tall — the gallery card's
// 26px read-out needs more room than the shorter column's bar leaves, so the
// phone keeps the dense histogram and only the desktop card runs the widget.
function ThumbEngagement({ compact = false }: { compact?: boolean }) {
  if (!compact) {
    return (
      <div className="h-full w-full" style={V69_ON_MOCK}>
        <CardDashboard compact still />
      </div>
    );
  }
  return (
    // The same well the other two cards sit on, so the rail reads as one set.
    <div className="flex h-full w-full flex-col bg-[var(--mk-well)] px-3 py-2.5">
      {/* Bars round at the top only: rounded on all four corners they read as
          floating pills rather than a series. */}
      <div className="flex min-h-0 flex-1 items-end gap-[2px]">
        {ADD_APP_BARS_COMPACT.map((h, i) => (
          <span
            key={i}
            className="flex-1 rounded-t-[2px]"
            style={{ height: `${h}%`, backgroundColor: "var(--mk-data)" }}
          />
        ))}
      </div>
    </div>
  );
}

function ThumbIntake({ compact = false }: { compact?: boolean }) {
  // strokeDasharray/offset rather than an arc path: the ratio is the data, and
  // a dash offset states it directly instead of hiding it in path maths.
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const progress = 2.4 / 3;
  // The engagement card hatches its in-progress column; the gauge carried no
  // texture at all, so the two sat on the same rail as different materials.
  // Geometry converted from that card's CSS hatch — 45deg, a 1.5px line every
  // 9px — into this viewBox, where the ring renders at roughly 2.4x.
  const hatchId = useId();
  return (
    // Same surface language as the engagement card: a grey well with the mark
    // sitting on it. The donut's empty run is the riser white — what a bar is
    // there — and the filled run is grey, so the two cards read as one system
    // without boxing the ring in a second card. Grey and not the shared
    // --mk-data tint: at this size the ring is one continuous band rather than
    // a row of thin bars, and the blue turned the whole tile into the coloured
    // one in a monotone rail. --mk-fill rather than a heavier grey for the same
    // reason: a band this size carries far more weight than a bar does, and now
    // that the hatch runs over it the fill no longer has to do that work alone.
    // It is also the fill the in-progress sparkline bar takes, so every
    // provisional surface in these mocks is the same grey under the same hatch.
    <div className="flex h-full w-full items-center justify-center bg-[var(--mk-well)]">
      <div className="relative aspect-square h-[70%]">
        {/* The stripe rides on currentColor so one pattern serves both themes:
            ink on the light band, white on the dark one. Well above the
            engagement card's 3.5%, because the band under it is --mk-fill —
            ten values off the riser white either side of it — so the hatch is
            most of what makes the filled run legible as a run at all. */}
        <svg
          viewBox="0 0 72 72"
          className="size-full -rotate-90 text-[rgba(16,24,40,0.11)] [[data-theme=dark]_&]:text-[rgba(255,255,255,0.13)]"
          aria-hidden
        >
          <defs>
            <pattern
              id={hatchId}
              width="3.75"
              height="3.75"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="3.75"
                stroke="currentColor"
                strokeWidth="0.65"
              />
            </pattern>
          </defs>
          <circle
            cx="36"
            cy="36"
            r={radius}
            fill="none"
            stroke="var(--mk-riser)"
            strokeWidth="7"
          />
          <circle
            cx="36"
            cy="36"
            r={radius}
            fill="none"
            stroke="var(--mk-fill)"
            strokeWidth="7"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
          />
          {/* The hatch as its own pass over the filled run, so the band keeps
              its grey and gains the texture rather than swapping one for the
              other. */}
          <circle
            cx="36"
            cy="36"
            r={radius}
            fill="none"
            stroke={`url(#${hatchId})`}
            strokeWidth="7"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
          />
          {/* The band's two edges. The bars on the engagement card are outlined
              and this gauge was not, so it read as a softer, different object;
              these give it the same visible edge. Radius ± half the 7px stroke. */}
          <circle
            cx="36"
            cy="36"
            r={radius + 3.5}
            fill="none"
            stroke="var(--mk-border)"
            strokeWidth="0.5"
          />
          <circle
            cx="36"
            cy="36"
            r={radius - 3.5}
            fill="none"
            stroke="var(--mk-border)"
            strokeWidth="0.5"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Quieter on the phone rail: at the desktop's 15px it was the
              loudest mark in a 148px tile, competing with the ring itself. */}
          <p
            className={`leading-none text-[var(--mk-fg)] ${
              compact ? "text-[11px]" : "text-[15px]"
            }`}
          >
            2.4k
          </p>
          {!compact && (
            <p className="mt-1 text-[10px] leading-none text-[var(--mk-muted)]">
              of 3,000
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ThumbCommunity({ compact = false }: { compact?: boolean }) {
  // Shorter copy on the phone rail. The desktop lines ran to three and two
  // wrapped rows in a 148px tile, which is what made this card read as the
  // dense one next to a bar chart and a gauge.
  const [ask, reply] = compact
    ? ["When do we kick off?", "Mon, Apr 8."]
    : ["When does my project kick off?", "Kickoff is Mon, Apr 8."];
  return (
    // Well + bordered risers, matching the other two cards. Both bubbles get the
    // same treatment rather than one filled and one not: alignment and the
    // squared corner already say who is speaking.
    <div className="flex h-full w-full flex-col justify-center gap-2 bg-[var(--mk-well)] p-2.5">
      {/* One squared corner on the sender's side, the design's bubble shape. */}
      <p className="max-w-[88%] rounded-[8px] rounded-tl-[2px] border-[0.5px] border-[var(--mk-border)] bg-[var(--mk-riser)] px-2.5 py-1.5 text-[10px] leading-[1.5] text-[var(--mk-fg)]">
        {ask}
      </p>
      <p className="ml-auto rounded-[8px] rounded-tr-[2px] border-[0.5px] border-[var(--mk-border)] bg-[var(--mk-riser)] px-2.5 py-1.5 text-[10px] leading-[1.5] text-[var(--mk-fg)]">
        {reply}
      </p>
    </div>
  );
}

const ADD_APP_CARDS = [
  { title: "Client engagement dashboard", Thumb: ThumbEngagement },
  { title: "Client intake", Thumb: ThumbIntake },
  { title: "Community support", Thumb: ThumbCommunity },
];

// Carousel arrows. Square at 4px, the radius the rest of this mock's controls
// use, rather than the design's pill.
function CarouselArrow({ back = false }: { back?: boolean }) {
  return (
    <span
      className="flex size-[22px] items-center justify-center rounded-[4px] text-[var(--mk-fg-2)]"
      style={{ border: `1px solid ${MOCK_BORDER}` }}
    >
      {back ? (
        <IconChevronLeft className="size-[11px]" />
      ) : (
        <IconChevronRight className="size-[11px]" />
      )}
    </span>
  );
}

function AddAppScreen() {
  return (
    <div className="flex h-full flex-col">
      {/* Same header the other desktop screens carry, so all four read as the
          same product. No action here — there's nothing to publish yet. */}
      <ScreenTopBar title="Add App" />
      {/* Centred, not top-anchored: this step's content is shorter than the row
          the four steps share, so left at the top it pooled all the slack under
          the rail and the screen read as half-empty. */}
      <div className="flex min-h-0 flex-1 flex-col justify-center gap-5 p-5">
        {/* Heading + composer centre in the screen, held to a measure — run the
          full 800 and the field reads as a bar rather than something you type
          in, and pinned left it left a dead half-screen beside it. */}
        <div className="mx-auto flex w-full max-w-[360px] shrink-0 flex-col gap-3">
          <p className="text-center text-[14px] leading-[20px] text-[var(--mk-fg)]">
            Margot, what will you build?
          </p>
          <div className="v63-gradient-border v63-ring-solid relative flex h-[88px] w-full flex-col justify-between rounded-[8px] p-3 [[data-theme=dark]_&]:bg-[var(--mk-elevated)]">
            {/* The prompt is content and the row under it is chrome, so the two
              can't share a size — at 12/12 the model name read as loud as the
              request being typed. */}
            <p className="px-1 text-[11px] leading-[1.5] text-[var(--mk-fg-2)]">
              {TYPEWRITER_PREFIX}
              {FLOW_PROMPT}
              <span className="ml-px inline-block h-[1em] w-[1.5px] animate-caret bg-[var(--mk-fg-2)] align-[-0.15em]" />
            </p>
            <div className="flex items-center justify-between text-[var(--mk-muted)]">
              <span className="flex items-center gap-3">
                <IconPlus className="size-[13px]" />
                <span className="flex items-center gap-1.5 text-[10px] leading-none">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                    className="size-[11px]"
                  >
                    <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.5.5 1 1.2 1 2V16h6v-.5c0-.8.5-1.5 1-2A6 6 0 0 0 12 3Z" />
                  </svg>
                  Ideas
                </span>
              </span>
              <span className="flex items-center gap-2.5 text-[10px] leading-none">
                Sonnet 5
                {/* 20px, the same submit the Iterate composer carries — at 24 it
                  was the heaviest mark on the screen, next to 10px chrome. */}
                <span className="flex size-[20px] items-center justify-center rounded-[4px] bg-[var(--mk-invert-bg)] text-[var(--mk-invert-fg)]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                    className="size-[11px]"
                  >
                    <path d="M12 19V5M6 11l6-6 6 6" />
                  </svg>
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Recommended for you. Set off from the composer by more than the
          screen's own rhythm — it's what you get instead of typing, not the
          next thing under the field. */}
        <div className="mt-5 flex shrink-0 flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <p className="text-[12px] leading-none text-[var(--mk-fg)]">
              Recommended for you
            </p>
            <span className="flex items-center gap-2">
              <CarouselArrow back />
              <CarouselArrow />
            </span>
          </div>
          <div className="group/cards flex gap-4">
            {ADD_APP_CARDS.map(({ title, Thumb }) => (
              // Hover is a tone change and nothing else — no lift, no shadow.
              //
              // It's a veil laid over the card rather than a background on it:
              // each Thumb paints its own opaque well, so a background set here
              // sits underneath and never shows. The veil is --mk-fg, which is
              // near-black in light and near-white in dark, so one wash darkens
              // a light card and lightens a dark one. Not at one strength
              // though: ink on a near-white well bites harder than the same
              // amount of white on a dark one, so light runs at half.
              //
              // Nothing moves, so the card can take its own hover — a lift would
              // carry the hit box out from under the pointer at the bottom edge
              // and flutter.
              //
              // The stage is pointer-events-none (decorative), so each card opts
              // back in.
              <div
                key={title}
                className="group/card pointer-events-auto relative h-[128px] min-w-0 flex-1 overflow-hidden rounded-[8px] border border-[var(--mk-border)]"
              >
                <Thumb />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-[var(--mk-fg)] opacity-0 transition-opacity duration-200 ease-out group-hover/card:opacity-[0.02] [[data-theme=dark]_&]:group-hover/card:opacity-[0.04] motion-reduce:transition-none"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DescribeVisual() {
  return (
    <BluePanel>
      {/* The composer is pinned to the bottom now, so it holds back from the
          cut the way Iterate's does rather than washing out under the shadow. */}
      <PhoneScreen title="Add App" contentInset={ITERATE_INSET}>
        <DescribeComposer />
      </PhoneScreen>
      {/* contents, not a plain wrapper: the card is BluePanel's flex child and
          its centring depends on it staying one. 800/fill matches Build and
          Iterate so all four steps present the same window. */}
      <div className="hidden sm:contents">
        <ScreenCard maxW={800} fill>
          <AddAppScreen />
        </ScreenCard>
      </div>
    </BluePanel>
  );
}

// ── 2. PLAN — chat: request → thinking → reply types in → questions card. ────
const ASSISTANT_REPLY = "Got it. A few quick questions before I build this.";
// `short` is the phone wording, swapped in the same way the card's header title
// is: at the phone composition's width the full second answer ran past the row
// and truncated mid-word, and an answer you can't read isn't an answer.
const PLAN_OPTIONS = [
  { label: "No, this is internal-only" },
  { label: "Yes, this will show in my client portal", short: "Yes, clients will see it" },
];
// No answer pre-selected — both options read as unpicked (numbered 1 and 2).
const PLAN_SELECTED = -1;

// Split from the card below so the desktop screen can pin the two apart — the
// turns sit at the top of the app, the card near the bottom.
function PlanTurns() {
  return (
    <>
      {/* User request */}
      <div className="flex justify-end">
        <p className="max-w-[78%] rounded-[4px] bg-[var(--mk-fill)] px-3 py-2 text-[12px] leading-[1.5] text-[var(--mk-fg)]">
          Build {FLOW_PROMPT}.
        </p>
      </div>

      {/* Assistant reply. */}
      <p className="text-[12px] leading-[1.5] text-[var(--mk-fg)]">
        {ASSISTANT_REPLY}
      </p>
    </>
  );
}

function PlanQuestionsCard() {
  return (
    // Rests at the bottom of the screen: the gap above it is the app that
    // has not been built yet. Safe against the cut now that the cut is a
    // shadow rather than the long fade that used to swallow this.
    <div className="mt-auto overflow-hidden rounded-[8px] border border-[var(--mk-border)]">
      {/* The brand mark stays black — greyed out it read as disabled.
                  The pager beside it runs on one gray, so the strip has a
                  single dark accent rather than two competing ones. */}
      {/* --mk-fill rather than --mk-elevated: at neutral-50 the strip was five
          values off the white card under it, so the questions read as one
          undivided block instead of a header over a list. */}
      <div className="flex items-center gap-2 bg-[var(--mk-fill)] px-3 py-2">
        <span className="flex size-[16px] shrink-0 items-center justify-center rounded-[4px] bg-[var(--mk-invert-bg)] text-[var(--mk-invert-fg)]">
          <IconBrandMark className="size-[9px]" />
        </span>
        <p className="min-w-0 flex-1 truncate pb-[3px] -mb-[3px] text-[12px] leading-none text-[var(--mk-fg)]">
          <span className="sm:hidden">A few questions</span>
          <span className="hidden sm:inline">
            Some questions before we start
          </span>
        </p>
        <span className="flex shrink-0 items-center gap-1 text-[11px] leading-none text-[var(--mk-muted)]">
          <IconChevronLeft className="size-[11px]" />
          <span>1</span>
          <span>of 2</span>
          <IconChevronRight className="size-[11px]" />
        </span>
      </div>
      {/* Even padding, and enough of it that the question band matches the
          option rows below. At pt-2.5/pb-1.5 it was both lopsided and 13px
          shorter than them, so the question read as a cramped caption on the
          header rather than the first row of the card. */}
      <p className="px-3 py-3.5 text-[12px] leading-none text-[var(--mk-fg)]">
        Will this app be visible to your clients?
      </p>
      {PLAN_OPTIONS.map((option, i) => {
        const selected = i === PLAN_SELECTED;
        return (
          // An unpicked answer lights to the same tone the picked one already
          // carries, so hovering previews the choice rather than inventing a
          // state the card doesn't otherwise have. Desktop only: this card is
          // the phone composition below sm, where the second option is half
          // cut by the screen's bottom edge and a highlight on it reads as a
          // stuck state rather than as an answer being considered.
          <div
            key={option.label}
            className={`pointer-events-auto flex items-center gap-2.5 px-3 py-2.5 transition-colors duration-150 max-sm:pointer-events-none motion-reduce:transition-none ${
              selected
                ? "bg-[var(--mk-elevated)]"
                : "sm:hover:bg-[var(--mk-elevated)]"
            }`}
            style={{ borderTop: `1px solid ${HAIRLINE}` }}
          >
            <span
              className={`flex size-[20px] shrink-0 items-center justify-center rounded-[4px] text-[11px] leading-none ${
                selected
                  ? "bg-[var(--mk-invert-bg)] text-[var(--mk-invert-fg)]"
                  : "bg-[var(--mk-fill)] text-[var(--mk-fg-2)]"
              }`}
            >
              {selected ? <IconCheck className="size-[11px]" /> : i + 1}
            </span>
            <p className="truncate pb-[3px] -mb-[3px] text-[12px] leading-none text-[var(--mk-fg)]">
              {option.short ? (
                <>
                  <span className="sm:hidden">{option.short}</span>
                  <span className="hidden sm:inline">{option.label}</span>
                </>
              ) : (
                option.label
              )}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// The desktop screens' header. `chevron` marks a name you could rename (the
// app in Plan); a plain screen name (Add App) doesn't get one. `action` is
// optional — Describe has nothing to put there.
function ScreenTopBar({
  title,
  chevron = false,
  action,
}: {
  title: string;
  chevron?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <div
      className="flex h-[40px] shrink-0 items-center justify-between px-4"
      style={{ borderBottom: `1px solid ${MOCK_BORDER}` }}
    >
      <span className="flex items-center gap-1.5 text-[12px] leading-none text-[var(--mk-fg)]">
        {title}
        {chevron && (
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className="size-[11px] text-[var(--mk-subtle)]"
          >
            <path d="M5 7.5 10 12.5 15 7.5" />
          </svg>
        )}
      </span>
      {action}
    </div>
  );
}

// The workspace's own view switch: what the team sees against what the client
// sees. It belongs in the title bar rather than over the table because it swaps
// the whole screen, not a filter on the rows. One word a side — at this scale
// the mock reads as a shape, and "Team View / Contact View" was two long runs
// of 10px type where a label was wanted.
function ViewToggle() {
  const seg =
    "flex h-full items-center rounded-[3px] px-2 text-[10px] leading-none";
  return (
    <div className="flex h-[22px] items-center gap-0.5 rounded-[5px] bg-[var(--mk-fill)] p-0.5">
      <span
        className={`${seg} bg-[var(--mk-surface)] text-[var(--mk-fg)] ring-1 ring-[var(--mk-border)]`}
      >
        Team
      </span>
      <span className={`${seg} text-[var(--mk-muted)]`}>Client</span>
    </div>
  );
}

// Inert, not dark: there's nothing to publish until the app is built.
const INERT_PUBLISH = (
  <span className="flex h-[22px] items-center rounded-[4px] bg-[var(--mk-fill)] px-2.5 text-[11px] leading-none text-[var(--mk-subtle)]">
    Publish
  </span>
);

// Desktop Plan: the whole app screen, not just the chat. The turns sit at the
// top of a centred column and the questions card rests near the bottom, with
// the empty middle doing the work of showing an app that isn't built yet.
function PlanDesktopScreen() {
  return (
    <div className="flex h-full flex-col">
      <ScreenTopBar title="Untitled" chevron action={INERT_PUBLISH} />
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-[520px] flex-col gap-3 px-4 pt-4">
          <PlanTurns />
        </div>
        <div className="mx-auto mt-auto w-full max-w-[520px] px-4 pb-4">
          <PlanQuestionsCard />
        </div>
      </div>
    </div>
  );
}

export function BuildAppVisual() {
  return (
    <BluePanel>
      {/* The conversation is tall enough to reach the dissolve on its own, so
          it doesn't reserve the fade the way the short Describe step does. */}
      <PhoneScreen
        title="Time tracker"
        gapClass="gap-3"
        contentInset={PLAN_INSET}
      >
        <PlanTurns />
        <PlanQuestionsCard />
      </PhoneScreen>
      <div className="hidden sm:contents">
        <ScreenCard maxW={800} fill>
          <PlanDesktopScreen />
        </ScreenCard>
      </div>
    </BluePanel>
  );
}

// ── 3. BUILD — the deployed Time tracker: a cursor logs time, a row slides in. ─
type Entry = {
  description: string;
  // Phone wording. The phone screen gives the description a single narrow line,
  // where the longer entries truncated mid-word; the desktop screens have the
  // room for the full text and keep it.
  short?: string;
  client: string;
  date: string;
  duration: string;
  status: Status;
};

const BUILD_ENTRIES: Entry[] = [
  {
    description: "Q1 financial review & reporting",
    short: "Q1 financial review",
    client: "Meridian Corp",
    date: "Apr 10",
    duration: "3h 45m",
    status: "Approved",
  },
  {
    description: "Tax preparation meeting",
    client: "Oakwood LLC",
    date: "Apr 10",
    duration: "1h 30m",
    status: "Pending",
  },
  {
    description: "Reconcile accounts receivable",
    short: "Reconcile accounts",
    client: "Meridian Corp",
    date: "Apr 9",
    duration: "2h 15m",
    status: "Approved",
  },
  {
    description: "Internal team standup",
    client: "—",
    date: "Apr 9",
    duration: "0h 30m",
    status: "Logged",
  },
  {
    description: "Payroll processing & review",
    short: "Payroll processing",
    client: "Bloom Studios",
    date: "Apr 8",
    duration: "4h 00m",
    status: "Approved",
  },
  {
    description: "Draft engagement letter",
    client: "NovaTech Inc",
    date: "Apr 8",
    duration: "1h 45m",
    status: "Pending",
  },
  // Seven fills the desktop table exactly — at six it ran out a third of the way
  // up the frame, and an eighth is cut in half by the bottom edge.
  {
    description: "Client onboarding call",
    client: "Northwind Group",
    date: "Apr 7",
    duration: "1h 15m",
    status: "Approved",
  },
];

// The Iterate preview column is taller than the Build screen's table and its
// rows are tighter, so seven left the frame two-thirds empty. These five carry
// it to the bottom edge; the Build table keeps its own seven, which is what
// fills that one exactly.
const ITERATE_ENTRIES: Entry[] = [
  ...BUILD_ENTRIES,
  {
    description: "Review vendor invoices",
    client: "Bloom Studios",
    date: "Apr 7",
    duration: "2h 00m",
    status: "Approved",
  },
  {
    description: "Bookkeeping cleanup",
    client: "Oakwood LLC",
    date: "Apr 7",
    duration: "3h 30m",
    status: "Approved",
  },
  {
    description: "Quarterly forecast model",
    short: "Quarterly forecast",
    client: "Meridian Corp",
    date: "Apr 4",
    duration: "2h 45m",
    status: "Pending",
  },
  {
    description: "Professional development",
    client: "—",
    date: "Apr 4",
    duration: "2h 00m",
    status: "Logged",
  },
  {
    description: "Year-end filing prep",
    client: "NovaTech Inc",
    date: "Apr 3",
    duration: "1h 30m",
    status: "Approved",
  },
];

// Shared tracks so the header and every row line up on one set of edges. Fixed
// widths on the trailing four rather than a flex row: as flex children they
// shrank to their content and got shoved into the right corner while the
// description soaked up ~470px for ~160px of text. Same approach the
// "Generation is the easy part" table uses (see COLS in production-gap).
// The trailing tracks are wider than their content needs on purpose. Sized to
// fit, every spare pixel fell into the one flexible column, so Description sat
// on a ~190px gutter while the other four had ~40 — one gaping hole and then a
// cramped huddle. Padding them out spreads that slack so the gaps read even.
const BUILD_COLS =
  "grid grid-cols-[minmax(0,1fr)_150px_92px_100px_96px] items-center gap-3";
// The preview column in Iterate is roughly half as wide and drops Client/Date.
// Depth of the softening on the clipped last row. One row is ~26px, so this
// covers it and a little air above.
const ITERATE_ROW_FADE =
  "linear-gradient(to bottom, #000 calc(100% - 30px), transparent)";

const ITERATE_COLS =
  "grid grid-cols-[minmax(0,1fr)_84px_84px] items-center gap-2.5";

// The table toolbar — filter affordances on the left, the running total on the
// right. Shared by Build's full-width table and Iterate's preview column, which
// runs `compact` because its column is roughly half the width.
function TableToolbar({ compact = false }: { compact?: boolean }) {
  const size = compact ? "text-[10px]" : "text-[11px]";
  // Outlined, not filled — the same treatment the "Generation is the easy part"
  // toolbar gives its Search and Filters controls, so the two time trackers
  // carry one chip style.
  const chip = `flex items-center rounded-[4px] border border-[var(--mk-border)] px-2 py-1 leading-none text-[var(--mk-muted)] ${size}`;
  return (
    <div
      className={`flex shrink-0 items-center justify-between ${
        compact ? "px-3 pb-2 pt-0.5" : "px-3.5 py-2.5"
      }`}
    >
      <span className={`flex items-center ${compact ? "gap-1" : "gap-1.5"}`}>
        <span className={`${chip} gap-1`}>
          <IconFilter className={compact ? "size-[10px]" : "size-[11px]"} />
          Filters
        </span>
        <span className={chip}>This week: Apr 7 – Apr 11</span>
      </span>
      <span className={`leading-none text-[var(--mk-muted)] ${size}`}>
        Total: 32h 15m
      </span>
    </div>
  );
}

// Summary tiles above the table — each carries a small sparkline so the header
// reads as a live dashboard rather than plain numbers.
// Three deliberately distinct silhouettes so the tiles don't read as one
// repeated chart: a steady climb, a mid-week peak that tapers, and a jagged
// day-to-day week.
const BUILD_STATS = [
  { label: "Total hours", value: "534.50", bars: [22, 34, 45, 55, 68, 80, 94] },
  { label: "Billable", value: "418.24", bars: [38, 66, 92, 78, 54, 40, 30] },
  // Two values top out at 100 rather than near it. On the phone every bar sits
  // in a full-height track, so anything in the 90s leaves a thin unfilled sliver
  // above the fill that reads as a rendering seam instead of as a value. Same
  // reason the last bar is 100: at 96 the slot showed through.
  { label: "This week", value: "32.25", bars: [64, 30, 100, 42, 72, 34, 100] },
];

// The current period's bar, which is still filling in. Exactly the engagement
// card's hatch geometry — a 1.5px line every 9px — so the two read as the same
// material. A tighter 1px/4px pitch was the first attempt, on the assumption
// these bars were only a few pixels wide; at their real ~20px they packed in
// enough stripes to read as a screen texture rather than as a hatch. Dark takes
// the reference's alpha too; light runs a step stronger because it sits on
// --mk-fill rather than on a white tile.
const SPARK_HATCH =
  "bg-[repeating-linear-gradient(45deg,rgba(16,24,40,0.06)_0,rgba(16,24,40,0.06)_1.5px,transparent_1.5px,transparent_9px)]";
const SPARK_HATCH_DARK =
  "[[data-theme=dark]_&]:bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.055)_0,rgba(255,255,255,0.055)_1.5px,transparent_1.5px,transparent_9px)]";

// Phone composition for Build. The desktop screen is a three-tile dashboard
// over a four-column table, and neither survives a ~320px column — the tiles
// lose the numbers they exist to show and every table cell truncates to an
// ellipsis. So the phone gets the same app built for a phone: the week as one
// full-width tile, then the entries as list rows.
function BuildPhoneContent() {
  const stat = BUILD_STATS[2];
  return (
    <>
      <div className="shrink-0 rounded-[8px] border border-[var(--mk-border)] p-3">
        <div className="flex items-baseline justify-between">
          <p className="text-[11px] leading-none text-[var(--mk-muted)]">
            {stat.label}
          </p>
          {/* Diatype Mono, the face the site uses for figures and eyebrows.
              Mono is tabular by construction, so no tabular-nums needed. */}
          <p className="text-[11px] leading-none text-[var(--mk-muted)] [font-family:var(--font-diatype-mono)]">
            {stat.value}
          </p>
        </div>
        {/* Taller than the desktop tile's 30px: full width across a phone, seven
            bars are wide enough that a short chart reads as blocks, not a
            series. Each bar sits in a full-height track, so a short day reads
            as a part of something rather than a stub floating on white. The
            last one takes the track's own grey rather than a saturated blue:
            at full height a solid accent dragged the whole tile to its right
            edge. The same grey as every other track, not a darker one — a
            heavier block there read as a value rather than as the period still
            filling in. It carries the hatch instead, the same texture the
            engagement card's in-progress column and the gauge use, which is
            what lets it register at all against a track of its own colour. */}
        <div className="mt-2.5 flex h-[64px] items-end gap-[5px]">
          {stat.bars.map((h, i) => (
            <div
              key={i}
              className="relative h-full flex-1 rounded-[6px] bg-[var(--mk-fill)]"
            >
              <span
                className={`absolute inset-x-0 bottom-0 rounded-[6px] ${
                  i === stat.bars.length - 1
                    ? `${SPARK_HATCH} ${SPARK_HATCH_DARK}`
                    : ""
                }`}
                style={{
                  height: `${h}%`,
                  backgroundColor:
                    i === stat.bars.length - 1
                      ? "var(--mk-fill)"
                      : "var(--mk-data)",
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Given the desktop table's frame and header bar rather than left as
          loose rows: bare, it read as a list that happened to sit under the
          tile. Extra top margin sets it off from the chart above. Description
          leads and the meta sits under it, so nothing has to share a line it
          can't fit on. Clipped rather than overflowing: the list is longer than
          any phone screen, and it's meant to run into the dissolve. */}
      <div className="mt-2 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[8px] border border-[var(--mk-border)]">
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--mk-hairline)] bg-[var(--mk-elevated)] px-3 py-2 text-[10px] leading-none text-[var(--mk-muted)]">
          <span>Description</span>
          <span>Status</span>
        </div>
        {BUILD_ENTRIES.map((entry, i) => (
          <div
            key={entry.description}
            className="flex shrink-0 items-center gap-3 px-3 py-2.5"
            style={i ? { borderTop: `1px solid ${HAIRLINE}` } : undefined}
          >
            <div className="min-w-0 flex-1">
              <p className="truncate pb-[3px] -mb-[3px] text-[12px] leading-none text-[var(--mk-fg)]">
                {entry.short ?? entry.description}
              </p>
              <p className="mt-1.5 text-[11px] leading-none text-[var(--mk-muted)]">
                {entry.date} · {entry.duration}
              </p>
            </div>
            <StatusPill status={entry.status} />
          </div>
        ))}
      </div>
    </>
  );
}

export function BrandPortalVisual() {
  const rows = BUILD_ENTRIES;
  return (
    <BluePanel>
      <PhoneScreen title="Time tracker" gapClass="gap-3">
        <BuildPhoneContent />
      </PhoneScreen>
      <div className="hidden sm:contents">
        <ScreenCard maxW={800} fill>
          {/* Title bar */}
          <div className="flex h-[38px] shrink-0 items-center justify-between border-b border-[var(--mk-hairline)] px-3.5">
            <span className="text-[12px] leading-none text-[var(--mk-fg)]">
              Time tracker
            </span>
            <DarkButton>Log time</DarkButton>
          </div>

          {/* Summary tiles with sparklines — the dashboard read above the table. */}
          <div className="flex shrink-0 gap-2 px-3.5 pt-3.5">
            {BUILD_STATS.map((stat) => (
              <div
                key={stat.label}
                className="flex-1 rounded-[8px] border border-[var(--mk-border)] p-2.5"
              >
                <p className="text-[10px] leading-none text-[var(--mk-muted)]">
                  {stat.label}
                </p>
                <p className="mt-1.5 text-[15px] leading-none tabular-nums text-[var(--mk-fg)]">
                  {stat.value}
                </p>
                {/* The one live thing on an otherwise still mock: hovering the
                    chart settles the series back and holds the bar under the
                    cursor at full strength. Focus by contrast rather than by a
                    new colour, so it costs the palette nothing and reads at a
                    glance. The stage is pointer-events-none (decorative), so
                    each column opts itself back in; the wrapper is full-height
                    so a 4px bar is still easy to land on.
                    `!` on the hover state because it and the group-hover dim are
                    the same specificity, and source order would otherwise pick
                    the winner. */}
                <div className="group/spark mt-2 flex h-[30px] items-end gap-[2.5px]">
                  {stat.bars.map((h, i) => (
                    <span
                      key={i}
                      className="pointer-events-auto flex h-full flex-1 items-end transition-opacity duration-200 group-hover/spark:opacity-40 hover:opacity-100! motion-reduce:transition-none"
                    >
                      {/* Grey, not the lime accent: three tiles of coloured
                          bars made the dashboard's chrome the loudest thing on
                          a screen whose subject is the table under it. The last
                          bar is the period still filling in — a step lighter
                          than the series and hatched, the same pairing the
                          gauge and the engagement card use for provisional.
                          Outlined like the engagement card's columns and the
                          gauge's band: once the fill went grey the bars needed
                          an edge to keep their silhouette against the tile. At
                          a full pixel that edge was most of a bar this small,
                          so it takes a half-pixel hairline instead. */}
                      <span
                        className={`w-full rounded-[1.5px] ring-[0.5px] ring-inset ring-[var(--mk-border)] ${
                          i === stat.bars.length - 1
                            ? `${SPARK_HATCH} ${SPARK_HATCH_DARK}`
                            : ""
                        }`}
                        style={{
                          height: `${h}%`,
                          backgroundColor:
                            i === stat.bars.length - 1
                              ? "var(--mk-fill)"
                              : "var(--mk-data-quiet)",
                        }}
                      />
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <TableToolbar />

          {/* Entries table — flex-1 so it fills the card, giving this step the
            same fixed height as the Iterate step. */}
          <div className="mx-3.5 mb-3.5 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[8px] border border-[var(--mk-border)]">
            <div
              className={`${BUILD_COLS} shrink-0 border-b border-[var(--mk-hairline)] bg-[var(--mk-elevated)] px-3 py-2 text-[10px] leading-none text-[var(--mk-muted)]`}
            >
              <span>Description</span>
              <span>Client</span>
              <span>Date</span>
              <span>Duration</span>
              <span>Status</span>
            </div>
            {/* No dissolve here, unlike the Iterate preview: these seven rows
                are sized to fill the frame exactly, so nothing is ever cut and
                a fade would only soften a last row that is entirely present. */}
            <div className="min-h-0 flex-1 overflow-hidden">
            {rows.map((entry, i) => (
              <div
                key={entry.description}
                // Rows light on hover, same as a real table would. --mk-elevated
                // is the tone this mock set already uses for a lifted row.
                className={`${BUILD_COLS} pointer-events-auto px-3 py-[7px] text-[11px] leading-none transition-colors duration-150 hover:bg-[var(--mk-elevated)] ${
                  i < rows.length - 1
                    ? "border-b border-[var(--mk-hairline)]"
                    : ""
                }`}
              >
                <span className="min-w-0 truncate pb-[3px] -mb-[3px] text-[var(--mk-fg)]">
                  {entry.description}
                </span>
                <span className="truncate pb-[3px] -mb-[3px] text-[var(--mk-muted)]">
                  {entry.client}
                </span>
                <span className="tabular-nums text-[var(--mk-muted)]">
                  {entry.date}
                </span>
                <span className="tabular-nums text-[var(--mk-muted)]">
                  {entry.duration}
                </span>
                <span>
                  <StatusPill status={entry.status} />
                </span>
              </div>
            ))}
            </div>
          </div>
        </ScreenCard>
      </div>
    </BluePanel>
  );
}

// ── 4. ITERATE — edit mode: the next request types into the composer. ────────
const ITERATE_CHAT: { role: "user" | "assistant"; text: string }[] = [
  { role: "user", text: "Make the table more compact vertically." },
  { role: "assistant", text: "Rows are tighter now." },
  {
    role: "user",
    text: "Add approval status colors so pending stands out more.",
  },
  { role: "assistant", text: "Statuses are color-coded now." },
  { role: "user", text: "Add a weekly total at the top." },
];
const ITERATE_INPUT = "I need this app to support overtime calculations";

// Widths for the skeleton rows shown while the preview "regenerates".
const ITERATE_SKELETON = ["70%", "84%", "58%", "76%", "52%"];

// Phone composition for Iterate. The desktop screen is a chat column beside a
// live preview; the preview has nowhere to go at this width, and the step's
// point — keep chatting to change anything — is carried by the chat, so the
// phone shows the conversation and the request waiting in the composer.
function IteratePhoneContent() {
  return (
    <>
      {/* The tail of the conversation, not all of it — every turn on a phone
          column was a wall of prose. Ends on a request so the chat reads as
          still going rather than stopping on a lone reply. */}
      {/* overflow-hidden, like the desktop column: without it the turns spill
          out of their box and print over the composer at narrow widths. */}
      <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-hidden">
        {ITERATE_CHAT.slice(-3).map((turn, i) =>
          turn.role === "user" ? (
            <div key={i} className="flex justify-end">
              <p className="max-w-[85%] rounded-[4px] bg-[var(--mk-fill)] px-2.5 py-1.5 text-[12px] leading-[1.5] text-[var(--mk-fg)]">
                {turn.text}
              </p>
            </div>
          ) : (
            <p
              key={i}
              className="text-[12px] leading-[1.5] text-[var(--mk-muted)]"
            >
              {turn.text}
            </p>
          ),
        )}
      </div>

      <ChatComposer text={ITERATE_INPUT} phone />
    </>
  );
}

export function BuildStepVisual() {
  const updating = false;
  return (
    <BluePanel>
      {/* The composer is the payload here, so it clears the dissolve. */}
      <PhoneScreen
        title="Time tracker"
        gapClass="gap-3"
        contentInset={ITERATE_INSET}
      >
        <IteratePhoneContent />
      </PhoneScreen>
      <div className="hidden sm:contents">
        <ScreenCard maxW={800} fill>
          {/* App title bar with Publish (edit mode). The view switch sits at
              44% — where the chat column ends and the preview begins — because
              it belongs to the app being previewed, not to the editor. Flush
              to that edge, with no inset — the bar and the row below split at
              the same 44% of the same box, so the switch starts exactly on the
              rule. */}
          <div className="relative flex h-[38px] shrink-0 items-center justify-between border-b border-[var(--mk-hairline)] px-3.5">
            <span className="text-[12px] leading-none text-[var(--mk-fg)]">
              Time tracker
            </span>
            <div className="absolute left-[44%]">
              <ViewToggle />
            </div>
            <DarkButton>Publish</DarkButton>
          </div>

          <div className="flex min-h-0 flex-1">
            {/* Chat editor */}
            <div className="flex w-[44%] shrink-0 flex-col border-r border-[var(--mk-hairline)]">
              <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-hidden p-3">
                {ITERATE_CHAT.map((turn, i) =>
                  turn.role === "user" ? (
                    <div key={i} className="flex justify-end">
                      <p className="max-w-[85%] rounded-[4px] bg-[var(--mk-fill)] px-2.5 py-1.5 text-[11px] leading-[1.5] text-[var(--mk-fg)]">
                        {turn.text}
                      </p>
                    </div>
                  ) : (
                    <p
                      key={i}
                      className="text-[11px] leading-[1.5] text-[var(--mk-muted)]"
                    >
                      {turn.text}
                    </p>
                  ),
                )}
              </div>
              {/* Composer — the next request sitting ready in the field. */}
              <div className="p-3 pt-0">
                <ChatComposer text={ITERATE_INPUT} />
              </div>
            </div>

            {/* Live app preview — the Build screen adapted to the narrow column.
              While a request sends, the rows shimmer as the app regenerates.
              A grey field with the app on a white card, the way the workspace
              frames a running app: the editor is the page, the app is an
              object sitting on it. */}
            <div className="flex min-w-0 flex-1 flex-col bg-[var(--mk-fill)] p-2.5">
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[8px] border border-[var(--mk-border)] bg-[var(--mk-surface)] pt-2.5">
                <TableToolbar compact />
                <div className="mx-2.5 mb-2.5 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[6px] border border-[var(--mk-border)]">
                  <div
                    className={`${ITERATE_COLS} shrink-0 border-b border-[var(--mk-hairline)] bg-[var(--mk-elevated)] px-2.5 py-1.5 text-[10px] leading-none text-[var(--mk-muted)]`}
                  >
                    <span>Description</span>
                    <span>Duration</span>
                    <span>Status</span>
                  </div>
                  {/* The fade has to sit on the viewport that does the clipping,
                      not on the rows inside it: measured against the full list
                      the gradient resolved ~20px past the cut, so it rendered
                      entirely out of frame and the last row stayed sliced. */}
                  <div
                    className="min-h-0 flex-1 overflow-hidden"
                    style={{
                      maskImage: ITERATE_ROW_FADE,
                      WebkitMaskImage: ITERATE_ROW_FADE,
                    }}
                  >
                  {updating
                    ? ITERATE_SKELETON.map((w, i) => (
                        <div
                          key={i}
                          className={`${ITERATE_COLS} px-2.5 py-[7.5px] ${
                            i < ITERATE_SKELETON.length - 1
                              ? "border-b border-[var(--mk-hairline)]"
                              : ""
                          }`}
                        >
                          <span
                            className="skeleton-shimmer h-[8px] min-w-0 rounded-full"
                            style={{ maxWidth: w }}
                          />
                          <span className="skeleton-shimmer h-[8px] w-[38px] rounded-full" />
                          <span className="skeleton-shimmer h-[8px] w-[46px] rounded-full" />
                        </div>
                      ))
                    : ITERATE_ENTRIES.map((entry, i) => (
                        // Same row hover as the Build step's table — the two are
                        // the same app at two moments, so they answer the cursor
                        // the same way. Only the settled rows: the skeleton above
                        // is mid-regeneration and nothing there is pickable yet.
                        <div
                          key={entry.description}
                          className={`${ITERATE_COLS} pointer-events-auto px-2.5 py-[7.5px] text-[10px] leading-none transition-colors duration-150 hover:bg-[var(--mk-elevated)] motion-reduce:transition-none ${
                            i < ITERATE_ENTRIES.length - 1
                              ? "border-b border-[var(--mk-hairline)]"
                              : ""
                          }`}
                        >
                          <span className="min-w-0 truncate pb-[3px] -mb-[3px] text-[var(--mk-fg)]">
                            {entry.description}
                          </span>
                          <span className="tabular-nums text-[var(--mk-muted)]">
                            {entry.duration}
                          </span>
                          <span>
                            <StatusPill status={entry.status} />
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScreenCard>
      </div>
    </BluePanel>
  );
}
