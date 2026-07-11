import { Section } from "@/components/ui/section";

// ─────────────────────────────────────────────────────────────────────────
// WHY ASSEMBLY — a bento of differentiators. Two blocks on top, one wide block
// below; each block pairs a light-mode mock-UI visual with its heading + copy.
// ─────────────────────────────────────────────────────────────────────────

// Minimal 1.5px line glyphs, sized by the caller. currentColor so they inherit.
type GlyphProps = { className?: string };
const IconFolder = ({ className }: GlyphProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </svg>
);
const IconLock = ({ className }: GlyphProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);
const IconShield = ({ className }: GlyphProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <path d="M12 3 5 6v6c0 4 3 6.5 7 8 4-1.5 7-4 7-8V6z" />
    <path d="m9.5 12 1.8 1.8 3.2-3.6" />
  </svg>
);
const IconCheck = ({ className }: GlyphProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <path d="m5 12.5 4.5 4.5L19 6.5" />
  </svg>
);
const IconMessage = ({ className }: GlyphProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <path d="M4 5h16v11H9l-4 3v-3H4z" />
  </svg>
);
const IconCard = ({ className }: GlyphProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <rect x="3" y="6" width="18" height="12" rx="2" />
    <path d="M3 10h18" />
  </svg>
);
const IconPen = ({ className }: GlyphProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <path d="M4 20h16" />
    <path d="M15 5.5 18.5 9 8 19.5 4.5 20 5 16.5z" />
  </svg>
);
const IconDoc = ({ className }: GlyphProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <path d="M7 3h7l4 4v14H7z" />
    <path d="M14 3v4h4" />
  </svg>
);
const IconUsers = ({ className }: GlyphProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <circle cx="9" cy="9" r="3" />
    <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
    <path d="M16 6.5a3 3 0 0 1 0 5.8M20.5 19a5.5 5.5 0 0 0-4-5.3" />
  </svg>
);

// Visual 1 — a branded client portal window: firm identity up top, a sidebar of
// folders (one locked, to signal per-client permissions), and content rows.
function PortalVisual() {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-border bg-background shadow-sm">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
        <span className="flex size-5 items-center justify-center rounded-md bg-foreground text-[10px] text-background">
          N
        </span>
        <span className="text-xs font-medium">Northgate Advisory</span>
        <span className="ml-auto size-5 rounded-full bg-muted" />
      </div>
      <div className="flex">
        <div className="w-[42%] space-y-1 border-r border-border p-2.5">
          {[
            { label: "Onboarding", locked: false, active: true },
            { label: "Documents", locked: false, active: false },
            { label: "Billing", locked: true, active: false },
            { label: "Reports", locked: false, active: false },
          ].map((row) => (
            <div
              key={row.label}
              className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] ${
                row.active
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              <IconFolder className="size-3.5 shrink-0" />
              <span className="truncate">{row.label}</span>
              {row.locked && <IconLock className="ml-auto size-3 shrink-0" />}
            </div>
          ))}
        </div>
        <div className="flex-1 space-y-2 p-3">
          <div className="h-2 w-2/3 rounded-full bg-muted" />
          <div className="h-2 w-full rounded-full bg-muted" />
          <div className="h-2 w-5/6 rounded-full bg-muted" />
          <div className="mt-3 h-7 w-24 rounded-md bg-foreground/90" />
        </div>
      </div>
    </div>
  );
}

// Visual 2 — a shield mark over the compliance controls, shown as check pills.
function ComplianceVisual() {
  const badges = ["SOC 2 Type II", "HIPAA-ready", "SSO", "End-to-end encrypted"];
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <span className="flex size-12 items-center justify-center rounded-2xl border border-border bg-background text-foreground shadow-sm">
        <IconShield className="size-6" />
      </span>
      <div className="flex flex-wrap justify-center gap-2">
        {badges.map((b) => (
          <span
            key={b}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-foreground shadow-sm"
          >
            <IconCheck className="size-3.5 text-muted-foreground" />
            {b}
          </span>
        ))}
      </div>
    </div>
  );
}

// Visual 3 — the built-in platform modules as a connected row, ending in the
// app you generate so it reads as "everything plugs into one experience".
function PlatformVisual() {
  const modules = [
    { label: "Messaging", Icon: IconMessage },
    { label: "Billing", Icon: IconCard },
    { label: "E-signatures", Icon: IconPen },
    { label: "Files", Icon: IconDoc },
    { label: "CRM", Icon: IconUsers },
  ];
  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-2.5 sm:gap-3">
      {modules.map(({ label, Icon }) => (
        <div
          key={label}
          className="flex min-w-[92px] flex-1 flex-col items-center gap-2 rounded-xl border border-border bg-background px-3 py-4 shadow-sm"
        >
          <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-foreground">
            <Icon className="size-4.5" />
          </span>
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
      ))}
      <div className="flex min-w-[92px] flex-1 flex-col items-center gap-2 rounded-xl border border-foreground/15 bg-foreground px-3 py-4 text-background shadow-sm">
        <span className="flex size-9 items-center justify-center rounded-lg bg-background/15">
          <IconCheck className="size-4.5" />
        </span>
        <span className="text-xs">Your app</span>
      </div>
    </div>
  );
}

interface Block {
  title: string;
  body: string;
  visual: React.ReactNode;
  wide?: boolean;
}

const BLOCKS: Block[] = [
  {
    title: "Purpose-built for client work",
    body: "Generic builders make apps. Assembly makes secure, branded client portals your clients actually log into — with permissions, folders, and your firm's identity.",
    visual: <PortalVisual />,
  },
  {
    title: "Secure and compliant by default",
    body: "SOC 2 Type II, HIPAA-ready, SSO, and end-to-end encryption — the controls regulated firms require, on by default for every plan.",
    visual: <ComplianceVisual />,
  },
  {
    title: "A platform, not just a builder",
    body: "Messaging, billing, e-signatures, files, and a CRM are built in — so every app you generate plugs into a complete client experience.",
    visual: <PlatformVisual />,
    wide: true,
  },
];

export function WhyAssembly() {
  return (
    <Section>
      <h2 className="type-h2 max-w-3xl">
        <span className="text-muted-foreground">
          A hundred tools can generate a web app.
        </span>{" "}
        Here&apos;s what sets Assembly apart.
      </h2>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {BLOCKS.map((block) => (
          <div
            key={block.title}
            className={`flex flex-col overflow-hidden rounded-2xl border border-border ${
              block.wide ? "md:col-span-2" : ""
            }`}
          >
            {/* Visual stage — a soft muted panel that frames the mock UI */}
            <div className="flex min-h-[220px] flex-1 items-center justify-center bg-muted/50 p-8">
              {block.visual}
            </div>
            <div className="border-t border-border p-6">
              <h3 className="type-h4">{block.title}</h3>
              <p className="mt-2 max-w-xl leading-relaxed text-muted-foreground">
                {block.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
