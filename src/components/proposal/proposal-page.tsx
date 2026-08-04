"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  TEMPLATES,
  TEMPLATE_FEATURE_DETAILS,
  type Template,
} from "@/lib/templates";
import { FooterAurora } from "@/components/layout/footer";
import { useTheme } from "@/components/theme/theme-provider";
import { TemplateGallery } from "@/components/templates/template-gallery";
import { MockFit, MOCK_DESIGN_SIZE } from "@/components/templates/mock-fit";
import { TemplateDetailPanel } from "@/components/proposal/template-detail-panel";
import { V69CardMock } from "@/components/home/hero-v71";

// ─────────────────────────────────────────────────────────────────────────
// PROPOSAL — a page made for one person. Someone on the team refined a prompt
// (or picked the template that fits) and sent them this link; it opens with
// their name and closes with a signup that already carries the build.
//
// Everything comes from the URL, so the link IS the proposal:
//   ?for=Jonathan          who it's prepared for (leads the page)
//   ?prompt=…              the refined prompt, shown in full
//   ?template=slug         a template instead, with its details in a panel
//   ?from=Sean Walsh    who sent it
//   ?note=…                one personal line under their name
//
// Unlike /get-started (a sheet on top of the site) this is a full page with no
// navigation at all: there is one thing to do on it. The template's details open
// in a right-hand panel rather than a link, so reading them never costs the page.
// ─────────────────────────────────────────────────────────────────────────

// Full-bleed section rule, spanning the page rather than the content rail —
// the same divider the security page rules its sections off with. It replaced a
// labelled head ("What we'd build" / "The idea"): the label named what the block
// underneath already says for itself.
function SectionRule({ className = "" }: { className?: string }) {
  return (
    <div
      className={`border-t border-border [[data-theme=dark]_&]:border-[#383838] ${className}`}
    />
  );
}

// The app panel is a blue field with a smaller card sitting on it, and that
// smaller card has two faces: the cover on the front, what the template actually
// does on the back. Only the inner card turns — the field stays put, so the flip
// reads as picking the card up rather than as the whole block rotating. It turns
// on a click rather than on hover: a hover flip fires when you're only crossing
// the card on your way down the page, and there is no hover at all on the phone
// this gets read on.
//
// The 3D lives in three places and all three are required: perspective on the
// field (without it the turn is a flat squash), preserve-3d on the rotating
// element so its faces keep their own depth, and backface-visibility on each face
// so the one pointing away is hidden instead of showing through mirrored.
const CARD_FIELD = "#7DA4FF";
// How far the card leans at full reach, and how far away "full reach" is —
// measured in the card's own widths, so the lean maxes out about a card away and
// holds there rather than growing with the size of the window.
const CARD_TILT_DEG = 7;
const CARD_TILT_REACH = 1.4;

// The open-row key for "Built for", which shares its state with the feature rows.
const BUILT_FOR = "Built for";

/**
 * A template's name as the opening sentence says it. Gallery names can carry a
 * "New" that belongs to the catalogue rather than to the app itself, and "New
 * client intake for Ana" reads as a new intake rather than as the thing being
 * built for her. Dropped here only: the template keeps its own name everywhere
 * else.
 */
