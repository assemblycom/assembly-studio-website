"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { TEMPLATES, type Template } from "@/lib/templates";
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
// picked template arrive as the same object. Card and well are both tokens: in
// light the well steps down from a white card, in dark it steps up off a darker
// one, which is the same lift either way.
// mt-10 under the section's lead — the step the article page puts between its
// running text and the media that follows it.
const CARD =
  "mt-10 rounded-xl border border-border bg-card p-3 [[data-theme=dark]_&]:border-white/[0.08]";
const CARD_HEAD = "flex items-center justify-between gap-4 px-2.5 pb-3 pt-2";
// The well hugs what's in it rather than holding a floor: a prompt of a
// paragraph or two and a cover-beside-a-summary come out within a line of each
// other, and a fixed height left whichever variant was shorter sitting in an
// empty panel. The cover's size (below) is picked to land in that same range.
const CARD_WELL = "rounded-lg bg-muted p-6 md:p-8";
// The card's quiet controls — Edit / Cancel / Save, and the template's way into
// its full spec. Text buttons rather than buttons: the page has one action and
// it isn't in here.
const CARD_CONTROL =
  "type-caption text-muted-foreground transition-colors hover:text-foreground";

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
 * The recipient carries the band's full ink and the sender the soft step: they
 * are the same shape, and who the page is for is the one being emphasised.
 */
