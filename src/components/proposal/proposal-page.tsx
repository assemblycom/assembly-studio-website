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
import {
  MAX_APP_NAME_LENGTH,
  buildSignupUrl,
  templateSignupUrl,
} from "@/lib/constants";
import { FooterAurora } from "@/components/layout/footer";
import { useTheme } from "@/components/theme/theme-provider";
import { MockFit, MOCK_DESIGN_SIZE } from "@/components/templates/mock-fit";
import { TemplateDetailPanel } from "@/components/proposal/template-detail-panel";
import { V69CardMock } from "@/components/home/hero-v71";
import { OptionAvatar } from "@/components/ui/select-menu";

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
// A full page rather than a sheet on top of the site: it has no
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
// Light prints the band in the brand blue, dark in the brand lime, with the ink
// on it flipping to black — see --proposal-* in globals.css.
const CARD_FIELD = "var(--proposal-field)";

// The card's parts, shared by the template's flip card and the prompt's card so
// the two arrivals are the same object with different contents.
// The face: the page's own surface, so it stays legible in either theme against
// the one fixed colour on the block.
//
// Whatever uses this MUST position the face itself (`relative`, or the flip
// card's `absolute inset-0`). `.card-sheen`'s shading and specular are laid on
// with `position:absolute; inset:0`, so on a static face they resolve against
// the field behind it and paint the sheen across the whole blue panel — which
// showed up as a faintly lighter rectangle around the card.
const CARD_FACE =
  "card-sheen flex flex-col overflow-hidden rounded-2xl bg-background p-4 shadow-[0_18px_40px_-24px_rgba(16,24,40,0.35)] md:p-5 [[data-theme=dark]_&]:bg-[#151515]";
// The framed area the face fills — the cover, the words, or the prompt.
const CARD_WELL =
  "mt-3 min-h-0 flex-1 overflow-hidden rounded-xl border border-black/[0.06] bg-[#FAFAFA] [[data-theme=dark]_&]:border-white/[0.06] [[data-theme=dark]_&]:bg-white/[0.03]";
// The card's one action, in the brand colour the band isn't: lime on the light
// band's blue, blue on the dark band's lime. Matching the field it sits on would
// make the button read as a hole in the card rather than as a control.
const CARD_ACTION =
  "mt-4 flex h-10 shrink-0 items-center justify-center rounded-lg bg-[#D9ED92] text-sm text-[#262626] [[data-theme=dark]_&]:bg-[#7DA4FF]";
// The field the card sits on, at the proportions the cover is drawn for.
const CARD_FIELD_CLS =
  "relative aspect-square w-full rounded-[20px] px-[19%] py-[9%]";
// The mark on the masthead. On a phone it sits centred in a rounded tile of the
// band's own ink: alone on a full-width colour field it read as a stray glyph
// rather than as the thing signing the page. On desktop it goes back to the bare
// mark in the corner, where the band's width gives it that position instead.
const MARK_TILE_CLS =
  // md:w-fit is load-bearing: without it the tile is a full-width flex row and
  // `justify-center` keeps centring the mark on desktop, where it belongs in the
  // corner.
  "mx-auto flex size-11 items-center justify-center rounded-xl bg-[var(--proposal-ink-fill)] md:mx-0 md:size-auto md:w-fit md:rounded-none md:bg-transparent";

// The prompt's field, on a phone only. The square and its deep insets are drawn
// for a cover — a picture that wants air around it — and they left the prompt
// being typed into a column about twenty characters wide, with the sentence
// running off the bottom. Here the card takes nearly the full width and a set
// height instead, so the writing has a line to sit on. From `sm` up there's
// width to spare and both cards go back to being the same object.
const PROMPT_FIELD_CLS =
  "relative h-[26rem] w-full rounded-[20px] px-[3%] py-[5%] sm:aspect-square sm:h-auto sm:px-[19%] sm:py-[9%]";

// How far the masthead draws in as it leaves: how much of a screen the move
// takes, how much it shrinks by, and the radius it ends on.
const BAND_INSET_DISTANCE = 520;
const BAND_INSET_SCALE = 0.06;
const BAND_INSET_RADIUS = 32;

