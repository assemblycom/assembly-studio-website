// Animated visuals for the "A platform, not just a builder" quick-look modals.
// Each mock reuses the hero rail's mock skin — the --v69-* tokens + the neutral
// ink ladder + the shared keyframes — so a modal illustration reads as the same
// system as the template row under the hero composer. The skin (light vs.
// .v72-mock-dark) is supplied by the modal wrapper, not here.
//
// Unlike the rail cards (which gate animation on hover / in-view), these play
// once on mount: the modal remounts its body each time it opens or steps, so a
// plain `[animation:…_both]` fires exactly when the reader sees it.

const MONO = '"ABC Diatype Mono", ui-monospace, SFMono-Regular, Menlo, monospace';

// Neutral fill ladder, mixed off the skin's ink so both themes track (matches
// hero-v71's ladder).
const ink = (pct: number) => `color-mix(in srgb, var(--v69-ink) ${pct}%, transparent)`;
const INK_FAINT = ink(16);
const INK_MID = ink(38);
const INK_STRONG = ink(62);
const INK_SOLID = ink(78);

// A staggered row-rise, played on mount. `ANIM` is the animation class; `delay`
// stamps the per-row stagger onto an inline style.
const ANIM = "[will-change:transform,opacity] [animation:cardRowIn_0.45s_ease-out_both]";
const delay = (i: number) => ({ animationDelay: `${i * 0.08}s` }) as React.CSSProperties;

