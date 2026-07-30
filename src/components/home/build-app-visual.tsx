"use client";

// ─────────────────────────────────────────────────────────────────────────
// BUILD-APP VISUAL — recreation of the app-builder screen from the Vibe Apps
// Figma spec (node 2902:53857): workspace sidebar, builder chat with the
// time-tracking prompt, and the "questions before we start" card. The chat
// plays a short looping sequence — thinking → reply typing in → the questions
// card sliding up — then resets. Decorative, hidden from assistive tech.
// ─────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import {
  IconApp,
  IconArrowUpRight,
  IconBell,
  IconBook,
  IconBrandMark,
  IconChat,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconGear,
  IconGlobe,
  IconGrid,
  IconHelp,
  IconPalette,
  IconPlus,
  IconUsers,
} from "@/components/home/mock-icons";
import { MockFrame } from "@/components/home/mock-frame";

// Assembly wordmark stair-step, in currentColor. `animated` lights the three
// bars in sequence (bottom → top) for the "thinking" indicator; otherwise it's
// a plain static mark (e.g. the questions-card header).
function IconMark({
  className,
  animated = false,
}: {
  className?: string;
  animated?: boolean;
}) {
  const stage = (delay: string) =>
    animated
      ? { animation: "markStage 1.4s ease-in-out infinite", animationDelay: delay }
      : undefined;
  return (
    <svg viewBox="0 0 139 139" fill="currentColor" className={className} aria-hidden>
      <path
        style={stage("0s")}
        d="M138.878 100.104V123.552C138.878 131.844 132.142 138.57 123.832 138.57H4.14569C0.460605 138.57 -1.38657 134.121 1.21984 131.521L29.2747 103.532C31.4737 101.338 34.4597 100.104 37.5707 100.104H138.888H138.878Z"
      />
      <path
        style={stage("0.18s")}
        d="M138.879 47.1379V70.5811C138.879 78.8728 132.143 85.5986 123.829 85.5986H47.2427L82.3575 50.5654C84.5565 48.3712 87.5379 47.1379 90.6489 47.1379H138.884H138.879Z"
      />
      <path
        style={stage("0.36s")}
        d="M138.879 4.1366V17.6205C138.879 25.9122 132.143 32.638 123.829 32.638H100.325L131.815 1.21717C134.421 -1.38353 138.879 0.459594 138.879 4.1366Z"
      />
    </svg>
  );
}

const ASSISTANT_REPLY =
  "Got it! I’ll build this for you. Before we start, I have a few quick questions to make sure this fits your workflow.";

// Looping demo of the plan step: thinking → reply typing in → done (card shows),
// then resets after a beat. Honors reduced-motion by jumping straight to done.
function usePlanSequence() {
  const [phase, setPhase] = useState<"thinking" | "typing" | "done">("thinking");
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setPhase("done");
      setTyped(ASSISTANT_REPLY.length);
      return;
    }
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let typingIv: ReturnType<typeof setInterval> | undefined;
    const wait = (ms: number) =>
      new Promise<void>((resolve) => timers.push(setTimeout(resolve, ms)));
    const typeReply = () =>
      new Promise<void>((resolve) => {
        let i = 0;
        typingIv = setInterval(() => {
          if (cancelled) return;
          i += 1;
          setTyped(i);
          if (i >= ASSISTANT_REPLY.length) {
            if (typingIv) clearInterval(typingIv);
            resolve();
          }
        }, 24);
      });

    (async () => {
      while (!cancelled) {
        setPhase("thinking");
        setTyped(0);
        await wait(1600);
        if (cancelled) return;
        setPhase("typing");
        await typeReply();
        if (cancelled) return;
        setPhase("done");
        await wait(3800);
        if (cancelled) return;
      }
    })();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      if (typingIv) clearInterval(typingIv);
    };
  }, []);

  return { phase, typed };
}

// Sidebar rows share one shape; `active` marks the draft app being built.
// Exported for the sibling mocks that share this sidebar scale.
export function NavItem({
  icon,
  label,
  trailing,
  active,
  muted,
}: {
  icon: React.ReactNode;
  label: string;
  trailing?: React.ReactNode;
  active?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={`flex h-[26px] items-center gap-2 rounded px-1.5 ${
        active ? "bg-border/70" : ""
      } ${muted ? "text-muted-foreground" : "text-foreground"}`}
    >
      <span className="[&>svg]:size-[16px] flex shrink-0 items-center justify-center text-muted-foreground">
        {icon}
      </span>
      <span className="min-w-0 flex-1 truncate text-[11.5px] leading-none">
        {label}
      </span>
      {trailing}
    </div>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-1.5 pb-1 pt-[18px] text-[10px] leading-none text-muted-foreground">
      {children}
    </p>
  );
}

