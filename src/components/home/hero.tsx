"use client";

import { useRef, useState } from "react";
import { APP_URL } from "@/lib/constants";

// ─────────────────────────────────────────────────────────────────────────
// HERO — a "watch how it works" pill, the title, then one panel grouping the
// entry box with three template quick-starts. As you type, an inline ghost
// suggestion completes your prompt (accept with Tab or →).
// ─────────────────────────────────────────────────────────────────────────

type IconProps = { className?: string };

function IconArrow({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
function IconPlay({ className }: IconProps) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M9 7.5v9a.75.75 0 0 0 1.14.64l7.2-4.5a.75.75 0 0 0 0-1.28l-7.2-4.5A.75.75 0 0 0 9 7.5Z" />
    </svg>
  );
}
function IconPaperclip({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

// Template quick-starts shown inside the hero panel.
const TEMPLATES = [
  { label: "Onboarding", prompt: "a client onboarding app" },
  { label: "Dashboards", prompt: "a client dashboard" },
  { label: "Trackers", prompt: "a project tracker for clients" },
];

// Pool the typeahead draws from — matched by substring against what you type.
const SUGGESTIONS = [
  "A client onboarding portal with progress tracking",
  "An onboarding checklist for new clients",
  "A client engagement dashboard",
  "A dashboard that flags clients who go quiet",
  "A project tracker clients can view",
  "A document approval workflow with reminders",
  "A branded proposal with e-sign",
  "A client intake form that creates a project",
  "A billing and invoices page",
  "A support request inbox for my clients",
  "A weekly status update clients can view",
  "A CRM for my client relationships",
  "A scheduling and booking app",
  "A white-labeled client portal",
];

export function Hero() {
  const [userInput, setUserInput] = useState("");
  const [boxFocused, setBoxFocused] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Inline contextual completion — the first suggestion that continues what the
  // user has typed, surfaced as ghost text they can accept with Tab or →. No
  // dropdown; the hint lives right in the field.
  const ghost =
    userInput.trim().length > 0
      ? SUGGESTIONS.find(
          (s) =>
            s.toLowerCase().startsWith(userInput.toLowerCase()) &&
            s.length > userInput.length,
        )?.slice(userInput.length) ?? ""
      : "";
  const acceptGhost = () => {
    if (ghost) setUserInput(userInput + ghost);
  };

  const submit = () => {
    if (userInput.trim()) window.open(APP_URL);
  };
  const pick = (prompt: string) => {
    setUserInput(prompt);
    inputRef.current?.focus();
  };

  return (
    <section className="pb-24 pt-24 md:pt-28">
      <div className="mx-auto max-w-7xl px-6">
        {/* Watch-how-it-works pill — eyebrow above the title */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => window.open(APP_URL)}
            className="group inline-flex items-center gap-3 rounded-full border border-border bg-muted/50 py-1.5 pl-1.5 pr-4 text-left transition-colors hover:bg-muted"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-background text-foreground transition-transform group-hover:scale-105">
              <IconPlay className="size-3.5" />
            </span>
            <span className="leading-tight">
              <span className="block whitespace-nowrap text-sm font-medium">
                Watch how it works
              </span>
              <span className="block whitespace-nowrap text-xs text-muted-foreground">
                2-minute demo
              </span>
            </span>
          </button>
        </div>

        <h1 className="mx-auto mt-6 max-w-3xl text-center text-4xl font-medium tracking-tight md:text-6xl">
          The AI app builder for client-facing experiences
        </h1>

        {/* One panel groups the entry box with the template quick-starts */}
        <div className="mx-auto mt-9 max-w-2xl rounded-3xl border border-border bg-gradient-to-b from-muted/60 to-muted/20 p-2.5">
          {/* Entry box + typeahead anchor */}
          <div ref={wrapRef} className="relative">
            <div className="shimmer-border relative rounded-2xl" data-focused={boxFocused}>
            <div
              onClick={() => inputRef.current?.focus()}
              className={`flex min-h-[152px] cursor-text flex-col rounded-2xl border bg-background p-4 shadow-sm transition-all duration-200 ${
                boxFocused ? "border-foreground/20 shadow-md" : "border-border"
              }`}
            >
              <div className="relative flex-1">
                {/* Ghost completion sits behind the textarea, aligned to the
                    typed text; the typed portion is transparent so only the
                    suggested remainder shows through. */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 whitespace-pre-wrap break-words px-1 text-base leading-relaxed text-transparent"
                >
                  {userInput}
                  <span className="text-muted-foreground/50">{ghost}</span>
                </div>
                <textarea
                  ref={inputRef}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onFocus={() => setBoxFocused(true)}
                  onBlur={() => setBoxFocused(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      submit();
                    } else if (
                      ghost &&
                      (e.key === "Tab" ||
                        (e.key === "ArrowRight" &&
                          e.currentTarget.selectionStart === userInput.length))
                    ) {
                      e.preventDefault();
                      acceptGhost();
                    }
                  }}
                  rows={3}
                  placeholder="Describe the app you want to build…"
                  aria-label="Describe what to build"
                  spellCheck={false}
                  className="relative h-full w-full resize-none bg-transparent px-1 text-base leading-relaxed text-foreground/80 caret-foreground/70 outline-none placeholder:text-muted-foreground"
                />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(APP_URL);
                  }}
                  className="flex items-center gap-2 rounded-full bg-muted px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground active:scale-[0.98]"
                >
                  <IconPaperclip className="size-4" />
                  Attach files
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    submit();
                  }}
                  disabled={!userInput.trim()}
                  aria-label="Build it"
                  className="flex size-9 items-center justify-center rounded-full bg-foreground text-background transition-all hover:opacity-90 active:scale-95 disabled:opacity-30 disabled:active:scale-100"
                >
                  <IconArrow />
                </button>
              </div>
            </div>
          </div>
        </div>

          {/* Start from a template — three quick-starts inside the panel */}
          <div className="px-2 pb-1 pt-4">
            <p className="text-sm text-muted-foreground">Start from a template</p>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {TEMPLATES.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => pick(t.prompt)}
                  className="group text-left"
                >
                  <div className="aspect-[5/3] w-full rounded-lg border border-border bg-muted-foreground/10 transition-colors group-hover:border-foreground/20" />
                  <p className="mt-2 truncate text-sm text-foreground/80">
                    {t.label}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Logos carousel — centered, set apart from the hero */}
      <div className="mx-auto mt-28 max-w-7xl px-6 md:mt-32">
        <div className="mx-auto max-w-2xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
          <div className="flex w-max animate-marquee items-center gap-12">
            {["Capital One", "Collective", "Ditto", "Heritage Law", "Waymaker", "Aura", "CoverPanda", "Northwind"]
              .concat(["Capital One", "Collective", "Ditto", "Heritage Law", "Waymaker", "Aura", "CoverPanda", "Northwind"])
              .map((name, i) => (
                <span key={i} className="shrink-0 text-base font-medium text-muted-foreground">
                  {name}
                </span>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}
