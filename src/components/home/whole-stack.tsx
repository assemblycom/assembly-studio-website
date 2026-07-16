import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────
// THE WHOLE STACK — itemizes the proof behind the production-gap claim:
// everything a firm would otherwise build or buy after a code generator
// hands them an app. Section 3 asserts the gap; each row here lands as
// evidence. Layout per the landing narrative doc: short manifesto copy on
// the left, an arrow-row list on the right with rows that expand.
// ─────────────────────────────────────────────────────────────────────────

// Row titles come verbatim from the landing narrative doc; each links to its
// corresponding docs page (studio.assembly.com/docs). The one-line bodies are
// retained as data but no longer rendered.
const DOCS = "https://studio.assembly.com/docs";
const ROWS: { title: string; body: string; href?: string; linkLabel?: string }[] = [
  {
    title: "CRM with contacts and companies",
    body: "Every app knows your contacts and companies from day one — no data silos, nothing to rebuild.",
    href: `${DOCS}/core-concepts/contacts-and-companies`,
  },
  {
    title: "Client authentication",
    body: "Secure magic links and Google Auth for your clients, built in.",
    href: `${DOCS}/core-concepts/magic-links`,
  },
  {
    title: "Roles and permissions",
    body: "Roles and client scoping are platform infrastructure — your team controls who sees what.",
    href: `${DOCS}/core-concepts/client-access`,
  },
  {
    title: "Notification center",
    body: "In-product and email notifications, for your team and your clients.",
    href: `${DOCS}/core-concepts/notifications`,
  },
  {
    title: "Workflow builder",
    body: "Automate the steps around your apps — reminders, follow-ups, and handoffs.",
    href: `${DOCS}/advanced-features/automations`,
  },
  {
    title: "Branding and custom domain",
    body: "Every app ships with your logo, colors, and custom domain.",
    href: `${DOCS}/getting-started/custom-domains`,
  },
  {
    title: "Integrated payments",
    body: "Invoice and collect payments inside the same client experience your apps live in.",
    href: `${DOCS}/built-in-apps/payments`,
  },
  {
    title: "API & MCP Server",
    body: "A full API and MCP server, so your systems and agents can reach everything programmatically.",
    href: `${DOCS}/api-reference/introduction`,
  },
  {
    title: "Enterprise-grade security",
    body: "A structural boundary separates what your team sees from what your clients see — no prompt can cross it.",
    href: `${DOCS}/advanced-features/security`,
  },
];

// Up-right arrow — signals "opens a page" (these rows link out to docs),
// unlike a right chevron which reads like an accordion that expands in place.
// Nudges up-and-out on hover.
function ArrowUpRight() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className="shrink-0 text-muted-foreground/70 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
    >
      <path
        d="M5 11L11 5M11 5H7M11 5V9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function WholeStack() {
  const rowClass =
    "group flex w-full items-center justify-between gap-4 border-t border-border px-3 py-4 text-left transition-colors hover:bg-muted/40";
  const titleClass =
    "text-[17px] text-muted-foreground transition-colors group-hover:text-foreground";

  return (
    <section id="whole-stack" className="py-16 md:py-24">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10">
        <div className="md:grid md:grid-cols-[minmax(0,420px)_minmax(0,1fr)] md:items-start md:gap-16 lg:gap-24">
          {/* Manifesto copy — short, left. */}
          <div>
            <h2 className="type-h2 text-foreground">
              A platform, not just a builder
            </h2>
            <p className="type-lead mt-5 text-muted-foreground">
              An app builder is only as good as the platform it plugs into.
              Assembly comes with a CRM, a client experience, workflows, and
              more built in — so you never rebuild the basics.
            </p>
          </div>

          {/* Linked rows — each capability is its own row, no expanding copy.
              Rows with a destination navigate; the rest carry the same arrow
              affordance until their links are wired. */}
          <div className="mt-8 border-b border-border md:mt-2">
            {ROWS.map((row) => {
              const external = row.href?.startsWith("http");
              return row.href ? (
                <Link
                  key={row.title}
                  href={row.href}
                  {...(external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className={rowClass}
                >
                  <span className={titleClass}>{row.title}</span>
                  <ArrowUpRight />
                </Link>
              ) : (
                <div key={row.title} className={rowClass}>
                  <span className={titleClass}>{row.title}</span>
                  <ArrowUpRight />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
