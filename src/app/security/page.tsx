import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { FAQ, type FAQEntry } from "@/components/home/faq";
import { DEMO_URL, TRUST_CENTER_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Security",
  description:
    "Enterprise-grade security for your client portals. SOC 2 Type II, HIPAA-ready, end-to-end encrypted, and built for regulated industries.",
};

const DIFFERENTIATORS: { title: string; description: string }[] = [
  {
    title: "Authentication, managed by the platform",
    description:
      "Clients can log in through an authenticated (SSO, OAuth) experience. Studio-built apps live inside this permissioned environment.",
  },
  {
    title: "Client & company permissions, scoped by you",
    description:
      "Apps automatically operate within Assembly's client and company model, letting you set custom permissions and visibility for your customers.",
  },
  {
    title: "Built-in admin-vs-client boundary",
    description:
      "Assembly has a native, structural separation between your internal team's view and your external clients' view.",
  },
  {
    title: "Permissions you control",
    description:
      "Every app respects the roles and per-client access rules you can set across your workspace — by plan, industry, or any custom field.",
  },
];

const COMPARISON: { aspect: string; generic: string; assembly: string }[] = [
  {
    aspect: "Where security lives",
    generic: "Generated fresh in each app",
    assembly: "Inherited from the platform",
  },
  {
    aspect: "How failures are caught",
    generic: "Scanned or checklisted after the fact",
    assembly: "Removed at the architectural level",
  },
  {
    aspect: "Internal team vs. client boundary",
    generic: "Must be requested and generated",
    assembly: "Native and structural",
  },
  {
    aspect: "Where the app lives",
    generic: "Standalone app at its own URL",
    assembly: "Inside your access-controlled client experience",
  },
];

const SECURITY_FAQS: FAQEntry[] = [
  {
    question: "Where do my app's login and permissions come from?",
    answer:
      "From the Assembly platform. Clients access your apps through your existing authenticated portal, and apps operate within the permissions and client scoping you already control — they don't generate their own auth.",
  },
  {
    question: "Can one client see another client's data?",
    answer:
      "Assembly separates internal-team and external-client access at the platform level, and apps are scoped to the client and company data they're meant to touch. That boundary is part of the foundation, not something each app re-implements.",
  },
  {
    question: "What certifications does Assembly hold?",
    answer:
      "The Assembly platform is SOC 2 Type II certified and supports HIPAA, GDPR, and CCPA, monitored via Secureframe. See the Trust Center for the current list and documentation.",
  },
  {
    question: "Are apps I build with Studio HIPAA / SOC 2 certified?",
    answer: "TBD",
  },
  {
    question: "What about SSO, MFA, and audit logs?",
    answer: "TBD",
  },
];

export default function SecurityPage() {
  return (
    <>
      {/* Hero */}
      <section className="px-6 pb-10 pt-24 text-center md:pt-32">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-medium tracking-tight md:text-5xl">
            Don&apos;t let AI generate your software security
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Build as fast as you want. The encryption, access controls, and
            certifications underneath are engineered, audited, and on by default
            — never left to chance.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={DEMO_URL}
              className="rounded-full bg-foreground px-6 py-3 text-sm text-background transition-opacity hover:opacity-90"
            >
              Book demo
            </a>
            <a
              href={TRUST_CENTER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border bg-background px-6 py-3 text-sm text-foreground transition-colors hover:bg-muted"
            >
              View Trust Center
            </a>
          </div>
        </div>
      </section>

      {/* What makes Assembly Studio different */}
      <Section className="pt-16 md:pt-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-medium tracking-tight md:text-3xl">
            What makes Assembly Studio different
          </h2>
          <p className="mt-3 text-muted-foreground">
            Apps you build inherit the platform&apos;s security model — you
            don&apos;t wire it up yourself.
          </p>
        </div>
        <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
          {DIFFERENTIATORS.map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-border p-6"
            >
              <h3 className="text-base font-medium">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* Comparison strip */}
      <Section className="pt-16 md:pt-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-medium tracking-tight md:text-3xl">
            Assembly vs. other AI app builders
          </h2>
        </div>
        <div className="mx-auto mt-10 max-w-4xl overflow-hidden rounded-2xl border border-border">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="w-1/3 px-5 py-4 font-medium" />
                <th className="w-1/3 px-5 py-4 font-medium text-muted-foreground">
                  Generic AI builders
                </th>
                <th className="w-1/3 px-5 py-4 font-medium">Assembly Studio</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row) => (
                <tr key={row.aspect} className="border-t border-border">
                  <td className="px-5 py-4 font-medium">{row.aspect}</td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {row.generic}
                  </td>
                  <td className="px-5 py-4">{row.assembly}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Social proof — placeholder until logos / quotes are ready */}
      <Section className="pt-0">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">Social proof</p>
          <p className="max-w-md text-sm text-muted-foreground/70">
            Placeholder for customer logos, security quotes, or compliance
            badges.
          </p>
        </div>
      </Section>

      {/* Security FAQ */}
      <FAQ heading="Security FAQ" items={SECURITY_FAQS} />

      {/* Final CTA */}
      <Section className="pt-0">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
            Build AI apps on a trusted platform
          </h2>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={DEMO_URL}
              className="rounded-full bg-foreground px-6 py-3 text-sm text-background transition-opacity hover:opacity-90"
            >
              Book demo
            </a>
            <a
              href={TRUST_CENTER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border bg-background px-6 py-3 text-sm text-foreground transition-colors hover:bg-muted"
            >
              Explore Trust Center
            </a>
          </div>
        </div>
      </Section>
    </>
  );
}
