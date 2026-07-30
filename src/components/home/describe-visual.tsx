"use client";

// ─────────────────────────────────────────────────────────────────────────
// DESCRIBE VISUAL — the builder's Add App start screen from the Vibe Apps
// spec (node 3242:57710): prompt box with category chips and the firm
// template list underneath. Decorative only.
// ─────────────────────────────────────────────────────────────────────────

import {
  NavItem,
  SectionLabel,
} from "@/components/home/build-app-visual";
import { useAssemblyTypewriter, TYPEWRITER_PREFIX } from "@/components/home/hero-v66";
import { MockFrame } from "@/components/home/mock-frame";
import {
  IconArrowUpRight,
  IconBell,
  IconBook,
  IconBookOpen,
  IconBrandMark,
  IconChat,
  IconChevronDown,
  IconDocument,
  IconFilePdf,
  IconGear,
  IconGlobe,
  IconGrid,
  IconHelp,
  IconPalette,
  IconPlus,
  IconUser,
  IconUsers,
} from "@/components/home/mock-icons";

const CHIPS = [
  "Tasks & Workflow",
  "CRM & Sales",
  "Content & Sites",
  "Finance",
  "Booking",
  "E-Commerce",
];

const TEMPLATES = [
  {
    icon: <IconUser />,
    title: "New client intake",
    description: "Company details, contacts, services, budget",
  },
  {
    icon: <IconBookOpen />,
    title: "Onboarding wizard",
    description: "Multi-step flow with saved progress",
  },
  {
    icon: <IconDocument />,
    title: "Document collection",
    description: "Requested docs with upload checklist",
  },
  {
    icon: <IconFilePdf />,
    title: "PDF to digital intake",
    description: "Turn a PDF into a guided web form",
  },
];

// Describe types the one prompt this whole flow is built around (kept shorter
// than the hero's rotating examples), so it matches the plan step's prompt.
const DESCRIBE_EXAMPLES = [
  "a time tracking app to log hours across clients and projects, with timers, manual entries, and weekly summaries",
];

export function DescribeVisual() {
  // "Build " prefix + the time-tracking prompt typing/erasing after it.
  const typedExample = useAssemblyTypewriter(true, DESCRIBE_EXAMPLES);
  return (
    <MockFrame>
      <div className="flex min-h-0 flex-1">
        {/* Workspace sidebar — Add App is the active row here. */}
        <div className="hidden w-[144px] shrink-0 flex-col border-r border-border bg-muted px-1.5 py-2 lg:flex md:w-[160px]">
          <div className="flex items-center gap-1.5 px-1.5 pb-3 pt-0.5">
            <span className="flex size-[16px] items-center justify-center rounded bg-foreground text-background">
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
          <NavItem icon={<IconPlus />} label="Add App" active />

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

        {/* Main column — the builder's blank-slate prompt. */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex h-[34px] shrink-0 items-center border-b border-border px-3">
            <span className="text-[11.5px] leading-none text-foreground">
              Add App
            </span>
          </div>
          <div className="flex h-[34px] shrink-0 items-center gap-4 border-b border-border px-3">
            {["Build", "Browse"].map((tab, i) => (
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

          {/* Blank-slate content — sized to fill the window without dominating
              it, and kept to a narrower column so the prompt box doesn't read
              as stretched. */}
          <div className="mx-auto flex w-full max-w-[410px] min-h-0 flex-1 flex-col justify-start gap-2.5 overflow-hidden p-4 pt-9 lg:justify-center lg:pt-4">
            <p className="text-center text-[13.5px] leading-none text-foreground">
              Margot, what will you build?
            </p>

            {/* Prompt box — animated gradient ring marks it as the live entry
                point, matching the hero composer. */}
            <div className="v63-gradient-border relative flex h-[80px] flex-col justify-between rounded-lg border border-border p-2.5">
              <p className="text-[11px] leading-relaxed text-foreground">
                {TYPEWRITER_PREFIX}
                {typedExample}
                <span className="ml-px inline-block w-px animate-pulse align-[-0.1em]">
                  |
                </span>
              </p>
              <span className="flex items-center justify-between">
                <IconPlus className="size-[12px] text-muted-foreground" />
                <span className="flex size-[20px] items-center justify-center rounded-md bg-foreground text-background">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                    className="size-[11px]"
                  >
                    <path d="M12 19V5M6 11l6-6 6 6" />
                  </svg>
                </span>
              </span>
            </div>

            {/* Category chips — a single row that clips at the edge with a
                trailing chevron, as if more categories sit off-screen. */}
            <div className="flex items-center gap-1.5">
              <div
                className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden"
                style={{
                  maskImage:
                    "linear-gradient(to right, #000 82%, transparent 100%)",
                  WebkitMaskImage:
                    "linear-gradient(to right, #000 82%, transparent 100%)",
                }}
              >
                {CHIPS.map((chip) => (
                  <span
                    key={chip}
                    className="flex shrink-0 items-center whitespace-nowrap rounded-[3px] border border-border px-1.5 py-1 text-[10px] leading-none text-foreground [[data-theme=dark]_&]:bg-white/[0.06]"
                  >
                    {chip}
                  </span>
                ))}
              </div>
              <IconChevronDown className="size-[10px] shrink-0 -rotate-90 text-muted-foreground" />
            </div>

            {/* Template list */}
            <div className="overflow-hidden rounded-lg border border-border">
              {TEMPLATES.map((template) => (
                <div
                  key={template.title}
                  className="flex items-center gap-2 border-b border-border px-2.5 py-[7px] last:border-b-0"
                >
                  <span className="[&>svg]:size-[10px] flex size-[20px] shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
                    {template.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[11px] leading-[1.35] text-foreground">
                      {template.title}
                    </span>
                    <span className="block truncate text-[10px] leading-[1.35] text-muted-foreground">
                      {template.description}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MockFrame>
  );
}
