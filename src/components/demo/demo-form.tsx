"use client";

import { useState } from "react";
import { IconArrow } from "@/components/home/icons";

const TEAM_SIZES = ["Just me", "2–10", "11–50", "51–200", "200+"];

const inputCls =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/30";

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

  if (submitted) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-border bg-background p-8 text-center shadow-sm">
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
      className="rounded-2xl border border-border bg-background p-6 shadow-sm md:p-8"
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
          <Field label="Team size" htmlFor="teamSize">
            <select
              id="teamSize"
              name="teamSize"
              defaultValue=""
              required
              className={`${inputCls} appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 fill=%22none%22 stroke=%22%23999%22 stroke-width=%221.5%22><path d=%22M4 6l4 4 4-4%22/></svg>')] bg-[right_1rem_center] bg-no-repeat pr-10`}
            >
              <option value="" disabled>
                Select…
              </option>
              {TEAM_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </Field>
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
        className="group mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm text-background transition-opacity hover:opacity-90"
      >
        Book a demo
        <IconArrow className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      </button>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        By submitting, you agree to Assembly&rsquo;s terms. We&rsquo;ll never
        share your details.
      </p>
    </form>
  );
}