// ── Client experience with custom domain ──────────────────────────────────
// A branded client portal in a browser window: window chrome carrying the
// custom domain, a sidebar (brand + nav), and a welcome panel in the body.
function StackCustomDomain() {
  const nav = ["Home", "Messages", "Files", "Payments"];
  return (
    <div className="flex h-full flex-col bg-[var(--v69-card)] text-[10px] leading-none">
      {/* Browser chrome — the client-facing custom domain. */}
      <div className="flex items-center gap-2 border-b border-[color:var(--v69-chip-border)] px-3 py-2.5">
        <span className="flex gap-1">
          <span className="size-1.5 rounded-full" style={{ background: INK_FAINT }} />
          <span className="size-1.5 rounded-full" style={{ background: INK_FAINT }} />
          <span className="size-1.5 rounded-full" style={{ background: INK_FAINT }} />
        </span>
        <span
          className="flex-1 truncate rounded-md bg-[var(--v69-well)] px-2.5 py-1 text-center text-[9px] text-neutral-400"
          style={{ fontFamily: MONO }}
        >
          clients.acme.com
        </span>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Sidebar — brand + nav, the active row filled. */}
        <div className="flex w-[38%] max-w-[132px] shrink-0 flex-col gap-1 border-r border-[color:var(--v69-chip-border)] p-2.5">
          <div className="flex items-center gap-1.5 pb-1.5">
            <span className="size-4 shrink-0 rounded-[5px]" style={{ background: INK_SOLID }} />
            <span className="truncate text-neutral-800">Acme Co.</span>
          </div>
          {nav.map((n, i) => (
            <div
              key={n}
              className={`${ANIM} truncate rounded-md px-2 py-1.5 text-[9px] ${
                i === 0 ? "text-neutral-800" : "text-neutral-400"
              }`}
              style={{ ...delay(i), backgroundColor: i === 0 ? "var(--v69-well)" : "transparent" }}
            >
              {n}
            </div>
          ))}
        </div>

        {/* Body — a branded welcome panel. */}
        <div className="flex min-w-0 flex-1 flex-col gap-2.5 p-3">
          <div className={`${ANIM} flex flex-col gap-1.5`} style={delay(1)}>
            <span className="text-[11px] text-neutral-800">Welcome back, Jane</span>
            <span className="text-[9px] text-neutral-400">Your project at a glance</span>
          </div>
          <div
            className={`${ANIM} flex flex-col gap-2 rounded-lg bg-[var(--v69-well)] p-2.5 shadow-[inset_0_0_0_1px_var(--v69-chip-border)]`}
            style={delay(2)}
          >
            <div className="h-1.5 w-3/4 rounded-full" style={{ background: INK_MID }} />
            <div className="h-1.5 w-1/2 rounded-full" style={{ background: INK_FAINT }} />
            <div className="mt-1 h-6 w-24 rounded-md" style={{ background: INK_SOLID }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Integrated CRM ────────────────────────────────────────────────────────
// A contacts table: a header count over rows of contact records, each with an
// avatar, name/company, and a status chip. Rows rise in with a stagger.
function StackCrm() {
  const rows: { initials: string; name: string; company: string; tag: string; tone: string }[] = [
    { initials: "JR", name: "Jane Rivera", company: "Northwind Co.", tag: "Client", tone: INK_STRONG },
    { initials: "AL", name: "Alex Lee", company: "Oakwood LLC", tag: "Lead", tone: INK_MID },
    { initials: "SC", name: "Sarah Chen", company: "NovaTech Inc", tag: "Client", tone: INK_STRONG },
  ];
  return (
    <div className="flex h-full flex-col gap-2.5 bg-[var(--v69-card)] p-3.5 text-[10px] leading-none">
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] text-neutral-800">Contacts</span>
        <span className="text-[9px] text-neutral-400">128 records</span>
      </div>
      <div className="overflow-hidden rounded-lg ring-1 ring-[var(--v69-chip-border)]">
        {rows.map((r, i) => (
          <div
            key={r.name}
            className={`${ANIM} flex items-center gap-2 px-2.5 py-2 ${
              i > 0 ? "border-t border-[color:var(--v69-chip-border)]" : ""
            }`}
            style={delay(i)}
          >
            <span
              className="flex size-5 shrink-0 items-center justify-center rounded-full text-[8px] text-[var(--color-white)]"
              style={{ background: r.tone }}
            >
              {r.initials}
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-neutral-800">{r.name}</span>
              <span className="truncate text-[8.5px] text-neutral-400">{r.company}</span>
            </span>
            <span className="shrink-0 rounded-full bg-[var(--v69-well)] px-2 py-0.5 text-[8px] text-neutral-500">
              {r.tag}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Check({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

// ── Platform-native authentication ────────────────────────────────────────
function StackAuth() {
  return (
    <div className="flex h-full flex-col justify-center gap-2 bg-[var(--v69-card)] p-4 text-[10px] leading-none">
      <span className={`${ANIM} text-[11px] text-neutral-800`} style={delay(0)}>Sign in to BrandMages</span>
      <div
        className={`${ANIM} flex h-8 items-center rounded-md bg-[var(--v69-well)] px-2.5 text-[10px] text-neutral-500 shadow-[inset_0_0_0_1px_var(--v69-chip-border)]`}
        style={delay(1)}
      >
        sarah@novatech.com
      </div>
      <div
        className={`${ANIM} flex h-8 items-center justify-center rounded-md text-[10px] text-[var(--color-white)]`}
        style={{ ...delay(2), background: INK_SOLID }}
      >
        Email me a magic link
      </div>
      <div className="flex items-center gap-2 py-0.5 text-[8.5px] text-neutral-400">
        <span className="h-px flex-1 bg-[var(--v69-well-2)]" />
        or
        <span className="h-px flex-1 bg-[var(--v69-well-2)]" />
      </div>
      <div
        className={`${ANIM} flex h-8 items-center justify-center gap-1.5 rounded-md bg-[var(--v69-well)] text-[10px] text-neutral-700 shadow-[inset_0_0_0_1px_var(--v69-chip-border)]`}
        style={delay(3)}
      >
        Continue with Google
      </div>
    </div>
  );
}

// ── Roles and permissions ─────────────────────────────────────────────────
function StackRoles() {
  const rows = [
    { initials: "TM", name: "Your team", role: "Admin", tone: INK_STRONG },
    { initials: "SC", name: "Sarah Chen", role: "Client", tone: INK_MID },
    { initials: "ML", name: "Marcus Lee", role: "Client", tone: INK_MID },
  ];
  return (
    <div className="flex h-full flex-col gap-2.5 bg-[var(--v69-card)] p-3.5 text-[10px] leading-none">
      <span className="text-[11px] text-neutral-800">Roles &amp; access</span>
      <div className="overflow-hidden rounded-lg ring-1 ring-[var(--v69-chip-border)]">
        {rows.map((r, i) => (
          <div
            key={r.name}
            className={`${ANIM} flex items-center gap-2 px-2.5 py-2 ${i > 0 ? "border-t border-[color:var(--v69-chip-border)]" : ""}`}
            style={delay(i)}
          >
            <span
              className="flex size-5 shrink-0 items-center justify-center rounded-full text-[8px] text-[var(--color-white)]"
              style={{ background: r.tone }}
            >
              {r.initials}
            </span>
            <span className="min-w-0 flex-1 truncate text-neutral-700">{r.name}</span>
            <span className="shrink-0 rounded-full bg-[var(--v69-well)] px-2 py-0.5 text-[8px] text-neutral-500">{r.role}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Notification center ───────────────────────────────────────────────────
const NOTIFS = [
  { dot: INK_STRONG, text: "New payment · $2,400", time: "2m" },
  { dot: INK_MID, text: "Form submitted · NovaTech", time: "1h" },
  { dot: INK_FAINT, text: "Sarah Chen signed in", time: "3h" },
];
function StackNotifications() {
  return (
    <div className="flex h-full flex-col gap-2.5 bg-[var(--v69-card)] p-3.5 text-[10px] leading-none">
      <span className="text-[11px] text-neutral-800">Notifications</span>
      <div className="flex flex-col gap-1.5">
        {NOTIFS.map((n, i) => (
          <div
            key={n.text}
            className={`${ANIM} flex items-center gap-2 rounded-md bg-[var(--v69-well)] px-2.5 py-2 shadow-[inset_0_0_0_1px_var(--v69-chip-border)]`}
            style={delay(i)}
          >
            <span className="size-1.5 shrink-0 rounded-full" style={{ background: n.dot }} />
            <span className="min-w-0 flex-1 truncate text-neutral-700">{n.text}</span>
            <span className="shrink-0 text-[8.5px] text-neutral-400">{n.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Workflow builder ──────────────────────────────────────────────────────
const FLOW = [
  { tag: "When", label: "Form submitted", tone: INK_STRONG },
  { tag: "Then", label: "Send welcome email", tone: INK_MID },
  { tag: "Then", label: "Create onboarding task", tone: INK_MID },
];
function StackWorkflow() {
  return (
    <div className="flex h-full flex-col justify-center bg-[var(--v69-card)] p-3.5 text-[10px] leading-none">
      {FLOW.map((f, i) => (
        <div key={f.label}>
          <div
            className={`${ANIM} flex items-center gap-2 rounded-md bg-[var(--v69-well)] px-2.5 py-2 shadow-[inset_0_0_0_1px_var(--v69-chip-border)]`}
            style={delay(i)}
          >
            <span className="shrink-0 rounded px-1.5 py-0.5 text-[8px] text-[var(--color-white)]" style={{ background: f.tone }}>
              {f.tag}
            </span>
            <span className="truncate text-neutral-700">{f.label}</span>
          </div>
          {i < FLOW.length - 1 && <div className="ml-4 h-3 w-px bg-[var(--v69-well-2)]" />}
        </div>
      ))}
    </div>
  );
}

// ── Ready-made apps ───────────────────────────────────────────────────────
const APPS = ["Messaging", "Payments", "Contracts", "Files", "Tasks", "More"];
function StackApps() {
  return (
    <div className="flex h-full flex-col gap-2.5 bg-[var(--v69-card)] p-3.5 text-[10px] leading-none">
      <span className="text-[11px] text-neutral-800">Install apps</span>
      <div className="grid flex-1 grid-cols-3 grid-rows-2 gap-1.5">
        {APPS.map((a, i) => (
          <div
            key={a}
            className={`${ANIM} flex flex-col items-center justify-center gap-1.5 rounded-lg bg-[var(--v69-well)] shadow-[inset_0_0_0_1px_var(--v69-chip-border)]`}
            style={delay(i)}
          >
            <span className="size-5 rounded-md" style={{ background: INK_MID }} />
            <span className="text-[8.5px] text-neutral-600">{a}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── API & MCP Server ──────────────────────────────────────────────────────
const API_LINES: { t: string; head?: boolean }[] = [
  { t: "GET /v1/contacts", head: true },
  { t: '{ "name": "Sarah Chen",' },
  { t: '  "company": "NovaTech" }' },
];
function StackApi() {
  return (
    <div className="flex h-full flex-col gap-2 bg-[var(--v69-card)] p-3.5 text-[10px] leading-none">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-neutral-800">API &amp; MCP</span>
        <span className="rounded-full bg-[var(--v69-well)] px-2 py-0.5 text-[8.5px] text-neutral-500">200 OK</span>
      </div>
      <div
        className="flex flex-1 flex-col justify-center gap-1.5 rounded-lg bg-[var(--v69-well)] p-3 shadow-[inset_0_0_0_1px_var(--v69-chip-border)]"
        style={{ fontFamily: MONO }}
      >
        {API_LINES.map((l, i) => (
          <span
            key={l.t}
            className={`${ANIM} block truncate text-[9px] ${l.head ? "text-neutral-800" : "text-neutral-500"}`}
            style={delay(i)}
          >
            {l.t}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Integrated payments ───────────────────────────────────────────────────
function StackPayments() {
  const items: [string, string][] = [
    ["Brand strategy", "$1,500"],
    ["Website design", "$2,500"],
  ];
  return (
    <div className="flex h-full flex-col justify-center gap-2.5 bg-[var(--v69-card)] p-3.5 text-[10px] leading-none">
      <div
        className={`${ANIM} flex flex-col gap-2 rounded-lg bg-[var(--v69-well)] p-3 shadow-[inset_0_0_0_1px_var(--v69-chip-border)]`}
        style={delay(0)}
      >
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-neutral-500">Invoice #1042</span>
          <span className="rounded-full px-2 py-0.5 text-[8.5px] text-[var(--color-white)]" style={{ background: INK_STRONG }}>Paid</span>
        </div>
        <span className="text-[22px] font-medium leading-none tracking-tight text-neutral-900">$4,000</span>
      </div>
      {items.map(([l, v], i) => (
        <div key={l} className={`${ANIM} flex items-center justify-between px-1 text-[9.5px]`} style={delay(i + 1)}>
          <span className="text-neutral-600">{l}</span>
          <span className="tabular-nums text-neutral-500">{v}</span>
        </div>
      ))}
    </div>
  );
}

// ── Enterprise-grade security ─────────────────────────────────────────────
const SEC = ["Encrypted in transit", "Encrypted at rest", "MFA enforced"];
function StackSecurity() {
  return (
    <div className="flex h-full flex-col gap-2.5 bg-[var(--v69-card)] p-3.5 text-[10px] leading-none">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-neutral-800">Security</span>
        <span className="rounded-full bg-[var(--v69-well)] px-2 py-0.5 text-[8.5px] text-neutral-500">SOC 2 Type II</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {SEC.map((s, i) => (
          <div
            key={s}
            className={`${ANIM} flex items-center gap-2 rounded-md bg-[var(--v69-well)] px-2.5 py-2 shadow-[inset_0_0_0_1px_var(--v69-chip-border)]`}
            style={delay(i)}
          >
            <span className="flex size-3.5 shrink-0 items-center justify-center rounded-full text-[var(--color-white)]" style={{ background: INK_SOLID }}>
              <Check className="size-2" />
            </span>
            <span className="text-neutral-700">{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StackVisual({ slug }: { slug: string }) {
  if (slug === "custom-domain") return <StackCustomDomain />;
  if (slug === "crm") return <StackCrm />;
  if (slug === "auth") return <StackAuth />;
  if (slug === "roles") return <StackRoles />;
  if (slug === "notifications") return <StackNotifications />;
  if (slug === "workflow") return <StackWorkflow />;
  if (slug === "apps") return <StackApps />;
  if (slug === "api") return <StackApi />;
  if (slug === "payments") return <StackPayments />;
  if (slug === "security") return <StackSecurity />;
  return null;
}
