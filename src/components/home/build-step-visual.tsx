"use client";

// ─────────────────────────────────────────────────────────────────────────
// ITERATE VISUAL — the builder view from the Vibe Apps spec (node 2031:37488):
// the workspace sidebar, the iteration chat, and the live Time Tracker app.
// It plays a short loop: the title menu opens and "switches to edit mode", the
// chat editor slides in beside the sidebar, then a cursor types the next
// request into the box. Decorative, hidden from assistive tech. The sidebar is
// shared with the Plan mock so both read as the same BrandMages workspace.
// ─────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { WorkspaceSidebar } from "@/components/home/build-app-visual";
import {
  IconChevronDown,
  IconCheckCircle,
  IconDots,
  IconFilter,
  IconGear,
  IconPen,
  IconPlus,
  IconSwitch,
  IconX,
} from "@/components/home/mock-icons";
import { MockFrame } from "@/components/home/mock-frame";

type Entry = {
  description: string;
  client: string;
  project: string;
  date: string;
  duration: string;
  billable: boolean;
  status: "Approved" | "Pending" | "Logged";
};

const ENTRIES: Entry[] = [
  { description: "Q1 financial review & reporting", client: "Meridian Corp", project: "Annual Audit", date: "Apr 10", duration: "3h 45m", billable: true, status: "Approved" },
  { description: "Tax preparation meeting", client: "Oakwood LLC", project: "Tax Filing 2025", date: "Apr 10", duration: "1h 30m", billable: true, status: "Pending" },
  { description: "Reconcile accounts receivable", client: "Meridian Corp", project: "Monthly Books", date: "Apr 9", duration: "2h 15m", billable: true, status: "Approved" },
  { description: "Internal team standup", client: "—", project: "Internal", date: "Apr 9", duration: "0h 30m", billable: false, status: "Logged" },
  { description: "Payroll processing & review", client: "Bloom Studios", project: "Payroll Mgmt", date: "Apr 8", duration: "4h 00m", billable: true, status: "Approved" },
  { description: "Draft engagement letter", client: "NovaTech Inc", project: "Onboarding", date: "Apr 8", duration: "1h 45m", billable: true, status: "Pending" },
  { description: "Review vendor invoices", client: "Bloom Studios", project: "Monthly Books", date: "Apr 8", duration: "2h 00m", billable: true, status: "Approved" },
  { description: "Client onboarding call", client: "NovaTech Inc", project: "Onboarding", date: "Apr 7", duration: "1h 00m", billable: true, status: "Approved" },
  { description: "Bookkeeping cleanup", client: "Oakwood LLC", project: "Monthly Books", date: "Apr 7", duration: "3h 30m", billable: true, status: "Approved" },
  { description: "Professional development", client: "—", project: "Internal", date: "Apr 7", duration: "2h 00m", billable: false, status: "Logged" },
];

const STATUS_STYLE: Record<Entry["status"], string> = {
  Approved: "bg-[var(--mock-positive-bg)] text-[color:var(--mock-positive-fg)]",
  Pending: "bg-[var(--mock-warning-bg)] text-[color:var(--mock-warning-fg)]",
  Logged: "bg-border/60 text-muted-foreground",
};

const MENU_ITEMS = [
  { icon: <IconSwitch />, label: "Switch to edit mode", active: true },
  { icon: <IconGear />, label: "Manage app", active: false },
  { icon: <IconPen />, label: "Rename app", active: false },
];

// The iteration transcript, oldest → newest. `user` messages are the requests;
// each is followed by the assistant's short confirmation (with optional bullets).
type Turn = { role: "user" | "assistant"; text: string; bullets?: string[] };
const CHAT: Turn[] = [
  { role: "user", text: "Build a time tracking app to log hours across clients and projects, with timers, manual entries, and weekly summaries." },
  { role: "assistant", text: "Got it! I’ll build this for you. Before we start, I have a few quick questions to make sure this fits your workflow." },
  { role: "user", text: "Make the table more compact vertically." },
  { role: "assistant", text: "Reduced row height and tightened cell spacing while preserving readability." },
  { role: "user", text: "Change “Team time” to “Team overview.”" },
  { role: "assistant", text: "Updated tab label to “Team overview.”" },
  { role: "user", text: "Add approval status colors so pending stands out more." },
  { role: "assistant", text: "Added color-coded statuses:", bullets: ["Approved → green", "Pending → orange", "Logged → gray"] },
  { role: "user", text: "Prepare invoices and payroll." },
  { role: "assistant", text: "Moved filters above the table and increased visual emphasis." },
];

const INPUT_TEXT = "I need this app to support overtime calculations";

