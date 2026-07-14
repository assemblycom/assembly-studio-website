// ─────────────────────────────────────────────────────────────────────────
// THE PRODUCTION GAP — the wedge. Sits right after How it works, while the
// deployment step is fresh: the visitor who stalled in another builder
// recognizes their own stall without a competitor being named. Copy from
// the landing narrative doc; the visual follows the marketing mock — the
// same "Client onboarding" app twice, once stranded on a random subdomain
// with open questions, once living inside the firm's client experience.
// ─────────────────────────────────────────────────────────────────────────

// Accents from the mock: brick for the unanswered questions, green for the
// handled ones. Mid-tone values so they read on the dark canvas too.
const RED = "#9d4b3f";
const GREEN = "#127d5c";

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
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0">
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

// The bare generated app: browser chrome + a form no one can reach.
function ElsewherePanel() {
  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-border bg-muted/40 p-5 md:p-6">
      <div className="rounded-xl border border-border bg-card">
        {/* Browser chrome. */}
        <div className="flex items-center gap-2.5 border-b border-border px-4 py-2.5">
          <span className="flex gap-1.5">
            <span className="size-2 rounded-full bg-foreground/15" />
            <span className="size-2 rounded-full bg-foreground/15" />
          </span>
          <span className="flex-1 truncate rounded-md border border-border px-3 py-1 font-mono text-[12px] text-muted-foreground">
            onboarding-app-x7f2.vercel.app
          </span>
        </div>
        <div className="p-5">
          <p className="text-[17px] font-medium text-foreground">Client onboarding</p>
          <div className="mt-4 flex flex-col gap-2.5">
            <div className="rounded-lg border border-border px-3.5 py-2.5 text-[13px] text-muted-foreground">Full name</div>
            <div className="rounded-lg border border-border px-3.5 py-2.5 text-[13px] text-muted-foreground">Your goals</div>
          </div>
          <div className="mt-4 inline-flex rounded-lg border border-border px-4 py-2 text-[13px] text-foreground">Continue</div>
        </div>
      </div>
      <ul className="flex flex-col gap-2.5" style={{ color: RED }}>
        {QUESTIONS.map((q) => (
          <li key={q} className="flex items-center gap-2.5 text-[14px]">
            <IconQuestion />
            {q}
          </li>
        ))}
      </ul>
    </div>
  );
}

// The same app inside the firm's client experience: sidebar, auth, brand.
function OnAssemblyPanel() {
  const nav = ["Onboarding", "Approvals", "Files", "Billing"];
  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-border bg-muted/40 p-5 md:p-6">
      <div className="flex overflow-hidden rounded-xl border border-border bg-card">
        {/* Portal sidebar — the firm's brand, not the tool's. */}
        <div className="w-[38%] max-w-[150px] border-r border-border px-4 py-4">
          <p className="text-[14px] font-medium text-violet-700">BrandMages</p>
          <ul className="mt-3.5 flex flex-col gap-2 text-[13px]">
            {nav.map((item, i) => (
              <li key={item} className={i === 0 ? "text-foreground" : "text-muted-foreground"}>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-1 p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[17px] font-medium text-foreground">Client onboarding</p>
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[10px] font-medium text-violet-700">
              JN
            </span>
          </div>
          <div className="mt-4 flex flex-col gap-2.5">
            <div className="rounded-lg border border-border px-3.5 py-2.5 text-[13px] text-foreground">Jane Nguyen</div>
            <div className="rounded-lg border border-border px-3.5 py-2.5 text-[13px] text-muted-foreground">Your goals</div>
          </div>
          <div className="mt-4 inline-flex rounded-lg border border-border px-4 py-2 text-[13px] text-foreground">Continue</div>
        </div>
      </div>
      <ul className="flex flex-col gap-2.5" style={{ color: GREEN }}>
        {ANSWERS.map((a) => (
          <li key={a} className="flex items-center gap-2.5 text-[14px]">
            <IconCheck />
            {a}
          </li>
        ))}
      </ul>
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
          The hard part comes after — deployment, authentication, permissions,
          notifications, branding. Assembly Studio apps ship inside your
          unified client experience, all of it handled.
        </p>
        <div className="mt-10 grid gap-6 md:mt-14 md:grid-cols-2 lg:gap-8">
          <div>
            <p className="text-[15px] text-muted-foreground">Elsewhere — an app that exists</p>
            <div className="mt-3">
              <ElsewherePanel />
            </div>
          </div>
          <div>
            <p className="text-[15px] text-muted-foreground">On Assembly — an app your clients use</p>
            <div className="mt-3">
              <OnAssemblyPanel />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
