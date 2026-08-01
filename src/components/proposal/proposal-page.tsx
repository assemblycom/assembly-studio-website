"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { TEMPLATES, type Template } from "@/lib/templates";
import { SignupHandoff } from "@/components/ui/signup-handoff";
import { FooterAurora } from "@/components/layout/footer";
import { useTheme } from "@/components/theme/theme-provider";
import { TemplateGallery } from "@/components/templates/template-gallery";
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
//   ?from=Sean Sullivan    who sent it
//   ?note=…                one personal line under their name
//
// Unlike /get-started (a sheet on top of the site) this is a full page with no
// navigation at all: there is one thing to do on it. The template's details open
// in a right-hand panel rather than a link, so reading them never costs the page.
// ─────────────────────────────────────────────────────────────────────────

/**
 * Template variant — the point is to see the thing. Real screenshots when the
 * template has them; otherwise the same widget cover the gallery cards use,
 * because a designed mock reads as the app and an empty placeholder frame reads
 * as a missing image. The feature list gives it substance without spending the
 * click on the details panel.
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

  return (
    <div className="mt-4">
      <h2 className="type-h3">{template.title}</h2>
      <p className="mt-3 text-base text-muted-foreground">{template.description}</p>

      <div className="mt-7">
        {hasScreenshots ? (
          <TemplateGallery
            title={template.title}
            images={template.images}
            previewCount={template.previewCount}
          />
        ) : (
          // Capped rather than full-bleed: these covers are drawn for a ~300px
          // gallery card, and stretched across the whole column the widget
          // floats in dead space instead of reading as a screen.
          <div className="relative aspect-[5/4] w-full max-w-[520px] overflow-hidden rounded-[20px] border border-border bg-background [[data-theme=dark]_&]:bg-[#151515]">
            <div
              className={`template-mock h-full w-full [font-family:var(--font-inter),system-ui,sans-serif] ${
                theme === "dark" ? "v72-mock-dark" : ""
              }`}
            >
              <V69CardMock slug={template.slug} />
            </div>
          </div>
        )}
      </div>

      <p className="mt-8 text-base leading-[1.75] text-foreground/80 md:text-[1.0625rem] md:leading-[1.85]">
        {template.longDescription}
      </p>

      {template.features.length > 0 && (
        <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
          {template.features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2.5 text-[0.9375rem] text-foreground/80"
            >
              <span className="mt-[0.6rem] size-1.5 shrink-0 rounded-full bg-foreground/40" />
              {feature}
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={onSeeDetails}
        className="mt-8 flex h-11 items-center justify-center gap-2 rounded-lg border border-foreground/20 px-5 text-sm text-foreground transition-colors hover:bg-foreground/5"
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
    </div>
  );
}

/**
 * Prompt variant — the point is that this is the idea someone had for them, in
 * their words. It's a live field rather than a quote block: nothing here is
 * saved anywhere, but being able to touch the words is what says the build
 * isn't fixed, and whatever it says at signup is what rides along.
 */
