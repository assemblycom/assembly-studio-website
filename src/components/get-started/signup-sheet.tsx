"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TEMPLATES } from "@/lib/templates";
import { PROMPT_IDEAS } from "@/components/home/prompt-ideas";
import { SignupHandoff } from "@/components/ui/signup-handoff";
import { HeroV76 } from "@/components/home/hero-v76";

// ─────────────────────────────────────────────────────────────────────────
// GET STARTED — the continuation screen between submitting (a custom prompt or
// a template) and the real signup on dashboard. It shows the visitor what they
// started with — so the jump to signup doesn't feel abrupt — then hands off,
// carrying that context. Everything is driven by URL params so a link fully
// reconstructs the screen; that's also what makes it shareable:
//   ?prompt=…        the composer prompt (newlines preserved)
//   ?template=slug   a picked template (shown with a preview + details)
//   ?for=Full%20Name optional "Prepared for …" personalization
// ─────────────────────────────────────────────────────────────────────────

// What you arrived with: the label on top and the words in a well under it. Two
// lines at rest, opening to five on a click, with the cut marked by the clamp's
// ellipsis under a soft fade rather than by a control — it's a reminder of what you asked for on the way to signing up,
// not the thing you came here to read, and the whole prompt travels with the link.
// A template reads the same way a typed prompt does; its own cover mock made the
// two arrivals look like different kinds of thing.
type PreviewProps = {
  template?: (typeof TEMPLATES)[number];
  prompt: string;
};

// A mask on the text itself rather than a well-coloured gradient over it, so it
// stays right on either theme. It only softens the last line rather than erasing
// it — the clamp's ellipsis has to survive the fade, since the dots are what say
// there's more, and a fade to nothing swallowed them.
const PROMPT_FADE =
  "linear-gradient(to bottom, #000 50%, rgba(0,0,0,0.55) 100%)";

function PreviewCard({ template, prompt }: PreviewProps) {
  // A picked template reads as the request you'd have typed: the Prompt Idea of
  // the same name where there is one — those are the spec-rich lines the composer
  // seeds — and otherwise the template's own long description, opened with
  // "Build …" so it starts like a prompt rather than like a catalogue entry.
  const asked = template
    ? (PROMPT_IDEAS.find(
        (idea) => idea.label.toLowerCase() === template.title.toLowerCase(),
      )?.prompt ??
      `Build a ${template.title.toLowerCase()}. ${template.longDescription ?? template.description}`)
    : prompt || "A brand-new app, from a blank canvas.";

  const [expanded, setExpanded] = useState(false);
  // Whether the cap is actually cutting anything off, so a prompt that fits gets
  // no fade and the row stays inert. Measured rather than guessed from the
  // length: two lines is however much fits the card's width.
  const ref = useRef<HTMLParagraphElement | null>(null);
  const [overflows, setOverflows] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setOverflows(el.scrollHeight > el.clientHeight + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [asked, expanded]);

  const canOpen = overflows || expanded;

  return (
    <div className="w-full">
      {/* The label is a caption on the row under it, so it sits on the card
          itself: framed, it made a box inside a box and the two hairlines
          competed. Body face, sentence case — the mono eyebrow belongs to the
          marketing sections. */}
      <p className="type-caption px-0.5 pb-1.5 text-muted-foreground">
        You&apos;re building
      </p>

      {/* The hairline is what makes the row visible; the fill only has to lift it
          off the card. Same radius and inset as the controls below it, but sized
          by its text rather than pinned to their height. The whole row is the
          control when there's more to see — a fade says "continues", and a
          "See more" label under it was a second thing to read. */}
      <div
        {...(canOpen
          ? {
              role: "button" as const,
              tabIndex: 0,
              "aria-expanded": expanded,
              onClick: () => setExpanded((open) => !open),
              onKeyDown: (event: React.KeyboardEvent) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setExpanded((open) => !open);
                }
              },
            }
          : {})}
        className={`rounded-lg border border-foreground/15 bg-muted/60 px-4 py-3 [[data-theme=dark]_&]:border-white/[0.10] [[data-theme=dark]_&]:bg-white/[0.05] ${
          canOpen ? "cursor-pointer" : ""
        }`}
      >
        <p
          ref={ref}
          style={{
            maskImage: overflows ? PROMPT_FADE : undefined,
            WebkitMaskImage: overflows ? PROMPT_FADE : undefined,
          }}
          className={`type-body whitespace-pre-wrap break-words text-foreground ${
            expanded ? "line-clamp-5" : "line-clamp-2"
          }`}
        >
          {asked}
        </p>
      </div>
    </div>
  );
}

