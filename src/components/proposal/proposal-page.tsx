"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { TEMPLATES, type Template } from "@/lib/templates";
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
function SectionRule() {
  return (
    <div className="border-t border-border [[data-theme=dark]_&]:border-[#383838]" />
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

function TemplateFlipCard({
  template,
  dark,
}: {
  template: Template;
  dark: boolean;
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
  // The card's one action, in the brand lime. It's part of the picture rather
  // than a control: the whole card is the click target, and the real signup is
  // the button at the foot of the page.
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
                <MockFit
                  className={`h-full ${MOCK_DESIGN_SIZE[template.slug] ?? ""}`}
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
            <p className="mt-3 shrink-0 text-[15px] text-foreground">
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
            <div className={`${wellCls} overflow-y-auto p-4`}>
              <p className="text-[15px] leading-relaxed text-pretty text-foreground">
                {template.longDescription}
              </p>
              {template.features.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {template.features.map((feature) => (
                    <li
                      key={feature}
                      className="rounded-md border border-black/[0.08] px-2 py-1 text-[11px] leading-none text-muted-foreground [font-family:var(--font-diatype-mono),ui-monospace,monospace] [[data-theme=dark]_&]:border-white/[0.1]"
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
}: {
  template: Template;
  onSeeDetails: () => void;
}) {
  const { theme } = useTheme();
  const hasScreenshots = Boolean(template.images?.length);
  const industries = template.industries ?? [];

  return (
    <>
      {/* The app wide on the left, the specifics in a rail on the right, split by
          a rule. The section's vertical padding lives on the two columns rather
          than on the section, so the rule between them runs the full height of
          the block and meets the page-width rules above and below it — as a
          border on the rail alone it started and stopped with the rail's own
          content, floating between the two horizontals. */}
      <div className="grid lg:grid-cols-[1.55fr_1fr]">
        <div className="min-w-0 pb-10 pt-14 md:pt-20 lg:pb-20 lg:pr-14">
          <h2 className="type-h2">{template.title}</h2>
          <p className="type-lead mt-3 max-w-xl text-muted-foreground">
            {template.description}
          </p>

          <div className="mt-10">
            {hasScreenshots ? (
              <TemplateGallery
                title={template.title}
                images={template.images}
                previewCount={template.previewCount}
              />
            ) : (
              <TemplateFlipCard template={template} dark={theme === "dark"} />
            )}
          </div>
        </div>

        {/* The rail: what's in it, who it's for, and the way into the detail —
            rows on hairlines rather than bulleted prose, so it scans. */}
        <aside className="min-w-0 pb-14 pt-10 md:pb-20 lg:border-l lg:border-border lg:pl-14 lg:pt-20">
          {template.features.length > 0 && (
            <>
              <p className="type-caption text-muted-foreground">
                What&rsquo;s included
              </p>
              {/* Body rather than a heading step: these are the answers to the
                  label above them, not headings of their own — at 18px each row
                  competed with the section's own title. */}
              <ul className="mt-3 border-t border-border">
                {template.features.map((feature) => (
                  <li
                    key={feature}
                    className="type-body border-b border-border py-3 text-foreground"
                  >
                    {feature}
                  </li>
                ))}
              </ul>
            </>
          )}

          {industries.length > 0 && (
            <div className="mt-8">
              <p className="type-caption text-muted-foreground">Built for</p>
              <p className="type-body mt-1.5 text-foreground">
                {industries.join(", ")} firms
              </p>
            </div>
          )}

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
// sequence, and saying it in three rows fills the rail the same way.
const PROMPT_NEXT = [
  "Built in your workspace",
  "Refined in plain English",
  "Published to your portal",
];

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
  return (
    <div className="grid lg:grid-cols-[1.55fr_1fr]">
      <div className="min-w-0 pb-10 pt-14 md:pt-20 lg:pb-20 lg:pr-14">
        <h2 className="type-h2">The idea</h2>
        <p className="type-lead mt-3 max-w-xl text-muted-foreground">
          In your words, and yours to change.
        </p>

        <div className="mt-10">
          <label className="sr-only" htmlFor="proposal-prompt">
            The app idea, yours to edit
          </label>
          {/* Framed like the template's app panel so the two variants sit at the
              same weight, and styled like the site's fields (same border tokens,
              same focus step) so it reads as editable at a glance. field-sizing
              grows the box with the words, so a long idea is never trapped behind
              a scrollbar inside the page. */}
          <textarea
            id="proposal-prompt"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            spellCheck={false}
            className="type-h4 min-h-[13rem] w-full resize-none rounded-[20px] border border-foreground/20 bg-background p-6 text-foreground outline-none transition-colors [field-sizing:content] hover:border-foreground/30 focus:border-foreground/40 md:p-7 [[data-theme=dark]_&]:bg-[#151515]"
          />
          <p className="type-caption mt-3 text-muted-foreground">
            Click in to edit. Change anything that isn&rsquo;t right.
          </p>
        </div>
      </div>

      <aside className="min-w-0 pb-14 pt-10 md:pb-20 lg:border-l lg:border-border lg:pl-14 lg:pt-20">
        <p className="type-caption text-muted-foreground">What happens next</p>
        <ul className="mt-3 border-t border-border">
          {PROMPT_NEXT.map((step) => (
            <li
              key={step}
              className="type-body border-b border-border py-3 text-foreground"
            >
              {step}
            </li>
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

  const firstName = recipient.split(/\s+/)[0] ?? "";

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
          <h1 className="type-display">{recipient || "you"}</h1>

          {/* type-h4 rather than an ad-hoc size: it's the system's step between
              the display name and caption text, and the note needs to sit above
              caption without approaching the name. */}
          {note && <p className="type-h4 mt-6 text-muted-foreground">{note}</p>}

          {from && (
            <p className="type-caption mt-8 text-muted-foreground">
              From <span className="text-foreground">{from}</span>
            </p>
          )}
        </div>
      </section>

      <SectionRule />

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
              onSeeDetails={() => setPanelOpen(true)}
            />
          ) : (
            <PromptBuild value={draft} onChange={setDraft} />
          )}
        </div>
      </section>

      <SectionRule />

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
              ? "Sign up and this template is waiting in your workspace. Change anything in plain English, then publish it to your client portal."
              : "Sign up and Assembly builds this idea in your workspace. Keep refining it in plain English, then publish it to your client portal."}
          </p>
          <div className="mx-auto mt-8 flex w-full max-w-xs flex-col items-stretch gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:items-center sm:justify-center">
            <Link
              href={startHref}
              className="rounded-lg bg-foreground px-5 py-2.5 text-center text-sm text-background transition-opacity hover:opacity-90"
            >
              {firstName ? `Get started, ${firstName}` : "Get started"}
            </Link>
          </div>
          <p className="type-caption mt-4 text-muted-foreground">
            Free to start. No card required.
          </p>
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
