"use client";

import { useEffect, useRef, useState } from "react";
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

// Custom dropdown so the menu matches the form (native <select> opens as an OS
// overlay we can't style). Renders a styled trigger + a menu that fades in
// anchored to the field, and carries its value in a hidden input.
function TeamSizeSelect({ label }: { label: string }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm text-foreground">{label}</span>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={`${inputCls} flex items-center justify-between text-left ${value ? "" : "!text-muted-foreground"}`}
        >
          {value || "Select…"}
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className={`shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            aria-hidden
          >
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {open && (
          <ul
            role="listbox"
            className="absolute left-0 top-full z-20 mt-2 w-full origin-top animate-fade-in overflow-hidden rounded-xl border border-border bg-background p-1 shadow-[0_16px_44px_-26px_rgba(20,20,40,0.35)]"
          >
            {TEAM_SIZES.map((size) => (
              <li key={size}>
                <button
                  type="button"
                  role="option"
                  aria-selected={value === size}
                  onClick={() => {
                    setValue(size);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
                >
                  {size}
                  {value === size && (
                    <svg
                      width="16"
                      height="16"
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
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <input type="hidden" name="teamSize" value={value} />
    </div>
  );
}

// Boxed card on desktop; on mobile the form goes borderless (Bird-style) so it
// doesn't read as a cramped panel on a small screen.
const cardCls =
  "bg-background md:rounded-2xl md:border md:border-border md:p-8 md:shadow-sm";

export function DemoForm() {
  // Prototype: there's no backend, so a submit just swaps in a confirmation.
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div
        className={`flex min-h-[420px] flex-col items-center justify-center py-16 text-center ${cardCls}`}
      >
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
      className={cardCls}
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
          <TeamSizeSelect label="Team size" />
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
