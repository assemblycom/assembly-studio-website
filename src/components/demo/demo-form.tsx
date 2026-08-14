"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { FIELD_CLS, SelectMenu } from "@/components/ui/select-menu";
import { INVALID_EMAIL_ERROR, SIGNUP_URL } from "@/lib/constants";

// Chili Piper Concierge — on submit the lead is handed to the router, which
// opens its own booking modal over the page and takes the visitor through to a
// scheduled call. Loaded on this page only; nothing else on the site books.
const CHILIPIPER_TENANT = "copilotplatforms";
const CHILIPIPER_ROUTER = "assembly-studio-website";

// Lead keys are Chili Piper's, not ours — they come from the router's own field
// mapping and don't follow our naming.
type ChiliPiperLead = {
  "first-Name": string;
  "last-Name": string;
  email: string;
  "company-size": string;
  objectives: string;
  "company-name": string;
  industry: string;
};

declare global {
  interface Window {
    ChiliPiper?: {
      submit: (
        tenant: string,
        router: string,
        options: {
          trigger: string;
          lead: ChiliPiperLead;
          onClose?: () => void;
          onSuccess?: () => void;
          onError?: () => void;
        },
      ) => void;
    };
  }
}

// The same brackets assembly.com's book-demo form offers, so a lead routes and
// reports the same whichever form it came in through. The submitted value is
// that form's string verbatim; the label is ours, in the site's sentence case
// and en dashes.
const COMPANY_SIZES = [
  ["Just Me", "Just me"],
  ["2 - 5", "2–5"],
  ["6 - 10", "6–10"],
  ["11 - 50", "11–50"],
  ["51 - 100", "51–100"],
  ["100+", "100+"],
].map(([value, label]) => ({ value, label }));

// Guided demos are for firms of 11+, so the brackets below that can't book a
// time. Chili Piper routes them to a form instead of a calendar, and deliberately
// says nothing about why — which read as the page breaking, since the modal
// appeared and vanished with no feedback. These brackets get our own
// acknowledgement instead.
//
// The values are Chili Piper's own strings (see COMPANY_SIZES), and this list has
// to be kept in step with the router's rules by hand. If the threshold moves in
// Chili Piper and nobody edits this, the wrong visitors get the wrong screen.
const CANNOT_BOOK_SIZES = new Set(["Just Me", "2 - 5", "6 - 10"]);

// Chili Piper's own UI is suppressed for those brackets, because it has nothing
// to offer them: the modal opens, finds no calendar, and the router sends the
// browser to the main marketing site. That redirect took the visitor off this page
// entirely, so our acknowledgement never got read.
//
// Two things have to be stopped. The modal is hidden by CSS keyed on the tenant
// name in its iframe URL. The redirect arrives as a postMessage from that iframe
// which the concierge script turns into a window.location assignment, so the only
// way to refuse it is to swallow the message before their listener runs — hence
// the capture-phase listener registered on mount, ahead of the script itself.
//
// The lead is still submitted and still reaches the router: only the UI and the
// navigation are suppressed.
const SUPPRESS_STYLE_ID = "chilipiper-suppress";
const SUPPRESS_CSS = `iframe[src*="${"copilotplatforms"}.chilipiper.com"],
[id^="chilipiper"], [class*="chilipiper"] { display: none !important; }`;

const inputCls = `${FIELD_CLS} aria-[invalid=true]:border-[var(--mock-negative-fg)]`;

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="flex flex-col gap-1.5">
      <span className="text-sm text-foreground">{label}</span>
      {children}
      {error && (
        <p
          id={`${htmlFor}-error`}
          role="alert"
          className="type-caption text-[var(--mock-negative-fg)]"
        >
          {error}
        </p>
      )}
    </label>
  );
}

// The browser's own validation bubble is an OS overlay that ignores every type
// and colour decision on this page, so the form validates itself and shows the
// message inline — same reasoning as SelectMenu replacing a native <select>.
const REQUIRED_FIELDS = [
  { name: "firstName", message: "Enter your first name." },
  { name: "lastName", message: "Enter your last name." },
  { name: "company", message: "Enter your company name." },
  { name: "email", message: "Enter your work email." },
] as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = Partial<Record<string, string>>;

