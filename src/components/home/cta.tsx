"use client";

import { useRef, useState } from "react";
import { V66Composer } from "./hero-v66";
import { PROMPT_IDEAS } from "./prompt-ideas";
import { useTheme } from "@/components/theme/theme-provider";

export function CTA() {
  // Dark sheet flowing into the black footer below; the green wordmark panel is
  // revealed beneath (square top, footer rounds the bottom).
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // Same prompt data + animated "Build …" placeholder as the hero composer,
  // so the top and bottom boxes read identically.
  const [prompt, setPrompt] = useState("");
  const { theme } = useTheme();
  const dark = theme === "dark";
  // bg-background in both themes so the CTA sits on the same canvas as the
  // rest of the landing page instead of introducing its own tint.
  return (
    <section className="bg-background px-6 py-14 md:py-20">
      {/* Extra bottom room so the Prompt Ideas menu (opens downward, up to
          20rem tall) never runs into the footer below. */}
      <div className="mx-auto max-w-3xl pb-72 pt-16 text-center md:pt-24">
        <p className={`type-eyebrow ${dark ? "text-white/60" : "text-neutral-500"}`}>AI App Builder</p>
        <h2 className={`type-h2 mt-3 ${dark ? "text-white" : "text-neutral-900"}`}>
          What are you waiting for?
        </h2>
        <div className="mx-auto mt-10 max-w-2xl text-left">
          {/* Composer sits above its under-card strip (Langdock-style): the
              strip peeks out beneath the box and carries the pricing line,
              so the reassurance reads as part of the composer, not a
              floating caption. */}
          <div className="relative z-10">
          <V66Composer
            textareaRef={inputRef}
            typewriter
            // Always accented — the arrow routes to onboarding even with an
            // empty box, so it never reads as disabled.
            submitDisabled={false}
            glow={false}
            tone={theme}
            compact
            minimalControls
            promptPicker
            promptPickerLabel="Prompt Ideas"
            promptPickerSide="left"
            promptItems={PROMPT_IDEAS}
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
          <div
            className={`relative -mt-3 mx-2 rounded-b-[18px] px-5 pb-2.5 pt-5 text-[13px] ${
              dark
                ? "bg-white/[0.05] text-white/50 ring-1 ring-white/[0.08]"
                : "bg-black/[0.03] text-neutral-500 ring-1 ring-black/[0.04]"
            }`}
          >
            Free forever plan. No credit card required.
          </div>
        </div>
      </div>
    </section>
  );
}
