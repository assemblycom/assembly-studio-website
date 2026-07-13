"use client";

import { useEffect, useRef, useState } from "react";
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

function useCyclingPrompt(
  inputRef: React.RefObject<HTMLTextAreaElement | null>,
) {
  const [prompt, setPrompt] = useState(PROMPT_PREFIX);
  // Once the visitor focuses or types, the demo typewriter must stop —
  // otherwise its ticks keep overwriting what they type. engagedRef is the
  // synchronous guard (blocks an in-flight tick); userEngaged tears the
  // animation effect down.
  const [userEngaged, setUserEngaged] = useState(false);
  const engagedRef = useRef(false);
  const clearedRef = useRef(false);
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const engage = () => {
      engagedRef.current = true;
      setUserEngaged(true);
    };
    // On first focus, wipe the leftover demo text so the visitor types into a
    // clean box — but only if it's still the animation's text.
    const onFocus = () => {
      if (!clearedRef.current) {
        clearedRef.current = true;
        if (el.value.startsWith(PROMPT_PREFIX)) setPrompt("");
      }
      engage();
    };
    el.addEventListener("focus", onFocus);
    el.addEventListener("input", engage);
    return () => {
      el.removeEventListener("focus", onFocus);
      el.removeEventListener("input", engage);
    };
  }, [inputRef]);
  useEffect(() => {
    if (userEngaged) return;
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
      if (engagedRef.current) return;
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
  }, [userEngaged, inputRef]);
  return [prompt, setPrompt] as const;
}

export function CTA() {
  // Dark sheet flowing into the black footer below; the green wordmark panel is
  // revealed beneath (square top, footer rounds the bottom).
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [prompt, setPrompt] = useCyclingPrompt(inputRef);
  const { theme } = useTheme();
  const dark = theme === "dark";
  return (
    <section className={`px-6 py-14 md:py-20 ${dark ? "bg-background" : "bg-[#fcfcfd]"}`}>
      {/* Extra bottom room so the Prompt Ideas menu (opens downward, up to
          20rem tall) never runs into the footer below. */}
      <div className="mx-auto max-w-3xl pb-72 pt-16 text-center md:pt-24">
        <p className={`type-eyebrow ${dark ? "text-white/60" : "text-neutral-500"}`}>AI App Builder</p>
        <h2 className={`type-h2 mt-3 ${dark ? "text-white" : "text-neutral-900"}`}>
          Ready to build?
        </h2>
        {/* Matches the hero composer — same controls, prompt animation, and
            theme-aware surface — so the top and bottom boxes read identically. */}
        <div className="mx-auto mt-10 max-w-2xl text-left">
          <V66Composer
            textareaRef={inputRef}
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
