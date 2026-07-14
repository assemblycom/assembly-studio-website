// ─────────────────────────────────────────────────────────────────────────
// BRAND-PORTAL VISUAL — the client's view of the portal, from Ana's
// exploration file (node 872:42010): a sidebar washed in the client firm's
// brand color (BrandMages blue) beside the generated Time Tracker app with
// its approvals table. Decorative only.
// ─────────────────────────────────────────────────────────────────────────

import {
  IconChat,
  IconChevronDown,
  IconClock,
  IconDots,
  IconFilter,
  IconFolder,
  IconGear,
  IconHouse,
  IconPlus,
} from "@/components/home/mock-icons";

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

function BrandNavItem({
  icon,
  label,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex h-[26px] items-center gap-2 rounded px-1.5 text-foreground ${
        active ? "bg-border/70" : ""
      }`}
    >
      <span className="[&>svg]:size-[12px] flex shrink-0 items-center justify-center">
        {icon}
      </span>
      <span className="min-w-0 flex-1 truncate text-[11.5px] leading-none">
        {label}
      </span>
    </div>
  );
}

export function BrandPortalVisual() {
  return (
    <div
      aria-hidden
      className="pointer-events-none flex select-none flex-col overflow-hidden rounded-lg bg-background ring-1 ring-border sm:aspect-[16/9.6]"
    >
      <div className="flex min-h-0 flex-1">
        {/* Client-side portal sidebar — hidden on small screens. */}
        <div className="hidden w-[148px] shrink-0 flex-col border-r border-border bg-muted px-1.5 py-2 sm:flex md:w-[168px]">
          <div className="flex items-center gap-1.5 px-1.5 pb-3 pt-0.5 text-foreground">
            <span className="flex size-[16px] items-center justify-center rounded bg-foreground text-[9px] leading-none text-background">
              B
            </span>
            <span className="text-[11.5px] leading-none">BrandMages</span>
            <IconChevronDown className="size-[10px] text-muted-foreground" />
          </div>

          <BrandNavItem icon={<IconHouse />} label="Home" />
          <BrandNavItem icon={<IconChat />} label="Messages" />
          <BrandNavItem icon={<IconClock />} label="Time tracker" active />
          <BrandNavItem icon={<IconFolder />} label="Folder" />

          <div className="mt-auto pt-2">
            <span className="flex size-[22px] items-center justify-center rounded-full border border-border text-foreground">
              <IconGear className="size-[11px]" />
            </span>
          </div>
        </div>

        {/* Main column — the generated Time Tracker app. */}
        <div className="flex min-w-0 flex-1 flex-col">
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
                Log Time
              </span>
            </span>
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
            <span className="flex items-center gap-1.5">
              <span className="flex items-center gap-1 rounded border border-border px-1.5 py-1 text-[10px] leading-none text-foreground">
                <IconFilter className="size-[10px]" />
                Filters
              </span>
              <span className="rounded bg-muted px-1.5 py-1 text-[10px] leading-none text-foreground">
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
              <span className="min-w-0 flex-1">Description</span>
              <span className="hidden w-[76px] sm:block">Client</span>
              <span className="hidden w-[80px] md:block">Project</span>
              <span className="w-[38px]">Date</span>
              <span className="w-[44px]">Duration</span>
              <span className="w-[58px]">Status</span>
            </div>
            {ENTRIES.map((entry) => (
              <div
                key={entry.description}
                className="flex items-center gap-2 border-b border-border px-2.5 py-[7px] text-[10.5px] leading-none last:border-b-0"
              >
                <span className="min-w-0 flex-1 truncate text-foreground">
                  {entry.description}
                </span>
                <span className="hidden w-[76px] truncate text-muted-foreground sm:block">
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
    </div>
  );
}
