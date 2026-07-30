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
      {/* Some bottom room so the Prompt Ideas menu (opens downward) has space
          before the footer, without leaving a large empty gap. */}
      <div className="mx-auto max-w-3xl pb-16 pt-16 text-center md:pb-24 md:pt-24">
        <h2
          className={`type-h2 text-balance leading-[1.12] ${dark ? "text-white" : "text-neutral-900"}`}
        >
          Build the firm
          <br />
          only you can build
        </h2>
        <div className="mx-auto mt-8 max-w-xl text-left">
          {/* Same animated gradient border as the hero composer up top. Every
              prop below must stay in step with hero-v76's composer — the two
              boxes are the same control and any drift shows immediately. */}
          <div className="v63-gradient-border v63-ring-solid relative rounded-[18px] md:rounded-[22px]">
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
              splitFooter
              promptPicker
              promptPickerLabel="Prompt Ideas"
              promptPickerSide="left"
              promptItems={PROMPT_IDEAS}
              hideHowTo
              plusAsAttach
              submitLabel="Get started"
              // Light mode uses a solid black submit button; dark keeps the
              // accent fill.
              submitDark={!dark}
              value={prompt}
              onValueChange={setPrompt}
              accent={dark ? "#7DA4FF" : "#D9ED92"}
              surfaceRadiusClass="rounded-[18px] md:rounded-[22px]"
              // Light needs an explicit faint fill here, unlike the hero: the
              // hero's box sits on the ground gradient (~#f9fafb behind the
              // composer) so its white field lifts off the surround for free,
              // while this section is pure bg-background — leaving a white field
              // on white, with no inner/outer separation at all. #f7f8fa is the
              // gradient's own mid stop, so the two composers match exactly.
              surfaceClassName={
                dark
                  ? "bg-transparent shadow-[0_24px_60px_-28px_rgba(0,0,0,0.8)]"
                  : "bg-[#f7f8fa] shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}