// How far the card leans at full reach, and how far away "full reach" is —
// measured in the card's own widths, so the lean maxes out about a card away and
// holds there rather than growing with the size of the window.
const CARD_TILT_DEG = 7;
const CARD_TILT_REACH = 1.4;

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

/**
 * The lean and the light, shared by both cards: a picked template and a typed
 * prompt are the same object, so they behave the same under the pointer even
 * though only one of them turns over.
 *
 * The lean follows the pointer anywhere on the page, not just over the card.
 * Written straight to the style rather than through state: this fires on every
 * pointer move, and re-rendering the card each time would be the whole page.
 * The tilt sits on its own wrapper so it composes with a flip instead of
 * fighting it for the transform.
 *
 * `frozen` settles the card flat and stops it following the pointer — for the
 * prompt card while its text is being edited. A surface you're typing on that
 * leans away every time the pointer moves is the one place the effect works
 * against the thing it's decorating.
 */
function useCardTilt(frozen = false) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const tiltRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (
      window.matchMedia("(hover: none)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    // Clearing the transform rather than writing 0deg lets the wrapper's own
    // transition carry it back to flat, so the card settles instead of snapping.
    if (frozen) {
      const host = hostRef.current;
      const tilt = tiltRef.current;
      if (tilt) tilt.style.transform = "";
      if (host) {
        host.style.removeProperty("--sheen-pos");
        host.style.removeProperty("--sheen-x");
        host.style.removeProperty("--sheen-y");
      }
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
  }, [frozen]);

  return { hostRef, tiltRef };
}

// The wrapper the lean is written to. Perspective belongs on the host; without
// it the turn is a flat squash.
const CARD_TILT_CLS =
  "h-full w-full transition-transform duration-300 ease-out [transform-style:preserve-3d] motion-reduce:transition-none";

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
  const { hostRef, tiltRef } = useCardTilt();

  const faceCls = `${CARD_FACE} absolute inset-0 [backface-visibility:hidden] [-webkit-backface-visibility:hidden]`;
  const wellCls = CARD_WELL;
  const actionCls = CARD_ACTION;
  // The whole field is the control, as a transparent button laid over it. The
  // rotating element itself can't be the button: the cover mock contains buttons
  // of its own, and a button inside a button is invalid — the parser hoists the
  // inner ones out and the second face goes with them.
  const hitCls =
    "absolute inset-0 z-10 cursor-pointer rounded-[20px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

  return (
    <div
      ref={hostRef}
      className={`${CARD_FIELD_CLS} [perspective:1400px]`}
      style={{ backgroundColor: CARD_FIELD }}
    >
      <div ref={tiltRef} className={CARD_TILT_CLS}>
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
 * A section's name, and the only label step on the page. Every block of the
 * proposal opens with one of these, so the reader always knows which of the three
 * questions — what it is, how it works, how to sign up — they're in.
 */
// Article typography, lifted wholesale from the customer stories
// (app/customers/[slug]) so the two long-form pages on the site read as the same
// kind of document. Sections are headings rather than grey captions: a caption
// over a panel reads as a form label, and the page stopped being something you
// read top to bottom.
//
// Prose is held to a reading measure rather than the column's full width. The
// rail leaves ~700px here, which runs past 90 characters a line at this size —
// long enough that the eye loses the return. The card and the headings still
// span the column; only the running text is capped.
const MEASURE = "max-w-[37.5rem]";

// One body setting for the whole article, and no exceptions to it — every
// paragraph, run-in entry and numbered step is this size, this leading, this
// measure. A standfirst step on the opening paragraph was tried and it was the
// thing that made the page look assembled from parts: with sections this short,
// a second body size reads as an inconsistency rather than as emphasis.
// 16px at 1.6 on a 600px measure, in solid ink: the setting long-form pages that
// read well use. Ours was 17px at 1.85 in a 80%-strength grey, which is the
// combination that made the writing look faint and loosely stacked rather than
// set.
const BODY = "text-base leading-[1.6] text-foreground";

// Headings sit close to what follows them — 20px, so the sentence reads as the
// heading's own rather than as the next thing down the page — and far from what
// came before.
function ArticleHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="type-h3 mt-14 first:mt-0 md:mt-16">{children}</h2>;
}