// Workspace nav shared by the how-it-works mocks (Plan + Iterate) so both read
// as the same BrandMages workspace. Hidden on small screens where the mock's
// primary column alone tells the story. `activeApp` marks the open app row.
export function WorkspaceSidebar({
  activeApp = "time-tracker",
  showDraft = true,
}: {
  activeApp?: "time-tracker";
  showDraft?: boolean;
}) {
  return (
    <div className="hidden w-[144px] shrink-0 flex-col border-r border-border bg-muted px-1.5 py-2 lg:flex md:w-[160px]">
      <div className="flex items-center gap-1.5 px-1.5 pb-3 pt-0.5">
        <span className="flex size-[16px] items-center justify-center rounded-[3px] bg-foreground text-background">
          <IconBrandMark className="size-[9px]" />
        </span>
        <span className="text-[11.5px] leading-none text-foreground">
          BrandMages
        </span>
        <IconChevronDown className="size-[10px] text-muted-foreground" />
      </div>

      <NavItem icon={<IconBook />} label="CRM" />
      <NavItem icon={<IconUsers />} label="Team" />
      <NavItem
        icon={<IconBell />}
        label="Notification"
        trailing={
          <span className="flex h-[14px] min-w-[16px] items-center justify-center rounded bg-border/70 text-[9.5px] leading-none text-foreground">
            2
          </span>
        }
      />

      <SectionLabel>Apps</SectionLabel>
      <NavItem icon={<IconGlobe />} label="Home" />
      <NavItem icon={<IconChat />} label="Messages" />
      <NavItem
        icon={<IconApp />}
        label="Time Tracker"
        active={activeApp === "time-tracker"}
        trailing={
          showDraft ? (
            <span className="rounded border border-border px-1.5 py-0.5 text-[9px] leading-none text-muted-foreground">
              Draft
            </span>
          ) : undefined
        }
      />
      <NavItem icon={<IconPlus />} label="Add App" muted />

      <SectionLabel>Customize</SectionLabel>
      <NavItem icon={<IconPalette />} label="Brand" />
      <NavItem icon={<IconGrid />} label="Apps" />

      <div className="mt-auto flex items-center justify-between pt-2">
        <span className="flex gap-1">
          <span className="flex size-[22px] items-center justify-center rounded-full border border-border">
            <IconGear className="size-[11px] text-foreground" />
          </span>
          <span className="flex size-[22px] items-center justify-center rounded-full border border-border">
            <IconHelp className="size-[11px] text-foreground" />
          </span>
        </span>
        <span className="flex items-center gap-1 rounded-full border border-border px-2 py-1 text-[10px] leading-none text-foreground">
          Open Portal
          <IconArrowUpRight className="size-[9px]" />
        </span>
      </div>
    </div>
  );
}

export function BuildAppVisual() {
  return (
    <MockFrame>
      <div className="flex min-h-0 flex-1">
        <WorkspaceSidebar />

        {/* Main column — builder header, chat, and the Q&A card. */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex h-[34px] shrink-0 items-center justify-between border-b border-border px-3">
            <span className="flex items-center gap-1 text-[11.5px] leading-none text-foreground">
              Time Tracker
              <IconChevronDown className="size-[10px] text-muted-foreground" />
            </span>
            <span className="flex h-[20px] items-center rounded-[3px] border border-border bg-muted px-2.5 text-[10px] leading-none text-muted-foreground/70">
              Publish
            </span>
          </div>

          <BuildChat />
        </div>
      </div>
    </MockFrame>
  );
}

// The animated chat column: prompt → thinking → reply → questions card.
function BuildChat() {
  const { phase, typed } = usePlanSequence();

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-3 md:px-5 md:py-4">
      <div className="flex justify-end">
        <p className="max-w-[75%] rounded-lg bg-muted px-2.5 py-1.5 text-[11.5px] leading-[1.5] text-foreground md:max-w-[320px]">
          Build a time tracking app to log hours across clients and projects,
          with timers, manual entries, and weekly summaries.
        </p>
      </div>

      {/* Assistant: a thinking indicator that gives way to the reply typing in. */}
      {phase === "thinking" ? (
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <IconMark animated className="size-[13px] text-foreground" />
          <span className="text-[11px] leading-none">14s</span>
        </div>
      ) : (
        <p className="max-w-[95%] animate-fade-in text-[11.5px] leading-[1.5] text-foreground">
          {phase === "typing" ? ASSISTANT_REPLY.slice(0, typed) : ASSISTANT_REPLY}
          {phase === "typing" && (
            <span className="ml-0.5 inline-block h-[1em] w-[1.5px] animate-caret bg-foreground align-[-0.15em]" />
          )}
        </p>
      )}

      {/* Q&A card slides up once the reply lands. */}
      {phase === "done" && (
        <div className="mt-auto animate-fade-in overflow-hidden rounded-lg border border-border bg-background">
              <div className="flex items-center gap-2 bg-muted px-2.5 py-2">
                <IconMark className="size-[10px] shrink-0 text-foreground" />
                <p className="min-w-0 flex-1 truncate text-[11px] leading-none text-foreground">
                  Some questions before we start
                </p>
                <span className="flex shrink-0 items-center gap-1 text-[10.5px] leading-none">
                  <IconChevronLeft className="size-[10px] text-muted-foreground/60" />
                  <span className="text-foreground">1</span>
                  <span className="text-muted-foreground">of 2</span>
                  <IconChevronRight className="size-[10px] text-foreground" />
                </span>
              </div>
              <p className="px-2.5 pb-1.5 pt-2 text-[11.5px] leading-none text-foreground">
                Will this app be visible to your clients?
              </p>
              {[
                "No, this is internal-only",
                "Yes, this will show in my client portal",
              ].map((option, i) => (
                <div
                  key={option}
                  className="flex items-center gap-2 border-b border-border px-2.5 py-2 last:border-b-0"
                >
                  <span className="flex size-[18px] shrink-0 items-center justify-center rounded-sm bg-border/70 text-[10px] leading-none text-foreground">
                    {i + 1}
                  </span>
                  <p className="truncate text-[11.5px] leading-none text-foreground">
                    {option}
                  </p>
                </div>
              ))}
            </div>
      )}
    </div>
  );
}
