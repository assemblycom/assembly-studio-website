"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { TEMPLATES } from "@/lib/templates";
import { PlaceholderArt } from "@/components/templates/template-gallery";
import { V69CardMock } from "@/components/home/hero-v71";
import { useTheme } from "@/components/theme/theme-provider";
import { buildSignupUrl, LOGIN_URL } from "@/lib/constants";

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

// The preview panel's fill — the same blue the how-it-works step visuals sit
// on, so this screen carries the colour the visitor just came from.
const PANEL_BLUE = "#7DA4FF";
// The same blue at a wash, for the one control that sits on the card.
const SHARE_TINT = "rgba(125,164,255,0.16)";

// Where a long pasted prompt gets cut off, so a wall of text never dominates
// the card. Eight lines EXACTLY: the paragraph is set in `type-body`, whose
// 15px/1.6 works out to 24px lines, so the cap lands on a line boundary. It
// used to cut a row of glyphs in half, and half a letterform under a fade is
// most of what made the clamp look broken rather than continued.
const PROMPT_LINE_HEIGHT = 24;
const PROMPT_COLLAPSED_MAX = PROMPT_LINE_HEIGHT * 8;

// The fade is a mask on the text itself, not a card-coloured gradient laid over
// it — so it stays correct on any surface and in either theme. Multi-stop
// rather than a straight two-stop ramp: a linear fade reaches half-opacity
// early and leaves a visible band where it begins, which reads as a smear
// across the last line instead of a soft ending.
const PROMPT_FADE = [
  "linear-gradient(to bottom",
  "#000 calc(100% - 34px)",
  "rgba(0,0,0,0.82) calc(100% - 23px)",
  "rgba(0,0,0,0.45) calc(100% - 12px)",
  "rgba(0,0,0,0.12) calc(100% - 5px)",
  "transparent 100%)",
].join(", ");

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

function IconCheck({ className = "" }: { className?: string }) {
  return (
    // The desktop-provided mark, like IconLink beside it: filled (not stroked),
    // 18×20, so it's sized by height with the width left to match.
    <svg className={className} viewBox="0 0 18 20" fill="currentColor" aria-hidden>
      <path d="M17.1094 2.67585C17.5312 2.97663 17.625 3.56257 17.3242 3.98444L7.01172 18.3594C6.85156 18.5821 6.60156 18.7266 6.32813 18.7462C6.05469 18.7657 5.78125 18.6719 5.58594 18.4766L0.273437 13.1641C-0.09375 12.7969 -0.09375 12.2032 0.273437 11.8399C0.640625 11.4766 1.23438 11.4727 1.59766 11.8399L6.13281 16.3673L15.8008 2.89069C16.1016 2.46882 16.6875 2.37507 17.1094 2.67585Z" />
    </svg>
  );
}

// execCommand-based copy for contexts where the async Clipboard API is denied.
// Returns whether the copy succeeded.
function legacyCopy(text: string): boolean {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

// Copy-the-current-link control. Grabs whatever's in the address bar, so it
// carries the prompt/template/for params exactly as the visitor sees them —
// which is the whole point of making these pages shareable.
function CopyLinkButton() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const copy = async () => {
    const url = window.location.href;
    let ok = false;
    // Prefer the async Clipboard API; fall back to a hidden-textarea copy for
    // contexts where it's blocked (older browsers, some embedded webviews).
    try {
      await navigator.clipboard.writeText(url);
      ok = true;
    } catch {
      ok = legacyCopy(url);
    }
    if (!ok) return;
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-live="polite"
      // Tinted with the panel's own blue rather than outlined: an outline
      // button on the white card read as an empty field, and the tint ties the
      // control to the surface it sits on instead of borrowing the sign-up
      // column's chrome.
      style={{ backgroundColor: SHARE_TINT }}
      className="flex h-12 w-full items-center justify-center gap-1.5 rounded-lg text-sm text-foreground transition-opacity hover:opacity-80"
    >
      {/* Text only at rest; the check is the confirmation's whole signal, so it
          earns its place where the link icon didn't. "Share" names the intent,
          the confirmation names the mechanic. */}
      {copied && <IconCheck className="h-3.5 w-[13px] text-foreground" />}
      {copied ? "Link copied" : "Share"}
    </button>
  );
}

// The submitted prompt. Preserves the visitor's own line breaks and spacing
// (whitespace-pre-wrap) so a multi-paragraph paste reads the way it was
// written, and cuts a long one off at the cap. No "show more": this is context
// for the sign-up step beside it, not the thing you came here to read, and the
// whole prompt travels with the link either way.
function PromptCard({ prompt }: { prompt: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Compare full height against the cap so the fade is only laid on a prompt
    // that actually runs past it — on a short one it would wash out its last
    // line for nothing.
    setOverflows(el.scrollHeight > PROMPT_COLLAPSED_MAX + 4);
  }, [prompt]);

  return (
    <p
      ref={ref}
      style={
        overflows
          ? {
              maxHeight: PROMPT_COLLAPSED_MAX,
              WebkitMaskImage: PROMPT_FADE,
              maskImage: PROMPT_FADE,
            }
          : undefined
      }
      className={`whitespace-pre-wrap text-pretty break-words type-body text-foreground ${
        overflows ? "overflow-hidden" : ""
      }`}
    >
      {prompt}
    </p>
  );
}

