"use client";

import { useEffect, useState } from "react";
import { V66Composer } from "./hero-v66";
import { useTheme } from "@/components/theme/theme-provider";

// Same prompt data + animation as the hero composer, so the top and bottom
// boxes read identically: a fixed "Build me " lead-in with the "what to build"
// part typed out and cycled.
const V76_PROMPTS = [
  "Client intake form",
  "Client engagement dashboard",
  "Client project tracker",
  "Content approval flow",
  "Document collection checklist",
  "Proposal clients can e-sign",
];
const PROMPT_PREFIX = "Build me ";
const BUILD_EXAMPLES = [
  "a client intake form with company details and an e-signature",
  "a dashboard that tracks client engagement over time",
  "a proposal builder with line items and a running total",
  "a project tracker for every client milestone",
];

function useCyclingPrompt() {
  const [prompt, setPrompt] = useState(PROMPT_PREFIX);
  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setPrompt(PROMPT_PREFIX + BUILD_EXAMPLES[0]);
      return;
    }
    let exampleIdx = 0;
    let charIdx = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      // Timers are throttled/paused while the tab is hidden; wait and retry so
      // the loop resumes cleanly on return instead of stalling mid-word.
      if (typeof document !== "undefined" && document.hidden) {
        timer = setTimeout(tick, 500);
        return;
      }
      const full = BUILD_EXAMPLES[exampleIdx];
      if (!deleting) {
        charIdx += 1;
        setPrompt(PROMPT_PREFIX + full.slice(0, charIdx));
        if (charIdx < full.length) timer = setTimeout(tick, 34);
        else {
          deleting = true;
          timer = setTimeout(tick, 2000);
        }
      } else {
        charIdx -= 1;
        setPrompt(PROMPT_PREFIX + full.slice(0, charIdx));
        if (charIdx > 0) timer = setTimeout(tick, 16);
        else {
          deleting = false;
          exampleIdx = (exampleIdx + 1) % BUILD_EXAMPLES.length;
          timer = setTimeout(tick, 350);
        }
      }
    };
    timer = setTimeout(tick, 600);
    return () => clearTimeout(timer);
  }, []);
  return [prompt, setPrompt] as const;
}

export function CTA() {
  // Dark sheet flowing into the black footer below; the green wordmark panel is
  // revealed beneath (square top, footer rounds the bottom).
  const [prompt, setPrompt] = useCyclingPrompt();
  const { theme } = useTheme();
  const dark = theme === "dark";
  return (
    <section className={`px-6 py-20 md:py-28 ${dark ? "bg-background" : "bg-[#fcfcfd]"}`}>
      <div className="mx-auto max-w-3xl text-center">
        <p className={`type-eyebrow ${dark ? "text-white/60" : "text-neutral-500"}`}>AI App Builder</p>
        <h2 className={`type-h2 mt-3 ${dark ? "text-white" : "text-neutral-900"}`}>
          Ready to build?
        </h2>
        {/* Matches the hero composer — same controls, prompt animation, and
            theme-aware surface — so the top and bottom boxes read identically. */}
        <div className="mx-auto mt-10 max-w-2xl text-left">
          <V66Composer
            glow={false}
            tone={theme}
            compact
            minimalControls
            promptPicker
            promptPickerLabel="Prompt Ideas"
            promptPickerSide="left"
            promptItems={V76_PROMPTS}
            hideHowTo
            plusAsAttach
            submitLabel="Start building"
            value={prompt}
            onValueChange={setPrompt}
            accent="#7DA4FF"
            surfaceRadiusClass="rounded-[14px] md:rounded-[22px]"
            surfaceClassName={
              dark
                ? "bg-[#1b1b1b] ring-1 ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_24px_60px_-28px_rgba(0,0,0,0.8)]"
                : "bg-white ring-1 ring-black/[0.06] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_24px_60px_-30px_rgba(16,24,40,0.18)]"
            }
          />
        </div>
      </div>
    </section>
  );
}
