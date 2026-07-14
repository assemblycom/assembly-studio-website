// ─────────────────────────────────────────────────────────────────────────
// MOCK ICONS — tiny 16px stroke icons shared by the how-it-works product
// mocks (build-app, brand-portal, team-crm). Hand-drawn to match the site's
// minimal line style; all inherit currentColor.
// ─────────────────────────────────────────────────────────────────────────

type IconProps = { className?: string };

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.25,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconBook({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} {...STROKE}>
      <path d="M3 3.5A1.5 1.5 0 0 1 4.5 2H13v10.5H4.75A1.75 1.75 0 0 0 3 14.25V3.5Z" />
      <path d="M3 12.75A1.75 1.75 0 0 1 4.75 11H13" />
    </svg>
  );
}

export function IconUsers({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} {...STROKE}>
      <circle cx="6" cy="5.5" r="2.25" />
      <path d="M2.5 13c.5-2 1.9-3 3.5-3s3 1 3.5 3" />
      <path d="M10.5 4a2 2 0 0 1 0 3.5M11.5 10.2c1.1.3 1.8 1.2 2.1 2.8" />
    </svg>
  );
}

export function IconBell({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} {...STROKE}>
      <path d="M8 2.5a3.75 3.75 0 0 1 3.75 3.75c0 2.5.75 3.75 1.25 4.25H3c.5-.5 1.25-1.75 1.25-4.25A3.75 3.75 0 0 1 8 2.5Z" />
      <path d="M6.75 12.75a1.35 1.35 0 0 0 2.5 0" />
    </svg>
  );
}

export function IconGlobe({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} {...STROKE}>
      <circle cx="8" cy="8" r="5.5" />
      <path d="M2.5 8h11M8 2.5c-3 3.4-3 7.6 0 11M8 2.5c3 3.4 3 7.6 0 11" />
    </svg>
  );
}

export function IconHouse({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} {...STROKE}>
      <path d="M2.75 7.25 8 2.75l5.25 4.5" />
      <path d="M4 6.5v6.75h8V6.5" />
    </svg>
  );
}

export function IconChat({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} {...STROKE}>
      <path d="M13.5 8A5.5 5.5 0 1 1 8 2.5 5.4 5.4 0 0 1 13.5 8Z" />
      <path d="M3.6 11.8 3 13.5l1.9-.6" />
    </svg>
  );
}

export function IconApp({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} {...STROKE}>
      <circle cx="8" cy="8" r="5.5" />
      <circle cx="8" cy="8" r="2" />
    </svg>
  );
}

export function IconPlus({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} {...STROKE}>
      <path d="M8 3.5v9M3.5 8h9" />
    </svg>
  );
}

export function IconPalette({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} {...STROKE}>
      <path d="M8 2.5a5.5 5.5 0 1 0 0 11c.9 0 1.25-.55 1.25-1.15 0-.9-.75-1.1-.75-1.85 0-.6.5-1 1.25-1h1.5c1.4 0 2.25-1 2.25-2.25C13.5 4.6 11 2.5 8 2.5Z" />
      <circle cx="5.4" cy="6.2" r="0.4" />
      <circle cx="8.5" cy="4.9" r="0.4" />
      <circle cx="5.2" cy="9.3" r="0.4" />
    </svg>
  );
}

export function IconGrid({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} {...STROKE}>
      <rect x="2.75" y="2.75" width="4.5" height="4.5" rx="1" />
      <rect x="8.75" y="2.75" width="4.5" height="4.5" rx="1" />
      <rect x="2.75" y="8.75" width="4.5" height="4.5" rx="1" />
      <rect x="8.75" y="8.75" width="4.5" height="4.5" rx="1" />
    </svg>
  );
}

export function IconGear({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} {...STROKE}>
      <circle cx="8" cy="8" r="1.9" />
      <path d="M8 2.2v1.6M8 12.2v1.6M13.8 8h-1.6M3.8 8H2.2M12.1 3.9l-1.1 1.1M5 11l-1.1 1.1M12.1 12.1 11 11M5 5 3.9 3.9" />
    </svg>
  );
}

export function IconHelp({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} {...STROKE}>
      <circle cx="8" cy="8" r="5.5" />
      <path d="M6.5 6.3a1.55 1.55 0 0 1 3 .45c0 1-1.5 1.15-1.5 2.25" />
      <path d="M8 11.2v.05" />
    </svg>
  );
}

export function IconArrowUpRight({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} {...STROKE}>
      <path d="M5 11l6-6M6.5 5H11v4.5" />
    </svg>
  );
}

export function IconChevronDown({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} {...STROKE}>
      <path d="M4.5 6.5 8 10l3.5-3.5" />
    </svg>
  );
}

export function IconChevronLeft({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} {...STROKE}>
      <path d="M9.5 4 6 8l3.5 4" />
    </svg>
  );
}

export function IconChevronRight({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} {...STROKE}>
      <path d="M6.5 4 10 8l-3.5 4" />
    </svg>
  );
}