// The context half: the artwork runs the full panel, and the words sit in a
// card floating at its centre. Text over a screenshot needs something to sit
// on — the card is that surface, and it keeps the copy legible whatever the
// artwork behind it turns out to be.
type PreviewProps = {
  template?: (typeof TEMPLATES)[number];
  prompt: string;
  preparedFor: string;
};

// What you picked, as a card: meta on top, the widget in the middle, the name
// underneath.
function PreviewCard({
  template,
  prompt,
  preparedFor,
  share = false,
}: PreviewProps & {
  share?: boolean;
}) {
  const { theme } = useTheme();
  const dark = theme === "dark";

  return (
    // Same sheet treatment as the templates quick-look modal — 20px radius,
    // solid surface and a hairline ring, no shadow — so a picked template looks
    // like the same object everywhere it shows up, sheet included.
    <div className="w-full max-w-sm rounded-[20px] bg-background p-4 ring-1 ring-black/[0.06] [[data-theme=dark]_&]:bg-[#1e1e1e] [[data-theme=dark]_&]:ring-white/[0.12]">
      <div className="flex items-baseline justify-between gap-3 px-1 pb-3 pt-1">
        {/* Body face, sentence case — the mono eyebrow belongs to the marketing
            sections, and inside a card it read as a system label rather than a
            caption on what you picked. */}
        <p className="type-caption shrink-0 whitespace-nowrap text-muted-foreground">
          You&apos;re building
        </p>
        {preparedFor && (
          <p className="type-caption truncate text-muted-foreground">
            For <span className="text-foreground">{preparedFor}</span>
          </p>
        )}
      </div>

      {template ? (
        // The template's own cover widget — the same live mock the templates
        // grid and the hero rail use, so what you picked looks the way it
        // looked when you picked it.
        <div className="relative aspect-[5/4] overflow-hidden rounded-xl border border-border bg-background [[data-theme=dark]_&]:border-white/[0.08] [[data-theme=dark]_&]:bg-[#151515]">
          <div
            className={`template-mock h-full w-full [font-family:var(--font-inter),system-ui,sans-serif] ${
              dark ? "v72-mock-dark" : ""
            }`}
          >
            <V69CardMock slug={template.slug} />
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-muted/50 p-5 [[data-theme=dark]_&]:border-white/[0.12] [[data-theme=dark]_&]:bg-white/[0.06]">
          {prompt ? (
            <PromptCard prompt={prompt} />
          ) : (
            <p className="type-h4 text-foreground">
              A brand-new app, from a blank canvas.
            </p>
          )}
        </div>
      )}

      {template && (
        <div className="px-1 pb-1 pt-3">
          <h1 className="type-h4 text-foreground">{template.title}</h1>
          <p className="type-caption mt-0.5 text-pretty text-muted-foreground">
            {template.description}
          </p>
        </div>
      )}

      {/* Share belongs to the thing being shared, so it rides on the card
          rather than floating in the panel's corner. The sheet supplies its
          own, hence only the standalone card carries it. */}
      {share && (
        <div className="pt-4">
          <CopyLinkButton />
        </div>
      )}
    </div>
  );
}

