// ─────────────────────────────────────────────────────────────────────────
// BUILD-APP VISUAL — static recreation of the app-builder screen from the
// Vibe Apps Figma spec (node 2902:53857): workspace sidebar, builder chat
// with the time-tracking prompt, and the "questions before we start" card.
// Purely decorative — no interactivity, hidden from assistive tech.
// ─────────────────────────────────────────────────────────────────────────

import {
  IconApp,
  IconAreaChart,
  IconArrowUpRight,
  IconBell,
  IconBook,
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
      <span className="[&>svg]:size-[12px] flex shrink-0 items-center justify-center">
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
    <p className="px-1.5 pb-1 pt-3 text-[10px] leading-none text-muted-foreground">
      {children}
    </p>
  );
}

export function BuildAppVisual() {
  return (
    <div
      aria-hidden
      className="pointer-events-none flex select-none flex-col overflow-hidden rounded-lg bg-background ring-1 ring-border sm:aspect-[16/11]"
    >
      <div className="flex min-h-0 flex-1">
        {/* Sidebar — workspace nav. Hidden on small screens where the chat
            column alone tells the story. */}
        <div className="hidden w-[168px] shrink-0 flex-col border-r border-border bg-muted px-1.5 py-2 sm:flex md:w-[188px]">
          <div className="flex items-center gap-1.5 px-1.5 pb-3 pt-0.5">
            <span className="flex size-[16px] items-center justify-center rounded bg-foreground text-[9px] leading-none text-background">
              B
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
            label="Untitled"
            active
            trailing={
              <span className="rounded bg-muted px-1 py-0.5 text-[9.5px] leading-none text-foreground">
                Draft
              </span>
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

        {/* Main column — builder header, chat, and the Q&A card. */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex h-[34px] shrink-0 items-center justify-between border-b border-border px-3">
            <span className="flex items-center gap-1 text-[11.5px] leading-none text-foreground">
              Untitled
              <IconChevronDown className="size-[10px] text-muted-foreground" />
            </span>
            <span className="rounded border border-border bg-muted px-2 py-1 text-[10px] leading-none text-muted-foreground/70">
              Publish
            </span>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-3 md:px-5 md:py-4">
            <div className="flex justify-end">
              <p className="max-w-[75%] rounded-lg bg-muted px-2.5 py-1.5 text-[11.5px] leading-[1.5] text-foreground md:max-w-[320px]">
                Build a time tracking app to log hours, track work across
                clients and projects, and generate clear reports for billing
                and productivity insights. Include timers, manual entries, and
                weekly summaries.
              </p>
            </div>
            <p className="max-w-[95%] text-[11.5px] leading-[1.5] text-foreground">
              Got it! I&rsquo;ll build this for you. Before we start, I have a
              few quick questions to make sure this fits your workflow.
            </p>

            {/* Q&A card pinned to the bottom of the chat, as in the spec. */}
            <div className="mt-auto overflow-hidden rounded-lg border border-border bg-background">
              <div className="flex items-center gap-2 bg-muted px-2.5 py-2">
                <IconAreaChart className="size-[10px] shrink-0 text-foreground" />
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
                  <span className="flex size-[18px] shrink-0 items-center justify-center rounded-sm bg-muted text-[10px] leading-none text-muted-foreground">
                    {i + 1}
                  </span>
                  <p className="truncate text-[11.5px] leading-none text-foreground">
                    {option}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
