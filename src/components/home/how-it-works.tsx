"use client";

import { useEffect, useRef, useState } from "react";
import { DescribeVisual } from "@/components/home/describe-visual";
import { BuildAppVisual } from "@/components/home/build-app-visual";
import { BrandPortalVisual } from "@/components/home/brand-portal-visual";
import { BuildStepVisual } from "@/components/home/build-step-visual";

// ─────────────────────────────────────────────────────────────────────────
// HOW IT WORKS — Sierra-style composition: the step list sits on the left
// (the active step expands to reveal its copy; a hairline progress bar runs
// the dwell time), one visual panel on the right crossfades between steps.
// Compact by design so the visitor keeps scrolling.
// ─────────────────────────────────────────────────────────────────────────

interface Step {
  id: string;
  title: string;
  body: string;
  visual: React.ReactNode;
}

const STEPS: Step[] = [
  {
    id: "describe",
    title: "Describe",
    body: "Say what you want in plain language, or start with an app template.",
    visual: <DescribeVisual />,
  },
  {
    id: "plan",
    title: "Plan",
    body: "The app builder asks a few product questions and shows you a plan. You approve or edit before anything is built.",
    visual: <BuildAppVisual />,
  },
  {
    id: "build",
    title: "Build",
    body: "A real app deploys into your workspace. Team views in your dashboard, client views in your client experience.",
    visual: <BrandPortalVisual />,
  },
  {
    id: "iterate",
    title: "Iterate",
    body: "Keep chatting to change anything, before or after launch.",
    visual: <BuildStepVisual />,
  },
];

const STEP_MS = 7000;

export function HowItWorks() {
  const [active, setActive] = useState(0);
  // Bumped on manual selection so the progress animation restarts even when
  // the same step is re-picked.
  const [cycle, setCycle] = useState(0);
  const [inView, setInView] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Only cycle while the section is on screen, so the dwell time isn't spent
  // before the visitor ever sees it.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(
      () => setActive((a) => (a + 1) % STEPS.length),
      STEP_MS,
    );
    return () => clearTimeout(t);
  }, [inView, active, cycle]);

  const select = (i: number) => {
    setActive(i);
    setCycle((c) => c + 1);
  };

  return (
    // Same rail as the nav/hero (max-w-[1600px], px-10 at md) so the step
    // list's left edge lines up with the nav logo above it.
    <section id="how-it-works" className="py-20 md:py-28">
      <div ref={rootRef} className="mx-auto max-w-[1600px] px-6 md:px-10">
        <h2 className="type-h2 text-foreground">How it works</h2>
        <div className="mt-10 md:mt-14 md:grid md:grid-cols-[minmax(0,340px)_minmax(0,1fr)] md:items-start md:gap-12 lg:gap-20">
        {/* Left — step list. The active row expands to show its copy. */}
        <div role="tablist" aria-label="How it works steps">
          {STEPS.map((step, i) => (
            <button
              key={step.id}
              type="button"
              role="tab"
              aria-selected={active === i}
              onClick={() => select(i)}
              className="relative block w-full border-t border-border py-4 text-left"
            >
              {/* The top hairline doubles as the step's progress bar. */}
              {active === i && (
                <span
                  aria-hidden
                  key={`${active}-${cycle}`}
                  className="absolute inset-x-0 -top-px h-px origin-left bg-foreground"
                  style={{
                    animation: `hiw-fill ${STEP_MS}ms linear forwards`,
                    animationPlayState: inView ? "running" : "paused",
                  }}
                />
              )}
              <span
                className={`block text-[17px] transition-colors ${
                  active === i
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {step.title}
              </span>
              {/* Copy reveals via the 0fr→1fr grid-rows trick so height
                  animates without measuring. */}
              <span
                className="grid transition-[grid-template-rows] duration-500 ease-out"
                style={{ gridTemplateRows: active === i ? "1fr" : "0fr" }}
              >
                <span className="overflow-hidden">
                  <span
                    className={`block pt-2 text-[15px] leading-relaxed text-muted-foreground transition-opacity duration-300 ${
                      active === i ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    {step.body}
                  </span>
                </span>
              </span>
            </button>
          ))}
        </div>

        {/* Right — single visual panel. All steps stay mounted in one grid
            cell and crossfade, so their internal animations don't restart.
            Pulled up beside the section heading so the tall panel doesn't
            sit low against the step list. */}
        <div className="mt-8 grid md:-mt-20 lg:-mt-24">
          {STEPS.map((step, i) => (
            <div
              key={step.id}
              className={`col-start-1 row-start-1 transition-opacity duration-500 ${
                active === i ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
              aria-hidden={active !== i}
            >
              {step.visual}
            </div>
          ))}
        </div>
        </div>
      </div>
    </section>
  );
}
