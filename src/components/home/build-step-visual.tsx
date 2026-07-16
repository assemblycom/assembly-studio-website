// ─────────────────────────────────────────────────────────────────────────
// BUILD VISUAL — the deployed Time Tracker inside the team workspace, from
// the Vibe Apps spec (node 5718:69043). The open app menu ("Switch to
// Builder") makes the deployed-but-still-editable story visible. Decorative.
// ─────────────────────────────────────────────────────────────────────────

import {
  NavItem,
  SectionLabel,
} from "@/components/home/build-app-visual";
import {
  IconApp,
  IconBell,
  IconBolt,
  IconBook,
  IconChecks,
  IconChevronDown,
  IconClock,
  IconDashboard,
  IconDots,
  IconFile,
  IconForm,
  IconGear,
  IconGrid,
  IconPalette,
  IconPen,
  IconPlus,
  IconSwitch,
  IconUsers,
} from "@/components/home/mock-icons";
import { MockFrame } from "@/components/home/mock-frame";

type Entry = {
  description: string;
  client: string;
  date: string;
  duration: string;
  billable: boolean;
  status: "Approved" | "Pending" | "Logged";
};

const ENTRIES: Entry[] = [
  {
    description: "Q1 financial review & reporting",
    client: "Meridian Corp",
    date: "Apr 10",
    duration: "3h 45m",
    billable: true,
    status: "Approved",
  },
  {
    description: "Tax preparation meeting",
    client: "Oakwood LLC",
    date: "Apr 10",
    duration: "1h 30m",
    billable: true,
    status: "Pending",
  },
  {
    description: "Reconcile accounts receivable",
    client: "Meridian Corp",
    date: "Apr 9",
    duration: "2h 15m",
    billable: true,
    status: "Approved",
  },
  {
    description: "Internal team standup",
    client: "—",
    date: "Apr 9",
    duration: "0h 30m",
    billable: false,
    status: "Logged",
  },
  {
    description: "Payroll processing & review",
    client: "Bloom Studios",
    date: "Apr 9",
    duration: "4h 00m",
    billable: true,
    status: "Approved",
  },
  {
    description: "Draft engagement letter",
    client: "NovaTech Inc",
    date: "Apr 8",
    duration: "1h 45m",
    billable: true,
    status: "Pending",
  },
  {
    description: "Review vendor invoices",
    client: "Bloom Studios",
    date: "Apr 8",
    duration: "2h 00m",
    billable: true,
    status: "Approved",
  },
];

const STATUS_STYLE: Record<Entry["status"], string> = {
  Approved:
    "bg-[var(--mock-positive-bg)] text-[color:var(--mock-positive-fg)]",
  Pending: "bg-[var(--mock-warning-bg)] text-[color:var(--mock-warning-fg)]",
  Logged: "bg-border/60 text-muted-foreground",
};

const MENU_ITEMS = [
  { icon: <IconSwitch />, label: "Switch to Builder", active: true },
  { icon: <IconGear />, label: "Manage app", active: false },
  { icon: <IconPen />, label: "Rename app", active: false },
];

