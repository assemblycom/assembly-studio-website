"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { TEMPLATES, type Template } from "@/lib/templates";
import {
  MAX_APP_NAME_LENGTH,
  MAX_PROMPT_LENGTH,
  buildSignupUrl,
  templateSignupUrl,
} from "@/lib/constants";
import { FooterAurora } from "@/components/layout/footer";
import { useTheme } from "@/components/theme/theme-provider";
import { MockFit, MOCK_DESIGN_SIZE } from "@/components/templates/mock-fit";
import { TemplateDetailPanel } from "@/components/proposal/template-detail-panel";
import { V69CardMock } from "@/components/home/hero-v71";
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
const NAV_ROW = "flex h-14 cursor-default items-center justify-between lg:h-16";

// The build panel, shared by the prompt and the template so a typed idea and a
// picked template arrive as the same object.
//
// Built like the steps list below it: one outlined container, no fill, its parts
// separated by hairlines rather than by nested surfaces. It used to be a filled
// card with a filled well inside it, which put three tones inside one panel and
// made the same information look heavier than the table a screen down.
//
// mt-10 under the section's lead — the step the article page puts between its
// running text and the media that follows it.
const CARD = "mt-10 overflow-hidden rounded-xl border border-border";
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

// Every small label on the masthead — "Proposal" over the title and the two names'
// own labels. type-eyebrow's size, in PP Mori rather than its mono and in normal
// case rather than its caps: mono read as another document's furniture on top of
// the page's own face, and capitals on a two-word label read as shouting. The
// tracking comes down with the caps, since 0.08em is drawn to open up capitals and
// only looks loose on lowercase.
const BAND_EYEBROW =
  "type-eyebrow normal-case tracking-[0.02em] text-[color:var(--proposal-ink-faint)] [font-family:var(--font-pp-mori)]";

/**
 * A template's name as the headline says it. Gallery names can carry a "New"
 * that belongs to the catalogue rather than to the app itself, and "New client
 * intake" reads as a new intake rather than as the thing being built. Dropped
 * here only: the template keeps its own name everywhere else.
 */
