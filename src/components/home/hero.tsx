"use client";

import { useEffect, useRef, useState } from "react";
import { APP_URL } from "@/lib/constants";

// ─────────────────────────────────────────────────────────────────────────
// HERO — ported from hero exploration v27.
// A clean entry box with the "Start from a template" row pinned below. As you
// type, a typeahead surfaces up to 5 contextual prompt suggestions matching
// what you've written.
// ─────────────────────────────────────────────────────────────────────────

type IconProps = { className?: string };

function IconArrow({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
function IconChevron({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}
function IconReturn({ className }: IconProps) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 10l-4 4 4 4" />
      <path d="M5 14h11a4 4 0 0 0 4-4V6" />
    </svg>
  );
}

// Template cards pinned below — three + a See more tile.
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
  const [open, setOpen] = useState(false);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  const query = userInput.trim().toLowerCase();
  const matches =
    query.length > 0
      ? SUGGESTIONS.filter((s) => s.toLowerCase().includes(query) && s.toLowerCase() !== query).slice(0, 5)
      : [];
  const showTypeahead = open && matches.length > 0;

  // Close the typeahead on outside click.
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const updateArrows = () => {
    const el = rowRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };
  useEffect(() => {
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, []);
  const scrollRow = (dir: 1 | -1) => rowRef.current?.scrollBy({ left: dir * 240, behavior: "smooth" });

  const submit = () => {
    if (userInput.trim()) window.open(APP_URL);
  };
  const pick = (prompt: string) => {
    setUserInput(prompt);
    setOpen(false);
    inputRef.current?.focus();
  };

  return (
    <section className="px-6 pb-24 pt-24 md:pt-28">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-medium tracking-tight md:text-6xl">
          The AI app builder for client-facing experiences
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          Describe what you need and Assembly builds it — apps for your client
          portal, no code, no infrastructure required.
        </p>

        {/* Glass panel: entry box + template row */}
        <div className="mx-auto mt-9 max-w-2xl rounded-3xl border border-border bg-gradient-to-b from-muted/70 to-muted/20 p-2.5 text-left backdrop-blur-sm">
          {/* Box + typeahead anchor */}
          <div ref={wrapRef} className="relative">
            <div
              onClick={() => inputRef.current?.focus()}
              className={`flex min-h-[140px] cursor-text flex-col rounded-2xl border bg-background p-4 shadow-sm transition-colors ${
                boxFocused ? "border-foreground/30" : "border-border"
              }`}
            >
              <textarea
                ref={inputRef}
                value={userInput}
                onChange={(e) => {
                  setUserInput(e.target.value);
                  setOpen(true);
                }}
                onFocus={() => {
                  setBoxFocused(true);
                  setOpen(true);
                }}
                onBlur={() => setBoxFocused(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
                rows={3}
                placeholder="Describe the app you want to build…"
                aria-label="Describe what to build"
                spellCheck={false}
                className="w-full flex-1 resize-none bg-transparent px-1 text-base leading-relaxed text-foreground/80 caret-foreground/70 outline-none placeholder:text-muted-foreground"
              />
              <div className="mt-3 flex items-center justify-end">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    submit();
                  }}
                  disabled={!userInput.trim()}
                  aria-label="Build it"
                  className="flex size-9 items-center justify-center rounded-full bg-foreground text-background transition-opacity hover:opacity-90 disabled:opacity-30"
                >
                  <IconArrow />
                </button>
              </div>
            </div>

            {/* Typeahead — contextual suggestions while typing */}
            {showTypeahead && (
              <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-border bg-background p-1.5 shadow-xl">
                <p className="px-3 pb-1 pt-2 text-xs text-muted-foreground">Suggestions</p>
                {matches.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => pick(s)}
                    className="group flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <span className="truncate">{s}</span>
                    <IconReturn className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Start from a template — pinned below */}
          <div className="px-2 pb-1 pt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Start from a template</p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => scrollRow(-1)}
                  disabled={!canLeft}
                  aria-label="Previous"
                  className="flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-25"
                >
                  <IconChevron className="size-3.5 rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollRow(1)}
                  disabled={!canRight}
                  aria-label="Next"
                  className="flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-25"
                >
                  <IconChevron className="size-3.5" />
                </button>
              </div>
            </div>
            <div
              ref={rowRef}
              onScroll={updateArrows}
              className="mt-3 flex gap-3 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {TEMPLATES.map((t) => (
                <button key={t.label} type="button" onClick={() => pick(t.prompt)} className="group w-40 shrink-0 text-left">
                  <div className="aspect-[5/3] w-full rounded-lg border border-border bg-muted-foreground/10 transition-colors group-hover:border-foreground/20" />
                  <p className="mt-2 truncate text-sm text-foreground/80">{t.label}</p>
                </button>
              ))}
              <a href={APP_URL} className="group w-40 shrink-0 text-left">
                <div className="flex aspect-[5/3] w-full items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground transition-colors group-hover:border-foreground/20 group-hover:text-foreground">
                  See more
                </div>
                <p className="mt-2 truncate text-sm text-muted-foreground">All templates</p>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Logos carousel */}
      <div className="mt-20">
        <p className="text-center text-sm text-muted-foreground">Trusted by teams at</p>
        <div className="mx-auto mt-8 max-w-5xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          <div className="flex w-max animate-marquee items-center gap-16">
            {["Capital One", "Collective", "Ditto", "Heritage Law", "Waymaker", "Aura", "CoverPanda", "Northwind"]
              .concat(["Capital One", "Collective", "Ditto", "Heritage Law", "Waymaker", "Aura", "CoverPanda", "Northwind"])
              .map((name, i) => (
                <span key={i} className="shrink-0 text-lg font-medium text-muted-foreground">
                  {name}
                </span>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}