// Page chrome — the gradient frame and the minimal header. Split out from the
// content because everything below depends on the URL params, which suspend:
// with a `null` fallback the prerendered HTML was an empty page, so a real load
// flashed a blank screen before anything appeared. Rendering the shell as the
// fallback means the frame and header paint immediately and only the column
// inside them fills in.
function GetStartedShell({
  preview,
  children,
  // Intercepted (opened from inside the site) vs. standalone (a shared link or
  // a refresh). Only the intercepted one can close by stepping back.
  asModal = false,
  dismissHref = "/",
  // Standalone (a shared link, a refresh) has to draw the page behind the sheet
  // itself. Opened from the site, `app/@modal` renders this over the page that is
  // already mounted, so the copy would be a second one.
  withBackdrop = true,
}: {
  preview?: React.ReactNode;
  children?: React.ReactNode;
  // Where dismissing lands. Carries the prompt so the composer you came from
  // still holds what you typed.
  asModal?: boolean;
  dismissHref?: string;
  withBackdrop?: boolean;
}) {
  const router = useRouter();

  // Clicking the page behind, or pressing Escape, puts you back where you were —
  // the sheet is a step on top of that page, so it dismisses like one. A push
  // rather than history.back(): the prompt rides in the URL, so the composer is
  // still holding what you typed even on a link opened cold.
  // Closing is driven by local state as well as the router. Next's intercepted
  // slot does not reliably unmount on a soft URL change — `push` never cleared
  // it, and `back()` only sometimes did — so the sheet stayed on screen over a
  // page that had already navigated. Unmounting ourselves makes the close
  // deterministic; the router call still fixes up the URL and history.
  const [closed, setClosed] = useState(false);

  const dismiss = useCallback(() => {
    setClosed(true);
    // Intercepted route: step back. Pushing changes the URL but leaves the
    // @modal slot mounted — the sheet stayed on screen over a page that had
    // already navigated. Back is what actually clears the slot, and the entry
    // it returns to is the page the sheet was opened from, which still holds
    // the typed prompt because that page never unmounted.
    if (asModal) {
      router.back();
      return;
    }
    // Standalone (shared link, refresh): there's no history entry to return to,
    // so this navigates. The prompt rides in dismissHref so the composer on the
    // page we land on is still holding what was typed.
    router.push(dismissHref);
  }, [router, asModal, dismissHref]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [dismiss]);

  // Hold the page still behind the sheet WITHOUT touching layout.
  //
  // Two layout-based locks were tried here and both moved the page in the
  // instant before the sheet painted: overflow:hidden on <html> let the browser
  // clamp the scroll position (~130px jump), and pinning <body> at a negative
  // offset landed at the top of the page. Blocking the scroll *events* instead
  // mutates nothing — no clamp, no reflow, no scrollbar removal — so there is
  // nothing that can shift. The sheet's own scroller keeps working because
  // events originating inside it are left alone.
  const sheetRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const block = (event: Event) => {
      const target = event.target as Node | null;
      if (target && sheetRef.current?.contains(target)) return;
      event.preventDefault();
    };
    document.addEventListener("wheel", block, { passive: false });
    document.addEventListener("touchmove", block, { passive: false });
    return () => {
      document.removeEventListener("wheel", block);
      document.removeEventListener("touchmove", block);
    };
  }, []);

  if (closed) return null;

  return (
    // In context: the page you came from is still there behind the sheet, dimmed
    // and blurred, rather than replaced by a ground of its own — so signing up
    // reads as a step on top of what you were doing, not a different screen. The
    // backdrop is inert (aria-hidden, no pointer events) and the whole thing is
    // fixed, so nothing behind it scrolls under the sheet.
    // Fixed to the viewport, not a min-h-screen block in normal flow. In flow
    // this shell lands at the END of the document and centres inside itself, so
    // opening the sheet from anywhere down the page put it a full screen below
    // the fold and you had to scroll to find it. Fixed, it centres on what you
    // are actually looking at, wherever that is. overflow-y-auto so a sheet
    // taller than a short window can still be scrolled to its end.
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4 sm:p-6 max-[479px]:items-end max-[479px]:p-0">
      {withBackdrop && (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 overflow-hidden"
        >
          <HeroV76 />
        </div>
      )}
      {/* The scrim is also the way out: a light tint and a light blur, enough to
          settle the page behind without erasing it — at a heavier hand it
          flattened into grey and stopped reading as the page you came from, which
          is the whole point of showing it. */}
      <button
        type="button"
        aria-label="Close"
        onClick={dismiss}
        className="fixed inset-0 bg-[#0a0e1c]/20 backdrop-blur-[5px] [[data-theme=dark]_&]:bg-black/45"
      />

      {/* A centred card at almost every width, sized to what's in it rather than
          filling the window. Only a true phone (under 480px) gets the bottom
          sheet — full width, sat on the floor, top corners rounded, the native
          shape there. Above that the sheet had the floor but not the width, and
          read as a panel stuck to the bottom of the screen. */}
      {/* In dark mode the sheet has to lift off a near-black page, so it takes a
          surface a step above it and a hairline — the drop shadow that separates
          it in light mode does nothing there. */}
      <main
        ref={sheetRef}
        className="relative z-10 w-full max-w-md rounded-[24px] bg-background px-6 py-10 shadow-[0_30px_80px_-50px_rgba(0,0,0,0.55)] ring-1 ring-foreground/10 sm:px-10 sm:py-12 max-[479px]:max-w-none max-[479px]:rounded-b-none max-[479px]:pb-12 max-[479px]:shadow-none [[data-theme=dark]_&]:bg-[#171717] [[data-theme=dark]_&]:ring-white/[0.10]">
        <div>
          <div className="mx-auto w-full max-w-sm">
              {/* Names the sheet. h2 rather than h1: the intercepted variant
                  opens over a page that still has its own. h3 is the scale's
                  regular-weight heading step — 22px on a phone, 30px from md. */}
              <h2 className="type-h3 mb-6 text-center text-foreground">
                Create your account
              </h2>

              {/* What you arrived with leads the column at every width: it's the
                  reason you're on this screen, and at one row it costs the phone
                  no room worth arguing over. */}
              <div className="mb-8">{preview}</div>

            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

function GetStartedContent({
  withBackdrop,
  asModal,
}: {
  withBackdrop: boolean;
  asModal: boolean;
}) {
  const params = useSearchParams();
  const prompt = params.get("prompt")?.trim() ?? "";
  const templateSlug = params.get("template") ?? "";
  const template = templateSlug
    ? TEMPLATES.find((t) => t.slug === templateSlug)
    : undefined;

  return (
    <GetStartedShell
      preview={<PreviewCard template={template} prompt={prompt} />}
      dismissHref={prompt ? `/?prompt=${encodeURIComponent(prompt)}` : "/"}
      withBackdrop={withBackdrop}
      asModal={asModal}
    >
      {/* Hand-off to signup — mirrors the app's own signup: Google, or an
          email. Carries the prompt/template (and email) along. */}
      <SignupHandoff prompt={prompt} template={template?.slug} />
    </GetStartedShell>
  );
}

export function GetStartedSheet({
  withBackdrop = true,
  asModal = false,
}: {
  withBackdrop?: boolean;
  asModal?: boolean;
}) {
  return (
    <Suspense
      fallback={<GetStartedShell withBackdrop={withBackdrop} asModal={asModal} />}
    >
      <GetStartedContent withBackdrop={withBackdrop} asModal={asModal} />
    </Suspense>
  );
}
