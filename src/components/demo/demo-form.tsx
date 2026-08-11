"use client";

import { useState } from "react";
import Script from "next/script";
import { FIELD_CLS, SelectMenu } from "@/components/ui/select-menu";
import { INVALID_EMAIL_ERROR } from "@/lib/constants";

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
  // Booking happens in Chili Piper's modal; this confirmation is the fallback
  // for when the script is unavailable, and the state after a booked call.
  const [submitted, setSubmitted] = useState(false);
  const [companySize, setCompanySize] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const clearError = (field: string) =>
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));

  const fieldProps = (field: string) => ({
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": errors[field] ? `${field}-error` : undefined,
    onChange: () => clearError(field),
  });

  if (submitted) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
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

  return (
    <>
      <Script
        id="chilipiper-concierge"
        src="https://copilotplatforms.chilipiper.com/concierge-js/cjs/concierge.js"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
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
        // modal. If the script is blocked or hasn't loaded, fall through to our
        // own confirmation rather than leaving the submit doing nothing.
        const value = (field: string) => String(data.get(field) ?? "").trim();
        if (window.ChiliPiper) {
          window.ChiliPiper.submit(CHILIPIPER_TENANT, CHILIPIPER_ROUTER, {
            trigger: "ThirdPartyForm",
            lead: {
              "first-Name": value("firstName"),
              "last-Name": value("lastName"),
              email: value("email"),
              "company-size": companySize,
              objectives: value("message"),
              "company-name": value("company"),
              industry: value("industry"),
            },
            // Closing the booking modal should put the visitor back on this
            // page, not navigate. Note the router can still force a redirect of
            // its own: the iframe posts an action:"REDIRECT" message and the
            // script sets window.location from it, which no callback here can
            // veto. That destination is a Chili Piper router setting.
            onClose: () => {},
            onSuccess: () => setSubmitted(true),
            onError: () => setSubmitted(true),
          });
          return;
        }

        setSubmitted(true);
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
    </>
  );
}
