"use client";

import { useEffect, useRef, useState } from "react";
import { Section } from "@/components/ui/section";

// ─────────────────────────────────────────────────────────────────────────
// HOW IT WORKS — a Framer-style sticky walkthrough. The agent chat is pinned on
// the right while the left column scrolls through the three steps (Build →
// Brand → Team), each with its own app-window visual and copy. The pinned chat
// re-narrates the active step, so the two halves read as one live build.
// ─────────────────────────────────────────────────────────────────────────

const ACCENT = "#7DA4FF";

interface Step {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  crumb: string;
  prompt: string;
  plan: string;
  response: string;
}

const STEPS: Step[] = [
  {
    id: "build",
    eyebrow: "Build",
    title: "Describe an app, ship it in minutes",
    body: "Start from a template or describe your app in plain language. Assembly ships a secure, client-ready app in one click — no code, no infrastructure, no developers.",
    crumb: "Engagement",
    prompt: "Build a dashboard that tracks client engagement over time.",
    plan: "Created a build plan",
    response:
      "Added an engagement score, a weekly activity chart, and a health breakdown — ready to publish.",
  },
  {
    id: "brand",
    eyebrow: "Brand",
    title: "A branded portal your clients want to use",
    body: "Your apps and native Assembly apps live side by side in a portal branded as your firm. Organize them into folders and set permissions so each client sees only what's meant for them.",
    crumb: "Branding",
    prompt: "Make the portal match our brand.",
    plan: "Applied your brand",
    response:
      "Applied your logo, colors, and domain, and grouped the apps into client-facing folders.",
  },
  {
    id: "team",
    eyebrow: "Team",
    title: "Your team's command center",
    body: "A built-in CRM for contacts and companies, a unified notification center, and an internal team view of every app you build — automatically.",
    crumb: "Team",
    prompt: "Set the team up to run it.",
    plan: "Set up your team",
    response:
      "Wired in a CRM for contacts and companies, plus a shared notification center for the team.",
  },
];

function IconCheck({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m5 12.5 4.5 4.5L19 6.5" />
    </svg>
  );
}

function IconArrowUp({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 19V5M6 11l6-6 6 6" />
    </svg>
  );
}

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
          className="mx-auto w-full overflow-hidden rounded-lg bg-background ring-1 ring-border lg:max-h-[calc(100vh-24rem)]"
          style={{ aspectRatio: "16 / 9" }}
        />
      </div>
    </div>
  );
}

// The agent chat. Message content is keyed so it re-fades whenever the step
// changes; the composer stays put so it reads as one persistent surface.
function ChatPanel({ step }: { step: Step }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg bg-card ring-1 ring-border shadow-[0_1px_2px_rgba(16,24,40,0.04),0_18px_40px_-28px_rgba(16,24,40,0.18)]">
      <div key={step.id} className="flex flex-1 flex-col gap-4 p-5">
        <div className="animate-fade-in rounded-lg bg-muted px-3.5 py-3" style={{ animationDelay: "0.02s" }}>
          <p className="text-[13px] leading-relaxed text-foreground">{step.prompt}</p>
        </div>
        <div className="animate-fade-in flex items-center gap-2 text-[12.5px] text-muted-foreground" style={{ animationDelay: "0.14s" }}>
          Thought for 4s
        </div>
        <div className="animate-fade-in flex items-center gap-2" style={{ animationDelay: "0.28s" }}>
          <span className="flex size-4 items-center justify-center rounded-full text-white" style={{ backgroundColor: ACCENT }}>
            <IconCheck className="size-2.5" />
          </span>
          <span className="text-[13px] text-muted-foreground">{step.plan}</span>
        </div>
        <p className="animate-fade-in text-[13px] leading-relaxed text-foreground/80" style={{ animationDelay: "0.42s" }}>
          {step.response}
        </p>
      </div>
      <div className="p-5 pt-0">
        <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
          <span className="flex-1 text-[13px] text-muted-foreground">Add a follow-up…</span>
          <span className="flex size-6 items-center justify-center rounded-full text-white" style={{ backgroundColor: ACCENT }}>
            <IconArrowUp className="size-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}

export function HowItWorks() {
  const [active, setActive] = useState(0);
  // How far to pull the pinned chat up so its bottom never drops below the last
  // step's visual — keeps the chat from overhanging into the next section. The
  // ref mirrors the state so the scroll handler can recover the chat's natural
  // (un-shifted) position and stay self-correcting as the sticky releases.
  const [chatShift, setChatShift] = useState(0);
  const chatShiftRef = useRef(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lastVisualRef = useRef<HTMLDivElement | null>(null);
  const chatRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Active step = whichever step's center is nearest the viewport middle.
    // Driven by scroll position (not IntersectionObserver) so it updates
    // reliably; the pinned chat re-narrates whichever step you're reading.
    const compute = () => {
      const mid = window.innerHeight / 2;
      let best = 0;
      let bestDist = Infinity;
      stepRefs.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const dist = Math.abs(r.top + r.height / 2 - mid);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      setActive(best);

      // Keep the chat's bottom from ever dropping below the last step's visual.
      // Work from the chat's *natural* bottom (its current rect plus the shift
      // already applied) so this stays correct whether the chat is still pinned
      // or has begun scrolling away — no compounding with the sticky release.
      const chatEl = chatRef.current;
      const lastVisual = lastVisualRef.current;
      if (chatEl && lastVisual && chatEl.offsetHeight > 0) {
        const naturalBottom =
          chatEl.getBoundingClientRect().bottom + chatShiftRef.current;
        const lastVisualBottom = lastVisual.getBoundingClientRect().bottom;
        const next = Math.max(0, naturalBottom - lastVisualBottom);
        chatShiftRef.current = next;
        setChatShift(next);
      }
    };
    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, []);

  return (
    <Section id="how-it-works">
      <div className="lg:grid lg:grid-cols-[1fr_minmax(0,360px)] lg:gap-6 xl:gap-8">
        {/* Left — the steps, scrolling. */}
        <div className="flex flex-col gap-16 lg:gap-32">
          {STEPS.map((step, i) => (
            <div
              key={step.id}
              data-step={i}
              ref={(el) => {
                stepRefs.current[i] = el;
              }}
            >
              <div ref={i === STEPS.length - 1 ? lastVisualRef : undefined}>
                <AppWindow crumb={step.crumb} />
              </div>

              {/* Tablet only: the chat rides inline under each step's visual.
                  Hidden on phones (visual alone) and on desktop (sticky chat). */}
              <div className="mt-4 hidden md:block lg:hidden">
                <ChatPanel step={step} />
              </div>

              <div className="mt-7">
                <span className="type-eyebrow text-muted-foreground">{step.eyebrow}</span>
                <h3 className="type-h3 mt-2">
                  {step.title}
                </h3>
                <p className="type-lead mt-3 max-w-xl text-muted-foreground">
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Right — the pinned chat, re-narrating the active step. Desktop only;
            mobile shows it inline above. */}
        <div className="hidden lg:block">
          <div
            ref={chatRef}
            className="sticky top-24 h-[min(560px,calc(100vh-8rem))]"
            style={{ transform: `translateY(-${chatShift}px)` }}
          >
            <ChatPanel step={STEPS[active]} />
          </div>
        </div>
      </div>
    </Section>
  );
}
