"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { TEMPLATES, type Template } from "@/lib/templates";
import { proposalAppName } from "@/lib/proposal-title";
import {
  MAX_PROMPT_LENGTH,
  buildSignupUrl,
  templateSignupUrl,
} from "@/lib/constants";
import { FooterAurora } from "@/components/layout/footer";
import { useTheme } from "@/components/theme/theme-provider";
import { TemplateDetailPanel } from "@/components/proposal/template-detail-panel";
import { OptionAvatar } from "@/components/ui/select-menu";
import { teamAvatar } from "@/lib/team";

// ─────────────────────────────────────────────────────────────────────────
// PROPOSAL — a page made for one person. Someone on the team refined a prompt
// (or picked the template that fits) and sent them this link; it opens with
// who it's prepared for and closes with a signup that already carries the build.
//
// Everything comes from the URL, so the link IS the proposal:
//   ?for=Jonathan          who it's prepared for
//   ?name=…                what the prompt builds, in two or three words
//   ?prompt=…              the refined prompt, shown in full and editable
//   ?template=slug         a template instead, as a cover and a summary
//   ?from=Sean Walsh       who prepared it
//   ?note=…                one personal line under the title
//
// It reads as a document in three parts — who it's for and what it is, the
// build itself, then how signing up turns it into a real app — and carries no
// navigation at all: there is one thing to do on it.
// ─────────────────────────────────────────────────────────────────────────

// One rail for the document — the names, the headline, the card and the steps
// all start on the same line.
const RAIL = "mx-auto w-full max-w-[50rem]";

// The head of the band is the site's nav, to the pixel: the rail, the gutter and
// the row height are the values root-shell hands StudioNav (max-w-[1600px],
// px-6 md:px-10, h-14 under lg and h-16 at it), and the mark is its 22px. So the
// logo lands exactly where it does on every other page, and this page's head
// reads as the site's own even though it carries no links.
//
// The mark can't sit on the document's 800px rail: indented that far it floated
// in from the edge instead of sitting in the corner.
const NAV_RAIL = "mx-auto w-full max-w-[1600px]";
const NAV_GUTTER = "px-6 md:px-10";
// cursor-default for the same reason the masthead below carries it: the mark and
// the label are printed furniture, not anything to click or type into.
// The row's height is set where it's used, since it steps down on scroll.
const NAV_ROW = "flex cursor-default items-center justify-between";

// The build panel, shared by the prompt and the template so a typed idea and a
// picked template arrive as the same object.
//
// Built like the steps list below it: one outlined container, no fill, its parts
// separated by hairlines rather than by nested surfaces. It used to be a filled
// card with a filled well inside it, which put three tones inside one panel and
// made the same information look heavier than the table a screen down.
//
// No margin of its own: the section places it, because on a phone the panel is
// ordered ABOVE the heading it belongs to and the space has to move with it.
const CARD = "overflow-hidden rounded-xl border border-border";
const CARD_HEAD =
  "flex items-center justify-between gap-4 border-b border-border px-5 py-4";
// The body's padding matches a step row's, so the two panels are set to the same
// rhythm. Used by the template variant, whose body is a cover and a summary.
const CARD_BODY = "px-5 py-4";

// The prompt's field. It IS a text box, and it looks like one in both states
// rather than only once you press Edit — as bare text on the card's own ground it
// read as a quote someone had pasted in, and the field appearing on edit was the
// thing that made the change feel abrupt. Inset from the card so the box has an
// edge of its own; filled rather than outlined, since the card is already an
// outline and two hairlines inside each other read as a form.
// The box stops growing at 20rem and scrolls inside itself past that. Left to
// grow, a long prompt pushed the whole page down — the steps and the action ended
// up a scroll away, and the proposal turned into a wall of prompt. Scrolling in a
// text box is what a text box does, so the cap costs nothing; the same ceiling
// applies while reading, so the panel is the same size in either state.
const CARD_FIELD_INSET = "p-3";
const CARD_FIELD =
  "scrollbar-slim max-h-80 overflow-y-auto rounded-lg bg-muted px-4 py-3.5 focus-within:ring-1 focus-within:ring-inset focus-within:ring-foreground/20";
