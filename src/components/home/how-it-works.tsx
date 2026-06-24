"use client";

import { useEffect, useState } from "react";
import { Section } from "@/components/ui/section";

interface Step {
  id: string;
  label: string;
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    id: "build",
    label: "Build",
    title: "Describe an app, ship it in minutes",
    body: "Start from a template or describe your app in plain English. Assembly generates a secure app you can publish to your client portal in one click — no code, no infrastructure, no developer required.",
  },
  {
    id: "brand",
    label: "Brand",
    title: "A branded portal your clients actually want to use",
    body: "Native Assembly apps and the ones you build live side by side in a portal branded as your firm. Organize apps into sidebar folders and set permissions so every client sees only what's meant for them.",
  },
  {
    id: "team",
    label: "Team",
    title: "Your team's command center",
    body: "Manage contacts and companies in a built-in CRM, stay on top of activity with a unified notification center, and get an internal team view with every app you build — automatically.",
  },
];

export function HowItWorks() {
  const [active, setActive] = useState(STEPS[0].id);

  useEffect(() => {
    const onScroll = () => {
      // The active step is the last one whose top has scrolled past the
      // marker line (~35% down the viewport).
      const marker = window.innerHeight * 0.35;
      let current = STEPS[0].id;
      for (const step of STEPS) {
        const el = document.getElementById(step.id);
        if (el && el.getBoundingClientRect().top <= marker) current = step.id;
      }
      setActive(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <Section id="how-it-works">
      <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
        How it works
      </h2>

      <div className="mt-12 grid gap-12 md:grid-cols-[180px_1fr] md:gap-16">
        {/* Side nav (scroll-spy) */}
        <nav
          aria-label="How it works steps"
          className="hidden h-fit md:sticky md:top-24 md:block"
        >
          <ul className="flex flex-col gap-4">
            {STEPS.map((step) => {
              const isActive = active === step.id;
              return (
                <li key={step.id}>
                  <button
                    onClick={() => scrollTo(step.id)}
                    aria-current={isActive ? "true" : undefined}
                    className="flex items-center gap-3 text-left text-sm transition-colors"
                  >
                    <span
                      className={`h-px transition-all ${
                        isActive
                          ? "w-8 bg-foreground"
                          : "w-4 bg-muted-foreground/40"
                      }`}
                    />
                    <span
                      className={
                        isActive ? "text-foreground" : "text-muted-foreground"
                      }
                    >
                      {step.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Content */}
        <div className="flex flex-col gap-16 md:gap-28">
          {STEPS.map((step) => (
            <div key={step.id} id={step.id} className="scroll-mt-24">
              <h3 className="text-2xl font-medium tracking-tight md:text-3xl">
                {step.title}
              </h3>
              <p className="mt-4 max-w-xl text-lg text-muted-foreground">
                {step.body}
              </p>
              <div className="mt-8 aspect-[16/9] w-full rounded-xl border border-border bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