export function DemoForm() {
  // Booking happens in Chili Piper's modal, so this form only knows three
  // outcomes: still filling it in, a call actually booked, or the scheduler
  // never got far enough to book one.
  //
  // "booked" is set from Chili Piper's own onSuccess and nowhere else. It used to
  // be set from onError too, and from the case where the script hadn't loaded, so
  // a visitor whose lead the router rejected was told a specialist would be in
  // touch when nothing had been recorded anywhere. That is the worst way for this
  // page to fail: it loses the lead AND stops the visitor trying again.
  const [status, setStatus] = useState<
    "idle" | "booked" | "received" | "failed"
  >("idle");
  const [companySize, setCompanySize] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  // Kept so "Try again" can reopen the scheduler without making them retype it.
  const lead = useRef<ChiliPiperLead | null>(null);
  // Set for the length of a sub-threshold submit, and read by the listener below.
  const suppressing = useRef(false);

  // Registered on mount, which is before next/script loads the concierge
  // (afterInteractive), so this listener sees a message first and can stop theirs
  // from ever running. Scoped tightly: only while suppressing, only messages from
  // Chili Piper, and only the REDIRECT action — anything else is left alone.
  useEffect(() => {
    const swallowRedirect = (event: MessageEvent) => {
      if (!suppressing.current) return;
      // String test rather than new URL(origin): a sandboxed frame's origin is
      // the literal "null", which URL() throws on, and a listener that throws on
      // every stray message is worse than the redirect it was added to prevent.
      if (!event.origin.endsWith(".chilipiper.com")) return;
      const action =
        typeof event.data === "object" && event.data
          ? (event.data as { action?: string }).action
          : undefined;
      if (action === "REDIRECT") event.stopImmediatePropagation();
    };

    window.addEventListener("message", swallowRedirect, true);
    return () => window.removeEventListener("message", swallowRedirect, true);
  }, []);

  const suppressChiliPiperUi = () => {
    suppressing.current = true;
    if (!document.getElementById(SUPPRESS_STYLE_ID)) {
      const style = document.createElement("style");
      style.id = SUPPRESS_STYLE_ID;
      style.textContent = SUPPRESS_CSS;
      document.head.append(style);
    }
  };

  const openScheduler = (nextLead: ChiliPiperLead) => {
    // Stored before the script check, not after: the likeliest reason ChiliPiper
    // is missing is that it hasn't finished loading, and that is exactly the case
    // where "Try again" has to have the lead to retry with.
    lead.current = nextLead;
    if (!window.ChiliPiper) {
      setStatus("failed");
      return;
    }

    // Every bracket goes to the router, so the request lands where sales already
    // reads them. What differs is the screen we show: a bracket that can't book
    // gets its acknowledgement straight away, because Chili Piper will never
    // report success for a path that has no calendar in it.
    const cannotBook = CANNOT_BOOK_SIZES.has(nextLead["company-size"]);
    // Hide their UI before submitting, or the modal paints for a frame first —
    // which is the flash this was meant to remove.
    if (cannotBook) suppressChiliPiperUi();
    window.ChiliPiper.submit(CHILIPIPER_TENANT, CHILIPIPER_ROUTER, {
      trigger: "ThirdPartyForm",
      lead: nextLead,
      // Closing the modal without booking leaves the form as it was, so they can
      // change an answer and try again. Note the router can still force a
      // redirect of its own: the iframe posts an action:"REDIRECT" message and
      // the script sets window.location from it, which no callback here can
      // veto. That destination is a Chili Piper router setting.
      onClose: () => {},
      onSuccess: () => setStatus(cannotBook ? "received" : "booked"),
      onError: () => setStatus(cannotBook ? "received" : "failed"),
    });
    if (cannotBook) setStatus("received");
  };

  const clearError = (field: string) =>
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));

  const fieldProps = (field: string) => ({
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": errors[field] ? `${field}-error` : undefined,
    onChange: () => clearError(field),
  });

  // Each outcome renders as the panel laid over the form, never in place of it:
  // swapping the form out changed the column's height, and the chat visual beside
  // it stretches to that column, so the whole right-hand image resized on submit.
  // Dimmed-and-covered keeps every height exactly as it was.
  const statusScreen = () => {
  // The scheduler opened and closed without booking anything. Say so plainly
  // rather than implying someone has the lead, and keep the way forward one click
  // away — the lead is still in memory, so reopening costs them nothing.
  if (status === "failed") {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="flex size-12 items-center justify-center rounded-lg bg-muted">
          <svg
            width="24"
            height="24"
            viewBox="0 0 20 20"
            fill="none"
            className="text-foreground"
            aria-hidden
          >
            <path
              d="M10 6v5m0 3h.01"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
        <h2 className="mt-5 text-xl font-medium tracking-tight">
          The scheduler didn&rsquo;t open
        </h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Nothing has been booked and we haven&rsquo;t taken your details. Try
          again, or email the person who sent you here and they&rsquo;ll set up a
          time directly.
        </p>
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            if (lead.current) openScheduler(lead.current);
          }}
          className="mt-6 inline-flex items-center rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          Try again
        </button>
      </div>
    );
  }

  // Sub-threshold brackets: the request is in, there is just no calendar to open.
  // Copy is Marlon's, and it deliberately doesn't say "you don't qualify".
  if (status === "received") {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="flex size-12 items-center justify-center rounded-lg bg-muted">
          <svg
            width="24"
            height="24"
            viewBox="0 0 20 20"
            fill="none"
            className="text-foreground"
            aria-hidden
          >
            <path
              d="M5 10l3.5 3.5L15 7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="mt-5 text-xl font-medium tracking-tight">
          Request received
        </h2>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
          We review every request and will be in touch if there&rsquo;s a strong
          fit. In the meantime, explore the free plan.
        </p>
        {/* The free plan is the action here, so it gets the form's own button
            rather than a link buried in the sentence. */}
        <a
          href={SIGNUP_URL}
          className="mt-6 inline-flex items-center rounded-lg bg-foreground px-5 py-2.5 text-sm text-background transition-opacity hover:opacity-90"
        >
          Get started
        </a>
      </div>
    );
  }

  if (status === "booked") {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="flex size-12 items-center justify-center rounded-lg bg-muted">
          <svg
            width="24"
            height="24"
            viewBox="0 0 20 20"
            fill="none"
            className="text-foreground"
            aria-hidden
          >
            <path
              d="M5 10l3.5 3.5L15 7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="mt-5 text-xl font-medium tracking-tight">
          Thanks — you&rsquo;re all set
        </h2>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">
          A product specialist will reach out within one business day to
          schedule your walkthrough.
        </p>
      </div>
    );
  }

  return null;
  };

  return (
    <div className="relative">
      <Script
        id="chilipiper-concierge"
        src="https://copilotplatforms.chilipiper.com/concierge-js/cjs/concierge.js"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
    {/* Dimmed and inert once there's an outcome, but still laid out, which is what
        holds the column — and therefore the chat visual — at its original height.
        `inert` takes it out of tab order and off the a11y tree, so the message is
        the only thing a keyboard or screen reader can reach. */}
    <div
      className={
        status === "idle"
          ? ""
          : "pointer-events-none select-none opacity-25 transition-opacity"
      }
      inert={status !== "idle"}
    >
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const next: Errors = {};
        for (const field of REQUIRED_FIELDS) {
          if (!String(data.get(field.name) ?? "").trim()) {
            next[field.name] = field.message;
          }
        }
        const email = String(data.get("email") ?? "").trim();
        if (email && !EMAIL_PATTERN.test(email)) {
          next.email = INVALID_EMAIL_ERROR;
        }
        setErrors(next);
        if (Object.keys(next).length > 0) {
          const first = REQUIRED_FIELDS.find((field) => next[field.name]);
          document.getElementById(first?.name ?? "firstName")?.focus();
          return;
        }

        // Hand the lead to Chili Piper, which takes over with its own booking
        // modal. Nothing here records the lead itself, so if the script is
        // blocked or the router rejects it, the only honest thing to show is the
        // failure state — see openScheduler.
        const value = (field: string) => String(data.get(field) ?? "").trim();
        openScheduler({
          "first-Name": value("firstName"),
          "last-Name": value("lastName"),
          email: value("email"),
          "company-size": companySize,
          objectives: value("message"),
          "company-name": value("company"),
          industry: value("industry"),
        });
      }}
    >
      {/* Rows sit further apart than the two fields within a row, so the pairs
          read across before they read down. */}
      <div className="flex flex-col gap-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="First name" htmlFor="firstName" error={errors.firstName}>
            <input
              id="firstName"
              name="firstName"
              type="text"
              autoComplete="given-name"
              placeholder="Jane"
              className={inputCls}
              {...fieldProps("firstName")}
            />
          </Field>
          <Field label="Last name" htmlFor="lastName" error={errors.lastName}>
            <input
              id="lastName"
              name="lastName"
              type="text"
              autoComplete="family-name"
              placeholder="Cooper"
              className={inputCls}
              {...fieldProps("lastName")}
            />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Company" htmlFor="company" error={errors.company}>
            <input
              id="company"
              name="company"
              type="text"
              autoComplete="organization"
              placeholder="Company"
              className={inputCls}
              {...fieldProps("company")}
            />
          </Field>
          <Field label="Work email" htmlFor="email" error={errors.email}>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="jane@company.com"
              className={inputCls}
              {...fieldProps("email")}
            />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Industry" htmlFor="industry">
            <input
              id="industry"
              name="industry"
              type="text"
              placeholder="Accounting, legal, marketing…"
              className={inputCls}
            />
          </Field>
          <SelectMenu
            label="Company size"
            name="companySize"
            value={companySize}
            onChange={setCompanySize}
            options={COMPANY_SIZES}
          />
        </div>

        <Field label="What are you looking to do with Assembly?" htmlFor="message">
          <textarea
            id="message"
            name="message"
            rows={4}
            placeholder="Tell us about your use case, clients, or the apps you have in mind."
            className={`${inputCls} resize-none`}
          />
        </Field>
      </div>

      <button
        type="submit"
        // Full width only on phones, where it's the whole thumb target. From sm
        // up the column is wide enough that a stretched button reads as a banner
        // rather than a control, so it sizes to its label and sits on the form's
        // left edge.
        className="mt-6 flex w-full items-center justify-center rounded-lg bg-foreground px-5 py-2.5 text-sm text-background transition-opacity hover:opacity-90 sm:inline-flex sm:w-auto sm:px-8"
      >
        Book a demo
      </button>
    </form>
    </div>

      {/* The message, on its own surface so it reads as sitting above the form
          rather than tangled in it. Tokens both ways: white card in light,
          near-black in dark.
          Two treatments, because the form is two different shapes. On a phone it
          stacks into something far taller than the screen, so an in-place overlay
          lands the card halfway down a long form with fields above and below it:
          there this is a fixed modal, centred in the viewport with the page dimmed
          behind. From lg the form fits on screen beside the visual, so the card
          sits over it in place, lifted above the midpoint by the bottom padding
          because centred it sat low against the heading. */}
      {status !== "idle" && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/85 p-4 backdrop-blur-sm lg:absolute lg:z-auto lg:bg-transparent lg:pb-28 lg:backdrop-blur-none">
          <div
            role="status"
            className="w-full max-w-md rounded-xl border border-border bg-background p-8 shadow-[0_24px_60px_-32px_rgba(20,20,40,0.35)] [[data-theme=dark]_&]:bg-[#141414]"
          >
            {statusScreen()}
          </div>
        </div>
      )}
    </div>
  );
}