function BandName({
  label,
  name,
  avatar,
  emphasis = false,
}: {
  label: string;
  name: string;
  /** Their photo, when we have one. Falls back to their initials. */
  avatar?: string;
  emphasis?: boolean;
}) {
  return (
    // items-center so the label sits over the pair it names rather than over the
    // full width of a stretched column — the band is centred.
    <div className="flex flex-col items-center gap-2.5">
      <p className="type-eyebrow text-[color:var(--proposal-ink-faint)]">
        {label}
      </p>
      <div className="flex items-center gap-2.5">
        <OptionAvatar
          option={{ value: name, label: name, avatar }}
          size={28}
          tone="field"
        />
        <span
          className={`type-h4 ${
            emphasis
              ? "text-[color:var(--proposal-ink)]"
              : "text-[color:var(--proposal-ink-soft)]"
          }`}
        >
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
        <p className="type-caption truncate text-muted-foreground">{appName}</p>
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
                className="type-caption text-foreground transition-opacity hover:opacity-70"
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

      {/* Editing happens IN the well, not in a field inside it: a bordered box
          on its own fill made a third surface inside the card, and the words
          moved as you started typing. The textarea is the same type in the same
          place as the paragraph it replaces — the well itself takes the focus
          ring, so the surface you were reading is the one that goes live. */}
      <div
        className={`${CARD_WELL} focus-within:ring-1 focus-within:ring-inset focus-within:ring-foreground/15`}
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
              // overflow-hidden so the auto-grown field never shows a scrollbar
              // of its own, and resize-none because the height is not the
              // reader's problem to solve.
              //
              // It opts out of the site's global focus ring (see the
              // :focus-visible block in globals.css), and out of BOTH of its
              // halves: that rule pairs an ink outline with a
              // background-coloured box-shadow, and clearing only the outline
              // left the shadow painting a hard near-black rectangle around the
              // line of text in dark mode. The well takes the focus ring here,
              // so this element wants no ring of its own.
              className="type-body block w-full resize-none overflow-hidden border-0 bg-transparent p-0 text-foreground outline-none focus-visible:shadow-none focus-visible:outline-none"
            />
          </>
        ) : (
          <p className="type-body whitespace-pre-wrap text-pretty text-foreground">
            {prompt}
          </p>
        )}
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
        <p className="type-caption truncate text-muted-foreground">
          {template.title}
        </p>
        <button type="button" onClick={onSeeDetails} className={CARD_CONTROL}>
          See full details
        </button>
      </div>

      <div className={CARD_WELL}>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-7">
          {/* The cover, at the one size it's framed at here. Same framing as the
              catalogue cards: a square, the mock scaled into it, and the
              hairline drawn over the cover rather than as a border, so the
              widget fills the whole square. */}
          <div className="relative w-32 shrink-0 sm:w-40">
            <MockFit
              className={`relative aspect-square overflow-hidden rounded-[14px] bg-background [[data-theme=dark]_&]:bg-[#151515] ${
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
              className="pointer-events-none absolute inset-0 rounded-[14px] border border-border/60 [[data-theme=dark]_&]:border-transparent"
            />
          </div>

          <div className="min-w-0">
            <p className="type-body text-pretty text-foreground">
              {template.longDescription}
            </p>
            {/* What comes in it, as tags rather than as a section of its own:
                the full list with a sentence on each is in the details panel. */}
            {template.features.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-1.5">
                {template.features.map((feature) => (
                  <li
                    key={feature}
                    className="rounded-sm border border-border bg-background px-2 py-1 text-[11px] uppercase leading-none tracking-[0.04em] text-muted-foreground [font-family:var(--font-diatype-mono),ui-monospace,monospace] [[data-theme=dark]_&]:border-white/[0.1] [[data-theme=dark]_&]:bg-white/[0.05]"
                  >
                    {feature}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** The one action's arrow, at the weight the site's other inline arrows use. */
function ArrowRight() {
  return (
    <svg
      aria-hidden
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
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
            className="brightness-0 invert"
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
  const [prompt, setPrompt] = useState(
    promptParam || "A brand-new app, from a blank canvas.",
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
      <header
        style={{ backgroundColor: "var(--proposal-field)" }}
        className="relative"
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
              className="brightness-0 invert"
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
            <p className="type-eyebrow text-[color:var(--proposal-ink-faint)]">
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
              // A narrower gap on a phone keeps the two side by side, where 56px
              // wrapped them into a stack two labels tall for no reason — the
              // names are short, the space just wasn't there.
              <div className="mt-12 flex flex-wrap items-start justify-center gap-x-8 gap-y-6 sm:gap-x-14 md:mt-14 md:gap-x-16">
                <BandName label="Prepared for" name={recipient} emphasis />
                {/* The link carries the sender's name only, so their photo is
                    looked back up from it. The recipient is a client and has no
                    photo of ours to find — they keep their initials. */}
                {from && (
                  <BandName
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
          <p className="type-lead mt-5 max-w-[33rem] text-pretty text-muted-foreground">
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

      {/* How it becomes a real app, then the one action. The steps are ruled off
          each other rather than carded: they're the reading at the end of a
          document, and the only panel down here should be the one you act on. */}
      <section className="px-6 md:px-10">
        <div className={`${RAIL} pb-20 pt-14 md:pb-28 md:pt-20`}>
          <h2 className="type-h3">Sign up to build it</h2>
          <p className="type-lead mt-5 max-w-[33rem] text-pretty text-muted-foreground">
            Creating your workspace is what starts the build. Here’s how it
            goes.
          </p>

          {/* The index rides beside the title as the site's own mono "[1]" (see
              the step strip in home/how-it-works), rather than as a numeral in a
              2rem gutter: the gutter left the number stranded a long way from the
              words it belonged to, and on a phone it took a column the text
              needed. divide-y rather than a border on every row, so the list is
              ruled BETWEEN its steps and doesn't close with a rule that made it
              read as a table sitting above the action. */}
          <ol className="mt-10 divide-y divide-border border-t border-border">
            {signupSteps(!!template).map((step, i) => (
              <li key={step.title} className="py-5 md:py-6">
                <div className="flex items-baseline gap-2">
                  {/* The title carries its weight in ink and in size rather than
                      in a bold face: the family's 500 is a SemiBold, and a run
                      of these set in it was the heaviest text on the page. */}
                  <p className="type-lead text-foreground">{step.title}</p>
                  <span
                    aria-hidden
                    className="shrink-0 text-[11px] tabular-nums text-muted-foreground/60 [font-family:var(--font-diatype-mono),ui-monospace,monospace]"
                  >
                    [{i + 1}]
                  </span>
                </div>
                <p className="type-body mt-1.5 max-w-[36rem] text-pretty text-muted-foreground">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>

          {/* The close, on the same printed colour the page opened on, so the
              document is bracketed by it — in light, a black panel on white.
              In dark that colour IS the page's ground, so instead of an outlined
              hole it takes the lift the site gives its dark bordered containers
              (bg-white/[0.04], as in home/how-it-works) and reads as a raised
              surface. The fill is a utility rather than an inline style so the
              dark override can win — an inline background beats any class.
              The button inverts the pair, the band's ink as its fill, rather
              than reaching for a third colour. */}
          <div className="mt-12 flex flex-wrap items-center justify-between gap-8 rounded-xl bg-[var(--proposal-field)] px-7 py-8 md:mt-14 md:px-10 md:py-9 [[data-theme=dark]_&]:border [[data-theme=dark]_&]:border-border [[data-theme=dark]_&]:bg-white/[0.04]">
            <div>
              <p className="type-h4 text-[color:var(--proposal-ink)]">
                Ready{recipient ? `, ${firstName(recipient)}` : ""}?
              </p>
              <p className="type-lead mt-1.5 text-[color:var(--proposal-ink-soft)]">
                Signing up creates your workspace and kicks off the build above.
              </p>
            </div>
            <Link
              href={startHref}
              style={{
                backgroundColor: "var(--proposal-ink)",
                color: "var(--proposal-field)",
              }}
              className="inline-flex h-12 shrink-0 items-center gap-2.5 rounded-lg px-7 text-sm transition-opacity hover:opacity-85"
            >
              <span>Sign up and build it</span>
              <ArrowRight />
            </Link>
          </div>
        </div>
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