export function BuildStepVisual() {
  return (
    <MockFrame>
      <div className="flex min-h-0 flex-1">
        {/* Team workspace sidebar — the deployed app sits among the others. */}
        <div className="hidden w-[168px] shrink-0 flex-col overflow-hidden border-r border-border bg-muted px-1.5 py-2 lg:flex md:w-[188px]">
          <div className="flex items-center gap-1.5 px-1.5 pb-2.5 pt-0.5">
            <span className="flex size-[16px] items-center justify-center rounded bg-foreground text-[9px] leading-none text-background">
              B
            </span>
            <span className="text-[11.5px] leading-none text-foreground">
              BrandMages
            </span>
            <IconChevronDown className="size-[10px] text-muted-foreground" />
          </div>

          <NavItem icon={<IconDashboard />} label="Dashboard" />
          <NavItem icon={<IconUsers />} label="CRM" />
          <NavItem icon={<IconBell />} label="Notifications" />
          <NavItem icon={<IconBolt />} label="Automation" />

          <SectionLabel>Apps</SectionLabel>
          <NavItem icon={<IconApp />} label="App 1" />
          <NavItem icon={<IconForm />} label="App 2" />
          <NavItem icon={<IconFile />} label="App 3" />
          <NavItem icon={<IconChecks />} label="App 4" />
          <NavItem icon={<IconClock />} label="Time Tracker" active />
          <NavItem icon={<IconPlus />} label="Add App" muted />

          <SectionLabel>Workspace</SectionLabel>
          <NavItem icon={<IconBook />} label="App Library" />
          <NavItem icon={<IconGrid />} label="Marketplace" />
          <NavItem icon={<IconPalette />} label="Branding" />
          <NavItem icon={<IconGear />} label="Settings" />
        </div>

        {/* Main column — the live app with its menu open. */}
        <div className="relative flex min-w-0 flex-1 flex-col">
          <div className="flex h-[34px] shrink-0 items-center justify-between px-3">
            <span className="flex items-center gap-1 text-[11.5px] leading-none text-foreground">
              Time Tracker
              <IconChevronDown className="size-[10px] text-muted-foreground" />
            </span>
            <span className="flex items-center gap-1.5">
              <span className="flex size-[20px] items-center justify-center rounded border border-border">
                <IconDots className="size-[11px] text-foreground" />
              </span>
              <span className="flex items-center gap-1 rounded bg-foreground px-2 py-1 text-[10px] leading-none text-background">
                <IconPlus className="size-[9px]" />
                Log time
              </span>
            </span>
          </div>

          {/* App menu — floats over the tabs, "Switch to Builder" hovered. */}
          <div className="absolute left-3 top-[30px] z-10 w-[128px] overflow-hidden rounded-md border border-border bg-background shadow-sm">
            {MENU_ITEMS.map((item) => (
              <span
                key={item.label}
                className={`flex items-center gap-1.5 px-2 py-[6px] text-[10px] leading-none text-foreground ${
                  item.active ? "bg-muted" : ""
                }`}
              >
                <span className="[&>svg]:size-[10px] flex shrink-0 items-center">
                  {item.icon}
                </span>
                {item.label}
              </span>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex shrink-0 gap-4 border-b border-border px-3">
            {["My time", "Team time", "All entries"].map((tab, i) => (
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

          {/* Toolbar */}
          <div className="flex shrink-0 items-center justify-between px-3 py-2">
            <span className="rounded bg-muted px-1.5 py-1 text-[10px] leading-none text-foreground">
              This week: Apr 7 – Apr 11
            </span>
            <span className="text-[10px] leading-none text-muted-foreground">
              Total: 32h 15m
            </span>
          </div>

          {/* Entries table */}
          <div className="mx-3 mb-3 min-h-0 flex-1 overflow-hidden rounded-md border border-border">
            <div className="flex items-center gap-2 border-b border-border bg-muted px-2.5 py-1.5 text-[10px] leading-none text-muted-foreground">
              <span className="min-w-0 flex-1">Description</span>
              <span className="hidden w-[76px] lg:block">Client</span>
              <span className="w-[38px]">Date</span>
              <span className="w-[44px]">Duration</span>
              <span className="hidden w-[58px] md:block">Billable</span>
              <span className="w-[58px]">Status</span>
            </div>
            {ENTRIES.map((entry) => (
              <div
                key={entry.description}
                className="flex items-center gap-2 border-b border-border px-2.5 py-[6px] text-[10.5px] leading-none last:border-b-0"
              >
                <span className="min-w-0 flex-1 truncate text-foreground">
                  {entry.description}
                </span>
                <span className="hidden w-[76px] truncate text-muted-foreground lg:block">
                  {entry.client}
                </span>
                <span className="w-[38px] text-muted-foreground">
                  {entry.date}
                </span>
                <span className="w-[44px] text-muted-foreground">
                  {entry.duration}
                </span>
                <span className="hidden w-[58px] md:block">
                  {entry.billable ? (
                    <span className="inline-block rounded-full bg-[var(--mock-positive-bg)] px-1.5 py-[3px] text-[9.5px] leading-none text-[color:var(--mock-positive-fg)]">
                      Billable
                    </span>
                  ) : (
                    <span className="text-[9.5px] text-muted-foreground">
                      Non-billable
                    </span>
                  )}
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
