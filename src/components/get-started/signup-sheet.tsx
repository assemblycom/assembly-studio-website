"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TEMPLATES } from "@/lib/templates";
import { PROMPT_IDEAS } from "@/components/home/prompt-ideas";
import { buildSignupUrl, LOGIN_URL } from "@/lib/constants";
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

function GoogleIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 18 18" aria-hidden focusable="false">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}

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
  dismissHref?: string;
  withBackdrop?: boolean;
}) {
  const router = useRouter();

  // Clicking the page behind, or pressing Escape, puts you back where you were —
  // the sheet is a step on top of that page, so it dismisses like one. A push
  // rather than history.back(): the prompt rides in the URL, so the composer is
  // still holding what you typed even on a link opened cold.
  const dismiss = useCallback(() => {
    // A push either way, never history.back(): the prompt rides in the URL, so
    // whether the page behind stayed mounted or not, the composer is holding what
    // you typed when the sheet closes.
    router.push(dismissHref);
  }, [router, dismissHref]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [dismiss]);

  return (
    // In context: the page you came from is still there behind the sheet, dimmed
    // and blurred, rather than replaced by a ground of its own — so signing up
    // reads as a step on top of what you were doing, not a different screen. The
    // backdrop is inert (aria-hidden, no pointer events) and the whole thing is
    // fixed, so nothing behind it scrolls under the sheet.
    <div className="relative flex min-h-screen items-center justify-center p-4 sm:p-6 max-[479px]:items-end max-[479px]:p-0">
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
      <main className="relative z-10 w-full max-w-md rounded-[24px] bg-background px-6 py-10 shadow-[0_30px_80px_-50px_rgba(0,0,0,0.55)] sm:px-10 sm:py-12 max-[479px]:max-w-none max-[479px]:rounded-b-none max-[479px]:pb-12 max-[479px]:shadow-none [[data-theme=dark]_&]:bg-[#171717] [[data-theme=dark]_&]:ring-1 [[data-theme=dark]_&]:ring-white/[0.10]">
        <div>
          <div className="mx-auto w-full max-w-sm">
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

function GetStartedContent({ withBackdrop }: { withBackdrop: boolean }) {
  const params = useSearchParams();
  const prompt = params.get("prompt")?.trim() ?? "";
  const templateSlug = params.get("template") ?? "";
  const template = templateSlug
    ? TEMPLATES.find((t) => t.slug === templateSlug)
    : undefined;

  const [email, setEmail] = useState("");
  // Validation lives in the page, not the browser: the native bubble is a
  // system chrome popover that ignores every type and colour decision here.
  const [emailError, setEmailError] = useState("");
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  // Google always hands off with prompt/template only; email adds the address
  // so signup can prefill it.
  const googleHref = useMemo(
    () => buildSignupUrl(prompt || undefined, template?.slug),
    [prompt, template],
  );
  const emailHref = useMemo(
    () => buildSignupUrl(prompt || undefined, template?.slug, email.trim() || undefined),
    [prompt, template, email],
  );

  // Never renders a disabled state: a greyed-out button on a signup screen
  // reads as "this is broken" before you've typed anything. It stays live and
  // the field's own validation catches an empty or malformed address.
  // Hover fades the fill in light mode, but in dark that pulls a soft-white
  // button *toward* the near-black ground and the hover reads as a dim-out.
  // There it brightens to full white instead — same gesture, right direction.
  const primary =
    "flex h-12 items-center justify-center rounded-lg bg-foreground px-5 text-center text-sm text-background transition-[opacity,background-color] hover:opacity-90 [[data-theme=dark]_&]:hover:bg-white [[data-theme=dark]_&]:hover:opacity-100";
  const oauth =
    "flex h-12 items-center justify-center gap-2.5 rounded-lg border border-foreground/20 bg-transparent px-5 text-center text-sm text-foreground transition-colors hover:bg-foreground/5";

  return (
    <GetStartedShell
      preview={<PreviewCard template={template} prompt={prompt} />}
      dismissHref={prompt ? `/?prompt=${encodeURIComponent(prompt)}` : "/"}
      withBackdrop={withBackdrop}
    >
      {/* Hand-off to signup — mirrors the app's own signup: Google, or an
          email. Carries the prompt/template (and email) along. */}
      <div>
        <a href={googleHref} className={oauth}>
          <GoogleIcon className="size-[18px]" />
          Continue with Google
        </a>

        {/* No "or" rule between the two: a divider frames them as a fork — carry
            on with Google, or else sign up with an email — when they are two ways
            through the same door, and both carry the prompt. Plain space instead,
            a step wider than the gap inside the email pair so the two options
            still read as separate choices. */}
        <div className="h-3" />

        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (!email.trim()) {
              setEmailError("Add your email to continue.");
              return;
            }
            if (!emailValid) {
              setEmailError("Double-check that email address.");
              return;
            }
            window.location.href = emailHref;
          }}
          className="flex flex-col gap-3"
        >
          {/* No field label: the placeholder already names the field, and a
              label between "or" and the input broke the stack's rhythm — the
              divider sat 16px under Google and 42px above the email row. */}
          <div className="flex flex-col gap-1.5">
            <input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              aria-label="Email"
              aria-invalid={emailError ? true : undefined}
              aria-describedby={emailError ? "email-error" : undefined}
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
              }}
              // text-base below sm is not a type choice — iOS Safari zooms the
              // page on focus for any input under 16px. But at rest the field
              // shows its placeholder, and at 16 that sat a step above the two
              // 14px buttons around it. So the placeholder drops to 14 and the
              // value stays at 16, keeping the zoom guard.
              className="h-12 rounded-lg border border-foreground/20 bg-background px-4 text-base text-foreground outline-none transition-colors placeholder:text-sm placeholder:text-muted-foreground focus:border-foreground/40 aria-[invalid=true]:border-[var(--mock-negative-fg)] sm:text-sm [[data-theme=dark]_&]:bg-transparent [[data-theme=dark]_&]:aria-[invalid=true]:border-[var(--mock-negative-fg)]"
            />
            {emailError && (
              <p
                id="email-error"
                role="alert"
                className="type-caption text-[var(--mock-negative-fg)]"
              >
                {emailError}
              </p>
            )}
          </div>
          <button type="submit" className={primary}>
            Continue with email
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <a
          href={LOGIN_URL}
          className="text-foreground transition-opacity hover:opacity-70"
        >
          Log in
        </a>
      </p>
    </GetStartedShell>
  );
}

export function GetStartedSheet({
  withBackdrop = true,
}: {
  withBackdrop?: boolean;
}) {
  return (
    <Suspense fallback={<GetStartedShell withBackdrop={withBackdrop} />}>
      <GetStartedContent withBackdrop={withBackdrop} />
    </Suspense>
  );
}
