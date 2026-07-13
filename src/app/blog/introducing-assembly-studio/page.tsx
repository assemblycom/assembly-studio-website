import type { Metadata } from "next";
import Link from "next/link";
import { ArticleToc, CopyLinkButton } from "@/components/blog/article-rail";
import { APP_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Introducing Assembly Studio",
  description:
    "The AI app builder for professional service firms — describe what you want in your own words, and it goes live where your team and clients already are.",
};

// ─────────────────────────────────────────────────────────────────────────
// Launch post (linked from the announcement bar). Composition inspired by
// OpenAI's release posts: centered meta + display headline + dek, a hairline
// utility row, then a sticky section TOC on the left with the article prose
// on the right. Copy drawn from the internal "About Assembly Studio" hub doc.
// ─────────────────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: "only-you", label: "Build the firm only you can build" },
  { id: "how-it-works", label: "From description to deployed app" },
  { id: "production-gap", label: "Where other builders stop" },
  { id: "security", label: "Security the AI can't get wrong" },
  { id: "what-firms-build", label: "What firms build" },
  { id: "get-started", label: "Available today" },
];

const BUILD_STEPS = [
  {
    name: "Describe",
    text: "Say what you want in your own words, or start from a template made for firm workflows and customize it.",
  },
  {
    name: "Plan",
    text: "Studio interviews you like a product lead — a few plain-language questions, only when needed — then shows a structured plan: who the app is for, the core flows, the notifications. You approve or edit before anything is built.",
  },
  {
    name: "Build",
    text: "Studio builds a real application and deploys it into your workspace. Internal views land in the dashboard; client views land in the client experience. Auth, permissions, and client data are wired in automatically.",
  },
  {
    name: "Iterate",
    text: "Keep chatting to change anything, before or after launch. Apps are never finished being shapeable.",
  },
];

const EXAMPLE_APPS = [
  {
    name: "Onboarding wizard",
    text: "Multi-step client onboarding with saved progress. Internal users see who's completed and who's stalled mid-flow.",
  },
  {
    name: "Client performance dashboard",
    text: "Each client sees their own metrics and trends; the team configures metrics and gets an overview across all clients.",
  },
  {
    name: "Document collection",
    text: "Request documents from a client; they see a checklist, upload items, and track status — reviews and notifications on both sides.",
  },
  {
    name: "Markup and comments",
    text: "Upload a design or PDF for review; comments pin to specific spots, and the team works a global review queue.",
  },
  {
    name: "Service request intake",
    text: "Clients pick a service, fill a scoping form, and submit; the team confirms or refines scope with status visible to the client.",
  },
];

const PROSE = "text-base leading-[1.75] text-foreground/80";