function headlineTitle(title: string) {
  const trimmed = title.replace(/^new\s+/i, "");
  return trimmed === title
    ? title
    : trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

const firstName = (name: string) => name.split(/\s+/)[0] ?? "";

/**
 * "Prepared for" / "Prepared by" — the two names the page opens on, as a pair
 * so it reads as a document that was addressed rather than as a landing page.
 *
 * Both are set identically: the same ink, the same size, the same 28px avatar.
 * The recipient used to take full ink against the sender's softer step, and side
 * by side that read as one of the two being greyed out rather than as a
 * hierarchy — they're a matched pair of facts about the document, so they look
 * like one.
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
    // items-center so the label sits over the pair it names rather than over the
    // full width of a stretched column — the band is centred.
    <div className={`flex flex-col items-center gap-2.5 ${className}`}>
      <p className={BAND_EYEBROW}>{label}</p>
      <div className="flex items-center gap-2.5">
        <OptionAvatar
          option={{ value: name, label: name, avatar }}
          size={28}
          tone="field"
        />
        {/* A step down on a phone. At the desktop 18px, two of these under a
            36px title read as a second headline rather than as the document's
            metadata — the treatment Linear, Notion and OpenAI all land on for a
            prepared-for/by pair at this width. */}
        <span className="type-h4 max-sm:text-[0.9375rem] text-[color:var(--proposal-ink)]">
          {name}
        </span>
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
  appName,
  prompt,
  onCommit,
}: {
  appName: string;
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
    return () => {
      live = false;
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

  return (
    <div className={CARD}>
      <div className={CARD_HEAD}>
        <p className="truncate text-sm text-muted-foreground">{appName}</p>
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
      <div className={CARD_FIELD_INSET}>
        <div
          ref={boxRef}
          className={`${CARD_FIELD} ${
            moreBelow && !editing ? "prompt-fade-bottom" : ""
          }`}
        >
          {editing ? (
            <>
              <label className="sr-only" htmlFor="proposal-prompt">
                The app idea, yours to edit
              </label>
              <textarea
                ref={fieldRef}
                id="proposal-prompt"
                autoFocus
                rows={1}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                spellCheck={false}
                // The same ceiling the creator writes prompts against, and the
                // one buildSignupUrl trims to — without it you could type a
                // prompt here that silently lost its tail on the way to signup.
                maxLength={MAX_PROMPT_LENGTH}
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
                className={`${CARD_PROMPT_TEXT} block w-full resize-none overflow-hidden border-0 bg-transparent p-0 text-foreground outline-none focus-visible:shadow-none focus-visible:outline-none`}
              />
            </>
          ) : (
            <p
              className={`${CARD_PROMPT_TEXT} whitespace-pre-wrap text-pretty text-foreground`}
            >
              {prompt}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Template variant — the same panel, with the template's cover and the
 * paragraph its own catalogue page opens with. Deliberately smaller than the
 * prompt variant's field: a picked template needs recognising, not reading, so
 * it's a picture at thumbnail size beside the summary rather than a full cover
 * with the writing underneath it.
 */
function TemplateCard({
  template,
  dark,
  onSeeDetails,
}: {
  template: Template;
  dark: boolean;
  onSeeDetails: () => void;
}) {
  return (
    <div className={CARD}>
      <div className={CARD_HEAD}>
        <p className="truncate text-sm text-muted-foreground">
          {template.title}
        </p>
        <button type="button" onClick={onSeeDetails} className={CARD_CONTROL}>
          See full details
        </button>
      </div>

      {/* The cover and the writing stay two blocks rather than one panel holding
          both — sharing one, the picture read as part of the paragraph's surface
          instead of as the app being proposed. Now that the card is outlined
          rather than filled, they're divided by a hairline instead of by their
          own fills, which is how the steps list separates its rows. They stack
          on a phone, where the rule runs across instead of down. */}
      <div className="flex flex-col sm:flex-row sm:items-stretch">
        {/* The cover's block. Same framing as the catalogue cards: a square, the
            mock scaled into it, and the hairline drawn over the cover rather than
            as a border, so the widget fills the whole square. The square is
            centred in the block, which stretches to the height of the writing
            beside it. */}
        <div className="flex shrink-0 items-center justify-center border-b border-border p-5 sm:w-48 sm:border-b-0 sm:border-r">
          <div className="relative aspect-square w-full max-w-36">
            <MockFit
              className={`relative aspect-square overflow-hidden rounded-[12px] bg-background [[data-theme=dark]_&]:bg-[#151515] ${
                MOCK_DESIGN_SIZE[template.slug] ?? ""
              }`}
            >
              {/* A picture of an app, not an app: inert and hidden from
                  assistive tech so its mock controls aren't tabbable. */}
              <div
                aria-hidden
                className={`template-mock pointer-events-none [font-family:var(--font-inter),system-ui,sans-serif] ${
                  dark ? "v72-mock-dark" : ""
                }`}
              >
                <V69CardMock slug={template.slug} />
              </div>
            </MockFit>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[12px] border border-border/60 [[data-theme=dark]_&]:border-transparent"
            />
          </div>
        </div>

        {/* The writing's block, on the same padding as the prompt variant's body
            so a template and a typed idea are set identically. */}
        <div className={`${CARD_BODY} min-w-0 flex-1`}>
          <p className="type-body text-pretty text-foreground">
            {template.longDescription}
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
        ? "Assembly builds the template on your own account, with your branding and your client records already in place."
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
  return (
    <header style={{ backgroundColor: "var(--proposal-field)" }}>
      <div className={NAV_GUTTER}>
        <div className={`${NAV_RAIL} ${NAV_ROW}`}>
          <Image
            src="/images/logo-mark.svg"
            alt="Assembly Studio"
            width={22}
            height={22}
            priority
            className="brightness-0 [[data-theme=dark]_&]:invert"
          />
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

function ProposalContent() {
  const params = useSearchParams();
  const recipient = (params.get("for") ?? "").trim();
  const from = (params.get("from") ?? "").trim();
  const note = (params.get("note") ?? "").trim();
  const promptParam = (params.get("prompt") ?? "").trim();
  const templateSlug = (params.get("template") ?? "").trim();
  const template: Template | undefined = templateSlug
    ? TEMPLATES.find((t) => t.slug === templateSlug)
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
  const appName = template
    ? headlineTitle(template.title)
    : (params.get("name") ?? "").trim().slice(0, MAX_APP_NAME_LENGTH);
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
  const buildLead = sender
    ? `${sender} ${
        template ? "picked this template for you" : "wrote this prompt for you"
      }. Sign up below and this app gets built in your own workspace.`
    : `${
        template
          ? "This template is where the build starts"
          : "This prompt describes the app we’d build"
      }. Sign up below and it gets built in your own workspace.`;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* The masthead is one printed colour with everything on it drawn in a
          single ink — see --proposal-* in globals.css. Black with white ink in
          both themes. It takes its colour inline rather than from a utility:
          Tailwind compiles an arbitrary hex through a different colour space, and
          the panels drawn in the same colour further down showed up a shade off
          the band. */}
      {/* A full-bleed hairline closes the masthead. It earns its keep in dark,
          where the band has no colour of its own and the hero would otherwise
          run into the page with nothing but space between them; in light the
          black band's own edge already does the work, so the rule is drawn in
          --border and simply lands on that boundary. */}
      <header
        style={{ backgroundColor: "var(--proposal-field)" }}
        className="relative border-b border-border"
      >
        {/* The site's nav, standing in: the mark where every other page has it,
            and what this page is where the nav's actions would be. The mark is
            not a link — a logo that quietly leaves the proposal is the one exit
            we don't want to build. */}
        {/* No rule under it: the site's nav doesn't carry one, and on this band
            it drew a line across a surface that has no bar to separate. */}
        <div className={NAV_GUTTER}>
          <div className={`${NAV_RAIL} ${NAV_ROW}`}>
            <Image
              src="/images/logo-mark.svg"
              alt="Assembly Studio"
              width={22}
              height={22}
              priority
              className="brightness-0 [[data-theme=dark]_&]:invert"
            />
          </div>
        </div>

        {/* Padding on the wrapper, rail inside — the same nesting the sections
            below use, so the band's words land on the document's column rather
            than one gutter inside it. */}
        <div className="px-6 md:px-10">
          {/* Centred, the way the site's other page-level mastheads are (see the
              security hero): the band is a title page, and the document's
              left-aligned reading starts below it. */}
          {/* cursor-default across the masthead: there is nothing to type into
              up here, and the text caret the browser shows by default made the
              title and the two names read like form fields. Text stays
              selectable — only the pointer changes. */}
          <div
            className={`${RAIL} cursor-default pb-16 pt-10 text-center md:pb-20 md:pt-14`}
          >
            {/* The title leads the band, with what kind of document this is as
                its eyebrow. "Proposal" used to sit opposite the mark in the nav
                row, where it labelled the page from a corner; over the name it
                labels the thing it belongs to. It also can't collide with the
                first section's heading the way an eyebrow repeating the app's
                own name did. */}
            {/* Set in PP Mori rather than type-eyebrow's mono, and in normal
                case rather than its caps: this one sits directly over the title,
                where a mono line read as another document's furniture and caps
                read as shouting a single word. The tracking comes down with the
                caps — 0.08em is drawn to open up capitals and only looks loose on
                lowercase. */}
            <p className="type-eyebrow normal-case tracking-[0.02em] text-[color:var(--proposal-ink-faint)] [font-family:var(--font-pp-mori)]">
              Proposal
            </p>
            <h1 className="type-display mx-auto mt-3.5 max-w-[42rem] text-balance text-[color:var(--proposal-ink)]">
              {headline}
            </h1>
            {note && (
              <p className="type-lead mx-auto mt-6 max-w-[33rem] text-pretty text-[color:var(--proposal-ink-soft)]">
                {note}
              </p>
            )}

            {/* The names go under the title, not over it: they're the
                document's metadata — who it's for, who wrote it — and above the
                name they outranked the one thing the page is about. */}
            {recipient && (
              // No rule between the two: at the column's full height it ran from
              // the label's cap to the name's baseline and aligned with neither,
              // and their own labels already group them. The space does the
              // separating instead, which is why it's wider than it was.
              // One per line on a phone, side by side from sm. Squeezed into two
              // columns at 390px the two pairs nearly touched and the centred
              // masthead lost its composition; stacked, each is a clean
              // label-over-name and the column stays centred.
              <div className="mt-12 flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-center sm:gap-x-14 md:mt-14 md:gap-x-16">
                <BandName label="Prepared for" name={recipient} />
                {/* The link carries the sender's name only, so their photo is
                    looked back up from it. The recipient is a client and has no
                    photo of ours to find — they keep their initials.
                    Hidden on a phone: who the proposal is FOR is the fact worth
                    the space at that width, and stacking both put four lines of
                    metadata under the title. */}
                {from && (
                  <BandName
                    className="max-sm:hidden"
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
        <div className={`${RAIL} pt-14 md:pt-20`}>
          <h2 className="type-h3">Your custom app</h2>
          <p className="type-lead mt-5 max-w-[45rem] text-pretty text-muted-foreground">
            {buildLead}
          </p>

          {template ? (
            <TemplateCard
              template={template}
              dark={theme === "dark"}
              onSeeDetails={() => setPanelOpen(true)}
            />
          ) : (
            <PromptCard
              appName={appName || "Your app"}
              prompt={prompt}
              onCommit={setPrompt}
            />
          )}
        </div>
      </section>

      {/* How it becomes a real app. No bottom padding: the closing CTA below
          carries its own, the way the site's stacked sections do. */}
      <section className="px-6 md:px-10">
        <div className={`${RAIL} pt-14 md:pt-20`}>
          <h2 className="type-h3">Sign up to build it</h2>
          <p className="type-lead mt-5 max-w-[45rem] text-pretty text-muted-foreground">
            Creating your workspace is what starts the build. Here’s how it
            goes.
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
        <p className="type-lead mx-auto mt-5 max-w-sm text-balance text-muted-foreground sm:max-w-xl">
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

export function ProposalPage() {
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
      <ProposalContent />
    </Suspense>
  );
}
