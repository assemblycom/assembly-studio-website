"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { TEMPLATES } from "@/lib/templates";
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

// Collapsed height for a long pasted prompt — roughly six lines. Past this we
// clamp and offer "Show more" so a wall of text never dominates the screen.
const PROMPT_COLLAPSED_MAX = 168;

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

function IconLink({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M8.5 11.5a2.5 2.5 0 0 0 3.6.1l2.4-2.4a2.55 2.55 0 0 0-3.6-3.6l-1.2 1.2" />
      <path d="M11.5 8.5a2.5 2.5 0 0 0-3.6-.1l-2.4 2.4a2.55 2.55 0 0 0 3.6 3.6l1.2-1.2" />
    </svg>
  );
}

function IconCheck({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4.5 10.5 8 14l7.5-8" />
    </svg>
  );
}

function IconChevron({
  className = "",
  open = false,
}: {
  className?: string;
  open?: boolean;
}) {
  return (
    <svg
      className={`${className} transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 7.5 10 12.5 15 7.5" />
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
      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
    >
      {copied ? (
        <IconCheck className="size-3.5 text-foreground" />
      ) : (
        <IconLink className="size-3.5" />
      )}
      {copied ? "Link copied" : "Copy link"}
    </button>
  );
}

// The submitted prompt. Preserves the visitor's own line breaks and spacing
// (whitespace-pre-wrap) so a multi-paragraph paste reads the way it was
// written, and clamps a long one behind "Show more".
function PromptCard({ prompt }: { prompt: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Compare full height against the collapsed cap to decide whether the
    // toggle is needed at all (short prompts never show it).
    setOverflows(el.scrollHeight > PROMPT_COLLAPSED_MAX + 4);
  }, [prompt]);

  const clamped = overflows && !expanded;

  return (
    <div>
      <div className="relative">
        <p
          ref={ref}
          style={clamped ? { maxHeight: PROMPT_COLLAPSED_MAX } : undefined}
          className={`whitespace-pre-wrap text-pretty break-words text-lg leading-relaxed text-foreground ${
            clamped ? "overflow-hidden" : ""
          }`}
        >
          {prompt}
        </p>
        {/* Fade the clamped edge so it reads as "there's more" rather than a
            hard cut. */}
        {clamped && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-card to-transparent" />
        )}
      </div>
      {overflows && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {expanded ? "Show less" : "Show more"}
          <IconChevron className="size-4" open={expanded} />
        </button>
      )}
    </div>
  );
}

// A picked template: a real-looking preview, a one-line summary, and the full
// description + features tucked behind a disclosure (not shown by default).
function TemplateCard({ slug }: { slug: string }) {
  const template = TEMPLATES.find((t) => t.slug === slug)!;
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div>
      {/* Text only — the mock preview was dropped here so this card states what
          you picked without competing with the account step below it. */}
      <p className="type-eyebrow text-muted-foreground">{template.category}</p>
      <h1 className="mt-2 text-xl font-medium leading-snug text-foreground">
        {template.title}
      </h1>
      {/* The one-liner — always visible. */}
      <p className="mt-1.5 text-pretty text-sm leading-relaxed text-muted-foreground">
        {template.description}
      </p>

      <button
        type="button"
        onClick={() => setShowDetails((v) => !v)}
        aria-expanded={showDetails}
        className="mt-3 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        {showDetails ? "Hide details" : "See details"}
        <IconChevron className="size-4" open={showDetails} />
      </button>

      {/* Full description + what's included — the "not shown by default" part. */}
      <div
        className={`grid transition-all duration-300 ease-out ${
          showDetails ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-pretty text-sm leading-relaxed text-foreground/80">
            {template.longDescription}
          </p>
          {template.features.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {template.features.map((f) => (
                <li
                  key={f}
                  className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground"
                >
                  {f}
                </li>
              ))}
            </ul>
          )}
        </div>
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

  // Disabled reads as a muted surface rather than a faded fill: at 40% opacity
  // `bg-foreground` over the dark ground landed on a solid mid-grey that looked
  // like an enabled button.
  const primary =
    "flex items-center justify-center rounded-lg bg-foreground px-5 py-3 text-center text-sm text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:hover:opacity-100";
  const oauth =
    "flex items-center justify-center gap-2.5 rounded-lg border border-foreground/20 bg-transparent px-5 py-3 text-center text-sm font-medium text-foreground transition-colors hover:bg-foreground/5";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Minimal header — the real logo mark (same asset the site nav uses)
          plus the shareable-link control. The mark is natively dark, so dark
          mode inverts it to white, matching the nav's treatment. */}
      <header className="flex items-center justify-between px-6 py-6 md:px-10">
        <Link href="/" aria-label="Assembly Studio" className="flex items-center">
          <Image
            src="/images/logo-mark.svg"
            alt="Assembly Studio"
            width={22}
            height={22}
            priority
            className="[[data-theme=dark]_&]:brightness-0 [[data-theme=dark]_&]:invert"
          />
        </Link>
        <CopyLinkButton />
      </header>

      <main className="flex flex-1 items-center justify-center px-6 pb-24">
        <div className="w-full max-w-md">
          {preparedFor && (
            <p className="mb-2 text-sm text-muted-foreground">
              Prepared for{" "}
              <span className="text-foreground">{preparedFor}</span>
            </p>
          )}
          <p className="type-eyebrow text-muted-foreground">You&apos;re building</p>

          {/* What the visitor started with. */}
          <div className="mt-4 rounded-xl border border-border bg-card p-6 [[data-theme=dark]_&]:border-[#383838]">
            {template ? (
              <TemplateCard slug={template.slug} />
            ) : prompt ? (
              <PromptCard prompt={prompt} />
            ) : (
              <p className="text-lg leading-relaxed text-foreground">
                A brand-new app, from a blank canvas.
              </p>
            )}
          </div>

          {/* Hand-off to signup — mirrors the app's own signup: Google, or an
              email. Carries the prompt/template (and email) along. Labelled like
              the block above so the page reads as two steps (here's what you're
              building → pick how to sign up) rather than two rival choices; the
              plain "or" is deliberately ruleless, since a full-width divider
              here split the step into two same-weight halves. */}
          <div className="mt-10">
            <p className="type-eyebrow text-muted-foreground">
              Create your account
            </p>

            <a href={googleHref} className={`mt-4 ${oauth}`}>
              <GoogleIcon className="size-[18px]" />
              Continue with Google
            </a>

            <p className="my-3 text-center text-xs text-muted-foreground">or</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (emailValid) window.location.href = emailHref;
              }}
              className="flex flex-col gap-3"
            >
              {/* The placeholder already names the field, and a visible label
                  here outweighed the step heading above it. */}
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/40 [[data-theme=dark]_&]:border-[#383838]"
              />
              <button type="submit" disabled={!emailValid} className={primary}>
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
        </div>
      </main>
    </div>
  );
}

export default function GetStartedPage() {
  return (
    <Suspense fallback={null}>
      <GetStartedContent />
    </Suspense>
  );
}