// The card's quiet controls — Edit / Cancel / Save, and the template's way into
// its full spec. Text buttons rather than buttons: the page has one action and
// it isn't in here. text-sm because that's the size every button on this site
// is set at; type-caption's 13px is for meta, and at that step these read as
// labels you can't press.
const CARD_CONTROL =
  "text-sm text-muted-foreground transition-colors hover:text-foreground";

// The prompt, reading and being edited. 16px on a phone and 15px from sm up:
// under 16px, iOS Safari zooms the whole page the moment the field takes focus.
// The site's own FIELD_CLS carries the same guard for the same reason, and it
// isn't a type decision — which is why the paragraph you read gets it too, so
// nothing resizes when Edit turns one into the other. Only the size is set here,
// not the leading: type-body's unitless 1.6 then scales with whichever step
// applies.
const CARD_PROMPT_TEXT = "type-body text-[1rem] sm:text-[0.9375rem]";

// What the field says when there's nothing in it — as the placeholder while
// it's being edited, and as the paragraph if it was saved empty.
const PROMPT_EMPTY = "Describe the app you want built.";

// The two names' own labels in the credit row. type-eyebrow's size, in PP Mori
// rather than its mono and in normal
// case rather than its caps: mono read as another document's furniture on top of
// the page's own face, and capitals on a two-word label read as shouting. The
// tracking comes down with the caps, since 0.08em is drawn to open up capitals and
// only looks loose on lowercase.
const BAND_EYEBROW =
  "type-eyebrow normal-case tracking-[0.02em] text-[color:var(--proposal-ink-faint)] [font-family:var(--font-pp-mori)]";

const firstName = (name: string) => name.split(/\s+/)[0] ?? "";

/**
 * One name in the masthead's metadata row: the avatar, with the label above the
 * name rather than beside it, so the two facts read as one block at a glance.
 *
 * Both names are set identically — they're a matched pair of facts about the
 * document, not a hierarchy — and both sit at the caption step. Rendered large
 * and centred under the title, they outranked the headline and turned the
 * masthead into a title page.
 */
function BandName({
  label,
  name,
  avatar,
  className = "",
}: {
  label: string;
  name: string;
  /** Their photo, when we have one. Falls back to their initials. */
  avatar?: string;
  className?: string;
}) {
  return (
    <div className={`flex min-w-0 items-center gap-2.5 ${className}`}>
      {/* Both circles are the same 26px, but a bright photo against the band
          reads bigger than the same disc filled with a wash of the ink. The
          hairline gives them a matching edge, which settles the two at the same
          size by eye. */}
      {/* Sized to the pair it sits beside rather than to one line of it: at
          26px it read as a bullet next to the label, where a credit's photo
          should stand as tall as the two lines it belongs to. */}
      <span className="relative inline-flex shrink-0">
        <OptionAvatar
          option={{ value: name, label: name, avatar }}
          size={38}
          tone="field"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-[color-mix(in_srgb,var(--proposal-ink)_8%,transparent)]"
        />
      </span>
      <div className="min-w-0">
        <p className={BAND_EYEBROW}>{label}</p>
        <p className="truncate text-[0.9375rem] text-[color:var(--proposal-ink)]">
          {name}
        </p>
      </div>
    </div>
  );
}

/**
 * The prompt, in full and editable in place. Nothing here is saved anywhere,
 * but being able to change the words is what says the build isn't fixed —
 * whatever the prompt says when they sign up is what rides along.
 *
 * Edit / Save rather than a field that's always live: the prompt is the thing
 * the page is showing them, and a textarea sitting open reads as a form to fill
 * in rather than as the proposal's centre.
 */
