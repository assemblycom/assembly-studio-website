"use client";

import { useEffect, useRef, useState } from "react";
import { Section } from "@/components/ui/section";

// ─────────────────────────────────────────────────────────────────────────
// HOW IT WORKS — Granola-style composition: a sticky menu of the three
// phases on the left (scroll-spy underlines the one you're reading; clicking
// scrolls to it), and each step's text + app-window visual stacked on the
// right. Native scroll throughout.
// ─────────────────────────────────────────────────────────────────────────

interface Step {
  id: string;
  menu: string;
  title: string;
  body: string;
  crumb: string;
}

const STEPS: Step[] = [
  {
    id: "build",
    menu: "Build the app",
    title: "Describe an app, ship it in minutes",
    body: "Start from a template or describe your app in plain language. Assembly ships a secure, client-ready app in one click — no code, no infrastructure, no developers.",
    crumb: "Engagement",
  },
  {
    id: "brand",
    menu: "Brand the portal",
    title: "A branded portal your clients want to use",
    body: "Your apps and native Assembly apps live side by side in a portal branded as your firm. Organize them into folders and set permissions so each client sees only what's meant for them.",
    crumb: "Branding",
  },
  {
    id: "team",
    menu: "Run it as a team",
    title: "Your team's command center",
    body: "A built-in CRM for contacts and companies, a unified notification center, and an internal team view of every app you build — automatically.",
    crumb: "Team",
  },
];

// The app-window visual for a step.
function AppWindow({ crumb }: { crumb: string }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg bg-card ring-1 ring-border shadow-[0_1px_2px_rgba(16,24,40,0.04),0_18px_40px_-28px_rgba(16,24,40,0.18)]">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="text-[13px] text-foreground">Client portal</span>
        <span className="text-[13px] text-muted-foreground">/ {crumb}</span>
        <span className="ml-auto flex gap-1.5">
          <span className="size-2 rounded-full bg-border" />
          <span className="size-2 rounded-full bg-border" />
        </span>
      </div>
      <div className="bg-muted p-3 md:p-4">
        <div
          className="mx-auto w-full overflow-hidden rounded-lg bg-background ring-1 ring-border"
          style={{ aspectRatio: "16 / 9" }}
        />
      </div>
    </div>
  );
}

export function HowItWorks() {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState<number[]>(() => STEPS.map(() => 0));
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Active step = whichever step's center is nearest the viewport middle.
    // Driven by scroll position (not IntersectionObserver) so it updates
    // reliably. Each menu row's underline doubles as a progress bar: it fills
    // as the viewport midline travels through that step, and stays filled for
    // steps already read (scrolling back rewinds it).
    const compute = () => {
      const mid = window.innerHeight / 2;
      let best = 0;
      let bestDist = Infinity;
      const fills: number[] = [];
      stepRefs.current.forEach((el, i) => {
        if (!el) {
          fills[i] = 0;
          return;
        }
        const r = el.getBoundingClientRect();
        const dist = Math.abs(r.top + r.height / 2 - mid);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
        fills[i] = Math.min(1, Math.max(0, (mid - r.top) / r.height));
      });
      setActive(best);
      setProgress(fills);
    };
    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, []);

  const scrollToStep = (i: number) => {
    stepRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Section id="how-it-works">
      <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16 xl:gap-24">
        {/* Left — sticky phase menu (desktop only). Each row underlines; the
            active row reads in full ink with a dark underline. */}
        <nav aria-label="How it works steps" className="hidden lg:block">
          <div className="sticky top-24">
            {STEPS.map((step, i) => (
              <button
                key={step.id}
                type="button"
                onClick={() => scrollToStep(i)}
                aria-current={active === i ? "true" : undefined}
                className={`relative block w-full border-b border-border py-3 text-left text-[15px] transition-colors ${
                  active === i
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {step.menu}
                {/* The underline as a progress bar — fills left-to-right as
                    the step is read; scaleX so the scrub costs no layout. */}
                <span
                  aria-hidden
                  className="absolute -bottom-px left-0 h-px w-full origin-left bg-foreground"
                  style={{ transform: `scaleX(${progress[i] ?? 0})` }}
                />
              </button>
            ))}
          </div>
        </nav>

        {/* Right — each step: text, then its visual. */}
        <div className="flex flex-col gap-16 lg:gap-28">
          {STEPS.map((step, i) => (
            <div
              key={step.id}
              ref={(el) => {
                stepRefs.current[i] = el;
              }}
              className="scroll-mt-24"
            >
              <h3 className="type-h3">{step.title}</h3>
              <p className="type-lead mt-3 max-w-2xl text-muted-foreground">
                {step.body}
              </p>
              <div className="mt-7">
                <AppWindow crumb={step.crumb} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
