import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { FAQ } from "@/components/home/faq";

export const metadata: Metadata = {
  title: "Security",
  description:
    "Enterprise-grade security for your client portals. SOC 2 Type II, HIPAA-ready, end-to-end encrypted, and built for regulated industries.",
};

type IconName =
  | "shield"
  | "lock"
  | "users"
  | "key"
  | "globe"
  | "doc"
  | "cross"
  | "target"
  | "clock"
  | "download"
  | "trash"
  | "eye";

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

function Glyph({ name }: { name: IconName }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 20 20",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "shield":
      return (
        <svg {...common}>
          <path d="M10 2.5l6 2.2v4.4c0 3.7-2.5 6.2-6 7.4-3.5-1.2-6-3.7-6-7.4V4.7l6-2.2z" />
          <path d="M7.5 10l1.8 1.8L13 8" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <rect x="4" y="8.5" width="12" height="8" rx="2" />
          <path d="M6.5 8.5V6.5a3.5 3.5 0 017 0v2" />
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <circle cx="7.5" cy="7" r="2.5" />
          <path d="M3 16c0-2.5 2-4 4.5-4S12 13.5 12 16" />
          <path d="M13 5.2a2.5 2.5 0 010 4.6M14.5 16c0-1.8-.7-3.1-1.8-3.8" />
        </svg>
      );
    case "key":
      return (
        <svg {...common}>
          <circle cx="7" cy="13" r="3" />
          <path d="M9 11l6-6M13 5l2 2M11 7l1.5 1.5" />
        </svg>
      );
    case "globe":
      return (
        <svg {...common}>
          <circle cx="10" cy="10" r="7" />
          <path d="M3 10h14M10 3c2 2.2 2 11.8 0 14M10 3c-2 2.2-2 11.8 0 14" />
        </svg>
      );
    case "doc":
      return (
        <svg {...common}>
          <path d="M5 3h6l4 4v10a1 1 0 01-1 1H5a1 1 0 01-1-1V4a1 1 0 011-1z" />
          <path d="M11 3v4h4M7 11h6M7 14h6" />
        </svg>
      );
    case "cross":
      return (
        <svg {...common}>
          <path d="M10 2.5l6 2.2v4.4c0 3.7-2.5 6.2-6 7.4-3.5-1.2-6-3.7-6-7.4V4.7l6-2.2z" />
          <path d="M10 7v5M7.5 9.5h5" />
        </svg>
      );
    case "target":
      return (
        <svg {...common}>
          <circle cx="10" cy="10" r="7" />
          <circle cx="10" cy="10" r="3.5" />
          <circle cx="10" cy="10" r="0.5" fill="currentColor" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="10" cy="10" r="7" />
          <path d="M10 6v4l2.5 2.5" />
        </svg>
      );
    case "download":
      return (
        <svg {...common}>
          <path d="M10 3v9m0 0l-3.5-3.5M10 12l3.5-3.5M4 15h12" />
        </svg>
      );
    case "trash":
      return (
        <svg {...common}>
          <path d="M4 6h12M8 6V4.5a1 1 0 011-1h2a1 1 0 011 1V6M6.5 6l.5 9a1 1 0 001 1h4a1 1 0 001-1l.5-9" />
        </svg>
      );
    case "eye":
      return (
        <svg {...common}>
          <path d="M2 10s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5z" />
          <circle cx="10" cy="10" r="2.5" />
        </svg>
      );
  }
}

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

      {/* Testimonial */}
      <Section className="pt-0">
        <figure className="mx-auto max-w-3xl text-center">
          <blockquote className="text-xl font-normal leading-relaxed tracking-tight md:text-2xl">
            &ldquo;Assembly cleared every box our compliance team had — SOC 2,
            HIPAA, SSO, audit logs — without slowing the rollout down.&rdquo;
          </blockquote>
          <figcaption className="mt-6 text-sm text-muted-foreground">
            Phillip LaRue · Capital One
          </figcaption>
        </figure>
      </Section>

      {/* Responsible disclosure */}
      <Section className="pt-0">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-muted p-8 text-center md:p-12">
          <h2 className="text-2xl font-medium tracking-tight">
            Found a vulnerability?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            We partner with the security research community. Report an issue and
            our team will respond quickly.
          </p>
          <a
            href="mailto:security@assembly.com"
            className="mt-6 inline-block rounded-full bg-foreground px-6 py-3 text-sm text-background transition-opacity hover:opacity-90"
          >
            Report an issue
          </a>
        </div>
      </Section>

      {/* FAQ */}
      <FAQ />
    </>
  );
}
