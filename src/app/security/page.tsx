import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { FAQ, type FAQEntry } from "@/components/home/faq";
import { SecurityTestimonials } from "@/components/security/security-testimonials";
import { SecurityCompliance } from "@/components/security/security-compliance";
import { SecurityCta } from "@/components/security/security-cta";
import { DEMO_URL, SIGNUP_URL, TRUST_CENTER_URL } from "@/lib/constants";
import { PAGE_SEO, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(PAGE_SEO.security);

const DIFFERENTIATORS: { title: string; description: string }[] = [
  {
    title: "Authentication, managed by the platform",
    description:
      "Clients sign in with magic links, Google, or a password. You control which methods are allowed, and MFA can be enforced on top. Login is platform infrastructure, so no app generates its own.",
  },
  {
    title: "Access, defined by the Assembly CRM",
    description:
      "Who sees what is decided by Assembly's contact and company model. Clients see only their own data, and apps can be limited to specific clients.",
  },
  {
    title: "Isolated by design",
    description:
      "Each app runs in its own sandboxed environment with its own database, scoped to your workspace. An issue in one app can't reach another, or anyone else's data.",
  },
  {
    title: "Secrets are handled securely",
    description:
      "When an app needs a third-party service, you provide the key through a secure form and the platform stores it. Credentials are injected at runtime, never hardcoded into what the AI generates.",
  },
];

const SECURITY_FAQS: FAQEntry[] = [
  {
    question: "How secure are the apps that I build?",
    answer:
      "The security-critical parts of every app aren't written by AI — they're built into Assembly's maintained foundation and enforced at build time. Apps never implement their own authentication: every request runs on short-lived, cryptographically signed tokens scoped to that specific app, and a token minted for one app is rejected by every other. Each app gets its own dedicated database, and access to workspace data is validated server-side on every request — isolation is enforced at the storage layer, not by generated code remembering to filter.\n\nSecrets and API credentials are server-only by construction: injected as environment variables at deploy, encrypted at rest, and never returned through any API. If generated code tries to pull a secret into the browser, the build fails — the app won't ship.",
  },
  {
    question: "Where is my customer data stored?",
    answer:
      "Your customer data is stored on enterprise cloud infrastructure in the United States, encrypted in transit (TLS) and at rest (AES-256). Each app you build gets its own dedicated database, scoped to your workspace. Details on hosting providers and regions are in the Assembly Trust Center.",
    links: [{ label: "Assembly Trust Center", href: TRUST_CENTER_URL }],
  },
  {
    question: "Is my data used for AI training?",
    answer:
      "No, Assembly never uses your workspace data or your clients' data to train any AI models, whether by Assembly or by our AI providers. Builds run in isolated environments, and the AI's access ends when the build does.",
  },
  {
    question: "How are apps isolated from one another?",
    answer:
      "Every app is born with its own boundaries: a dedicated codebase, its own database, and its own deployment, all scoped to your workspace. Apps render in sandboxed environments inside the platform and reach data only through Assembly's permission-checked APIs. An issue in one app can't reach another, and can never reach another customer's data.",
  },
  {
    question: "Which subprocessors does Assembly use?",
    answer:
      "Assembly uses a small set of vetted subprocessors for cloud hosting, app deployment, AI model inference, payments, and analytics — each bound by data processing agreements. The current, complete list is maintained in the Trust Center and updated whenever it changes.",
    links: [
      { label: "vetted subprocessors", href: TRUST_CENTER_URL },
      { label: "Trust Center", href: TRUST_CENTER_URL },
    ],
  },
  {
    question: "How are secrets and API credentials managed?",
    answer:
      "Secrets and API credentials are never written into generated code. When an app needs a third-party service, you provide the credential through a secure form; the platform stores it encrypted and injects it at runtime as an environment variable. The AI never holds your keys, and they never appear in your app's codebase.",
  },
  {
    question: "Is Assembly SOC2 compliant?",
    answer:
      "Yes. The Assembly platform is SOC 2 Type II certified and monitored continuously via Secureframe. Because Assembly apps run entirely on this infrastructure — auth, permissions, hosting, and data included — they never leave the audited environment. Reports are available in the Trust Center.",
    links: [{ label: "Trust Center", href: TRUST_CENTER_URL }],
  },
  {
    question: "Is Assembly HIPAA compliant?",
    answer:
      "Yes. Assembly supports HIPAA compliance, with a BAA available on the Advanced plan. One boundary applies: AI features aren't covered.\n\nIn practice, ready-made apps like secure messaging, file sharing, and contracts can all handle PHI — as long as the app doesn't use AI itself (these are clearly labeled). Building new apps with the app builder isn't covered, since the build process uses AI.\n\nIf you're a covered entity, talk to us and we'll map what fits where.",
    links: [{ label: "talk to us", href: DEMO_URL }],
  },
  {
    question: "What happens if there's a security incident?",
    answer:
      "Assembly maintains a documented incident response process: incidents are triaged by severity, contained, and remediated, and affected customers are notified in line with contractual and legal requirements. Because security is engineered at the platform level, a fix ships platform-wide — every workspace and every app at once, with nothing for you to patch.",
    links: [
      { label: "documented incident response process", href: TRUST_CENTER_URL },
    ],
  },
  {
    question: "How is Assembly different from vibe coding tools?",
    answer:
      "Other tools generate your app's security along with your app, then hand you scanners to find what the AI got wrong. On Assembly, apps don't generate that layer at all. Authentication, permissions, data scoping, and hosting are platform infrastructure, engineered once and inherited by every app you build. And your apps ship into the client experience your customers already log into, not to a standalone app you have to secure yourself.",
  },
];

export default function SecurityPage() {
  return (
    <>
      {/* Hero — a light, centered lede matching the Templates page (no dark
          card); the plain light nav sits above it on the white page. */}
      <section className="px-6 pb-16 pt-24 text-center md:pb-24 md:pt-32">
        <div className="mx-auto max-w-3xl">
          <h1 className="type-display text-balance">Secure by design</h1>
          <p className="type-lead mx-auto mt-6 max-w-2xl text-pretty text-muted-foreground">
            Build as fast as you want. Authentication, permissions, and
            encryption are platform infrastructure, engineered, audited, and on
            by default.
          </p>
          <div className="mx-auto mt-8 flex w-full max-w-xs flex-col items-stretch gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:items-center sm:justify-center">
            <a
              href={SIGNUP_URL}
              className="rounded-lg bg-foreground px-5 py-2.5 text-center text-sm text-background transition-opacity hover:opacity-90"
            >
              Get started
            </a>
            <a
              href={TRUST_CENTER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-foreground/20 bg-transparent px-5 py-2.5 text-center text-sm text-foreground transition-colors hover:bg-foreground/5"
            >
              Trust center
            </a>
          </div>
        </div>
      </section>

      {/* Compliance seals — surfaced right after the hero so the credibility
          lands first, under its full-bleed rule. */}
      <div className="border-t border-border [[data-theme=dark]_&]:border-[#383838]" />
      <div className="relative">
        <SecurityCompliance />
      </div>

      {/* Content region — the "different" section down through the customer
          story. The vertical guide rails that used to frame it are gone; the
          horizontal rules still separate the sections. */}
      <div className="relative">

        {/* Full-bleed line above the first section. */}
        <div className="border-t border-border [[data-theme=dark]_&]:border-[#383838]" />

      {/* What makes Assembly Studio different — uses the site content rail
          (mx-auto max-w-[1600px], px-6 md:px-10) rather than the narrower
          Section default, so the left column lines up with the nav logo. */}
      <section className="mx-auto max-w-[1200px] px-6 pb-20 pt-16 md:px-10 md:pb-28 md:pt-24">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16">
          {/* Left — heading sits with its column (no sticky follow; the page
              stays still). */}
          <div className="md:self-start">
            <h2 className="type-h2">
              What makes Assembly Studio different
            </h2>
            <p className="mt-6 max-w-md text-muted-foreground">
              Apps you build inherit our platform&apos;s security model, so you
              don&apos;t wire it up yourself.
            </p>
          </div>

          {/* Right — numbered primitives, divided rows */}
          <ul>
            {DIFFERENTIATORS.map((card, i) => (
              <li
                key={card.title}
                className="border-t border-border py-8 first:border-t-0 first:pt-0 md:grid md:grid-cols-[auto_1fr] md:gap-x-6"
              >
                <span className="mb-3 block font-mono text-sm tabular-nums text-muted-foreground md:mb-0 md:pt-0.5">
                  [{i + 1}]
                </span>
                <div>
                  <h3 className="text-base font-medium">{card.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">
                    {card.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>


        {/* Customer story — Metta Health spotlight. */}
        <section className="mx-auto max-w-[1200px] px-6 pb-20 pt-16 md:px-10 md:pb-28 md:pt-16">
          <SecurityTestimonials />
        </section>
      </div>


      {/* Certifications + FAQ — the seal row sits right before the questions. */}
      <div className="relative">

        <FAQ
          heading="Frequently asked questions"
          items={SECURITY_FAQS}
          twoColumn
        />
      </div>

      {/* Final CTA — parallax chip field naming the platform's baked-in
          controls, mirroring the templates page CTA. */}
      {/* Divider before the CTA — full-bleed section rule (matches the other
          full-width rules on this page, e.g. above SecurityCompliance). */}
      <div className="border-t border-border [[data-theme=dark]_&]:border-[#383838]" />

      <SecurityCta />
    </>
  );
}
