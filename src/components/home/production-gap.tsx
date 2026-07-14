// ─────────────────────────────────────────────────────────────────────────
// THE PRODUCTION GAP — the wedge. Sits right after How it works, while the
// deployment step is fresh: the visitor who stalled in another builder
// recognizes their own stall without a competitor being named. Copy from
// the landing narrative doc.
//
// The visual is monochrome on purpose (site rule: status via brightness,
// not hue). The story is told through FIDELITY, not color: the "elsewhere"
// window is flat and generic — an unstyled scaffold on a random subdomain —
// while the Assembly window carries the site's real card language (layered
// shadow, filled wells, solid ink button). Questions read muted and open;
// handled items read solid ink with checks.
// ─────────────────────────────────────────────────────────────────────────

const QUESTIONS = [
  "Who logs in?",
  "Which client sees what?",
  "How does it know your clients?",
  "Whose brand is on it?",
  "Where does this live for your clients?",
];

const ANSWERS = [
  "Login built in — secure magic links",
  "Permissions scoped per client",
  "Knows your contacts from day one",
  "Your brand, automatically",
  "Lives where clients already log in",
];

function IconQuestion() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.4-3 3.9" />
      <path d="M12 17.5h.01" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

// The bare generated app: flat window, outlined placeholder fields, no
// depth — deliberately reads as a scaffold, not a product.
function ElsewhereWindow() {
  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex items-center gap-2.5 border-b border-border px-4 py-2.5">
        <span className="flex gap-1.5">
          <span className="size-2 rounded-full bg-foreground/10" />
          <span className="size-2 rounded-full bg-foreground/10" />
          <span className="size-2 rounded-full bg-foreground/10" />
        </span>
        <span className="flex-1 truncate rounded-md bg-muted px-3 py-1 font-mono text-[12px] text-muted-foreground">
          onboarding-app-x7f2.vercel.app
        </span>
      </div>
      <div className="p-5 md:p-6">
        <p className="text-[15px] font-medium text-foreground">Client onboarding</p>
        <div className="mt-4 flex flex-col gap-2.5">
          <div className="rounded-lg border border-border px-3.5 py-2.5 text-[13px] text-muted-foreground">Full name</div>
          <div className="rounded-lg border border-border px-3.5 py-2.5 text-[13px] text-muted-foreground">Your goals</div>
        </div>
        <div className="mt-4 inline-flex rounded-lg border border-border px-4 py-2 text-[13px] text-muted-foreground">Continue</div>
      </div>
    </div>
  );
}

// The same app inside the firm's client experience — rendered in the site's
// real card language: hairline ring, layered shadow, filled wells, solid
// ink CTA. The fidelity gap against the left window IS the argument.
function OnAssemblyWindow() {
  const nav = ["Onboarding", "Approvals", "Files", "Billing"];
  return (
    <div className="flex overflow-hidden rounded-2xl bg-card ring-1 ring-black/[0.07] [box-shadow:0_1px_2px_rgba(16,24,40,0.04),0_16px_36px_-20px_rgba(16,24,40,0.18)]">
      <div className="w-[38%] max-w-[160px] border-r border-border bg-muted/50 px-4 py-4 md:px-5">
        <p className="text-[14px] font-medium text-foreground">BrandMages</p>
        <ul className="mt-4 flex flex-col gap-2.5 text-[13px]">
          {nav.map((item, i) => (
            <li key={item} className={i === 0 ? "font-medium text-foreground" : "text-muted-foreground"}>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-1 p-5 md:p-6">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[15px] font-medium text-foreground">Client onboarding</p>
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground text-[10px] font-medium text-background">
            JN
          </span>
        </div>
        <div className="mt-4 flex flex-col gap-2.5">
          <div className="rounded-lg bg-muted px-3.5 py-2.5 text-[13px] text-foreground shadow-[inset_0_0_0_1px_rgba(16,24,40,0.04)]">Jane Nguyen</div>
          <div className="rounded-lg bg-muted px-3.5 py-2.5 text-[13px] text-muted-foreground shadow-[inset_0_0_0_1px_rgba(16,24,40,0.04)]">Your goals</div>
        </div>
        <div className="mt-4 inline-flex rounded-lg bg-foreground px-4 py-2 text-[13px] text-background">Continue</div>
      </div>
    </div>
  );
}

export function ProductionGap() {
  return (
    <section id="production-gap" className="py-20 md:py-28">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10">
        <h2 className="type-h2 max-w-xl text-foreground">
          Generation is the easy part
        </h2>
        <p className="type-lead mt-5 max-w-xl text-muted-foreground">
          The hard part comes after: deployment, authentication, permissions,
          notifications, branding. Assembly Studio apps ship inside your
          unified client experience, all of it handled.
        </p>
        <div className="mt-10 grid gap-10 md:mt-14 md:grid-cols-2 md:gap-8 lg:gap-12">
          <div className="flex flex-col">
            <p className="text-[13px] text-muted-foreground">Elsewhere — an app that exists</p>
            <div className="mt-3">
              <ElsewhereWindow />
            </div>
            {/* Open questions — muted, unresolved. */}
            <ul className="mt-6 flex flex-col gap-2.5 text-muted-foreground">
              {QUESTIONS.map((q) => (
                <li key={q} className="flex items-center gap-2.5 text-[14px]">
                  <span className="text-muted-foreground/70">
                    <IconQuestion />
                  </span>
                  {q}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col">
            <p className="text-[13px] text-muted-foreground">On Assembly — an app your clients use</p>
            <div className="mt-3">
              <OnAssemblyWindow />
            </div>
            {/* Handled — solid ink, resolved. */}
            <ul className="mt-6 flex flex-col gap-2.5 text-foreground">
              {ANSWERS.map((a) => (
                <li key={a} className="flex items-center gap-2.5 text-[14px]">
                  <IconCheck />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