function IconPaperclip({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path d="M9.4292 0.719726C11.5034 -1.35449 14.8667 -1.35449 16.9409 0.719726C19.0151 2.79395 19.0151 6.15723 16.9409 8.23145L10.312 14.8643C8.96826 16.208 6.79248 16.208 5.44873 14.8643C4.10498 13.5205 4.10498 11.3447 5.44873 10.001L11.6401 3.81348C12.0073 3.44629 12.6011 3.44629 12.9644 3.81348C13.3276 4.18066 13.3315 4.77441 12.9644 5.1377L6.77686 11.3252C6.16748 11.9346 6.16748 12.9229 6.77686 13.5361C7.38623 14.1494 8.37451 14.1455 8.98779 13.5361L15.6167 6.90723C16.9604 5.56348 16.9604 3.3877 15.6167 2.04395C14.2729 0.700195 12.0972 0.700195 10.7573 2.04395L3.68701 9.11426C1.61279 11.1885 1.61279 14.5518 3.68701 16.626C5.76123 18.7002 9.12451 18.7002 11.1987 16.626L16.7222 11.1064C17.0894 10.7393 17.6831 10.7393 18.0464 11.1064C18.4097 11.4736 18.4136 12.0674 18.0464 12.4307L12.523 17.9541C9.71436 20.7627 5.16357 20.7627 2.35889 17.9541C-0.445801 15.1455 -0.449707 10.5947 2.35889 7.79004L9.4292 0.719726Z" fill="currentColor" />
    </svg>
  );
}

function IconArrowUp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M12 19V5M6 11l6-6 6 6" />
    </svg>
  );
}

// The demo cursor that clicks through the menu. White fill + dark outline so it
// reads on either surface.
function IconCursor({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M5.5 3.2 18.4 10.1 12.2 11.8 9.6 17.9 5.5 3.2Z"
        fill="var(--background)"
        stroke="var(--foreground)"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type Phase =
  | "closed"
  | "titleClick"
  | "itemHover"
  | "itemPress"
  | "builder"
  | "typing"
  | "idle";

// Sequence: a cursor clicks the app title, the menu opens, "Switch to edit mode"
// is hovered then pressed, the editor slides in, and the next request types into
// the box. Holds, then loops.
function useIterateSequence() {
  const [phase, setPhase] = useState<Phase>("closed");
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setPhase("idle");
      setTyped(INPUT_TEXT.length);
      return;
    }
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let typeIv: ReturnType<typeof setInterval> | undefined;
    const wait = (ms: number) =>
      new Promise<void>((r) => timers.push(setTimeout(r, ms)));
    const type = () =>
      new Promise<void>((r) => {
        let i = 0;
        typeIv = setInterval(() => {
          if (cancelled) return;
          i += 1;
          setTyped(i);
          if (i >= INPUT_TEXT.length) {
            if (typeIv) clearInterval(typeIv);
            r();
          }
        }, 52);
      });

    (async () => {
      while (!cancelled) {
        setPhase("closed");
        setTyped(0);
        await wait(1500);
        if (cancelled) return;
        setPhase("titleClick"); // cursor presses the title → menu opens
        await wait(1100);
        if (cancelled) return;
        setPhase("itemHover"); // cursor glides down onto the menu item
        await wait(850);
        if (cancelled) return;
        setPhase("itemPress"); // the item is pressed
        await wait(520);
        if (cancelled) return;
        setPhase("builder"); // menu closes, the editor slides in
        await wait(1200);
        if (cancelled) return;
        setPhase("typing");
        await type();
        if (cancelled) return;
        setPhase("idle");
        await wait(5200);
        if (cancelled) return;
      }
    })();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      if (typeIv) clearInterval(typeIv);
    };
  }, []);

  const menuOpen =
    phase === "titleClick" || phase === "itemHover" || phase === "itemPress";
  const expanded = phase === "builder" || phase === "typing" || phase === "idle";
  return {
    phase,
    menuOpen,
    titleActive: menuOpen,
    expanded,
    cursorVisible:
      phase === "closed" ||
      phase === "titleClick" ||
      phase === "itemHover" ||
      phase === "itemPress",
    cursorAtItem: phase === "itemHover" || phase === "itemPress",
    cursorPressing: phase === "titleClick" || phase === "itemPress",
    publishVisible: expanded,
    typedText:
      phase === "typing" ? INPUT_TEXT.slice(0, typed) : phase === "idle" ? INPUT_TEXT : "",
    showCaret: expanded,
  };
}