function ArticleText({
  children,
  muted = false,
}: {
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <p
      className={`${MEASURE} mt-5 ${BODY} ${muted ? "!text-muted-foreground" : ""}`}
    >
      {children}
    </p>
  );
}

/**
 * Run-in paragraphs: the name opens the sentence rather than sitting on a line
 * of its own. Stacked name-over-sentence pairs read as a spec sheet however the
 * rules are removed — each entry is two blocks and the section is a grid of
 * them. As a run-in it's a paragraph like any other, and the name carries its
 * weight in ink rather than in position.
 *
 * Both variants hang their marker in the margin — a numeral where the order is
 * the point, a bullet where it isn't — so the paragraphs still start on the
 * column's edge and a run of them reads as one list rather than as four
 * paragraphs that happen to be near each other.
 */
function RunInList({
  items,
  className = "",
  ordered = false,
}: {
  items: { label: string; detail?: string }[];
  className?: string;
  // Numbered, for the steps, where the order is the point.
  ordered?: boolean;
}) {
  const List = ordered ? "ol" : "ul";
  return (
    <List className={`${MEASURE} space-y-5 ${className}`}>
      {items.map((item, i) => (
        // A bullet is a mark, a numeral is two or three characters: they don't
        // want the same margin. Given the numeral's, a bullet floats a long way
        // off the sentence it belongs to.
        <li key={item.label} className={`flex ${ordered ? "gap-3" : "gap-2"}`}>
          <span
            aria-hidden
            className={`${BODY} shrink-0 !text-muted-foreground ${
              ordered ? "w-4" : "w-1.5"
            }`}
          >
            {ordered ? `${i + 1}.` : "•"}
          </span>
          {/* One colour, the article's own: the name opened the sentence in
              solid ink over a lighter one, and two greys in a line read as a
              rendering fault rather than as emphasis. The name still leads —
              it's where the sentence starts. */}
          <p className={BODY}>
            {item.label}. {item.detail}
          </p>
        </li>
      ))}
    </List>
  );
}

/**
 * The lead image on the masthead — a post's opening picture, at the size one is
 * printed at. It's capped rather than full-bleed only because the mock is a
 * square composition: past this width the page opens on a screen of picture with
 * no words on it at all.
 */
function ProposalLeadImage({
  template,
  startHref,
}: {
  template: Template;
  startHref: string;
}) {
  const { theme } = useTheme();
  return (
    <div className="w-full">
      <TemplateFlipCard
        template={template}
        dark={theme === "dark"}
        startHref={startHref}
      />
    </div>
  );
}

/**
 * Template variant — the writing: the template's own paragraph
 * (`longDescription`, the same one its catalogue page opens with) rather than
 * anything written for this page, so the proposal isn't a second, drifting
 * description of the same app, then what comes in it.
 */
function TemplateBuild({ template }: { template: Template }) {
  return (
    <div>
      <ArticleHeading>What we&rsquo;d build</ArticleHeading>
      {/* The template's own paragraph, so the proposal and the catalogue say the
          same thing about the same app. The sectors it's drawn for aren't
          repeated here: the masthead carries them as chips and the rail lists
          them again, which was three statements of the same fact in one page. */}
      <ArticleText>{template.longDescription}</ArticleText>

      {template.features.length > 0 && (
        <>
          <ArticleHeading>What comes in it</ArticleHeading>
          <RunInList
            className="mt-5"
            items={template.features.map((feature) => ({
              label: feature,
              detail: TEMPLATE_FEATURE_DETAILS[feature],
            }))}
          />
        </>
      )}
      {/* The way into the full spec used to hang here as a quiet link. It sits
          in the rail now, under the page's action, where the two things you can
          do next are one pair rather than one at the end of the writing and one
          off to the side. */}
    </div>
  );
}