function headlineTitle(title: string) {
  const trimmed = title.replace(/^new\s+/i, "");
  return trimmed === title
    ? title
    : trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function TemplateFlipCard({
  template,
  dark,
  startHref,
}: {
  template: Template;
  dark: boolean;
  startHref: string;
}) {
  const [flipped, setFlipped] = useState(false);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const tiltRef = useRef<HTMLDivElement | null>(null);

  // The lean follows the pointer anywhere on the page, not just over the card.
  // Written straight to the style rather than through state: this fires on every
  // pointer move, and re-rendering the card each time would be the whole page.
  // The tilt sits on its own wrapper so it composes with the flip instead of
  // fighting it for the transform.
  useEffect(() => {
    if (
      window.matchMedia("(hover: none)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const onMove = (event: PointerEvent) => {
      const host = hostRef.current;
      const tilt = tiltRef.current;
      if (!host || !tilt) return;
      const box = host.getBoundingClientRect();
      if (!box.width) return;
      const reach = box.width * CARD_TILT_REACH;
      const clamp = (n: number) => Math.max(-1, Math.min(1, n));
      const x = clamp((event.clientX - (box.left + box.width / 2)) / reach);
      const y = clamp((event.clientY - (box.top + box.height / 2)) / reach);
      tilt.style.transform = `rotateY(${x * CARD_TILT_DEG}deg) rotateX(${
        -y * CARD_TILT_DEG
      }deg)`;
      // The light source is where the pointer is, so the specular travels the
      // opposite way to the lean, the way a reflection slides across glass.
      host.style.setProperty("--sheen-pos", `${50 - x * 50}%`);
      host.style.setProperty("--sheen-x", `${50 + x * 55}%`);
      host.style.setProperty("--sheen-y", `${50 + y * 55}%`);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  // The inner card: the page's own surface, so it stays legible in either theme
  // against the one fixed colour on the block.
  const faceCls =
    "card-sheen absolute inset-0 flex flex-col overflow-hidden rounded-2xl bg-background p-4 shadow-[0_18px_40px_-24px_rgba(16,24,40,0.35)] [backface-visibility:hidden] [-webkit-backface-visibility:hidden] md:p-5 [[data-theme=dark]_&]:bg-[#151515]";
  // The framed area each face fills — the cover on one side, the words on the
  // other — so the two faces are the same composition with different contents.
  const wellCls =
    "mt-3 min-h-0 flex-1 overflow-hidden rounded-xl border border-black/[0.06] bg-[#FAFAFA] [[data-theme=dark]_&]:border-white/[0.06] [[data-theme=dark]_&]:bg-white/[0.03]";
  // The card's one action, in the brand lime. It looks like the control it is:
  // the lime panel opens signup, and the rest of the card turns over.
  const actionCls =
    "mt-4 flex h-10 shrink-0 items-center justify-center rounded-lg bg-[#D9ED92] text-sm text-[#262626]";
  // The whole field is the control, as a transparent button laid over it. The
  // rotating element itself can't be the button: the cover mock contains buttons
  // of its own, and a button inside a button is invalid — the parser hoists the
  // inner ones out and the second face goes with them.
  const hitCls =
    "absolute inset-0 z-10 cursor-pointer rounded-[20px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

  return (
    <div
      ref={hostRef}
      className="relative aspect-square w-full rounded-[20px] px-[19%] py-[9%] [perspective:1400px]"
      style={{ backgroundColor: CARD_FIELD }}
    >
      <div
        ref={tiltRef}
        className="h-full w-full transition-transform duration-300 ease-out [transform-style:preserve-3d] motion-reduce:transition-none"
      >
        <div
          className="relative h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] [transform-style:preserve-3d] motion-reduce:transition-none"
          style={{ transform: flipped ? "rotateY(180deg)" : undefined }}
        >
          {/* Front: the cover, on the template's own design size so it fills the
              well instead of sitting at 288px in the middle of it. */}
          <div className={faceCls}>
            <p className="type-caption shrink-0 text-muted-foreground">
              You&rsquo;re building
            </p>
            <div className={`${wellCls} flex items-center justify-center`}>
              {/* The covers are drawn square and MockFit scales them off their
                  width, so the frame they scale into has to be driven by the
                  well's height — given the well's full width they would come out
                  as tall as the card is wide and overflow it. */}
              <div className="aspect-square h-full max-w-full">
                {/* relative is load-bearing: MockFit centres the cover with
                    position:absolute, so without it the cover centres on the
                    card face and sits low in the well. */}
                <MockFit
                  className={`relative h-full ${MOCK_DESIGN_SIZE[template.slug] ?? ""}`}
                >
                  {/* The cover is a picture of an app, not an app: hidden from
                      assistive tech and inert, so its mock controls aren't
                      tabbable. Its own tile fill is dropped so it sits on the
                      well rather than laying a second card over it. */}
                  <div
                    aria-hidden
                    className={`template-mock pointer-events-none [font-family:var(--font-inter),system-ui,sans-serif] [&>*]:!bg-transparent [&>*]:!bg-none ${
                      dark ? "v72-mock-dark" : ""
                    }`}
                  >
                    <V69CardMock slug={template.slug} />
                  </div>
                </MockFit>
              </div>
            </div>
            <p className="type-body mt-3 shrink-0 text-foreground">
              {template.title}
            </p>
            <p className="type-caption shrink-0 text-muted-foreground">
              {template.description}
            </p>
            <div aria-hidden className={actionCls}>
              Build
            </div>
          </div>

          {/* Back: the paragraph that used to sit under the card, plus what's in
              it as chips, which is what you turn it over for. */}
          <div className={`${faceCls} [transform:rotateY(180deg)]`}>
            <p className="type-caption shrink-0 text-muted-foreground">
              About this template
            </p>
            <div className={`${wellCls} flex flex-col p-4 max-md:p-3`}>
              {/* The paragraph takes whatever the face has left after the chips,
                  rather than a fixed number of lines: a phone gives it four or
                  five, a wide screen the whole thing, and neither has to be
                  guessed at. Where it does run past the space, a mask fades the
                  last line out — the same treatment as the prompt field, and the
                  reason this isn't a line-clamp: clamping ended it on a cut word
                  and an ellipsis. It's set a step down on mobile so more of it
                  fits, and the whole text is in the details panel either way. */}
              <div className="relative min-h-0 flex-1 overflow-hidden [mask-image:linear-gradient(to_bottom,#000_calc(100%-1.75rem),transparent)] md:overflow-y-auto md:[mask-image:none]">
                {/* The mobile step down is written as utilities rather than as
                    type-caption: the .type-* classes live in the components
                    layer, so a variant can't be put in front of one. */}
                <p className="type-body text-pretty text-foreground max-md:text-[0.8125rem] max-md:leading-[1.5]">
                  {template.longDescription}
                </p>
              </div>
              {/* Mobile keeps the first two chips: enough to read as a list of
                  what's in it, where all of them wrapped to three rows and pushed
                  themselves off the bottom of the well. The full set is listed in
                  "What's included" a screen below. */}
              {template.features.length > 0 && (
                <ul className="mt-4 flex shrink-0 flex-wrap gap-1.5 max-md:mt-2 max-md:[&>li:nth-child(n+3)]:hidden">
                  {template.features.map((feature) => (
                    <li
                      key={feature}
                      // Lifted off the well with a fill lighter than it, in
                      // either theme, and set in caps at a step down in size so
                      // the mono reads as a tag rather than as running text.
                      className="rounded-sm border border-black/[0.08] bg-white px-2 py-1 text-[11px] uppercase leading-none tracking-[0.04em] text-muted-foreground [font-family:var(--font-diatype-mono),ui-monospace,monospace] [[data-theme=dark]_&]:border-white/[0.1] [[data-theme=dark]_&]:bg-white/[0.07]"
                    >
                      {feature}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div aria-hidden className={actionCls}>
              Build
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setFlipped(!flipped)}
        aria-label={
          flipped ? `Show the ${template.title} app` : `About ${template.title}`
        }
        className={hitCls}
      />

      {/* Build reads as the card's action, so it behaves like one: this link
          sits over that row, above the flip target, and opens the same signup
          sheet as every other action on the page. It can't live inside a face —
          the flip target is laid over both of them — so its box is written from
          the same paddings the faces use (the field's px-[19%]/py-[9%] plus the
          face's own p-4 / md:p-5), and the two faces put Build in the same place
          so one link serves either side. */}
      <Link
        href={startHref}
        aria-label={`Build ${template.title}`}
        className="absolute bottom-[calc(9%+1rem)] left-[calc(19%+1rem)] right-[calc(19%+1rem)] z-20 h-10 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground md:bottom-[calc(9%+1.25rem)] md:left-[calc(19%+1.25rem)] md:right-[calc(19%+1.25rem)]"
      />
    </div>
  );
}

/**
 * Template variant — the point is to see the thing, so the app takes the wide
 * column and the specifics sit in a rail beside it: the title and what it does
 * lead, the app fills the frame, and what's included reads as a list of rows
 * rather than a paragraph. Real screenshots when the template has them;
 * otherwise the same widget cover the gallery cards use, because a designed mock
 * reads as the app and an empty placeholder frame reads as a missing image.
 */
function TemplateBuild({
  template,
  onSeeDetails,
  startHref,
}: {
  template: Template;
  onSeeDetails: () => void;
  startHref: string;
}) {
  const { theme } = useTheme();
  const hasScreenshots = Boolean(template.images?.length);
  const industries = template.industries ?? [];
  // One row open at a time, as in the prompt rail. "Built for" shares the state
  // with the features, so opening it closes whichever feature was open.
  const [openFeature, setOpenFeature] = useState<string | null>(null);

  return (
    <>
      {/* The app wide on the left, the specifics in a rail on the right, split by
          a rule. The section's vertical padding lives on the two columns rather
          than on the section, so the rule between them runs the full height of
          the block and meets the page-width rules above and below it — as a
          border on the rail alone it started and stopped with the rail's own
          content, floating between the two horizontals. */}
      <div className="grid lg:grid-cols-[1.55fr_1fr]">
        <div className="min-w-0 pb-10 pt-14 max-md:pb-0 max-md:pt-0 md:pt-20 lg:pb-20 lg:pr-14">
          {/* No heading over the card at any width: the page opens on the app's
              name and what it does, and repeating both above the cover said the
              same two things twice on one screen. The card carries its own title
              anyway, as part of the picture of the app. */}
          <div>
            {hasScreenshots ? (
              <TemplateGallery
                title={template.title}
                images={template.images}
                previewCount={template.previewCount}
              />
            ) : (
              <TemplateFlipCard
                template={template}
                dark={theme === "dark"}
                startHref={startHref}
              />
            )}
          </div>
        </div>

        {/* The rail: what's in it, who it's for, and the way into the detail —
            rows on hairlines rather than bulleted prose, so it scans. */}
        {/* On a phone the rail follows the title it belongs to, so the two columns'
            own padding stacked into a gap wider than the block itself. Mobile pulls
            them together and lets the card's outline do the separating. */}
        <aside className="min-w-0 pb-14 pt-10 max-md:pt-5 md:pb-20 lg:border-l lg:border-border lg:pl-14 lg:pt-20">
          {/* On a phone these two facts are loose blocks on the page, a screen
              below the card they describe. One outline around the pair holds them
              together as the app's spec — the same card the prompt variant's rail
              sits in. Wide layouts keep them open against the column rule. */}
          {/* With the label gone on mobile the card's own top padding sat on top of
              the first row's, so the list started low; the rows carry their own
              space, so the card only keeps a little. A tighter radius too — at 20px
              the corners read as a card of their own rather than as a frame around
              a table. */}
          <div className="max-md:rounded-[14px] max-md:border max-md:border-border max-md:p-4 max-md:pb-0 max-md:pt-1.5">
            {template.features.length > 0 && (
              <>
                {/* Desktop only, like the prompt rail's own label: inside the card
                    the rows sit under the title they answer and read without being
                    announced. */}
                <p className="type-caption text-muted-foreground max-md:hidden">
                  What&rsquo;s included
                </p>
                {/* Body rather than a heading step: these are the answers to the
                    label above them, not headings of their own — at 18px each row
                    competed with the section's own title. Inside the card the rows
                    run the full width, and the closing hairline is what separates
                    them from the "Built for" row under them.
                    The rows open, the same as the prompt rail's: a feature name
                    alone is a promise, and the line under it is what makes the
                    promise mean something. Same component, so the two variants
                    behave identically. A feature with no detail written yet still
                    reads as a row, it just doesn't open. */}
                {/* Inside the card the label already has the outline above it, so
                    the list's own opening hairline is a second line a few pixels
                    under it. Dropped on mobile, and the rows pull up to sit with
                    the label the way "Built for" does with its value. */}
                <ul className="mt-3 border-t border-border max-md:-mx-4 max-md:mt-0 max-md:border-t-0">
                  {template.features.map((feature) => {
                    const detail = TEMPLATE_FEATURE_DETAILS[feature];
                    return detail ? (
                      <PromptStep
                        key={feature}
                        label={feature}
                        detail={detail}
                        open={openFeature === feature}
                        onToggle={() =>
                          setOpenFeature(
                            openFeature === feature ? null : feature,
                          )
                        }
                      />
                    ) : (
                      <li
                        key={feature}
                        className="type-body border-b border-border py-3 text-foreground max-md:px-4"
                      >
                        {feature}
                      </li>
                    );
                  })}
                </ul>
              </>
            )}

            {/* Who it's for, as one more row that opens: a label with its answer
                underneath behaves the same as every row above it, and on a phone
                the card reads as one continuous table rather than a list with a
                labelled block bolted under it. Its own list, so it stays a fact
                about the firm rather than another thing that's included, and on
                mobile it picks up where the features left off. */}
            {industries.length > 0 && (
              // No top margin and no opening hairline of its own: the features
              // list already closes with one, so on desktop this added a second
              // line with an empty band between them. It just carries on from the
              // rows above, at both widths.
              <ul className="max-md:-mx-4 max-md:[&>li:last-child]:border-b-0">
                <PromptStep
                  label="Built for"
                  detail={`${industries.join(", ")} firms.`}
                  open={openFeature === BUILT_FOR}
                  onToggle={() =>
                    setOpenFeature(openFeature === BUILT_FOR ? null : BUILT_FOR)
                  }
                />
              </ul>
            )}
          </div>

          <button
            type="button"
            onClick={onSeeDetails}
            className="mt-8 flex h-11 items-center gap-2 rounded-lg border border-foreground/20 px-5 text-sm text-foreground transition-colors hover:bg-foreground/5"
          >
            See full details
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden
              className="text-muted-foreground"
            >
              <path
                d="M6 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </aside>
      </div>
    </>
  );
}

// What signing up does, for the prompt variant's rail — the counterpart to the
// template's "What's included". A prompt has no feature list, but it does have a
// sequence, and saying it in three rows fills the rail the same way. Each row
// opens: three labels alone are a promise, and the sentence under them is what
// makes the promise mean something. The template rail stays flat, since its rows
// are features that say themselves.
const PROMPT_NEXT = [
  {
    label: "Built in your workspace",
    detail:
      "Assembly builds the app on your own account, with your branding and your client records already in place.",
  },
  {
    label: "Refined by asking",
    detail:
      "Tell the builder what to change and it rebuilds. No tickets, no code, no waiting on us.",
  },
  {
    label: "Published to your portal",
    detail:
      "When it reads right, publish it. Your clients open it inside the portal they already sign into.",
  },
];

// One row of that sequence, built to the same shape as the site's divided FAQ
// rows: a hairline list, a chevron that turns a quarter rather than flipping, and
// a drawer that animates on grid-rows so nothing has to be measured.
function PromptStep({
  label,
  detail,
  open,
  onToggle,
}: {
  label: string;
  detail: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <li className="border-b border-border max-md:px-4">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="group flex w-full cursor-pointer items-center justify-between gap-6 py-3 text-left"
      >
        <span className="type-body text-foreground">{label}</span>
        <svg
          width="18"
          height="18"
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
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          {/* Body, not caption: this is a sentence to read, and the site's own
              accordion (the FAQ) sets question and answer at the same step,
              separating them by colour rather than by size. */}
          <p className="type-body pb-4 pr-8 text-muted-foreground">{detail}</p>
        </div>
      </div>
    </li>
  );
}

/**
 * Prompt variant — the same two-column shape as the template variant, so the two
 * proposals read as one page with different contents: the idea on the left where
 * the app screen would be, the sequence in the rail where the feature list would
 * be. The idea is a real field — nothing here is saved anywhere, but being able
 * to touch the words is what says the build isn't fixed, and whatever it says at
 * signup is what rides along. It's drawn as a field (a bordered panel that
 * lightens on focus, like the site's other inputs) rather than as a rule down the
 * left edge, which read as a pull quote — something to admire, not edit.
 */
function PromptBuild({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  // Both cues are for someone who hasn't touched the field yet, so they both go
  // once the caret is in it. Tracked in state rather than with peer-focus: the
  // tooltip shows on hover and hides on focus, and leaving which of those two
  // utilities wins to Tailwind's class order is how that ends up flickering.
  const [editing, setEditing] = useState(false);
  const [hovering, setHovering] = useState(false);
  // One row of the sequence open at a time, so opening one closes the last.
  const [openStep, setOpenStep] = useState<string | null>(null);
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const tipRef = useRef<HTMLSpanElement | null>(null);

  // The tooltip rides next to the cursor rather than sitting above the box, so
  // it answers where you're already looking. Only its visibility goes through
  // state; the position is written to the node, since it moves every frame.
  const trackTip = (event: React.PointerEvent<HTMLTextAreaElement>) => {
    const field = fieldRef.current;
    const tip = tipRef.current;
    if (!field || !tip) return;
    const box = field.getBoundingClientRect();
    tip.style.left = `${event.clientX - box.left + 14}px`;
    tip.style.top = `${event.clientY - box.top + 18}px`;
  };

  return (
    // On a phone the two columns stack, and two separately outlined blocks read
    // as two unrelated things. One outline around the pair holds them together as
    // the proposal: the prompt, then what happens to it. The field drops its own
    // border inside that (its fill is enough) so there is only ever one edge.
    // Wide layouts keep the two columns and the rule between them.
    <div className="grid max-md:my-10 max-md:rounded-[20px] max-md:border max-md:border-border max-md:p-4 lg:grid-cols-[1.55fr_1fr]">
      <div className="min-w-0 pb-10 pt-14 max-md:pb-6 max-md:pt-0 md:pt-20 lg:pb-20 lg:pr-14">
        {/* Desktop only. On a phone the field is the whole screen the moment you
            scroll past the name, so a heading and a line above it are two thirds
            of the first view spent saying what the field plainly is. */}
        <div className="hidden md:block">
          <h2 className="type-h2">Here&rsquo;s your prompt</h2>
          <p className="type-lead mt-3 max-w-xl text-muted-foreground">
            Make any edits before we build it.
          </p>
        </div>

        {/* Mobile only. The heading above is desktop-only, so on a phone the
            field arrives with nothing naming it: one caption line says what the
            box is and that it's editable, which is the part touch can't get
            from the hover tooltip. */}
        <p className="type-caption text-muted-foreground md:hidden">
          Your prompt, yours to edit
        </p>

        <div ref={fieldRef} className="group relative max-md:mt-2 md:mt-10">
          <label className="sr-only" htmlFor="proposal-prompt">
            The app idea, yours to edit
          </label>
          {/* Framed like the template's app panel so the two variants sit at the
              same weight. What says "editable" is the field itself: a surface
              lifted off the page the way an input is, and a border that steps up
              on hover and again on focus. Inside the mobile card the border is
              gone (it read as a second edge a few pixels off the card's own), so
              being active is said with the fill instead: one step of tone, which
              is as much as it needs when the caret is already in there. The pencil sits with the label above
              instead of inside the corner, where it had to be paid for with a
              wide right padding that ragged every line of the prompt.
              field-sizing grows the box with the words rather than trapping a
              short prompt behind a scrollbar, but it grows without limit, and a
              long prompt turned the field into a wall of text that pushed the
              signup off the screen. So it grows to a cap and scrolls inside after
              that: a fixed 28rem on desktop, and a share of the viewport on
              mobile, where 28rem would be most of the screen. */}
          <textarea
            id="proposal-prompt"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onFocus={() => setEditing(true)}
            onBlur={() => setEditing(false)}
            // Touch has no hover and no cursor to hang a tooltip off, so the
            // pointer type decides whether the hint exists at all.
            onPointerEnter={(event) => {
              if (event.pointerType === "touch") return;
              trackTip(event);
              setHovering(true);
            }}
            onPointerMove={trackTip}
            onPointerLeave={() => setHovering(false)}
            spellCheck={false}
            className="type-h4 min-h-[13rem] w-full cursor-text resize-none scrollbar-slim overflow-y-auto rounded-[20px] border border-foreground/20 bg-[#FAFAFA] p-6 pb-12 text-foreground outline-none transition-colors [field-sizing:content] hover:border-foreground/30 focus:border-foreground/40 max-md:max-h-[55vh] max-md:rounded-2xl max-md:border-0 max-md:p-4 max-md:pb-10 max-md:text-base max-md:focus:bg-[#F2F2F2] md:max-h-[28rem] md:p-7 md:pb-14 [[data-theme=dark]_&]:bg-[#161616] [[data-theme=dark]_&]:max-md:focus:bg-[#1F1F1F]"
          />
          {/* Says in words what the field only implies, in the same tooltip the
              pricing table uses (bordered, on the page surface) but tracking the
              cursor. Pointer-only by nature, so the sr-only label above carries
              the same fact for anyone not using one. */}
          <span
            ref={tipRef}
            role="tooltip"
            className={`pointer-events-none absolute left-0 top-0 z-30 whitespace-nowrap rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-muted-foreground shadow-md ${
              hovering && !editing ? "block" : "hidden"
            }`}
          >
            Feel free to edit this
          </span>
          {/* A prompt longer than the cap scrolls inside the field, and the last
              visible line was sliced clean through by the bottom edge, which
              reads as broken rather than as "there is more". This fades it into
              the field's own fill instead. Both ends of the gradient are the fill
              colour, one at zero alpha: fading to `transparent` interpolates
              through a different tone, and the edge of this box showed up as a
              second border along the bottom. On desktop it sits a pixel inside the
              field so it covers the fill and not the border, with a radius a pixel
              under the field's to match the curve there; on mobile the field has no
              border, so it goes flush to the edge. The field carries extra
              bottom padding so a short prompt never ends underneath it. */}
          <div className="pointer-events-none absolute inset-x-px bottom-px h-14 rounded-b-[19px] bg-[linear-gradient(to_top,#FAFAFA_0%,#FAFAFA00_100%)] max-md:inset-x-0 max-md:bottom-0 max-md:h-12 max-md:rounded-b-2xl [[data-theme=dark]_&]:bg-[linear-gradient(to_top,#161616_0%,#16161600_100%)]" />
        </div>
      </div>

      <aside className="min-w-0 pb-14 pt-10 max-md:pb-0 max-md:pt-0 md:pb-20 lg:border-l lg:border-border lg:pl-14 lg:pt-20">
        {/* Mobile drops the label: inside one outlined card the rows sit
            directly under the prompt, and the sequence reads without being
            announced. */}
        <p className="type-caption max-md:hidden text-muted-foreground">
          What happens next
        </p>
        <ul className="mt-3 border-t border-border max-md:-mx-4 max-md:mt-0 max-md:[&>li:last-child]:border-b-0">
          {PROMPT_NEXT.map((step) => (
            <PromptStep
              key={step.label}
              label={step.label}
              detail={step.detail}
              open={openStep === step.label}
              onToggle={() =>
                setOpenStep(openStep === step.label ? null : step.label)
              }
            />
          ))}
        </ul>
      </aside>
    </div>
  );
}

function ProposalHeader() {
  return (
    // The mark, and nothing else. It isn't a link: this page has no navigation
    // by design, and a logo that quietly leaves the proposal is the one exit we
    // don't want to build. Nothing on the right either — a "Proposal" label
    // there only named what the page already says in full underneath it.
    <header className="flex h-16 items-center px-6 md:h-20 md:px-10">
      <Image
        src="/images/logo-mark.svg"
        alt="Assembly Studio"
        width={22}
        height={22}
        priority
        className="[[data-theme=dark]_&]:brightness-0 [[data-theme=dark]_&]:invert"
      />
    </header>
  );
}

// The page ends the way every other page on the site ends: the brand aurora
// rising out of the footer sheet. Here it's the aurora and nothing else — no
// rule, no wordmark, no small print. A proposal carries no navigation, and the
// two caption lines that were here only repeated what the page already says.
// The `footer-reveal` class tones the sheet per theme; `FooterAurora` brings its
// own breathe animation and reaches up under the sheet on a mask.
function ProposalFooter() {
  const { theme } = useTheme();
  const light = theme !== "dark";

  return (
    <footer
      className={`footer-reveal relative overflow-hidden ${
        light ? "bg-background" : "bg-[#101010]"
      }`}
    >
      {/* Holds the aurora off the content above it, and — since the aurora is
          pulled up by a negative margin of its own (-mt-44 / -mt-40) — has to be
          taller than that pull, or the top of the gradient lands above the
          footer's top edge and `overflow-hidden` crops it. The old 128/160px
          spacer was exactly at (and on mobile under) the pull, so the gradient
          was cut off at the top. */}
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
  const prompt = (params.get("prompt") ?? "").trim();
  const templateSlug = (params.get("template") ?? "").trim();
  const template: Template | undefined = templateSlug
    ? TEMPLATES.find((t) => t.slug === templateSlug)
    : undefined;


  // The prompt variant is editable, so what signup receives is whatever the
  // field says now — not what the link was written with. Seeded once: this page
  // carries no navigation, so the query it mounted with is the query it keeps.
  const [draft, setDraft] = useState(
    prompt || "A brand-new app, from a blank canvas.",
  );

  const [panelOpen, setPanelOpen] = useState(false);
  const startRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  // Signing up is the same sheet the landing page and the templates gallery
  // open: /get-started intercepted as a modal over whatever you were reading,
  // carrying what you arrived with. The prompt variant is editable, so the link
  // is built from the field as it reads now rather than from the query the page
  // mounted with. The name rides along so the sheet greets them too.
  const startParams = new URLSearchParams(
    template ? { template: template.slug } : { prompt: draft },
  );
  if (recipient) startParams.set("for", recipient);
  const startHref = `/get-started?${startParams.toString()}`;

  // The floating CTA is only useful while the closing one is off screen; once
  // it's in view the bar is a second copy of the button sitting on top of the
  // first one.
  const [startInView, setStartInView] = useState(false);
  useEffect(() => {
    const el = startRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      ([entry]) => setStartInView(entry.isIntersecting),
      { rootMargin: "0px 0px -25% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Every other CTA on the page opens the same sheet. Pushed rather than
  // linked so the details panel can close itself on the way out.
  const goToSignup = () => {
    setPanelOpen(false);
    router.push(startHref);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ProposalHeader />

      {/* Who it's for. It opens on the name alone — no "Prepared for" label above
          it; a page addressed to one person doesn't need to announce that it is.
          Each step down from there is a clear step: the name is the only
          display-scale thing on the page, the note sits under it, and the sender
          is one quiet line. */}
      <section className="px-6 pb-12 pt-10 text-center md:px-10 md:pb-20 md:pt-20">
        <div className="mx-auto w-full max-w-2xl">
          {/* One sentence: what it is and who it's for. The template variant knows
              the app's name, so the opening says it rather than making the reader
              scroll to the build section to find out; the prompt variant has no
              name to say, so it opens on the recipient alone. Balanced and capped
              at the column, since a long template name plus a long name is two
              lines. */}
          <h1 className="type-display text-balance">
            {template
              ? recipient
                ? `${headlineTitle(template.title)} for ${recipient}`
                : headlineTitle(template.title)
              : recipient || "you"}
          </h1>

          {/* The site's hero lockup: display, then a lead line at mt-6 (customers,
              pricing, and security heroes all read this way). It was a type-h4 at
              one point, which is a heading step doing a subtitle's job, and the
              sender sat at mt-8, the gap the other heroes keep for their action. */}
          {note && <p className="type-lead mt-6 text-muted-foreground">{note}</p>}

          {from && (
            <p className="type-caption mt-6 text-muted-foreground">
              From <span className="text-foreground">{from}</span>
            </p>
          )}
        </div>
      </section>

      {/* Desktop only. On a phone what follows leads with its own edge — the
          prompt variant's outline, the template variant's card — and a page rule
          a few pixels above it reads as a second one. */}
      <SectionRule className="max-md:hidden" />

      {/* The build. Each variant gets the shape that suits it: the template one
          runs wide with a rail of specifics, the prompt one runs narrow and
          large. Both are ruled off above rather than labelled. */}
      {/* No vertical padding here: both variants put it on their two columns
          instead, so the rule between the columns runs the full height of the
          section and meets the page-width rules above and below. */}
      <section className="flex-1 px-6 md:px-10">
        <div className="mx-auto max-w-6xl">
          {template ? (
            <TemplateBuild
              template={template}
              startHref={startHref}
              onSeeDetails={() => setPanelOpen(true)}
            />
          ) : (
            <PromptBuild value={draft} onChange={setDraft} />
          )}
        </div>
      </section>

      <SectionRule className={template ? "" : "max-md:hidden"} />

      {/* Closing CTA, built to the same shape as the site's other closing CTAs
          (see SecurityCta): headline, a line of body copy carrying what happens
          when you sign up, then the action. The signup itself is the sheet the
          rest of the site opens, so what used to be an inline form here is one
          button. Extra bottom padding clears the floating CTA on the way down. */}
      <section className="px-6 pb-28 pt-16 text-center md:pb-32 md:pt-24">
        <div ref={startRef} id="start">
          <h2 className="type-display mx-auto max-w-md text-balance text-foreground md:max-w-2xl">
            {template ? "It’s ready when you are" : "Let’s build it"}
          </h2>
          <p className="type-lead mx-auto mt-5 max-w-sm text-pretty text-muted-foreground sm:max-w-xl">
            {template
              ? "Sign up and it’s waiting in your workspace."
              : "Sign up and we’ll build it in your workspace."}
          </p>
          <div className="mx-auto mt-8 flex w-full max-w-xs flex-col items-stretch gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:items-center sm:justify-center">
            <Link
              href={startHref}
              className="rounded-lg bg-foreground px-5 py-2.5 text-center text-sm text-background transition-opacity hover:opacity-90"
            >
              {/* The label stays fixed: the name is whatever the link was written
                  with, and a long one turned the button into a paragraph. The page
                  is already addressed to them at the top. */}
              Get started
            </Link>
          </div>
        </div>
      </section>

      <ProposalFooter />

      {/* The signup is now at the foot of the page at every width, so the action
          floats until you reach it on desktop too — it used to be mobile-only,
          because a sticky rail carried it on wide screens. Same treatment as the
          template sheet's action bar; the button is capped rather than
          full-bleed once there's room for it. */}
      {/* The bar separates itself from the page by blurring what's behind it
          rather than by laying a background-coloured scrim over it: the scrim
          landed on the footer aurora as a dark wash across the colour. The blur
          is masked so it fades out upward instead of ending on a hard edge. */}
      <div
        className={`pointer-events-none fixed inset-x-0 bottom-0 z-40 pb-4 pt-12 backdrop-blur-xl transition-opacity duration-300 [mask-image:linear-gradient(to_top,#000_60%,transparent)] [-webkit-mask-image:linear-gradient(to_top,#000_60%,transparent)] ${
          startInView ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="pointer-events-auto mx-auto max-w-xs px-6 sm:max-w-sm">
          <Link
            href={startHref}
            tabIndex={startInView ? -1 : 0}
            aria-hidden={startInView}
            className="flex h-12 w-full items-center justify-center rounded-lg bg-foreground px-5 text-sm text-background"
          >
            Get started
          </Link>
        </div>
      </div>

      {template && (
        <TemplateDetailPanel
          template={template}
          open={panelOpen}
          onClose={() => setPanelOpen(false)}
          onStart={goToSignup}
        />
      )}
    </div>
  );
}

export function ProposalPage() {
  // The params suspend, and everything on the page depends on them — the shell
  // is the header alone, so a real load paints the frame instead of a blank.
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <ProposalHeader />
        </div>
      }
    >
      <ProposalContent />
    </Suspense>
  );
}
