"use client";

// ─────────────────────────────────────────────────────────────────────────
// BRAND-PORTAL VISUAL — the deployed "Build" step: the shared BrandMages
// workspace sidebar (same as the Plan/Iterate mocks) beside the generated Time
// Tracker app. It plays a short loop showing the app in use — the "Log Time"
// button presses and a freshly-logged entry slides into the table — then
// resets. Decorative only.
// ─────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import {
  IconChevronDown,
  IconDots,
  IconFilter,
  IconPlus,
} from "@/components/home/mock-icons";
import { MockFrame } from "@/components/home/mock-frame";
import { WorkspaceSidebar } from "@/components/home/build-app-visual";

type Entry = {
  description: string;
  client: string;
  project: string;
  date: string;
  duration: string;
  status: "Approved" | "Pending" | "Logged";
};

const ENTRIES: Entry[] = [
  {
    description: "Q1 financial review & reporting",
    client: "Meridian Corp",
    project: "Annual Audit",
    date: "Apr 10",
    duration: "3h 45m",
    status: "Approved",
  },
  {
    description: "Tax preparation meeting",
    client: "Oakwood LLC",
    project: "Tax Filing 2025",
    date: "Apr 10",
    duration: "1h 30m",
    status: "Pending",
  },
  {
    description: "Reconcile accounts receivable",
    client: "Meridian Corp",
    project: "Monthly Books",
    date: "Apr 9",
    duration: "2h 15m",
    status: "Approved",
  },
  {
    description: "Internal team standup",
    client: "—",
    project: "Internal",
    date: "Apr 9",
    duration: "0h 30m",
    status: "Logged",
  },
  {
    description: "Payroll processing & review",
    client: "Bloom Studios",
    project: "Payroll Mgmt",
    date: "Apr 8",
    duration: "4h 00m",
    status: "Approved",
  },
  {
    description: "Draft engagement letter",
    client: "NovaTech Inc",
    project: "Onboarding",
    date: "Apr 8",
    duration: "1h 45m",
    status: "Pending",
  },
];

const STATUS_STYLE: Record<Entry["status"], string> = {
  Approved:
    "bg-[var(--mock-positive-bg)] text-[color:var(--mock-positive-fg)]",
  Pending:
    "bg-[var(--mock-negative-bg)] text-[color:var(--mock-negative-fg)]",
  Logged: "bg-border/60 text-muted-foreground",
};

// The entry that "gets logged" on each loop — it slides in at the top and the
// oldest row drops off, so the table keeps its height.
const NEW_ENTRY: Entry = {
  description: "Discovery call",
  client: "Meridian Corp",
  project: "Advisory",
  date: "Apr 11",
  duration: "0h 45m",
  status: "Pending",
};

// A little demo cursor that glides up to Log Time and clicks — copied from the
// Iterate mock so the two read the same. White fill + dark outline reads on
// either surface.
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

// Loop: the cursor glides to Log Time → presses → a freshly-logged entry slides
// in → hold → reset. Reduced motion just shows the logged state.
function useLogTimeLoop() {
  const [pressing, setPressing] = useState(false);
  const [logged, setLogged] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(false);
  const [cursorNear, setCursorNear] = useState(false);
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setLogged(true);
      return;
    }
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const wait = (ms: number) =>
      new Promise<void>((r) => timers.push(setTimeout(r, ms)));
    (async () => {
      while (!cancelled) {
        setLogged(false);
        setPressing(false);
        setCursorNear(false);
        setCursorVisible(true);
        await wait(900);
        if (cancelled) return;
        setCursorNear(true); // glide up to the Log Time button
        await wait(650);
        if (cancelled) return;
        setPressing(true); // click
        await wait(280);
        if (cancelled) return;
        setPressing(false);
        setLogged(true); // the entry slides in
        setCursorVisible(false);
        await wait(3600);
        if (cancelled) return;
      }
    })();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);
  return { pressing, logged, cursorVisible, cursorNear };
}

export function BrandPortalVisual() {
  const { pressing, logged, cursorVisible, cursorNear } = useLogTimeLoop();
  // Keep the row count steady: on log, prepend the new entry and drop the last.
  const rows = logged ? [NEW_ENTRY, ...ENTRIES.slice(0, -1)] : ENTRIES;
  return (
    <MockFrame>
      <div className="flex min-h-0 flex-1">
        {/* Same internal workspace sidebar as the Plan/Iterate mocks, so all
            three read as one BrandMages workspace. No Draft badge here — by the
            Build step the app has deployed. */}
        <WorkspaceSidebar showDraft={false} />

        {/* Main column — the generated Time Tracker app. */}
        <div className="relative flex min-w-0 flex-1 flex-col">
          {/* Demo cursor — glides up to Log Time and clicks each loop. */}
          <div
            className={`pointer-events-none absolute z-20 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              cursorVisible ? "opacity-100" : "opacity-0"
            }`}
            style={cursorNear ? { top: 26, right: 26 } : { top: "56%", right: "38%" }}
          >
            <IconCursor
              className={`size-[15px] drop-shadow-sm transition-transform duration-150 ${
                pressing ? "scale-90" : "scale-100"
              }`}
            />
          </div>
          <div className="flex h-[34px] shrink-0 items-center justify-between border-b border-border px-3">
            <span className="flex items-center gap-1 text-[11.5px] leading-none text-foreground">
              Time Tracker
              <IconChevronDown className="size-[10px] text-muted-foreground" />
            </span>
            <span className="flex items-center gap-1.5">
              <span className="flex size-[20px] items-center justify-center rounded-[3px] border border-border">
                <IconDots className="size-[11px] text-foreground" />
              </span>
              <span
                className={`flex h-[20px] items-center gap-1 rounded-[3px] bg-foreground px-2 text-[10px] leading-none text-background transition-transform duration-150 ${
                  pressing ? "scale-95" : "scale-100"
                }`}
              >
                <IconPlus className="size-[9px]" />
                Log Time
              </span>
            </span>
          </div>

          {/* Tabs — same row height as the title bar above. */}
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

          {/* Toolbar */}
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
            <div className="flex items-center gap-2 border-b border-border bg-muted px-2.5 py-1.5 text-[10px] leading-none text-muted-foreground">
              <span className="min-w-[64px] flex-1">Description</span>
              <span className="hidden w-[76px] lg:block">Client</span>
              <span className="hidden w-[80px] md:block">Project</span>
              <span className="w-[38px]">Date</span>
              <span className="w-[44px]">Duration</span>
              <span className="w-[58px]">Status</span>
            </div>
            {rows.map((entry, i) => (
              <div
                key={entry.description}
                className={`flex items-center gap-2 border-b border-border px-2.5 py-[7px] text-[10.5px] leading-none last:border-b-0 ${
                  logged && i === 0 ? "animate-log-row" : ""
                }`}
              >
                <span className="min-w-[64px] flex-1 truncate text-foreground">
                  {entry.description}
                </span>
                <span className="hidden w-[76px] truncate text-muted-foreground lg:block">
                  {entry.client}
                </span>
                <span className="hidden w-[80px] truncate text-muted-foreground md:block">
                  {entry.project}
                </span>
                <span className="w-[38px] text-muted-foreground">
                  {entry.date}
                </span>
                <span className="w-[44px] text-muted-foreground">
                  {entry.duration}
                </span>
                <span className="w-[58px]">
                  <span
                    className={`inline-block rounded-full px-1.5 py-[3px] text-[9.5px] leading-none ${STATUS_STYLE[entry.status]}`}
                  >
                    {entry.status}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MockFrame>
  );
}