function PreviewPanel(props: PreviewProps) {
  const art = props.template?.images?.[0];

  return (
    // Stacked, the panel is only as tall as the card it holds — a half-screen
    // of empty frame above the form is the wrong order of business on a phone.
    // Stacked, the panel is capped and centred: full-bleed it becomes a wide,
    // short band that crops the artwork hard and dwarfs the card inside it.
    <div
      className="relative isolate mx-auto w-full max-w-xl flex-none overflow-hidden rounded-[20px] lg:max-w-none lg:min-h-[420px] lg:flex-1"
      style={{ backgroundColor: PANEL_BLUE }}
    >
      {art ? (
        <>
          <Image
            src={art}
            alt=""
            fill
            quality={90}
            sizes="(min-width: 1024px) 50vw, 100vw"
            // Cover, not contain: the artwork is a backdrop here, so filling
            // the panel matters more than showing every pixel of it.
            className="object-cover object-left-top"
          />
          {/* Knocks the screenshot back so it reads as a backdrop and the card
              on top of it stays the thing you look at. */}
          <div className="absolute inset-0 bg-background/45 [[data-theme=dark]_&]:bg-black/70" />
        </>
      ) : (
        !props.template && !props.prompt && <PlaceholderArt />
      )}

      {/* Padding only grows at xl: between lg and xl the column is narrow
          enough that a 40px inset left the card filling the frame edge to
          edge, with no artwork visible around it. */}
      <div className="relative flex h-full items-center justify-center p-6 xl:p-10">
        <PreviewCard {...props} share />
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
}: {
  preview?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    // The rotating gradient frame carries over to the real sign-in this screen
    // hands off to, so the two screens read as one flow. See `.studio-glow-frame`.
    <div className="studio-glow-frame min-h-screen p-3">
      {/* Split screen at lg: the account step on the left, what you're about to
          build on the right — so the context stays in view while you sign up
          instead of being something you scroll past. Below lg the preview is
          dropped entirely and the screen is the sign-up step alone; every way
          of fitting it onto a phone (a bottom sheet, a band, a card) fought the
          form for the space it needs. */}
      <div className="relative grid min-h-[calc(100vh-24px)] overflow-hidden rounded-[24px] bg-background lg:grid-cols-2">
        {/* Corner-anchored so neither column has to give up room for it. The
            mark is natively dark, so dark mode inverts it, matching the nav. */}
        <Link
          href="/"
          aria-label="Assembly Studio"
          className="absolute left-8 top-8 z-10 hidden items-center lg:flex"
        >
          <Image
            src="/images/logo-mark.svg"
            alt="Assembly Studio"
            width={22}
            height={22}
            priority
            className="[[data-theme=dark]_&]:brightness-0 [[data-theme=dark]_&]:invert"
          />
        </Link>

        {/* Barely any inset — the artwork panel is a whole half of the page, so
            the column gives it everything but a margin. No rule and no tint
            between the halves: the split is carried by the columns themselves. */}
        <aside className="order-2 hidden flex-col p-4 pt-0 lg:flex lg:p-6">
          <div className="flex flex-1 flex-col">{preview}</div>
        </aside>

        <main className="order-1 flex flex-col px-6 pb-14 pt-12 lg:px-14 lg:pt-12 xl:px-20">
          <div className="flex flex-1 flex-col justify-center">
            <div className="mx-auto w-full max-w-sm lg:py-0">
              {/* The mark leads the column on a phone, where there's no corner
                  to hang it in — set in a rounded square so it reads as the
                  app's own mark rather than a stray glyph. */}
              <Link
                href="/"
                aria-label="Assembly Studio"
                className="mx-auto mb-6 flex size-14 items-center justify-center rounded-xl bg-foreground lg:hidden"
              >
                <Image
                  src="/images/logo-mark.svg"
                  alt="Assembly Studio"
                  width={30}
                  height={30}
                  priority
                  className="brightness-0 invert [[data-theme=dark]_&]:invert-0"
                />
              </Link>
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function GetStartedContent() {
  const params = useSearchParams();
  const prompt = params.get("prompt")?.trim() ?? "";
  const templateSlug = params.get("template") ?? "";
  const template = templateSlug
    ? TEMPLATES.find((t) => t.slug === templateSlug)
    : undefined;
  // Optional personalization for a shared link (e.g. after a sales call).
  const preparedFor = params.get("for")?.trim() ?? "";

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
      preview={
        <PreviewPanel
          template={template}
          prompt={prompt}
          preparedFor={preparedFor}
        />
      }
    >
      {/* Hand-off to signup — mirrors the app's own signup: Google, or an
          email. Carries the prompt/template (and email) along. */}
      <div>
        {/* Titles the column so the form has a head of its own, and replaces the
            old "Create your account" label rather than stacking a third line of
            copy above the buttons. Body face, not the mono eyebrow — Diatype
            belongs to the marketing sections, not the form. */}
        {/* Fluid rather than stepped: the scale's own 22→30 lands entirely on
            the md breakpoint, so the heading dropped a third of its size in one
            pixel of resize. These ramp continuously between the same two ends. */}
        <h2
          className="type-h3 text-center text-foreground"
          style={{ fontSize: "clamp(1.375rem, 0.884vw + 1.17rem, 1.875rem)" }}
        >
          Welcome to Assembly
        </h2>
        <p
          className="type-lead mt-2 text-center text-muted-foreground"
          style={{ fontSize: "clamp(0.9375rem, 0.11vw + 0.912rem, 1rem)" }}
        >
          Create your account to start building.
        </p>

        <a href={googleHref} className={`mt-8 ${oauth}`}>
          <GoogleIcon className="size-[18px]" />
          Continue with Google
        </a>

        {/* Equal air above and below — the divider has to sit exactly between
            the two options, not closer to one of them. */}
        <div className="my-4 flex items-center gap-3">
          <span aria-hidden className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <span aria-hidden className="h-px flex-1 bg-border" />
        </div>

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
              className="h-12 rounded-lg border border-border bg-background px-4 text-base text-foreground outline-none transition-colors placeholder:text-sm placeholder:text-muted-foreground focus:border-foreground/40 aria-[invalid=true]:border-[var(--mock-negative-fg)] sm:text-sm [[data-theme=dark]_&]:border-[#383838] [[data-theme=dark]_&]:aria-[invalid=true]:border-[var(--mock-negative-fg)]"
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
          className="underline underline-offset-2 transition-colors hover:text-foreground"
        >
          Log in
        </a>
      </p>
    </GetStartedShell>
  );
}

export default function GetStartedPage() {
  return (
    <Suspense fallback={<GetStartedShell />}>
      <GetStartedContent />
    </Suspense>
  );
}
