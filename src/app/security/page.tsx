import type { Metadata } from "next";
import Image from "next/image";
import { Section } from "@/components/ui/section";
import { FAQ, type FAQEntry } from "@/components/home/faq";
import { SecurityBenchmark } from "@/components/security/security-benchmark";
import { DEMO_URL, TRUST_CENTER_URL } from "@/lib/constants";

// Curated customer spotlight for the social-proof band — teaser for the full
// Capital One Luxury Travel case study (see src/lib/case-studies.ts).
const SPOTLIGHT = {
  company: "Capital One Luxury Travel",
  href: "/customers/capital-one-luxury-travel",
  image: "/images/customers/capital-one-luxury-travel.jpg",
  stat: { value: "1,100+", label: "Hotel partners onboarded" },
  title:
    "How Capital One Luxury Travel balanced 'build vs. buy' with Assembly",
  quote:
    "Before Assembly, we managed hotel partners through spreadsheets and email chains — it just didn't scale.",
  person: {
    name: "Phillip LaRue",
    role: "Sr. Director of Luxury Travel at Capital One",
  },
};

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
      {/* Hero — a light, centered lede matching the Templates page (no dark
          card); the plain light nav sits above it on the white page. */}
      <section className="px-6 pb-24 pt-24 text-center md:pb-36 md:pt-32">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-medium tracking-tight md:text-5xl">
            Don&apos;t let AI generate your
            <br />
            software security
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Build as fast as you want. The encryption, access controls, and
            certifications underneath are engineered, audited, and on by
            default — never left to chance.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={DEMO_URL}
              className="rounded-full bg-foreground px-6 py-2.5 text-sm text-background transition-opacity hover:opacity-90"
            >
              Book demo
            </a>
            <a
              href={TRUST_CENTER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border bg-background px-6 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
            >
              View Trust Center
            </a>
          </div>
        </div>
      </section>

      {/* What makes Assembly Studio different */}
      <Section className="pt-16 md:pt-24">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2 md:gap-16">
          {/* Left — heading stays in view while the list scrolls */}
          <div className="md:sticky md:top-28 md:self-start">
            <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
              What makes Assembly Studio different
            </h2>
            <p className="mt-6 max-w-md text-muted-foreground">
              Apps you build inherit the platform&apos;s security model — you
              don&apos;t wire it up yourself.
            </p>
          </div>

          {/* Right — numbered primitives, divided rows */}
          <ul>
            {DIFFERENTIATORS.map((card, i) => (
              <li
                key={card.title}
                className="grid grid-cols-[auto_1fr] gap-x-6 border-t border-border py-8 first:border-t-0 first:pt-0"
              >
                <span className="pt-0.5 font-mono text-sm tabular-nums tracking-widest text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
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
      </Section>

      {/* Comparison — capability benchmark across AI app builders */}
      <Section className="pt-16 md:pt-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-medium tracking-tight md:text-3xl">
            Assembly vs. other AI app builders
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Standalone-app generators can scaffold security — you own and
            maintain it. Assembly apps inherit the platform&apos;s controls.
          </p>
        </div>
        <SecurityBenchmark />
      </Section>

      {/* Social proof — customer spotlight */}
      <Section className="pt-0">
        <div className="mx-auto max-w-6xl">
          <h2 className="max-w-2xl text-3xl font-medium tracking-tight md:text-4xl">
            See how enterprises trust Assembly at scale
          </h2>

          <div className="mt-10 grid gap-4 overflow-hidden rounded-3xl border border-border p-3 md:min-h-[480px] md:grid-cols-2 md:p-4">
            {/* Left — photo with a stat overlay */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl md:aspect-auto">
              <Image
                src={SPOTLIGHT.image}
                alt={SPOTLIGHT.company}
                fill
                sizes="(min-width: 768px) 45vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
              <div className="absolute bottom-6 left-6 text-background">
                <p className="text-sm text-background/80">
                  {SPOTLIGHT.stat.label}
                </p>
                <p className="text-4xl font-medium tracking-tight">
                  {SPOTLIGHT.stat.value}
                </p>
              </div>
            </div>

            {/* Right — headline, pull quote, attribution, CTA (centered so the
                card doesn't leave a big empty band at the bottom) */}
            <div className="flex flex-col justify-center gap-5 px-2 py-6 md:px-10 md:py-12">
              <p className="text-sm text-muted-foreground">Customer story</p>
              <h3 className="text-2xl font-medium tracking-tight">
                {SPOTLIGHT.title}
              </h3>
              <blockquote className="border-l-2 border-border pl-4 leading-relaxed text-muted-foreground">
                &ldquo;{SPOTLIGHT.quote}&rdquo;
              </blockquote>
              <div className="flex items-center gap-3">
                <Image
                  src={SPOTLIGHT.image}
                  alt={SPOTLIGHT.person.name}
                  width={96}
                  height={96}
                  className="size-10 rounded-full object-cover"
                />
                <div>
                  <div className="text-sm font-medium">
                    {SPOTLIGHT.person.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {SPOTLIGHT.person.role}
                  </div>
                </div>
              </div>
              <a
                href={SPOTLIGHT.href}
                className="group mt-1 inline-flex w-fit items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm text-background transition-opacity hover:opacity-90"
              >
                Read the story
                <span
                  aria-hidden
                  className="transition-transform group-hover:translate-x-0.5"
                >
                  →
                </span>
              </a>
            </div>
          </div>
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
