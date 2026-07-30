// Shared template "screenshot" mock — a real-looking mini-UI for each template
// so browsing feels like the product. Extracted so multiple hero versions can
// reuse it instead of each redefining the same mocks. Scales cleanly from a
// small panel thumbnail to a large popover preview.

import type { Template } from "@/lib/templates";

// Short labels keep the featured templates from wrapping in tight layouts.
export const SHORT_LABEL: Record<string, string> = {
  "new-client-intake": "Client intake",
  "client-engagement-dashboard": "Engagement dashboard",
  "client-project-tracker": "Project tracker",
  "content-approval-flow": "Content approval",
  "proposal-builder": "Proposal builder",
  "client-ai-assistant": "Client AI assistant",
};
export const label = (t: Template) => SHORT_LABEL[t.slug] ?? t.title;

const STATUS = { submitted: "#f59e0b", done: "#22c55e" } as const;

// Per-row hover entrance — the class only takes effect while an ancestor
// `.group` is hovered, so the rows rise in with a stagger on each hover. Full
// strings (not interpolated) so Tailwind's JIT can see them.
const ROW_ANIM = [
  "will-change-[transform,opacity] group-hover:animate-[cardRowIn_0.4s_ease-out_both]",
  "will-change-[transform,opacity] group-hover:animate-[cardRowIn_0.4s_ease-out_0.08s_both]",
  "will-change-[transform,opacity] group-hover:animate-[cardRowIn_0.4s_ease-out_0.16s_both]",
];

