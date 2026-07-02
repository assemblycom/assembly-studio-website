import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { FAQ } from "@/components/home/faq";
import { Glyph, type IconName } from "@/components/security/glyph";

export const metadata: Metadata = {
  title: "Security",
  description:
    "Enterprise-grade security for your client portals. SOC 2 Type II, HIPAA-ready, end-to-end encrypted, and built for regulated industries.",
};

interface Feature {
  icon: IconName;
  title: string;
  description: string;
}

const GROUPS: { label: string; lead: string; features: Feature[] }[] = [
  {
    label: "Encryption & access",
    lead: "Only the right people ever reach your clients' data — and it's encrypted the entire way.",
    features: [
      {
        icon: "lock",
        title: "End-to-end encryption",
        description:
          "Encrypted in transit (TLS 1.3) and at rest (AES-256), always.",
      },
      {
        icon: "users",
        title: "Role-based access",
        description:
          "Fine-grained permissions so people only ever see what they should.",
      },
      {
        icon: "key",
        title: "SSO & SAML",
        description:
          "Enterprise single sign-on with SAML 2.0 for secure access.",
      },
      {
        icon: "doc",
        title: "Audit logging",
        description:
          "A complete, exportable trail of every action for compliance.",
      },
    ],
  },
  {
    label: "Built for regulated industries",
    lead: "The controls accounting, legal, healthcare, and financial teams are required to have.",
    features: [
      {
        icon: "shield",
        title: "SOC 2 Type II",
        description:
          "Audited controls for security, availability, and confidentiality.",
      },
      {
        icon: "cross",
        title: "HIPAA ready",
        description:
          "A BAA is available for teams handling protected health information.",
      },
      {
        icon: "globe",
        title: "Data residency",
        description:
          "Choose where your data lives to meet regional requirements.",
      },
      {
        icon: "target",
        title: "Penetration tested",
        description:
          "Regular third-party pen testing with published advisories.",
      },
    ],
  },
  {
    label: "Your data, your control",
    lead: "You decide how long data lives, where the keys are, and when it's gone.",
    features: [
      {
        icon: "clock",
        title: "Retention controls",
        description: "Set how long data is kept — and when it's purged.",
      },
      {
        icon: "key",
        title: "Bring your own keys",
        description: "Manage your own encryption keys (BYOK) on enterprise.",
      },
      {
        icon: "download",
        title: "Export anytime",
        description: "Your data is yours — export it in full whenever you need.",
      },
      {
        icon: "trash",
        title: "Delete on request",
        description: "Full deletion when a contract ends, verified and logged.",
      },
    ],
  },
];

export default function SecurityPage() {
  return (
    <>
      {/* Hero */}
      <section className="px-6 pb-10 pt-24 text-center md:pt-32">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-medium tracking-tight md:text-5xl">
            Your clients&apos; data is in safe hands
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Assembly is built from the ground up with the encryption, access
            controls, and certifications that regulated industries require — on
            by default, for every plan.
          </p>
          <a
            href="https://trust.assembly.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block rounded-full bg-foreground px-6 py-3 text-sm text-background transition-opacity hover:opacity-90"
          >
            Visit our Trust Center
          </a>
        </div>
      </section>

      {/* Grouped principles */}
      {GROUPS.map((group, gi) => (
        <Section key={group.label} className={gi === 0 ? "pt-16 md:pt-24" : "pt-0"}>
          <div className="grid gap-8 md:grid-cols-[1fr_2fr] md:gap-12">
            <div className="md:sticky md:top-24 md:self-start">
              <h2 className="text-2xl font-medium tracking-tight md:text-3xl">
                {group.label}
              </h2>
              <p className="mt-3 text-muted-foreground">{group.lead}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {group.features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-border p-6"
                >
                  <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                    <Glyph name={feature.icon} />
                  </div>
                  <h3 className="mt-4 text-base font-medium">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Section>
      ))}

      {/* FAQ */}
      <FAQ />
    </>
  );
}
