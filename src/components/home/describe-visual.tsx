// ─────────────────────────────────────────────────────────────────────────
// DESCRIBE VISUAL — the builder's Add App start screen from the Vibe Apps
// spec (node 3242:57710): prompt box with category chips and the firm
// template list underneath. Decorative only.
// ─────────────────────────────────────────────────────────────────────────

import {
  NavItem,
  SectionLabel,
} from "@/components/home/build-app-visual";
import { MockFrame } from "@/components/home/mock-frame";
import {
  IconApp,
  IconArrowUpRight,
  IconBell,
  IconBook,
  IconChat,
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconFile,
  IconForm,
  IconGear,
  IconGlobe,
  IconGrid,
  IconHelp,
  IconList,
  IconMic,
  IconPalette,
  IconPlus,
  IconUsers,
} from "@/components/home/mock-icons";

const CHIPS = ["Tasks & Workflow", "CRM & Sales", "Content & Sites", "Finance"];

const TEMPLATES = [
  {
    icon: <IconApp />,
    title: "New client intake",
    description: "Company details, contacts, services, budget",
  },
  {
    icon: <IconList />,
    title: "Onboarding wizard",
    description: "Multi-step flow with saved progress",
  },
  {
    icon: <IconFile />,
    title: "Document collection",
    description: "Requested docs with upload checklist",
  },
  {
    icon: <IconForm />,
    title: "PDF to digital intake",
    description: "Turn a PDF into a guided web form",
  },
];

export function DescribeVisual() {
  return (
    <MockFrame>
      <div className="flex min-h-0 flex-1">
        {/* Workspace sidebar — Add App is the active row here. */}
        <div className="hidden w-[168px] shrink-0 flex-col border-r border-border bg-muted px-1.5 py-2 lg:flex md:w-[188px]">
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
          <div className="flex h-[34px] shrink-0 items-center px-3">
            <span className="text-[11.5px] leading-none text-foreground">
              Add App
            </span>
          </div>
          <div className="flex shrink-0 gap-4 border-b border-border px-3">
            {["Build", "Browse"].map((tab, i) => (
              <span
                key={tab}
                className={`-mb-px border-b pb-1.5 text-[11px] leading-none ${
                  i === 0
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground"
                }`}
              >
                {tab}
              </span>
            ))}
          </div>

          <div className="mx-auto flex w-full max-w-[420px] min-h-0 flex-1 flex-col justify-start gap-3 overflow-hidden p-4 pt-9 lg:justify-center lg:pt-4">
            <p className="text-center text-[13px] leading-none text-foreground">
              Margot, what will you build?
            </p>

            {/* Prompt box */}
            <div className="flex h-[64px] flex-col justify-between rounded-lg border border-border p-2.5">
              <p className="text-[11px] leading-none text-muted-foreground">
                Build an onboarding wizard for my clients
              </p>
              <span className="flex items-center justify-between">
                <IconPlus className="size-[11px] text-muted-foreground" />
                <IconMic className="size-[11px] text-muted-foreground" />
              </span>
            </div>

            {/* Category chips */}
            <div className="flex items-center gap-1.5 overflow-hidden">
              {CHIPS.map((chip, i) => (
                <span
                  key={chip}
                  className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded border border-border px-1.5 py-1 text-[10px] leading-none text-foreground"
                >
                  {i === 0 && <IconCheck className="size-[9px]" />}
                  {chip}
                </span>
              ))}
              <IconChevronRight className="size-[10px] shrink-0 text-muted-foreground" />
            </div>

            {/* Template list */}
            <div className="overflow-hidden rounded-lg border border-border">
              {TEMPLATES.map((template) => (
                <div
                  key={template.title}
                  className="flex items-center gap-2 border-b border-border px-2.5 py-[7px] last:border-b-0"
                >
                  <span className="[&>svg]:size-[11px] flex size-[20px] shrink-0 items-center justify-center rounded bg-muted text-foreground">
                    {template.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[10.5px] leading-[1.35] text-foreground">
                      {template.title}
                    </span>
                    <span className="block truncate text-[9.5px] leading-[1.35] text-muted-foreground">
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