function Pill({ color, label }: { color: string; label: string }) {
  return (
    <span className="ml-auto flex shrink-0 items-center gap-1 rounded-full border border-border bg-background px-1.5 py-0.5 text-[9px] leading-none text-muted-foreground">
      <span className="size-1.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

export function TemplateMock({ slug }: { slug: string }) {
  if (slug === "client-project-tracker") {
    const rows = [
      { label: "Discovery & scope", color: STATUS.done, status: "Done" },
      { label: "Design phase", color: STATUS.submitted, status: "In progress" },
      { label: "Build & QA", color: STATUS.submitted, status: "Upcoming" },
    ];
    return (
      <div className="flex flex-col gap-2.5 p-3.5 text-[10px] leading-none">
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="flex items-center gap-1.5 bg-muted/60 px-2.5 py-2">
            <span className="flex size-4 items-center justify-center rounded-full bg-emerald-100 text-[8px] text-emerald-700">A</span>
            <span className="text-foreground">Northwind rebrand</span>
          </div>
          {rows.map((r) => (
            <div key={r.label} className="flex items-center gap-1.5 border-t border-border px-2.5 py-2">
              <span className="truncate text-foreground/80">{r.label}</span>
              <Pill color={r.color} label={r.status} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (slug === "client-engagement-dashboard") {
    const bars = [42, 60, 48, 76, 56, 96, 70];
    const peak = bars.indexOf(Math.max(...bars));
    const days = ["M", "T", "W", "T", "F", "S", "S"];
    return (
      <div className="flex flex-col gap-3 p-3.5 text-[10px] leading-none">
        <span className="flex items-center gap-2">
          <span className="text-2xl font-medium leading-none text-foreground">82</span>
          <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-medium text-emerald-600">+5%</span>
        </span>
        <div className="flex flex-col gap-1.5">
          <div className="flex h-16 items-end gap-1.5 border-b border-border/70 pb-px">
            {bars.map((h, i) => (
              <div key={i} className={`flex-1 rounded-t-md ${i === peak ? "bg-foreground/70" : "bg-foreground/15"}`} style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="flex gap-1.5">
            {days.map((d, i) => (
              <span key={i} className="flex-1 text-center text-[8px] text-muted-foreground/70">{d}</span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (slug === "content-approval-flow") {
    const rows = [
      { label: "March newsletter", color: STATUS.done, status: "Approved" },
      { label: "Launch announcement", color: STATUS.submitted, status: "In review" },
      { label: "Case study", color: STATUS.submitted, status: "Draft" },
    ];
    return (
      <div className="flex flex-col gap-2.5 p-3.5 text-[10px] leading-none">
        <div className="overflow-hidden rounded-lg border border-border">
          {rows.map((r, i) => (
            <div key={r.label} className={`flex items-center gap-1.5 px-2.5 py-2 ${i > 0 ? "border-t border-border" : ""}`}>
              <span className="truncate text-foreground/80">{r.label}</span>
              <Pill color={r.color} label={r.status} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (slug === "proposal-builder") {
    const items: [string, string][] = [
      ["Brand strategy", "$4,000"],
      ["Visual identity", "$6,500"],
      ["Website design", "$8,000"],
    ];
    return (
      <div className="flex flex-col gap-2.5 p-3.5 text-[10px] leading-none">
        <span className="flex items-center gap-1.5">
          <span className="size-4 rounded-md bg-foreground" />
          <span className="text-foreground">Proposal — Northwind</span>
        </span>
        <div className="flex flex-col gap-1.5 rounded-lg border border-border p-2.5">
          {items.map(([l, price]) => (
            <div key={l} className="flex items-center justify-between">
              <span className="text-foreground/80">{l}</span>
              <span className="tabular-nums text-muted-foreground">{price}</span>
            </div>
          ))}
          <div className="mt-0.5 flex items-center justify-between border-t border-border pt-1.5">
            <span className="text-foreground">Total</span>
            <span className="tabular-nums text-foreground">$18,500</span>
          </div>
        </div>
      </div>
    );
  }

  if (slug === "client-ai-assistant") {
    return (
      <div className="flex flex-col gap-2 p-3.5 text-[10px] leading-none">
        <div className="flex items-center gap-1.5">
          <span className="flex size-4 items-center justify-center rounded-full bg-foreground text-[8px] text-background">A</span>
          <span className="text-foreground">Assistant</span>
        </div>
        <div className="max-w-[85%] rounded-lg rounded-tl-sm bg-muted px-2.5 py-2 text-foreground/80">When does my project kick off?</div>
        <div className="ml-auto max-w-[85%] rounded-lg rounded-tr-sm bg-foreground px-2.5 py-2 leading-relaxed text-background">Kickoff is Mon, Apr 8.</div>
      </div>
    );
  }

  if (slug === "time-tracker") {
    const rows = [
      { u: "U2", name: "Usman 2", hrs: "4.00" },
      { u: "U1", name: "Usman 1", hrs: "8.50" },
      { u: "U3", name: "Usman 3", hrs: "6.00" },
    ];
    return (
      <div className="flex flex-col gap-2.5 p-3.5 text-[10px] leading-none">
        <div className="overflow-hidden rounded-lg border border-border">
          {rows.map((r, i) => (
            <div key={r.u} className={`flex items-center gap-1.5 px-2.5 py-2 ${i > 0 ? "border-t border-border" : ""} ${ROW_ANIM[i]}`}>
              <span className="flex size-4 items-center justify-center rounded-full bg-sky-100 text-[7px] text-sky-700">{r.u}</span>
              <span className="text-foreground/80">{r.name}</span>
              <span className="ml-auto tabular-nums text-muted-foreground">{r.hrs}</span>
              <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[8px] font-medium text-emerald-600">Billable</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (slug === "service-request-intake") {
    const rows = [
      { t: "Gamer coaching", color: STATUS.done, s: "Confirmed" },
      { t: "Tax Help", color: STATUS.done, s: "Confirmed" },
      { t: "Gamer coaching", color: STATUS.submitted, s: "Pending" },
    ];
    return (
      <div className="flex flex-col gap-2.5 p-3.5 text-[10px] leading-none">
        <div className="overflow-hidden rounded-lg border border-border">
          {rows.map((r, i) => (
            <div key={i} className={`flex items-center gap-1.5 px-2.5 py-2 ${i > 0 ? "border-t border-border" : ""}`}>
              <span className="truncate text-foreground/80">{r.t}</span>
              <Pill color={r.color} label={r.s} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (slug === "onboarding-wizard") {
    const stats: [string, string][] = [
      ["In progress", "1"],
      ["Completed", "0"],
      ["Stalled", "0"],
      ["Not started", "0"],
    ];
    return (
      <div className="flex flex-col gap-2.5 p-3.5 text-[10px] leading-none">
        <div className="grid grid-cols-2 gap-1.5">
          {stats.map(([l, n]) => (
            <div key={l} className="rounded-lg border border-border px-2 py-1.5">
              <div className="text-[8px] text-muted-foreground">{l}</div>
              <div className="text-sm font-medium leading-none text-foreground">{n}</div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-full rounded-full bg-foreground" />
          </div>
          <span className="text-[8px] text-muted-foreground">100%</span>
        </div>
      </div>
    );
  }

  if (slug === "data-visualization") {
    // A small line/area chart reads as "data visualization" and stays distinct
    // from the engagement dashboard's bar chart.
    return (
      <div className="flex flex-col gap-3 p-3.5 text-[10px] leading-none">
        <div className="flex items-center gap-2">
          <span className="text-foreground">Monthly revenue</span>
          <span className="ml-auto rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-medium text-emerald-600">+12%</span>
        </div>
        <div className="flex flex-col gap-1.5 rounded-lg border border-border p-2.5">
          <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-14 w-full text-foreground" aria-hidden>
            <polygon points="0,40 0,27 17,29 33,18 50,22 67,10 83,14 100,5 100,40" className="fill-current text-foreground/10" />
            <polyline points="0,27 17,29 33,18 50,22 67,10 83,14 100,5" fill="none" className="stroke-current text-foreground/70" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          </svg>
          <div className="flex justify-between text-[8px] text-muted-foreground/70">
            <span>Jan</span>
            <span>Apr</span>
            <span>Jul</span>
          </div>
        </div>
      </div>
    );
  }

  if (slug === "goal-tracker") {
    const goals: [string, number][] = [
      ["Revenue target", 72],
      ["New clients", 45],
      ["Retention", 90],
    ];
    return (
      <div className="flex flex-col gap-2.5 p-3.5 text-[10px] leading-none">
        <div className="overflow-hidden rounded-lg border border-border">
          {goals.map(([g, pct], i) => (
            <div key={g} className={`flex flex-col gap-1.5 px-2.5 py-2 ${i > 0 ? "border-t border-border" : ""} ${ROW_ANIM[i]}`}>
              <div className="flex items-center justify-between">
                <span className="truncate text-foreground/80">{g}</span>
                <span className="tabular-nums text-muted-foreground">{pct}%</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-foreground/70" style={{ width: `${pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (slug === "client-support-requests") {
    const rows = [
      { t: "Login issue", color: STATUS.submitted, s: "Open" },
      { t: "Billing question", color: STATUS.submitted, s: "In progress" },
      { t: "Feature request", color: STATUS.done, s: "Resolved" },
    ];
    return (
      <div className="flex flex-col gap-2.5 p-3.5 text-[10px] leading-none">
        <div className="overflow-hidden rounded-lg border border-border">
          {rows.map((r, i) => (
            <div key={i} className={`flex items-center gap-1.5 px-2.5 py-2 ${i > 0 ? "border-t border-border" : ""} ${ROW_ANIM[i]}`}>
              <span className="truncate text-foreground/80">{r.t}</span>
              <Pill color={r.color} label={r.s} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default — New client intake
  const fields = [
    { label: "Company name", value: "Northwind Co." },
    { label: "Primary contact", value: "jane@northwind.com" },
    { label: "Project type", value: "Brand + website" },
  ];
  return (
    <div className="flex flex-col gap-2.5 p-3.5 text-[10px] leading-none">
      {fields.map((f, i) => (
        <div key={f.label} className={`flex flex-col gap-1.5 ${ROW_ANIM[i]}`}>
          <span className="text-muted-foreground">{f.label}</span>
          <span className="flex h-6 items-center rounded-[4px] border border-border bg-muted/30 px-2.5 text-foreground/90">{f.value}</span>
        </div>
      ))}
    </div>
  );
}

// A framed "screenshot" — browser chrome + the mock, scaled to fill.
export function Screenshot({ slug, className = "" }: { slug: string; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-xl border border-border bg-background ${className}`}>
      <div className="flex items-center gap-1 border-b border-border/60 bg-muted/30 px-2.5 py-1.5">
        <span className="size-1.5 rounded-full bg-foreground/15" />
        <span className="size-1.5 rounded-full bg-foreground/15" />
        <span className="size-1.5 rounded-full bg-foreground/15" />
      </div>
      <TemplateMock slug={slug} />
    </div>
  );
}