function PromptCard({
  prompt,
  onCommit,
}: {
  prompt: string;
  onCommit: (next: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(prompt);
  const fieldRef = useRef<HTMLTextAreaElement | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [moreBelow, setMoreBelow] = useState(false);

  // Whether the prompt runs past the box, which is what the bottom fade is for.
  // Tracked rather than assumed so the fade lifts once you reach the end — a
  // permanent fade over the last line reads as text that never finishes.
  //
  // The first measurement goes through a microtask rather than the effect body,
  // where a synchronous setState is a cascading render the repo's lint rule
  // catches. NOT requestAnimationFrame: frames are paused in a hidden tab, so
  // the fade would be missing until the tab was focused and scrolled. Effects
  // run after paint, so layout is already settled by the time this reads it.
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    let live = true;
    const check = () => {
      if (live)
        setMoreBelow(el.scrollTop + el.clientHeight < el.scrollHeight - 1);
    };
    queueMicrotask(check);
    el.addEventListener("scroll", check, { passive: true });
    // Re-measured on resize too, not only when the text changes: the same
    // prompt overflows at one width and fits at another, and a stale
    // measurement left the fade sitting over a paragraph with nothing under it.
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => {
      live = false;
      observer.disconnect();
      el.removeEventListener("scroll", check);
    };
  }, [prompt, draft, editing]);

  // The field grows to whatever it holds, so a long prompt is all there rather
  // than a few lines of it above a scrollbar — and a short one doesn't leave a
  // tall empty box. Measured off scrollHeight, which needs the height released
  // first or it only ever reports the height it already has.
  useEffect(() => {
    const el = fieldRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [draft, editing]);

  // Opening the field puts the caret after the last word, not in front of the
  // first: pressing Edit means adding to what's there, and autofocus alone
  // leaves the caret at position 0, where the first key typed lands in front of
  // the prompt.
  useEffect(() => {
    const el = fieldRef.current;
    if (!editing || !el) return;
    el.focus();
    const end = el.value.length;
    el.setSelectionRange(end, end);
  }, [editing]);

  return (
    <div className={CARD}>
      <div className={CARD_HEAD}>
        {/* What the panel holds, not what it builds: the app's own name is
            already the page's title, and repeating it here labelled the box
            with the one thing the reader had just read. */}
        <p className="truncate text-sm text-muted-foreground">Prompt</p>
        <div className="flex shrink-0 items-center gap-3.5">
          {editing ? (
            <>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className={CARD_CONTROL}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onCommit(draft);
                  setEditing(false);
                }}
                // Same size as its Cancel, and solid ink against Cancel's muted:
                // the pair's hierarchy is carried in the ink, not in a weight —
                // the family's 500 is a SemiBold and would shout here.
                className="text-sm text-foreground transition-opacity hover:opacity-70"
              >
                Save
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setDraft(prompt);
                setEditing(true);
              }}
              className={CARD_CONTROL}
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {/* The field is the same box in both states — the textarea simply replaces
          the paragraph inside it, at the same type in the same place, so pressing
          Edit puts a caret in what you were reading instead of swapping one shape
          for another. The box takes the focus ring; the textarea itself carries
          no chrome at all. */}
      <div className={`relative ${CARD_FIELD_INSET}`}>
        <div ref={boxRef} className={CARD_FIELD}>
          {editing ? (
            <>
              <label className="sr-only" htmlFor="proposal-prompt">
                The app idea, yours to edit
              </label>
              <textarea
                ref={fieldRef}
                id="proposal-prompt"
                rows={1}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                spellCheck={false}
                // The same ceiling the creator writes prompts against, and the
                // one buildSignupUrl trims to — without it you could type a
                // prompt here that silently lost its tail on the way to signup.
                maxLength={MAX_PROMPT_LENGTH}
                // Clearing the field left an empty grey box with no way of
                // knowing what belongs in it.
                placeholder={PROMPT_EMPTY}
                // overflow-hidden so the auto-grown field never shows a
                // scrollbar of its own, and resize-none because the height is
                // not the reader's problem to solve.
                //
                // It opts out of the site's global focus ring (see the
                // :focus-visible block in globals.css), and out of BOTH of its
                // halves: that rule pairs an ink outline with a
                // background-coloured box-shadow, and clearing only the outline
                // left the shadow painting a hard near-black rectangle around
                // the line of text in dark mode. The box around it carries the
                // ring, so this element wants none of its own.
                className={`${CARD_PROMPT_TEXT} block w-full resize-none overflow-hidden border-0 bg-transparent p-0 text-foreground outline-none placeholder:text-muted-foreground focus-visible:shadow-none focus-visible:outline-none`}
              />
            </>
          ) : (
            // Saved empty, the box reads as broken rather than as blank — the
            // same line the field shows as its placeholder says what it wants.
            <p
              className={`${CARD_PROMPT_TEXT} whitespace-pre-wrap text-pretty ${
                prompt ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {prompt || PROMPT_EMPTY}
            </p>
          )}
        </div>

        {/* The last visible line fading out when the prompt runs on, in both
            states — cut off at the box's edge mid-line it reads as text that
            stops rather than text that continues.
            An overlay inside the box rather than a mask on the box: masking the
            scroller took its fill and its bottom edge with it, so the box itself
            dissolved instead of the words inside it. Painted in the box's own
            fill, over the text, with the box's bottom radius. */}
        {moreBelow && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-3 bottom-3 h-12 rounded-b-lg"
            style={{
              background:
                "linear-gradient(to top, var(--muted) 25%, color-mix(in srgb, var(--muted) 0%, transparent) 100%)",
            }}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Template variant — the same panel, holding the paragraph the template's own
 * catalogue page opens with and what comes in it.
 *
 * No cover in here: the masthead now carries it as the page's anchor, and the
 * same picture twice on one screen read as a page that couldn't decide which
 * copy of it mattered. The card is the writing; the band is the picture.
 */
function TemplateCard({
  template,
  onSeeDetails,
}: {
  template: Template;
  onSeeDetails: () => void;
}) {
  return (
    <div className={CARD}>
      <div className={CARD_HEAD}>
        {/* Not "Template" — see buildLead. What the label has to tell the reader
            is that the app can be changed, not where it came from. */}
        <p className="truncate text-sm text-muted-foreground">Remixable app</p>
        <button type="button" onClick={onSeeDetails} className={CARD_CONTROL}>
          See full details
        </button>
      </div>

      {/* Writing only. The cover used to sit in a column beside it, but the
          masthead already carries the picture, and a square that had to be
          centred in a column the paragraph's height set the card's height from
          the picture rather than from what it says. Same padding as the prompt
          variant's body, so a template and a typed idea are set identically. */}
      <div className={CARD_BODY}>
        <p className="type-body text-pretty text-foreground">
          {/* The one-line summary is the floor: a Contentful entry with no
              committed record here has no long description, and the card read as
              an empty box. */}
          {template.longDescription || template.description}
        </p>
        {/* What comes in it, as tags rather than as a section of its own: the
            full list with a sentence on each is in the details panel. Filled
            rather than outlined now the card around them is outlined — two
            nested hairlines read as a form, a quiet fill reads as a tag. */}
        {template.features.length > 0 && (
          <ul className="mt-5 flex flex-wrap gap-1.5">
            {template.features.map((feature) => (
              <li
                key={feature}
                className="rounded-sm bg-muted px-2 py-1 text-[11px] uppercase leading-none tracking-[0.04em] text-muted-foreground [font-family:var(--font-diatype-mono),ui-monospace,monospace] [[data-theme=dark]_&]:bg-white/[0.06]"
              >
                {feature}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/**
 * The steps, as the site's expanding rows: the FAQ's divided-row mechanics (a
 * title-and-chevron control over a grid-rows drawer) inside the outline the
 * security list boxes its rows with.
 *
 * Numbers are gone with the change. They were carrying the order while every
 * step's copy was on show; with one row open at a time, a position in a list
 * says little about what you're reading, and the security rows drop theirs at
 * exactly the same point for the same reason.
 *
 * Single-open, matching the FAQ and the security rows — opening one closes the
 * last. The first is open on arrival so the section reads as filled in rather
 * than as three things to go and click.
 */
function SignupSteps({ steps }: { steps: { title: string; body: string }[] }) {
  const [openTitle, setOpenTitle] = useState<string | null>(
    steps[0]?.title ?? null,
  );

  return (
    <ul className="mt-10 overflow-hidden rounded-xl border border-border">
      {steps.map((step) => {
        const open = openTitle === step.title;
        return (
          <li
            key={step.title}
            className="border-t border-border first:border-t-0"
          >
            <button
              type="button"
              onClick={() => setOpenTitle(open ? null : step.title)}
              aria-expanded={open}
              className="group flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="type-body text-foreground">{step.title}</span>
              {/* Rests pointing right and swings down as the row opens — the
                  direction the copy arrives from, and the same 90° turn at the
                  same 300ms as every other expanding row on the site. */}
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden
                className={`shrink-0 text-muted-foreground transition-[transform,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:text-foreground motion-reduce:transition-none ${
                  open ? "rotate-0" : "-rotate-90"
                }`}
              >
                <path
                  d="M5 8l5 5 5-5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {/* Reveal via grid-rows 0fr → 1fr, so it animates without measuring
                the copy. */}
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
                open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <p className="type-body max-w-[40rem] px-5 pb-4 text-pretty text-muted-foreground">
                  {step.body}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

// How signing up turns the thing above into a real app. Both variants show the
// same three steps in the same place; only the middle one names what gets
// built, since a template and a prompt are built from different things.
function signupSteps(fromTemplate: boolean) {
  return [
    {
      title: "Sign up",
      body: "Create your Assembly workspace: your account, your branding and your team, in one place.",
    },
    {
      title: "The app gets built",
      body: fromTemplate
        ? "Assembly builds the app on your own account, with your branding and your client records already in place."
        : "Assembly builds exactly what the prompt describes, on your own account, with your branding already in place.",
    },
    {
      title: "Use it, or change anything",
      body: "Tell the builder what to adjust in plain English and it rebuilds. No tickets, no code, no waiting on us.",
    },
  ];
}

// The loading shell: the top of the band and nothing in it yet, so a real load
// paints the print rather than a white screen that then turns colour. The mark
// isn't a link — this page has no navigation by design, and a logo that quietly
// leaves the proposal is the one exit we don't want to build.
function ProposalHeaderShell() {
  return <ProposalNav />;
}

/**
 * The page's bar, behaving like the site's nav rather than like a logo printed
 * at the top: sticky, transparent at rest, and settling into the same frosted
 * surface once you scroll — the mask, the blur, the thresholds and the easing
 * are StudioNav's, so the two read as one bar.
 *
 * Not StudioNav itself: that bar's job is the site's links and account actions,
 * and a proposal carries neither. This one is the mark (not a link — a logo
 * that quietly leaves the proposal is the one exit we don't want to build) and
 * the page's single action.
 */
function ProposalNav({ startHref }: { startHref?: string }) {
  const { theme } = useTheme();
  const dark = theme === "dark";
  const [scrolled, setScrolled] = useState(false);

  // StudioNav's numbers, including the hysteresis: with one threshold, the
  // layout nudge that scrolling causes right at the cutoff can re-cross it and
  // flip the state back and forth.
  useEffect(() => {
    const THRESHOLD = 40;
    const MARGIN = 24;
    const onScroll = () =>
      setScrolled((prev) =>
        prev
          ? window.scrollY > THRESHOLD - MARGIN
          : window.scrollY > THRESHOLD + MARGIN,
      );
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const ease =
    "duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none";

  return (
    <header className={`sticky top-0 z-50 transition-colors ${ease}`}>
      {/* The progressive frosted blur, copied from StudioNav: it extends past
          the bar and is masked out below it, so the blur eases off into the
          page instead of ending on a hairline. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 top-0 h-[135%] transition-opacity ${ease} ${
          scrolled ? "opacity-100" : "opacity-0"
        }`}
        style={{
          backdropFilter: "blur(11px)",
          WebkitBackdropFilter: "blur(11px)",
          background: `linear-gradient(to bottom, ${
            dark ? "rgba(14,14,16,0.5)" : "rgba(255,255,255,0.88)"
          } 0%, transparent 100%)`,
          maskImage:
            "linear-gradient(to bottom, #000 0%, #000 42%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, #000 0%, #000 42%, transparent 100%)",
        }}
      />
      <div className={`relative z-10 ${NAV_GUTTER}`}>
        <div
          className={`${NAV_RAIL} ${NAV_ROW} transition-[height] ${ease} ${
            scrolled ? "h-12 lg:h-14" : "h-14 lg:h-16"
          }`}
        >
          <Image
            src="/images/logo-mark.svg"
            alt="Assembly"
            width={22}
            height={22}
            priority
            className="brightness-0 [[data-theme=dark]_&]:invert"
          />
          {/* A step smaller than the closing CTA, which is the one that gets
              the full size: this is the same door, kept within reach. */}
          {startHref && (
            <Link
              href={startHref}
              className="cursor-pointer rounded-lg bg-foreground px-3.5 py-2 text-[0.8125rem] text-background transition-opacity hover:opacity-90"
            >
              Sign up and build
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

// The page ends the way every other page on the site ends: the brand aurora
// rising out of the footer sheet, and here that alone — no rule, no wordmark, no
// small print. A proposal carries no navigation.
function ProposalFooter() {
  const { theme } = useTheme();
  const light = theme !== "dark";

  return (
    <footer
      className={`footer-reveal relative overflow-hidden ${
        light ? "bg-background" : "bg-[#101010]"
      }`}
    >
      {/* Taller than the aurora's own negative pull (-mt-44 / -mt-40), or the
          top of the gradient lands above the footer and overflow-hidden crops
          it. */}
      <div className="h-56 md:h-64" />
      <FooterAurora />
    </footer>
  );
}

function ProposalContent({ catalogue }: { catalogue: Template[] }) {
  const params = useSearchParams();
  const recipient = (params.get("for") ?? "").trim();
  const from = (params.get("from") ?? "").trim();
  const note = (params.get("note") ?? "").trim();
  const promptParam = (params.get("prompt") ?? "").trim();
  const templateSlug = (params.get("template") ?? "").trim();
  // Catalogue first, committed array second. The catalogue is Contentful, so it
  // holds entries that were never committed here — which is exactly what the
  // proposal creator offers, so a link it wrote could name a template this page
  // could not find, and the proposal silently fell back to the blank-canvas
  // prompt. TEMPLATES stays as the floor: a proposal sent before a template left
  // the catalogue still has to resolve.
  const template: Template | undefined = templateSlug
    ? catalogue.find((t) => t.slug === templateSlug) ??
      TEMPLATES.find((t) => t.slug === templateSlug)
    : undefined;

  const { theme } = useTheme();
  const [panelOpen, setPanelOpen] = useState(false);

  // The prompt is editable, so what signup receives is whatever the card says
  // now — not what the link was written with. Seeded once: this page carries no
  // navigation, so the query it mounted with is the query it keeps.
  // Clamped to the same ceiling the field enforces while typing: the query is
  // hand-editable, and maxLength only governs what a person types, so a
  // longer-than-supported prompt could otherwise arrive by link and lose its
  // tail silently when signup trimmed it.
  const [prompt, setPrompt] = useState(
    promptParam.slice(0, MAX_PROMPT_LENGTH) ||
      "A brand-new app, from a blank canvas.",
  );

  // What the headline calls the thing being built: a template's own title, or
  // the name the sender gave the prompt. Capped here as well as in the creator —
  // the query is hand-editable, and a headline is not a place to put a sentence.
  // Shared with the tab title and the Short.io link record, so the headline and
  // the preview name the app the same way.
  const appName = proposalAppName({
    name: params.get("name") ?? undefined,
    template: templateSlug,
    templateTitle: template?.title,
  });
  const headline = appName || "A new app, built for you";

  // Signing up goes straight to onboarding on dashboard, carrying what the
  // proposal was built from — the picked template, or the prompt as the card
  // reads now.
  const startHref = template
    ? templateSignupUrl({
        templateId: template.templateId,
        title: template.title,
        description: template.description,
      })
    : buildSignupUrl(prompt);

  const sender = firstName(from);
  // What this is and who made it, then what happens to it — the reader needs to
  // learn the build isn't fixed, which is what makes the panel above worth
  // reading closely.
  //
  // The template variant doesn't say "template". Being explicit that one was
  // picked off a shelf reads as impersonal for a document somebody sent to one
  // named client, so it's an app that was prepared for them, and the remix line
  // is what carries the fact that it isn't finished work.
  const buildLead = template
    ? `${
        sender ? `${sender} prepared this app for you` : "This app was prepared for you"
      }. Look through what it comes with before signing up. We’ll build exactly that, in your own branded workspace. You can remix and customize it after.`
    : `${
        sender
          ? `${sender} wrote this prompt for you`
          : "This prompt describes the app we’d build"
      }. Update the prompt however you’d like before signing up. We’ll build exactly what’s in it, in your own branded workspace.`;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* The masthead is one printed colour with everything on it drawn in a
          single ink — see --proposal-* in globals.css. Black with white ink in
          both themes. It takes its colour inline rather than from a utility:
          Tailwind compiles an arbitrary hex through a different colour space, and
          the panels drawn in the same colour further down showed up a shade off
          the band. */}
      {/* No rule under the masthead. The band is the page's own ground in both
          themes, so a full-bleed hairline was dividing a surface from itself —
          the space, and the metadata row's own rule, already mark where the
          document starts. */}
      <ProposalNav startHref={startHref} />

      <header
        style={{ backgroundColor: "var(--proposal-field)" }}
        className="relative"
      >
        {/* Padding on the wrapper, rail inside — the same nesting the sections
            below use, so the band's words land on the document's column rather
            than one gutter inside it. */}
        <div className="relative px-6 md:px-10">
          {/* Centred on the document's own rail from md, the way the site's
              other page-level mastheads are — but at a fraction of the height
              the band used to run to, and with the names as one credit row
              rather than as two columns of their own.

              Left-aligned on a phone. At that width a centred display title
              wraps to three or four ragged lines with nothing to centre against,
              and the credit row's two names sat in the middle of a column narrow
              enough that the whole band read as a poster.

              cursor-default across the masthead: there is nothing to type into
              up here, and the text caret the browser shows by default made the
              title and the names read like form fields. Text stays selectable —
              only the pointer changes. */}
          <div
            // With no rule closing the band, its bottom padding is what marks
            // the masthead off from the document — short, it read as the credit
            // row belonging to the first section rather than to the title.
            // No rule at any width: the band is the page's own ground, so a
            // hairline across it divided a surface from itself. Space does the
            // separating, which is why the phone's bottom padding is longer than
            // it was when the rule carried that job.
            className={`${RAIL} cursor-default pb-12 pt-10 text-left md:pb-24 md:pt-14 md:text-center`}
          >
            {/* The title leads, with nothing over it. A "Proposal" eyebrow was
                labelling the page from above the name of the thing it proposes,
                and the two names below already say what kind of document this
                is. */}
            <h1 className="type-display max-w-[20ch] text-balance text-[color:var(--proposal-ink)] md:mx-auto">
              {headline}
            </h1>
            {/* The sender's line is dropped on a phone: under a title that
                already runs to two or three lines there, it pushed the credit
                and the build itself further down for a sentence the page can be
                read without. */}
            {note && (
              <p className="type-lead mt-3 hidden max-w-[32rem] text-pretty text-[color:var(--proposal-ink-soft)] md:mx-auto md:mt-4 md:block">
                {note}
              </p>
            )}

            {/* The two names as one credit row, the way a document credits
                itself — they were two tall columns with their own labels above
                them, big enough to read as a second headline and far enough
                apart to read as unrelated. No rule over them: on a centred band
                a full-width hairline under a centred column of type read as a
                divider between two sections rather than as a credit line. The
                space does the separating. */}
            {recipient && (
              <div className="mt-5 flex flex-wrap items-center gap-x-10 gap-y-4 text-left md:mt-6 md:justify-center">
                <BandName label="Prepared for" name={recipient} />
                {/* The link carries the sender's name only, so their photo is
                    looked back up from it. The recipient is a client and has
                    no photo of ours to find — they keep their initials.
                    Dropped on a phone: who the page was made FOR is the fact
                    worth the width there, and two of these side by side left
                    each one squeezed against the gutters. */}
                {from && (
                  <BandName
                    className="max-md:hidden"
                    label="Prepared by"
                    name={from}
                    avatar={teamAvatar(from)}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* The build itself. A template shows its cover and its summary, a prompt
          shows the prompt — the same panel either way, so the two arrivals are
          the same step of the same document. */}
      {/* Sections are separated by the article page's own step (mt-14 / md:mt-20,
          see app/customers/[slug]) rather than by a marketing section's padding.
          Stacked band-bottom and section-top gutters had put over 200px between
          the title and this heading, and across a void that size the heading
          read as a second page title rather than as the name's subordinate. */}
      <section className="flex-1 px-6 md:px-10">
        {/* On a phone the build comes first and the section's heading and lead
            follow it: the panel IS what the reader opened the link for, and
            under three lines of running text it started below the fold. From md
            the reading order is the document's own again — heading, lead, then
            the thing they describe. */}
        <div className={`${RAIL} flex flex-col pt-12 md:pt-20`}>
          <div className="order-2 mt-10 md:order-1 md:mt-0">
            <h2 className="type-h3">Your custom app</h2>
            <p className="type-lead mt-3 max-w-[45rem] text-pretty text-muted-foreground">
              {buildLead}
            </p>
          </div>

          <div className="order-1 md:order-2 md:mt-10">
            {template ? (
              <TemplateCard
                template={template}
                onSeeDetails={() => setPanelOpen(true)}
              />
            ) : (
              <PromptCard prompt={prompt} onCommit={setPrompt} />
            )}
          </div>
        </div>
      </section>

      {/* How it becomes a real app. No bottom padding: the closing CTA below
          carries its own, the way the site's stacked sections do. */}
      <section className="px-6 md:px-10">
        <div className={`${RAIL} pt-12 md:pt-20`}>
          <h2 className="type-h3">Sign up to build it</h2>
          <p className="type-lead mt-3 max-w-[45rem] text-pretty text-muted-foreground">
            Creating your workspace is what starts the build, and there is
            nothing to install or set up first. The app is yours from the moment
            it exists, on your own account. Here’s how it goes.
          </p>

          <SignupSteps steps={signupSteps(!!template)} />
        </div>
      </section>

      {/* The close, built to the site's closing-CTA shape (see SecurityCta and
          CustomersCta): a centred section with a display headline, one muted
          line and the primary button, and no panel around any of it. It used to
          be a bordered block in the printed colour with the button off to the
          right, which was a CTA shape this site doesn't have anywhere else. The
          only thing kept from it is the copy, which is addressed to whoever the
          page was made for. */}
      <section className="px-6 py-16 text-center md:py-24">
        <h2 className="type-display mx-auto max-w-md text-balance text-foreground md:max-w-2xl">
          Ready{recipient ? `, ${firstName(recipient)}` : ""}?
        </h2>
        {/* text-balance rather than text-pretty. This line runs to two lines on a
            phone, and pretty only rescues a last line of ONE word — it left
            "build above." sitting on its own. Balance evens the two lines
            instead, which is what a short centred standfirst wants. */}
        <p className="type-lead mx-auto mt-4 max-w-sm text-balance text-muted-foreground sm:max-w-xl">
          Signing up creates your workspace and kicks off the build above.
        </p>
        <Link
          href={startHref}
          className="mx-auto mt-8 block w-full max-w-xs rounded-lg bg-foreground px-5 py-2.5 text-center text-sm text-background transition-opacity hover:opacity-90 sm:inline-block sm:w-auto"
        >
          Sign up and build it
        </Link>
      </section>

      <ProposalFooter />

      {template && (
        <TemplateDetailPanel
          template={template}
          open={panelOpen}
          onClose={() => setPanelOpen(false)}
          onStart={() => {
            setPanelOpen(false);
            window.location.href = startHref;
          }}
        />
      )}
    </div>
  );
}

export function ProposalPage({ catalogue }: { catalogue: Template[] }) {
  // The params suspend, and everything on the page depends on them — the shell
  // is the head of the band alone, so a real load paints the frame.
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <ProposalHeaderShell />
        </div>
      }
    >
      <ProposalContent catalogue={catalogue} />
    </Suspense>
  );
}