export function IconAreaChart({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} {...STROKE}>
      <path
        d="M2.5 13.5v-3l3.5-3 3 2 4.5-4v8h-11Z"
        fill="currentColor"
        stroke="none"
        opacity={0.8}
      />
    </svg>
  );
}

export function IconClock({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} {...STROKE}>
      <circle cx="8" cy="8" r="5.5" />
      <path d="M8 5v3.25L10 9.5" />
    </svg>
  );
}

export function IconFolder({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} {...STROKE}>
      <path d="M2.5 4.25c0-.55.45-1 1-1h3l1.25 1.5h4.75c.55 0 1 .45 1 1v6c0 .55-.45 1-1 1h-9c-.55 0-1-.45-1-1v-7.5Z" />
    </svg>
  );
}

export function IconSearch({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} {...STROKE}>
      <circle cx="7" cy="7" r="4.25" />
      <path d="m10.5 10.5 3 3" />
    </svg>
  );
}

export function IconDots({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} {...STROKE}>
      <path d="M4 8h.05M8 8h.05M12 8h.05" strokeWidth={1.8} />
    </svg>
  );
}

export function IconFilter({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} {...STROKE}>
      <path d="M3 5h10M5 8h6M6.75 11h2.5" />
    </svg>
  );
}

export function IconList({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} {...STROKE}>
      <path d="M6 4.5h7M6 8h7M6 11.5h7M3 4.5h.05M3 8h.05M3 11.5h.05" />
    </svg>
  );
}

export function IconExport({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} {...STROKE}>
      <path d="M8 2.75v7M5.25 5.5 8 2.75l2.75 2.75" />
      <path d="M3 10.5v2.25c0 .28.22.5.5.5h9c.28 0 .5-.22.5-.5V10.5" />
    </svg>
  );
}

export function IconBolt({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} {...STROKE}>
      <path d="M8.75 2.5 4 9h3.25L7.25 13.5 12 7H8.75l0-4.5Z" />
    </svg>
  );
}

export function IconDashboard({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} {...STROKE}>
      <circle cx="8" cy="8" r="5.5" />
      <path d="M8 8l2.5-2.5" />
      <path d="M4.5 10.5h7" />
    </svg>
  );
}

export function IconFile({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} {...STROKE}>
      <path d="M4 2.75h5L12 5.75v7.5H4V2.75Z" />
      <path d="M9 2.75v3h3" />
    </svg>
  );
}

export function IconPen({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} {...STROKE}>
      <path d="m10.5 3 2.5 2.5-7 7-3 .5.5-3 7-7Z" />
    </svg>
  );
}

export function IconForm({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} {...STROKE}>
      <rect x="3" y="2.75" width="10" height="10.5" rx="1" />
      <path d="M5.25 5.75h5.5M5.25 8h5.5M5.25 10.25h3" />
    </svg>
  );
}

export function IconCard({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} {...STROKE}>
      <rect x="2.5" y="3.75" width="11" height="8.5" rx="1" />
      <path d="M2.5 6.5h11" />
    </svg>
  );
}

export function IconChecks({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} {...STROKE}>
      <path d="m3 5 1.25 1.25L6.5 4M3 10.75 4.25 12 6.5 9.75M9 5.5h4M9 11.25h4" />
    </svg>
  );
}

export function IconSync({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} {...STROKE}>
      <path d="M13 8a5 5 0 0 1-8.7 3.4M3 8a5 5 0 0 1 8.7-3.4" />
      <path d="M11 3.5h1.5V2M5 12.5H3.5V14" />
    </svg>
  );
}

export function IconSliders({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} {...STROKE}>
      <path d="M3 5h10M3 11h10" />
      <circle cx="6" cy="5" r="1.4" fill="var(--background)" />
      <circle cx="10" cy="11" r="1.4" fill="var(--background)" />
    </svg>
  );
}

export function IconCheckCircle({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className}>
      <circle cx="8" cy="8" r="5.75" fill="currentColor" />
      <path
        d="m5.5 8 1.75 1.75L10.75 6.25"
        fill="none"
        stroke="var(--background)"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconMic({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} {...STROKE}>
      <rect x="6" y="2.5" width="4" height="7" rx="2" />
      <path d="M3.75 8a4.25 4.25 0 0 0 8.5 0M8 12.25v1.5" />
    </svg>
  );
}

export function IconCheck({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} {...STROKE}>
      <path d="m3.5 8.5 3 3 6-7" />
    </svg>
  );
}

export function IconSwitch({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} {...STROKE}>
      <path d="M6.5 3H3.75a.75.75 0 0 0-.75.75v8.5c0 .41.34.75.75.75H6.5" />
      <path d="M7 8h6.5M11 5.5 13.5 8 11 10.5" />
    </svg>
  );
}

export function IconX({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} {...STROKE}>
      <path d="m4.5 4.5 7 7M11.5 4.5l-7 7" />
    </svg>
  );
}
