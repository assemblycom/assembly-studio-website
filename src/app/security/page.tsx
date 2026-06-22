import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { FAQ } from "@/components/home/faq";

export const metadata: Metadata = {
  title: "Security",
  description:
    "Enterprise-grade security for your AI workflows. SOC 2 compliant, end-to-end encrypted, and built for regulated industries.",
};

const SECURITY_FEATURES = [
  {
    title: "SOC 2 Type II",
    description:
      "Independently audited controls for security, availability, and confidentiality.",
  },
  {
    title: "End-to-end encryption",
    description:
      "All data is encrypted in transit (TLS 1.3) and at rest (AES-256).",
  },
  {
    title: "Role-based access",
    description:
      "Fine-grained permissions ensure team members only access what they need.",
  },
  {
    title: "SSO & SAML",
    description:
      "Enterprise single sign-on with SAML 2.0 support for seamless authentication.",
  },
  {
    title: "Data residency",
    description:
      "Choose where your data is stored to meet regional compliance requirements.",
  },
  {
    title: "Audit logging",
    description:
      "Comprehensive audit trail of all actions for compliance and forensic analysis.",
  },
  {
    title: "HIPAA ready",
    description:
      "BAA available for healthcare customers requiring HIPAA compliance.",
  },
  {
    title: "Penetration tested",
    description:
      "Regular third-party penetration testing with published security advisories.",
  },
];

export default function SecurityPage() {
  return (
    <>
      {/* Hero */}
      <section className="px-6 pb-16 pt-24 text-center md:pt-32">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-medium tracking-tight md:text-5xl">
            Enterprise-grade security
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Your data security is our top priority. Assembly Studio is built
            from the ground up with the controls and compliance certifications
            that enterprises require.
          </p>
        </div>
      </section>

      {/* Social proof */}
      <Section className="bg-muted">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm text-muted-foreground">
            Trusted by security-conscious enterprises
          </p>
          <div className="mt-4 flex items-center justify-center gap-8 opacity-40">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-8 w-28 rounded bg-muted-foreground/20"
              />
            ))}
          </div>
        </div>
      </Section>

      {/* Security features */}
      <Section>
        <div className="text-center">
          <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
            Security features
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Comprehensive security controls designed for regulated industries
            and enterprise requirements.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {SECURITY_FEATURES.map((feature) => (
            <div key={feature.title}>
              <h3 className="text-sm font-medium">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* FAQ - reuses home FAQ with security-relevant questions */}
      <FAQ />
    </>
  );
}
