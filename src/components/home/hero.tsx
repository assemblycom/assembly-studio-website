"use client";

import { useState, useRef, useEffect } from "react";
import { APP_URL } from "@/lib/constants";

const CATEGORIES = [
  {
    label: "Onboarding",
    items: [
      { title: "New client intake", desc: "Company details, contacts, services, budget" },
      { title: "Onboarding wizard", desc: "Multi-step flow with saved progress" },
      { title: "Document collection", desc: "Requested docs with upload checklist" },
    ],
  },
  {
    label: "Workflows",
    items: [
      { title: "Approval flow", desc: "Route requests through reviewers" },
      { title: "Task assignment", desc: "Assign and track deliverables" },
      { title: "Status updates", desc: "Automated progress reports to clients" },
    ],
  },
  {
    label: "Portals",
    items: [
      { title: "Client dashboard", desc: "Branded hub for files, tasks, messages" },
      { title: "Partner portal", desc: "External collaboration workspace" },
      { title: "Knowledge base", desc: "Self-service help center for clients" },
    ],
  },
  {
    label: "Communication",
    items: [
      { title: "Secure messaging", desc: "Threaded conversations with clients" },
      { title: "Email notifications", desc: "Automated alerts and reminders" },
      { title: "Announcement feed", desc: "Broadcast updates to all clients" },
    ],
  },
  {
    label: "Finance",
    items: [
      { title: "Invoice collection", desc: "Send and track client payments" },
      { title: "Contract signing", desc: "E-signatures with audit trail" },
      { title: "Billing dashboard", desc: "Payment history and statements" },
    ],
  },
  {
    label: "Reporting",
    items: [
      { title: "Client analytics", desc: "Engagement and activity metrics" },
      { title: "Custom reports", desc: "Filtered views of portal data" },
      { title: "Export to CSV", desc: "Download data for external tools" },
    ],
  },
];

export function Hero() {
  const [open, setOpen] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(null);
      }
    }
    if (open !== null) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [open]);

  return (
    <section className="px-6 pb-20 pt-24 md:pb-28 md:pt-32">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-medium tracking-tight md:text-6xl">
          The AI app builder for
          <br />
          client-facing experiences
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Build apps that ship to your client portal, work with your existing
          contacts, and honor your team&apos;s permissions and brand. No code, no
          infrastructure, no developer required.
        </p>

        <div className="mx-auto mt-10 max-w-xl">
          <a href={APP_URL} className="block">
            <div className="rounded-2xl border border-border bg-muted p-5 text-left transition-colors hover:border-foreground/20">
              <p className="text-muted-foreground">
                Describe what you want to build...
              </p>
              <div className="mt-10 flex items-center justify-end">
                <span className="rounded-full bg-foreground px-4 py-1.5 text-sm text-background">
                  Start building
                </span>
              </div>
            </div>
          </a>

          {/* Category chips + dropdown */}
          <div ref={panelRef} className="relative mt-4">
            <div className="flex items-center gap-2">
              <div className="flex flex-1 items-center gap-2 overflow-x-auto scrollbar-none">
                {CATEGORIES.map((cat, i) => (
                  <button
                    key={cat.label}
                    onClick={() => setOpen(open === i ? null : i)}
                    className={`shrink-0 rounded-full border px-3 py-1 text-xs transition-colors ${
                      open === i
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="shrink-0 text-muted-foreground"
              >
                <path
                  d="M6 3l5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Dropdown panel */}
            {open !== null && (
              <div className="absolute left-0 right-0 z-10 mt-2 rounded-xl border border-border bg-background shadow-lg">
                {CATEGORIES[open].items.map((item) => (
                  <a
                    key={item.title}
                    href={APP_URL}
                    className="flex items-center gap-4 border-b border-border px-5 py-4 text-left transition-colors last:border-0 hover:bg-muted"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <div className="h-5 w-5 rounded bg-muted-foreground/20" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="mt-12 text-sm text-muted-foreground">
          Trusted by teams at leading firms
        </p>
        <div className="mt-4 flex items-center justify-center gap-8 opacity-40">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-8 w-24 rounded bg-muted-foreground/20"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