export default function IntroducingAssemblyStudioPage() {
  return (
    <article className="bg-background">
      {/* ── Header — centered, OpenAI-release style. ── */}
      <header className="mx-auto max-w-3xl px-6 pt-20 text-center md:pt-28">
        <p className="font-[family-name:var(--font-diatype-mono)] text-xs text-muted-foreground">
          July 13, 2026 · Product
        </p>
        <h1 className="type-display mt-6 [text-wrap:balance]">
          Introducing Assembly Studio
        </h1>
        <p className="type-lead mx-auto mt-5 max-w-2xl text-muted-foreground">
          The AI app builder for professional service firms — describe what you
          want in your own words, and it goes live where your team and clients
          already are.
        </p>
      </header>

      {/* Utility row */}
      <div className="mx-auto mt-12 flex max-w-3xl items-center justify-between border-t border-border px-6 py-3">
        <span className="text-sm text-muted-foreground">6 min read</span>
        <CopyLinkButton />
      </div>

      {/* ── Body — sticky TOC left, prose right. ── */}
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-6 md:pt-10 lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16 xl:gap-20">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <ArticleToc sections={SECTIONS} />
          </div>
        </aside>

        <div className="max-w-2xl">
          {/* Hero visual — the brand aurora as a quiet opening image. */}
          <div
            aria-hidden
            className="h-56 overflow-hidden rounded-2xl md:h-72"
            style={{
              background:
                "linear-gradient(160deg, #0a0e1c 0%, #243c9e 30%, #4f6bf9 52%, #9fd6c4 74%, #c6e84f 92%, #d9ed92 100%)",
            }}
          />

          <section id="only-you" className="scroll-mt-24 pt-14">
            <h2 className="type-h3">Build the firm only you can build</h2>
            <p className={`mt-4 ${PROSE}`}>
              Every professional service firm has an &ldquo;if only we had a
              tool for this&rdquo; list — the intake flow, the tracker, the
              dashboard that would make the firm feel unmistakably yours.
              Off-the-shelf software doesn&rsquo;t cover it, developers are
              expensive, and the new AI builders spin up slick prototypes that
              rarely make it in front of a client.
            </p>
            <p className={`mt-4 ${PROSE}`}>
              Assembly Studio closes that gap. You describe what you want in
              your own words. Studio asks the right clarifying questions, shows
              you a plan, then builds a real, production-grade app. Firms use
              it to replace the patchwork of point tools, spreadsheets, and
              email threads around their client work with software built for
              exactly how they operate.
            </p>
          </section>

          <section id="how-it-works" className="scroll-mt-24 pt-14">
            <h2 className="type-h3">From description to deployed app</h2>
            <div className="mt-6 space-y-5">
              {BUILD_STEPS.map((step, i) => (
                <div key={step.name} className="flex gap-4">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-sm text-foreground tabular-nums">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-base font-medium text-foreground">{step.name}</p>
                    <p className={`mt-1 ${PROSE}`}>{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="production-gap" className="scroll-mt-24 pt-14">
            <h2 className="type-h3">Where other builders stop</h2>
            <p className={`mt-4 ${PROSE}`}>
              The difference isn&rsquo;t the building — it&rsquo;s where the
              app lives. Every Assembly Studio app goes live directly into
              Assembly&rsquo;s client experience platform, inheriting the
              foundation your firm already runs on: authentication, roles and
              permissions, client and company data from the CRM, notifications,
              and your brand.
            </p>
            <p className={`mt-4 ${PROSE}`}>
              Your team uses the app in their dashboard; your clients use it in
              the client experience they already log into. There&rsquo;s no
              separate hosting to configure, no login to bolt on, no &ldquo;now
              what?&rdquo; moment after generation. That gap — between an app
              that exists and an app your clients can actually use — is where
              other AI builders stop and Assembly Studio starts.
            </p>
          </section>

          <section id="security" className="scroll-mt-24 pt-14">
            <h2 className="type-h3">Security the AI can&rsquo;t get wrong</h2>
            <p className={`mt-4 ${PROSE}`}>
              Authentication, permissions, and client scoping are platform
              infrastructure — maintained by humans, not AI. A structural
              boundary separates your internal team from your external
              clients, and no prompt can accidentally cross it. New apps
              automatically respect the roles and permissions you already use:
              the AI builds features, never the security layer.
            </p>
          </section>

          <section id="what-firms-build" className="scroll-mt-24 pt-14">
            <h2 className="type-h3">What firms build</h2>
            <p className={`mt-4 ${PROSE}`}>
              The sweet spot is apps with two sides — an internal view for the
              team, a client-facing view for clients — though internal-only
              tools work just as well.
            </p>
            <div className="mt-6 divide-y divide-border border-y border-border">
              {EXAMPLE_APPS.map((app) => (
                <div key={app.name} className="grid gap-1 py-4 sm:grid-cols-[200px_1fr] sm:gap-6">
                  <p className="text-base font-medium text-foreground">{app.name}</p>
                  <p className={PROSE}>{app.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="get-started" className="scroll-mt-24 pt-14">
            <h2 className="type-h3">Available today</h2>
            <p className={`mt-4 ${PROSE}`}>
              Assembly Studio is available now for every Assembly workspace.
              Start from a template made for firm workflows, or describe the
              tool your firm has always needed — and publish it to the client
              experience your clients already use.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href={APP_URL}
                className="rounded-lg bg-foreground px-5 py-2.5 text-sm text-background transition-opacity hover:opacity-90"
              >
                Start building
              </a>
              <Link
                href="/templates"
                className="rounded-lg border border-border bg-background px-5 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
              >
                Browse templates
              </Link>
            </div>
          </section>
        </div>
      </div>
    </article>
  );
}
