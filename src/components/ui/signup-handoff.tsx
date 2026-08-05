"use client";

import { useMemo, useState } from "react";
import {
  buildSignupUrl,
  INVALID_EMAIL_ERROR,
  LOGIN_URL,
  type SignupTemplate,
} from "@/lib/constants";
import { GoogleIcon } from "@/components/ui/google-icon";

/**
 * The hand-off to the real signup on dashboard: Google, or an email. Whatever
 * the visitor arrived with (a prompt, a template, and the address they typed)
 * rides along in the URL so signup opens already holding it.
 *
 * Shared by the /get-started sheet and the personalized /proposal page — the two
 * screens frame it differently, but the door itself must be the same one.
 */
export function SignupHandoff({
  prompt,
  template,
  emailCtaLabel = "Continue with email",
  inputRef,
}: {
  prompt?: string;
  template?: SignupTemplate;
  emailCtaLabel?: string;
  /** Lets the page put the cursor here (e.g. after a CTA elsewhere on it). */
  inputRef?: React.RefObject<HTMLInputElement | null>;
}) {
  const [email, setEmail] = useState("");
  // Validation lives in the page, not the browser: the native bubble is a
  // system chrome popover that ignores every type and colour decision here.
  const [emailError, setEmailError] = useState("");
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  // Google always hands off with prompt/template only; email adds the address
  // so signup can prefill it.
  const googleHref = useMemo(
    () => buildSignupUrl(prompt || undefined, template),
    [prompt, template],
  );
  const emailHref = useMemo(
    () => buildSignupUrl(prompt || undefined, template, email.trim() || undefined),
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
            setEmailError("Enter your email to continue.");
            return;
          }
          if (!emailValid) {
            setEmailError(INVALID_EMAIL_ERROR);
            return;
          }
          window.location.href = emailHref;
        }}
        className="flex flex-col gap-3"
      >
        {/* No field label: the placeholder already names the field, and a label
            between "or" and the input broke the stack's rhythm. */}
        <div className="flex flex-col gap-1.5">
          <input
            ref={inputRef}
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
          {emailCtaLabel}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <a
          href={LOGIN_URL}
          className="text-foreground transition-opacity hover:opacity-70"
        >
          Log in
        </a>
      </p>
    </div>
  );
}
