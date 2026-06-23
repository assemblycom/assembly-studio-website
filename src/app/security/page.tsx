import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { FAQ } from "@/components/home/faq";

export const metadata: Metadata = {
  title: "Security",
  description:
    "Enterprise-grade security for your client portals. SOC 2 Type II, HIPAA-ready, end-to-end encrypted, and built for regulated industries.",
};

const CERTIFICATIONS = ["SOC 2 Type II", "HIPAA", "GDPR", "CCPA"];

type IconName =
  | "shield"
  | "lock"
  | "users"
  | "key"
  | "globe"
  | "doc"
  | "cross"
  | "target";

interface Feature {
  icon: IconName;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: "shield",
    title: "SOC 2 Type II",
    description:
      "Independently audited controls for security, availability, and confidentiality.",
  },
  {
    icon: "lock",
    title: "End-to-end encryption",
    description:
      "Data is encrypted in transit (TLS 1.3) and at rest (AES-256), always.",
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
      "Enterprise single sign-on with SAML 2.0 for seamless, secure access.",
  },
  {
    icon: "globe",
    title: "Data residency",
    description:
      "Choose where your data lives to meet regional compliance requirements.",
  },
  {
    icon: "doc",
    title: "Audit logging",
    description:
      "A complete, exportable trail of every action for compliance and forensics.",
  },
  {
    icon: "cross",
    title: "HIPAA ready",
    description:
      "A BAA is available for healthcare teams handling protected health information.",
  },
  {
    icon: "target",
    title: "Penetration tested",
    description:
      "Regular third-party pen testing with published security advisories.",
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
  }
}

export default function SecurityPage() {
  return (
    <>
      {/* Hero */}
      <section className="px-6 pb-10 pt-24 text-center md:pt-32">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-medium tracking-tight md:text-5xl">
            Security you can build on
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Your clients&apos; data is the most sensitive thing you handle.
            Assembly is built from the ground up with the controls and
            certifications regulated industries require.
          </p>
        </div>
      </section>

      {/* Certifications */}
      <Section className="pt-4 md:pt-6">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {CERTIFICATIONS.map((cert) => (
            <div
              key={cert}
              className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium"
            >
              <span className="text-accent">
                <Glyph name="shield" />
              </span>
              {cert}
            </div>
          ))}
        </div>
      </Section>

      {/* Feature cards */}
      <Section className="pt-0">
        <div className="text-center">
          <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
            How we protect your data
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Comprehensive controls designed for regulated industries and
            enterprise requirements — on by default.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-border p-6"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                <Glyph name={feature.icon} />
              </div>
              <h3 className="mt-4 text-base font-medium">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
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