// How the thing above actually gets built, in three steps. Both variants show
// this: it used to be the prompt variant's side rail only, where it read as
// unrelated trivia parked next to the prompt, and the template variant answered
// "how does this work" nowhere at all. It's the middle of the page's three
// questions — what it is, how it works, how to sign up.
const HOW_IT_WORKS = [
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

/**
 * Prompt variant — the same card the template arrives as, with the prompt in the
 * well instead of a cover. A typed idea should look as much like a thing as a
 * picked template does; before this it was a paragraph in a box below the fold
 * while a template got the masthead.
 *
 * The prompt stays editable in place — nothing here is saved anywhere, but being
 * able to touch the words is what says the build isn't fixed, and whatever it
 * says at signup is what rides along.
 */
function PromptHeroCard({
  value,
  onChange,
  startHref,
}: {
  value: string;
  onChange: (next: string) => void;
  startHref: string;
}) {
  // The hint is for someone who hasn't touched the field yet, so it goes once
  // the caret is in it.
  const [editing, setEditing] = useState(false);
  // The same lean and specular the template's card has: it doesn't turn over,
  // but it's the same object and should sit in the same light — until the caret
  // is in it, at which point the card settles flat and holds still to be typed
  // on, and picks the lean back up when you leave the field.
  const { hostRef, tiltRef } = useCardTilt(editing);

  return (
    // No fill on the field: this card only ever sits on the masthead, which is
    // already that colour. Painting it again put a second layer of the same blue
    // over the band, and the two rendered a hair apart.
    <div ref={hostRef} className={`${PROMPT_FIELD_CLS} [perspective:1400px]`}>
      <div ref={tiltRef} className={CARD_TILT_CLS}>
        <div className={`${CARD_FACE} relative h-full`}>
          <div className="flex shrink-0 items-baseline justify-between gap-3">
            <p className="type-caption text-muted-foreground">
              You&rsquo;re building
            </p>
            {/* Says in words what the well only implies. It's the affordance the
              card would otherwise be missing: a cover is something to look at,
              and this has to read as something to type in. */}
            <p
              className={`type-caption text-muted-foreground transition-opacity ${
                editing ? "opacity-0" : "opacity-100"
              }`}
            >
              Click to edit
            </p>
          </div>

          <div className={CARD_WELL}>
            <label className="sr-only" htmlFor="proposal-prompt">
              The app idea, yours to edit
            </label>
            <textarea
              id="proposal-prompt"
              value={value}
              onChange={(event) => onChange(event.target.value)}
              onFocus={() => setEditing(true)}
              onBlur={() => setEditing(false)}
              spellCheck={false}
              className="scrollbar-slim type-body h-full w-full cursor-text resize-none bg-transparent p-4 text-foreground outline-none md:p-5 md:text-[1.0625rem] md:leading-[1.6]"
            />
          </div>

          <Link href={startHref} className={CARD_ACTION}>
            Build
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * The second rail: the facts panel the customer stories carry (app/customers/
 * [slug] MetaCard) — who it's for, who sent it, what it is — with the page's
 * action under it. It's the same shape and the same sticky behaviour, so the
 * proposal and a case study are recognisably the same kind of page.
 *
 * Desktop only. On a phone this would be a second block of the same facts under
 * the ones the hero already gives, and the floating bar carries the action.
 */
function ProposalAside({
  template,
  recipient,
  from,
  startHref,
  onSeeDetails,
}: {
  template?: Template;
  recipient: string;
  from: string;
  startHref: string;
  /** Opens the full spec. Only a template has one. */
  onSeeDetails?: () => void;
}) {
  const industries = template?.industries ?? [];

  const rows = [
    ...(recipient ? [{ label: "Prepared for", value: recipient }] : []),
    ...(from ? [{ label: "From", value: from }] : []),
    template
      ? { label: "Template", value: headlineTitle(template.title) }
      : { label: "Build", value: "From your own prompt" },
    ...(industries.length > 0
      ? [{ label: "Built for", value: `${industries.join(", ")} firms` }]
      : []),
  ];

  return (
    <aside className="hidden h-fit flex-col gap-4 md:sticky md:top-28 md:flex">
      <div className="overflow-hidden rounded-lg border border-border bg-card [[data-theme=dark]_&]:border-[#383838]">
        <div className="flex flex-col items-center px-6 pb-6 pt-8">
          <div className="flex size-16 items-center justify-center rounded-full bg-background ring-1 ring-border [[data-theme=dark]_&]:ring-[#383838]">
            <Image
              src="/images/logo-mark.svg"
              alt=""
              width={22}
              height={22}
              className="[[data-theme=dark]_&]:brightness-0 [[data-theme=dark]_&]:invert"
            />
          </div>
          <p className="mt-4 text-center font-medium tracking-tight">
            {template ? headlineTitle(template.title) : "A new app"}
          </p>
          <p className="type-caption mt-1 text-center text-muted-foreground">
            Built on Assembly
          </p>
        </div>

        <dl className="border-t border-border/70 [[data-theme=dark]_&]:border-[#383838]">
          {rows.map((row, i) => (
            <div
              key={row.label}
              className={`px-6 py-4 ${
                i < rows.length - 1
                  ? "border-b border-border/70 [[data-theme=dark]_&]:border-[#383838]"
                  : ""
              }`}
            >
              <dt className="text-sm text-foreground">{row.label}</dt>
              <dd className="mt-0.5 flex items-center gap-2 text-sm text-muted-foreground">
                {row.label === "From" && (
                  <OptionAvatar
                    option={{ value: row.value, label: row.value }}
                    size={20}
                  />
                )}
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <Link
        href={startHref}
        className="rounded-lg bg-foreground px-5 py-2.5 text-center text-sm text-background transition-opacity hover:opacity-90"
      >
        Get started
      </Link>

      {/* The site's outline button, under the solid one: the same pair the rest
          of the site uses for "do the thing" and "read more first". */}
      {template && onSeeDetails && (
        <button
          type="button"
          onClick={onSeeDetails}
          className="rounded-lg border border-foreground/20 bg-transparent px-5 py-2.5 text-center text-sm text-foreground transition-colors hover:bg-foreground/5"
        >
          See full details
        </button>
      )}
    </aside>
  );
}

// The loading shell: the top of the masthead and nothing in it yet, so a real
// load paints the band rather than a white screen that then turns blue. The mark
// isn't a link — this page has no navigation by design, and a logo that quietly
// leaves the proposal is the one exit we don't want to build.
function ProposalHeaderShell() {
  return (
    <header
      style={{ backgroundColor: CARD_FIELD }}
      className="flex h-32 items-start px-6 pt-6 md:h-40 md:px-10 md:pt-8"
    >
      <span className={MARK_TILE_CLS}>
        <Image
          src="/images/logo-mark.svg"
          alt="Assembly Studio"
          width={22}
          height={22}
          priority
          className="brightness-0 invert [[data-theme=dark]_&]:invert-0"
        />
      </span>
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

  // What the headline calls the thing being built: a template's own title, or
  // the name the sender gave the prompt. Capped here as well as in the creator —
  // the query is hand-editable, and a headline is not a place to put a sentence.
  const headline = template
    ? headlineTitle(template.title)
    : (params.get("name") ?? "").trim().slice(0, MAX_APP_NAME_LENGTH);

  // The prompt variant is editable, so what signup receives is whatever the
  // field says now — not what the link was written with. Seeded once: this page
  // carries no navigation, so the query it mounted with is the query it keeps.
  const [draft, setDraft] = useState(
    prompt || "A brand-new app, from a blank canvas.",
  );

  const [panelOpen, setPanelOpen] = useState(false);
  const router = useRouter();

  // The masthead starts full-bleed and draws itself in as you leave it: it
  // scales down from its top edge and takes a radius, so the page's own white
  // comes up the sides and the band becomes a panel sitting on it. Same move as
  // the waitlist hero — a transform and a radius written straight to the node on
  // scroll, rather than a pinned section, so the page never stops scrolling
  // normally. Reduced motion gets the band as it is, full width, and nothing
  // moves.
  const bandRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = bandRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const draw = () => {
      frame = 0;
      // Over the first screenful: past that it's off-view and the numbers hold.
      const t = Math.min(1, window.scrollY / BAND_INSET_DISTANCE);
      el.style.transform = `scale(${1 - BAND_INSET_SCALE * t})`;
      el.style.borderRadius = `${BAND_INSET_RADIUS * t}px`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };

    draw();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // Signing up goes straight to onboarding on dashboard, carrying what the
  // proposal was built from — the picked template, or the prompt as the field
  // reads now rather than as the page mounted with it. There is no sheet on this
  // site in between any more: it asked for an account this side of the hand-off
  // and onboarding asked again on the far side.
  const startHref = template
    ? templateSignupUrl({
        templateId: template.templateId,
        title: template.title,
        description: template.description,
      })
    : buildSignupUrl(draft);

  // Every other CTA on the page leaves for the same place; this one also closes
  // the details panel on the way out.
  const goToSignup = () => {
    setPanelOpen(false);
    window.location.href = startHref;
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* The opening is one coloured band, the way a post's masthead is: the mark
          and the byline on it, the title, what it's for, and the app itself
          sitting on the same field its cover is drawn on — so the card reads as
          the artwork of the masthead rather than as a picture pasted under it.
          Everything on the band is drawn in one ink — white on the light band,
          black on the dark one's lime: it's a printed surface, not a themed
          one, so nothing on it uses the page's own text tokens. */}
      {/* The band takes its colour from CARD_FIELD itself rather than from a
          matching utility: Tailwind compiles an arbitrary hex through a
          different colour space, and the card's own field showed up as a
          slightly-off rectangle sitting on the band. */}
      <header
        ref={bandRef}
        style={{ backgroundColor: CARD_FIELD }}
        className="relative origin-top overflow-hidden px-6 pb-14 pt-6 text-center will-change-[transform,border-radius] md:px-10 md:pb-16 md:pt-8"
      >
        <span className={MARK_TILE_CLS}>
          <Image
            src="/images/logo-mark.svg"
            alt="Assembly Studio"
            width={22}
            height={22}
            priority
            // Drawn in the band's ink: white on the black band, black on the lime.
            className="brightness-0 invert [[data-theme=dark]_&]:invert-0"
          />
        </span>

        <div className="mx-auto mt-12 w-full max-w-3xl md:mt-14">
          {/* The byline leads, the way a post's date and author line does. In the
              page's own face, not mono: a mono line at the top of a masthead set
              in PP Mori reads as a different document's furniture. */}
          {from && (
            <p className="flex items-center justify-center gap-2 text-[0.9375rem] text-[color:var(--proposal-ink-soft)]">
              <OptionAvatar
                option={{ value: from, label: from }}
                size={22}
                tone="field"
              />
              <span>
                From{" "}
                <span className="text-[color:var(--proposal-ink)]">{from}</span>
              </span>
            </p>
          )}

          {/* One sentence: what it is and who it's for. A template knows the
              app's name; a prompt gets one written for it in the creator, so
              both open on what's being built rather than making the reader
              scroll to the build section to find out. A prompt sent without a
              name still opens on the recipient alone.

              "for {name}" is held together as one unwrappable phrase, so a title
              too long for one line breaks before it and puts the person on a
              line of their own — rather than splitting their name across two,
              which is what a plain string does to anyone with a long one. */}
          <h1
            className={`type-display text-balance text-[color:var(--proposal-ink)] ${from ? "mt-6" : ""}`}
          >
            {headline ? (
              recipient ? (
                <>
                  {headline}{" "}
                  <span className="whitespace-nowrap">for {recipient}</span>
                </>
              ) : (
                headline
              )
            ) : (
              recipient || "you"
            )}
          </h1>

          {/* Tags, as a post carries its subjects: the sectors this one is drawn
              for. The site's sector-chip treatment — mono, caps, soft fill. Two
              at most: the full list is four on some templates, which wraps into a
              band of chips heavier than the title above it, and the rail carries
              the complete set anyway. */}
          {(template?.industries?.length ?? 0) > 0 && (
            <ul className="mt-6 flex flex-wrap justify-center gap-2">
              {template!.industries!.slice(0, 2).map((industry) => (
                <li
                  key={industry}
                  className="rounded-md bg-[var(--proposal-ink-fill)] px-2.5 py-1 font-mono text-[12px] uppercase tracking-wide text-[color:var(--proposal-ink)]"
                >
                  {industry}
                </li>
              ))}
            </ul>
          )}

          {/* The standfirst: one line on what this is, under the title. */}
          {note && (
            <p className="mx-auto mt-6 max-w-xl text-[0.9375rem] leading-[1.6] text-[color:var(--proposal-ink-soft)]">
              {note}
            </p>
          )}
        </div>

        {/* The app, on the band. Its field is drawn in this same blue, so it
            disappears into the masthead and the card floats. Both arrivals get
            one: a picked template shows its cover, a typed prompt shows the
            prompt, still editable.

            The gap above it is smaller than the one under the byline, because
            the card's field carries its own top padding — measured off the
            card's width, so it grows with the card — and the two stacked read as
            a hole between the words and the artwork. */}
        <div className="mx-auto mt-6 w-full max-w-lg sm:max-w-2xl md:mt-8">
          {template ? (
            <ProposalLeadImage template={template} startHref={startHref} />
          ) : (
            <PromptHeroCard
              value={draft}
              onChange={setDraft}
              startHref={startHref}
            />
          )}
        </div>
      </header>

      {/* The body, as an article with a facts rail beside it — the customer-story
          layout (app/customers/[slug]). One reading order still: the article is
          the page, and the rail is a card of facts that doesn't continue
          anywhere, which is what made the earlier two-column attempt fight the
          text. */}
      <section className="flex-1 px-6 md:px-10">
        <div className="mx-auto grid max-w-5xl gap-12 pb-16 pt-12 md:grid-cols-[minmax(0,1fr)_16rem] md:gap-16 md:pb-24 md:pt-16">
          <article>
            {/* Only the template has writing of its own here. The prompt IS the
                idea, and it's on the masthead — repeating it under a heading was
                the same words twice on one page. */}
            {template && <TemplateBuild template={template} />}

            {/* Who's building it. The page named the app, listed what's in it
                and went straight into the steps, on the assumption the reader
                knows what Assembly is — and the one person this page is written
                for is exactly the person who doesn't yet. Two sentences, before
                the steps, because "built in your workspace" means nothing until
                you know there's a workspace. Headed as a question about the app
                rather than about us — it sits in a row with what we'd build,
                what comes in it and how it works, and "What Assembly is" was the
                one line on the page that read like a brochure. */}
            <ArticleHeading>Where it lives</ArticleHeading>
            <ArticleText>
              Assembly is the portal your clients sign into: files, messages,
              invoices and contracts, in one place with your name on it. An app
              like this one is built on top of that, so it opens where your
              clients already are instead of being one more link to send them.
            </ArticleText>

            {/* Both variants answer it, in the same words and the same place. */}
            <ArticleHeading>How it works</ArticleHeading>
            <RunInList ordered className="mt-5" items={HOW_IT_WORKS} />
          </article>

          <ProposalAside
            template={template}
            recipient={recipient}
            from={from}
            startHref={startHref}
            onSeeDetails={() => setPanelOpen(true)}
          />
        </div>
      </section>

      <SectionRule />

      {/* Closing CTA, built to the same shape as the site's other closing CTAs
          (see SecurityCta): headline, a line of body copy carrying what happens
          when you sign up, then the action. The signup itself is the sheet the
          rest of the site opens, so what used to be an inline form here is one
          button. Extra bottom padding clears the floating CTA on the way down. */}
      <section className="px-6 pb-28 pt-16 text-center md:pb-32 md:pt-24">
        <div id="start">
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

      {/* No floating action bar. The sticky rail carries the signup while you
          read, and the closing section carries it at the end — a third copy
          riding the bottom of the window on its own scrim was one button too
          many, and the scrim washed whatever it passed over. */}

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
          <ProposalHeaderShell />
        </div>
      }
    >
      <ProposalContent />
    </Suspense>
  );
}
