"use client";

import { useEffect, useRef, useState } from "react";
import { APP_URL } from "@/lib/constants";
import { TEMPLATES, TEMPLATE_CATEGORIES } from "@/lib/templates";

// Category chips + the templates shown for the selected category.
const CATEGORIES = TEMPLATE_CATEGORIES.map((label) => ({
  label,
  items: TEMPLATES.filter((t) => t.category === label).map((t) => ({
    title: t.title,
    desc: t.description,
  })),
})).filter((c) => c.items.length > 0);

// Rotating example prompts for the entry box.
const PROMPTS = [
  "a client onboarding portal",
  "an approvals workflow",
  "a billing dashboard",
  "a project tracker",
  "a document collection flow",
];

// Customer names shown in the logo marquee.
const TRUSTED_BY = [
  "Capital One",
  "Collective",
  "Ditto",
  "Heritage Law",
  "Waymaker",
  "Aura",
  "CoverPanda",
];

export function Hero() {
  const [selected, setSelected] = useState<number | null>(0);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const [promptIdx, setPromptIdx] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [boxFocused, setBoxFocused] = useState(false);
  const chipsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateArrows = () => {
    const el = chipsRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 1);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    updateArrows();
    const el = chipsRef.current;
    el?.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el?.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, []);

  useEffect(() => {
    const id = setInterval(
      () => setPromptIdx((i) => (i + 1) % PROMPTS.length),
      2800,
    );
    return () => clearInterval(id);
  }, []);

  const scrollChips = (dir: number) => {
    const el = chipsRef.current;
    if (!el) return;
    el.scrollLeft = Math.max(
      0,
      Math.min(el.scrollLeft + dir * 220, el.scrollWidth),
    );
    updateArrows();
  };

  // Only fade the edges that have more content to scroll toward, so the first
  // and last chips are never dimmed.
  const chipsMask =
    canLeft && canRight
      ? "linear-gradient(to right, transparent, #000 7%, #000 93%, transparent)"
      : canRight
        ? "linear-gradient(to right, #000 93%, transparent)"
        : canLeft
          ? "linear-gradient(to right, transparent, #000 7%)"
          : "none";

  return (
    <section className="px-6 pb-20 pt-24 md:pt-32">
      <div className="mx-auto max-w-2xl text-center">
        {/* Trust badge */}
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border py-1 pl-1 pr-3 text-xs text-muted-foreground">
            <span className="flex -space-x-1.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="size-5 rounded-full border-2 border-background bg-muted-foreground/30"
                />
              ))}
            </span>
            Trusted by 1,000+ teams
          </span>
        </div>

        <h1 className="mt-6 text-4xl font-medium tracking-tight md:text-6xl">
          The AI app builder for
          <br />
          client-facing experiences
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Build apps for your client portal — no code, no infrastructure, no
          developer required.
        </p>

        {/* Describe-to-build entry */}
        <div
          onClick={() => inputRef.current?.focus()}
          className={`mt-8 flex min-h-[150px] cursor-text flex-col rounded-2xl border bg-muted p-6 text-left transition-colors ${
            boxFocused ? "border-foreground/30" : "border-border hover:border-foreground/20"
          }`}
        >
          {/* The input is always full-width and left-aligned, so nothing reflows
              on focus. The "Assembly Studio, build …" overlay simply crossfades
              out (and the placeholder fades in) — no layout jump, no jitter. */}
          <div className="relative text-base">
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onFocus={() => setBoxFocused(true)}
              onBlur={() => setBoxFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && userInput.trim()) window.open(APP_URL);
              }}
              className="w-full bg-transparent text-foreground/80 caret-foreground/70 outline-none"
              aria-label="Describe what to build"
              autoComplete="off"
              spellCheck={false}
            />
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-0 flex items-baseline whitespace-nowrap transition-opacity duration-500 ${
                boxFocused || userInput ? "opacity-0" : "opacity-100"
              }`}
            >
              <span className="text-muted-foreground">
                Assembly Studio, build&nbsp;
              </span>
              <span
                key={promptIdx}
                className="animate-prompt text-foreground/80"
              >
                {PROMPTS[promptIdx]}
              </span>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-end pt-10">
            <a
              href={APP_URL}
              onClick={(e) => e.stopPropagation()}
              className="rounded-full bg-foreground px-4 py-1.5 text-sm text-background transition-opacity hover:opacity-90"
            >
              Start building
            </a>
          </div>
        </div>

        {/* Category chips — left edge aligns with the entry box; scroll
            controls grouped on the right. */}
        <div className="mt-4 flex items-center gap-1.5">
          <div
            ref={chipsRef}
            style={{ maskImage: chipsMask, WebkitMaskImage: chipsMask }}
            className="flex flex-1 items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {CATEGORIES.map((cat, i) => (
              <button
                key={cat.label}
                onClick={() => setSelected(selected === i ? null : i)}
                className={`shrink-0 rounded-[4px] border px-3 py-1 text-xs transition-colors ${
                  selected === i
                    ? "sticky left-0 z-10 border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scrollChips(-1)}
            aria-label="Scroll categories left"
            className={`shrink-0 p-1 transition-colors ${
              canLeft
                ? "text-muted-foreground hover:text-foreground"
                : "pointer-events-none text-transparent"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M10 3l-5 5 5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scrollChips(1)}
            aria-label="Scroll categories right"
            className={`shrink-0 p-1 transition-colors ${
              canRight
                ? "text-muted-foreground hover:text-foreground"
                : "pointer-events-none text-transparent"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M6 3l5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Templates for the selected category — height reserved so the content
            below never shifts when the panel is toggled. */}
        <div className="mt-2 min-h-[204px]">
          {selected !== null && (
            <div className="rounded-xl border border-border bg-background p-1.5 text-left">
              {CATEGORIES[selected].items.slice(0, 3).map((item) => (
                <a
                  key={item.title}
                  href={APP_URL}
                  className="flex items-center gap-4 rounded-lg px-4 py-3 transition-colors hover:bg-muted"
                >
                  <div className="size-10 shrink-0 rounded-lg bg-muted" />
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Logo marquee — narrow centered window (~3 at a time), auto-scroll */}
      <div className="mx-auto mt-14 max-w-md overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_18%,black_82%,transparent)]">
        <div className="flex w-max animate-marquee items-center gap-12">
          {[...TRUSTED_BY, ...TRUSTED_BY].map((name, i) => (
            <span
              key={i}
              className="shrink-0 text-base font-medium text-muted-foreground"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
