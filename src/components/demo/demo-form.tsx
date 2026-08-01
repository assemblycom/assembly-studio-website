"use client";

import { useState } from "react";
import { FIELD_CLS, SelectMenu } from "@/components/ui/select-menu";

const TEAM_SIZES = ["Just me", "2–10", "11–50", "51–200", "200+"].map((size) => ({
  value: size,
  label: size,
}));

const inputCls = FIELD_CLS;

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="flex flex-col gap-1.5">
      <span className="text-sm text-foreground">{label}</span>
      {children}
    </label>
  );
}

export function DemoForm() {
  // Prototype: there's no backend, so a submit just swaps in a confirmation.
  const [submitted, setSubmitted] = useState(false);
  const [teamSize, setTeamSize] = useState("");

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
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
    >
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" htmlFor="name">
            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="name"
              placeholder="Jane Cooper"
              className={inputCls}
            />
          </Field>
          <Field label="Work email" htmlFor="email">
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="jane@company.com"
              className={inputCls}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company" htmlFor="company">
            <input
              id="company"
              name="company"
              type="text"
              required
              autoComplete="organization"
              placeholder="Company"
              className={inputCls}
            />
          </Field>
          <SelectMenu
            label="Team size"
            name="teamSize"
            value={teamSize}
            onChange={setTeamSize}
            options={TEAM_SIZES}
          />
        </div>

        <Field label="What do you want to build?" htmlFor="message">
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
        className="mt-6 flex w-full items-center justify-center rounded-lg bg-foreground px-5 py-2.5 text-sm text-background transition-opacity hover:opacity-90"
      >
        Book a demo
      </button>
    </form>
  );
}