export function BuildStepVisual() {
  const {
    phase,
    expanded,
    menuOpen,
    titleActive,
    cursorVisible,
    cursorAtItem,
    cursorPressing,
    publishVisible,
    typedText,
    showCaret,
  } = useIterateSequence();

  return (
    <MockFrame>
      <div className="flex min-h-0 flex-1">
        <WorkspaceSidebar showDraft={false} />

        <div className="relative flex min-w-0 flex-1 flex-col">
        {/* Outer top bar — the app title is the menu trigger. Collapsed, this is
            the app's only bar so it carries the app actions; switching to edit
            mode hands those off to the live-app pane and shows Publish instead. */}
        <div className="flex h-[34px] shrink-0 items-center justify-between border-b border-border px-3">
          <span
            className={`-mx-1.5 flex items-center gap-1 rounded-md px-1.5 py-1 text-[11.5px] leading-none text-foreground transition-colors ${
              titleActive ? "bg-muted" : ""
            }`}
          >
            Time Tracker
            <IconChevronDown className="size-[10px] text-muted-foreground" />
          </span>
          {publishVisible ? (
            <span className="flex h-[20px] items-center rounded-[3px] bg-foreground px-2.5 text-[10px] leading-none text-background">
              Publish
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <span className="flex size-[20px] items-center justify-center rounded-[3px] border border-border">
                <IconDots className="size-[11px] text-foreground" />
              </span>
              <span className="flex h-[20px] items-center gap-1 rounded-[3px] bg-foreground px-2 text-[10px] leading-none text-background">
                <IconPlus className="size-[9px]" />
                Log Time
              </span>
            </span>
          )}
        </div>

        {/* Title menu — opens under the title; the cursor hovers then presses
            "Switch to edit mode", which reveals the chat editor. */}
        {menuOpen && (
          <div className="absolute left-3 top-[30px] z-20 w-[150px] animate-menu-in overflow-hidden rounded border border-border bg-background shadow-sm">
            {MENU_ITEMS.map((item, i) => {
              // Only the "Switch to edit mode" row (i === 0) reacts to the cursor.
              const pressed = i === 0 && phase === "itemPress";
              const hovered = i === 0 && phase === "itemHover";
              return (
                <span
                  key={item.label}
                  className={`flex items-center gap-1.5 px-2 py-[6px] text-[10px] leading-none text-foreground transition-colors ${
                    pressed ? "bg-border" : hovered ? "bg-muted" : ""
                  }`}
                >
                  <span className="[&>svg]:size-[10px] flex shrink-0 items-center">
                    {item.icon}
                  </span>
                  {item.label}
                </span>
              );
            })}
          </div>
        )}

        {/* Demo cursor — glides from the title down to the menu item and back
            out. A quick scale-down marks each press. */}
        {cursorVisible && (
          <div
            className="pointer-events-none absolute z-30 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={cursorAtItem ? { left: 46, top: 42 } : { left: 58, top: 16 }}
          >
            <IconCursor
              className={`size-[15px] drop-shadow-sm transition-transform duration-150 ${
                cursorPressing ? "scale-90" : "scale-100"
              }`}
            />
          </div>
        )}

        <div className="flex min-h-0 flex-1">
          {/* Chat editor — slides in when switching to edit mode. */}
          <div
            className="flex min-h-0 flex-col overflow-hidden border-r border-border transition-[flex-basis,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ flexBasis: expanded ? "44%" : "0%", opacity: expanded ? 1 : 0 }}
          >
            {/* Transcript — top-aligned so the conversation reads from the top,
                with the composer pinned below. */}
            <div className="flex min-h-0 flex-1 flex-col justify-start gap-3 overflow-hidden p-2.5">
              {CHAT.map((turn, i) =>
                turn.role === "user" ? (
                  <div key={i} className="flex justify-end">
                    <p className="max-w-[85%] rounded-lg bg-muted px-2 py-1.5 text-[10.5px] leading-[1.45] text-foreground">
                      {turn.text}
                    </p>
                  </div>
                ) : (
                  <div key={i} className="text-[10.5px] leading-[1.45] text-foreground">
                    <p>{turn.text}</p>
                    {turn.bullets && (
                      <ul className="mt-1 space-y-0.5">
                        {turn.bullets.map((b) => (
                          <li key={b} className="text-muted-foreground">
                            {b}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ),
              )}
            </div>

            {/* Composer — the next request types in here. */}
            <div className="shrink-0 p-2.5 pt-0">
              <div className="rounded-lg border border-border px-2 py-2">
                <p className="min-h-[13px] text-[10.5px] leading-[1.45] text-foreground">
                  {typedText}
                  {showCaret && (
                    <span className="ml-px inline-block h-[1em] w-[1.5px] animate-caret bg-foreground align-[-0.15em]" />
                  )}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <IconPaperclip className="size-[12px] text-muted-foreground" />
                  <span className="flex size-[20px] items-center justify-center rounded-md bg-foreground text-background">
                    <IconArrowUp className="size-[11px]" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Live app — the deployed Time Tracker. Its own header only shows in
              edit mode, where it sits beside the chat as a live preview;
              collapsed, the outer bar is the single app header. `@container` so
              the table's columns respond to this pane's width — it narrows to
              ~56% in edit mode, which viewport breakpoints can't see. */}
          <div className="relative flex min-w-0 flex-1 flex-col @container">
            {expanded && (
              <div className="flex h-[34px] shrink-0 items-center justify-between border-b border-border px-3">
                <span className="text-[11.5px] leading-none text-foreground">Time Tracker</span>
                <span className="flex items-center gap-1.5">
                  <span className="flex size-[20px] items-center justify-center rounded-[3px] border border-border">
                    <IconDots className="size-[11px] text-foreground" />
                  </span>
                  <span className="flex h-[20px] items-center gap-1 rounded-[3px] bg-foreground px-2 text-[10px] leading-none text-background">
                    <IconPlus className="size-[9px]" />
                    Log Time
                  </span>
                </span>
              </div>
            )}

            {/* Tabs */}
            <div className="flex h-[34px] shrink-0 items-center gap-4 border-b border-border px-3">
              {["My time", "Team time", "All entries"].map((tab, i) => (
                <span
                  key={tab}
                  className={`-mb-px flex h-[34px] items-center border-b text-[11px] leading-none ${
                    i === 0
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground"
                  }`}
                >
                  {tab}
                </span>
              ))}
            </div>

            {/* Filters toolbar */}
            <div className="flex shrink-0 items-center justify-between px-3 py-2">
              <span className="flex items-center gap-1.5">
                <span className="flex items-center gap-1 rounded-[3px] border border-border px-1.5 py-1 text-[10px] leading-none text-foreground">
                  <IconFilter className="size-[10px]" />
                  Filters
                </span>
                <span className="rounded-[3px] bg-muted px-1.5 py-1 text-[10px] leading-none text-foreground">
                  This week: Apr 7 – Apr 11
                </span>
              </span>
              <span className="text-[10px] leading-none text-muted-foreground">
                Total: 32h 15m
              </span>
            </div>

            {/* Entries table */}
            <div className="mx-3 mb-3 min-h-0 flex-1 overflow-hidden rounded-md border border-border">
              <div className="flex items-center gap-2 border-b border-border bg-muted px-2.5 py-1.5 text-[9.5px] leading-none text-muted-foreground">
                <span className="min-w-[64px] flex-1 truncate">Description</span>
                <span className="hidden w-[64px] @min-[520px]:block">Client</span>
                <span className="hidden w-[60px] @min-[440px]:block">Project</span>
                <span className="w-[42px] whitespace-nowrap">Date</span>
                <span className="hidden w-[50px] whitespace-nowrap @min-[320px]:block">Duration</span>
                <span className="hidden w-[40px] text-center @min-[380px]:block">Billable</span>
                <span className="w-[52px]">Status</span>
              </div>
              {ENTRIES.map((entry) => (
                <div
                  key={entry.description}
                  className="flex items-center gap-2 border-b border-border px-2.5 py-[5px] text-[10px] leading-none last:border-b-0"
                >
                  <span className="min-w-[64px] flex-1 truncate text-foreground">
                    {entry.description}
                  </span>
                  <span className="hidden w-[64px] truncate text-muted-foreground @min-[520px]:block">
                    {entry.client}
                  </span>
                  <span className="hidden w-[60px] truncate text-muted-foreground @min-[440px]:block">
                    {entry.project}
                  </span>
                  <span className="w-[42px] whitespace-nowrap text-muted-foreground">{entry.date}</span>
                  <span className="hidden w-[50px] whitespace-nowrap text-muted-foreground @min-[320px]:block">{entry.duration}</span>
                  <span className="hidden w-[40px] justify-center @min-[380px]:flex">
                    {entry.billable ? (
                      <IconCheckCircle className="size-[12px] text-[color:var(--mock-positive-fg)]" />
                    ) : (
                      <IconX className="size-[11px] text-muted-foreground/50" />
                    )}
                  </span>
                  <span className="w-[52px]">
                    <span
                      className={`inline-block rounded-full px-1.5 py-[3px] text-[9px] leading-none ${STATUS_STYLE[entry.status]}`}
                    >
                      {entry.status}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>
      </div>
    </MockFrame>
  );
}