function PromptBuild({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="mt-4">
      <label className="sr-only" htmlFor="proposal-prompt">
        The app idea, yours to edit
      </label>
      <textarea
        id="proposal-prompt"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
        // field-sizing grows the box with the words, so a long idea is never
        // trapped behind a scrollbar inside the page.
        className="min-h-[9rem] w-full resize-none rounded-xl border border-border bg-muted/50 p-6 text-base leading-[1.85] text-foreground outline-none transition-colors [field-sizing:content] focus:border-foreground/30 md:p-8 md:text-[1.0625rem] [[data-theme=dark]_&]:bg-white/[0.03]"
      />
      <p className="type-caption mt-3 text-muted-foreground">
        Edit it here if something isn&rsquo;t right. You can keep changing it in
        plain English once the app is up.
      </p>
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
      {/* Holds the aurora off the content above it — the room the caption row
          used to take, so the colour still rises from the floor rather than
          climbing into the last section. */}
      <div className="h-32 md:h-40" />
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
  const [draft, setDraft] = useState(prompt || "A brand-new app, from a blank canvas.");

  const [panelOpen, setPanelOpen] = useState(false);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const startRef = useRef<HTMLDivElement | null>(null);

  // The floating mobile CTA is only useful while the signup block is off screen;
  // once it's in view the bar is a second copy of the button sitting on top of
  // the first one.
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

  // Every CTA that isn't the signup form itself lands on the signup form, with
  // the cursor already in the field.
  const goToSignup = () => {
    setPanelOpen(false);
    startRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    // After the scroll settles, so focus doesn't fight it (and so iOS doesn't
    // jump the keyboard up mid-animation).
    window.setTimeout(() => emailRef.current?.focus(), 500);
  };

  // What the page says about the build, in one line above the signup. It stands
  // in for the three-step "what happens next" list this page used to carry.
  const howItWorks = template
    ? "Sign up and this template is waiting in your workspace. Change anything in plain English, then publish it to your client portal."
    : "Sign up and this idea is waiting in your workspace, exactly as it reads above. Assembly builds it, you refine it in plain English, then publish it to your client portal.";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ProposalHeader />

      {/* Who it's for. It leads the page the way a name leads a letter: the
          label small above it, the name at display size, then one or two lines
          of framing and who it came from. */}
      <section className="px-6 pb-10 pt-8 md:px-10 md:pb-14 md:pt-16">
        <div className="mx-auto w-full max-w-6xl">
          <p className="type-caption text-muted-foreground">Prepared for</p>
          <h1 className="type-display mt-3">{recipient || "you"}</h1>

          {note && (
            <p className="type-lead mt-6 max-w-2xl text-foreground/85">{note}</p>
          )}

          {from && (
            <p className="type-caption mt-8 text-muted-foreground">
              From <span className="text-foreground">{from}</span>
            </p>
          )}
        </div>
      </section>

      <div className="px-6 md:px-10">
        <div className="mx-auto max-w-6xl border-t border-border" />
      </div>

      {/* The build on the left with room to breathe, the signup pinned
          alongside it on the right — the same composition as a template detail
          page, with the signup where the sidebar would be. Extra bottom padding
          on mobile clears the floating CTA. */}
      <section className="flex-1 px-6 pb-32 pt-12 md:px-10 md:pt-16 lg:pb-24">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
          <div>
            {/* The two variants say different things. A template proposal is
                "here is the app"; a prompt proposal is "here is the idea I had
                for you". Same page, different centre of gravity. */}
            <p className="type-caption text-muted-foreground">
              {template ? "What we’d build" : "The idea"}
            </p>

            {template ? (
              <TemplateBuild template={template} onSeeDetails={() => setPanelOpen(true)} />
            ) : (
              <PromptBuild value={draft} onChange={setDraft} />
            )}
          </div>

          {/* Signing up, kept in view the whole way down the page. */}
          <div ref={startRef} id="start" className="lg:sticky lg:top-10 lg:self-start">
            <p className="type-body mb-5 text-muted-foreground">{howItWorks}</p>
            <div className="rounded-2xl border border-border p-6 md:p-7 [[data-theme=dark]_&]:bg-white/[0.02]">
              <h2 className="type-h4">
                {firstName ? `Get started, ${firstName}` : "Get started"}
              </h2>
              <div className="mt-6">
                <SignupHandoff
                  prompt={template ? undefined : draft}
                  template={template?.slug}
                  emailCtaLabel="Continue with email"
                  inputRef={emailRef}
                />
              </div>
            </div>
            <p className="type-caption mt-4 text-center text-muted-foreground">
              Free to start. No card required.
            </p>
          </div>
        </div>
      </section>

      <ProposalFooter />

      {/* Mobile: the signup is at the foot of a long page, so the action floats
          until you reach it. Same treatment as the template sheet's action bar. */}
      <div
        className={`pointer-events-none fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-background via-background/90 to-transparent pb-4 pt-12 transition-opacity duration-300 lg:hidden ${
          startInView ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="pointer-events-auto px-6">
          <button
            type="button"
            onClick={goToSignup}
            tabIndex={startInView ? -1 : 0}
            aria-hidden={startInView}
            className="flex h-12 w-full items-center justify-center rounded-lg bg-foreground px-5 text-sm text-background"
          >
            Get started
          </button>
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
