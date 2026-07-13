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
};

// Second story — a security/compliance-led case study shown as a text-only
// (no photo) quiet card beside the Capital One spotlight. Facts drawn from
// the Metta Health case study (see src/lib/case-studies.ts).
const SPOTLIGHT_SECURITY = {
  company: "Metta Health",
  href: "/customers/metta-health",
  eyebrow: "Metta Health",
  title:
    "How Metta Health scales HIPAA-compliant patient authorizations with Assembly",
  stat: { value: "50+", label: "Authorization templates managed" },
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
          <h1 className="type-display text-balance">
            Don&apos;t let AI generate your{" "}
            <br className="hidden md:block" />
            software security
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base text-muted-foreground md:text-lg">
            Build as fast as you want. Encryption, access controls, and
            certifications are engineered, audited, and on by default.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={DEMO_URL}
              className="rounded-lg bg-foreground px-5 py-2.5 text-sm text-background transition-opacity hover:opacity-90"
            >
              Book demo
            </a>
            <a
              href={TRUST_CENTER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-border bg-background px-5 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
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
            <h2 className="type-h2">
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
                className="border-t border-border py-8 first:border-t-0 first:pt-0 md:grid md:grid-cols-[auto_1fr] md:gap-x-6"
              >
                <span className="mb-3 block font-mono text-sm tabular-nums tracking-widest text-muted-foreground md:mb-0 md:pt-0.5">
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
          <h2 className="type-h3">
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
          <h2 className="type-h2 max-w-2xl">
            See how enterprises trust Assembly at scale
          </h2>

          {/* Three-panel band, à la Paraform: the Capital One story reads as
              text (left) + photo (middle) inside one card, and the Metta Health
              story is the dark contrast card (right). Each card is its own link. */}
          <div className="mt-10 grid items-stretch gap-4 md:grid-cols-3">
            {/* Card 1 — Capital One: text + photo, spanning two columns. */}
            <a
              href={SPOTLIGHT.href}
              className="group grid overflow-hidden rounded-3xl border border-border md:col-span-2 md:grid-cols-2"
            >
              {/* Text (left on desktop, below the photo on mobile). */}
              <div className="order-2 flex flex-col justify-between p-6 md:order-1 md:p-8">
                <div>
                  <p className="font-[family-name:var(--font-diatype-mono)] text-xs uppercase tracking-wide text-muted-foreground">
                    Customer story
                  </p>
                  {/* font-normal — on this site 500 loads PP Mori SemiBold,
                      which reads bold inside these cards. Sized a step below
                      the section scale so the cards read calm, not shouty. */}
                  <h3 className="mt-4 max-w-sm text-xl font-normal leading-snug">
                    {SPOTLIGHT.title}
                  </h3>
                </div>
                <span className="mt-10 inline-flex w-fit items-center gap-2 text-sm">
                  Read the story
                  <span
                    aria-hidden
                    className="transition-transform group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </span>
              </div>
              {/* Photo (middle overall) with the stat overlay. Fills the card's
                  height on desktop; a fixed aspect on mobile. */}
              <div className="relative order-1 aspect-[4/3] overflow-hidden md:order-2 md:aspect-auto">
                <Image
                  src={SPOTLIGHT.image}
                  alt={SPOTLIGHT.company}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                {/* Always white — this sits on the photo's dark gradient, not the
                    page surface, so it must not follow the (dark) page theme. */}
                <div className="absolute bottom-6 left-6 text-white">
                  <p className="text-sm text-white/80">{SPOTLIGHT.stat.label}</p>
                  <p className="text-4xl font-normal tracking-tight">
                    {SPOTLIGHT.stat.value}
                  </p>
                </div>
              </div>
            </a>

            {/* Card 2 — security/compliance story, no photo. Quiet muted
                surface; the big stat carries the card instead of body copy. */}
            <a
              href={SPOTLIGHT_SECURITY.href}
              className="group flex flex-col justify-between rounded-3xl bg-muted p-6 md:p-8"
            >
              <div>
                <p className="font-[family-name:var(--font-diatype-mono)] text-xs uppercase tracking-wide text-muted-foreground">
                  {SPOTLIGHT_SECURITY.eyebrow}
                </p>
                <h3 className="mt-4 max-w-sm text-xl font-normal leading-snug">
                  {SPOTLIGHT_SECURITY.title}
                </h3>
              </div>
              <div className="mt-8">
                <p className="text-5xl font-normal tracking-tight md:text-6xl">
                  {SPOTLIGHT_SECURITY.stat.value}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {SPOTLIGHT_SECURITY.stat.label}
                </p>
                <span className="mt-6 inline-flex w-fit items-center gap-2 text-sm">
                  Read the story
                  <span
                    aria-hidden
                    className="transition-transform group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </span>
              </div>
            </a>
          </div>
        </div>
      </Section>

      {/* Security FAQ */}
      <FAQ heading="Security FAQ" items={SECURITY_FAQS} />

      {/* Final CTA — generous padding to match the templates page CTA. */}
      <section className="px-6 py-14 md:py-20">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-6 py-16 md:py-24">
          <div className="text-center">
          <h2 className="type-h2 mx-auto max-w-2xl text-balance">
            Build AI apps on a trusted platform
          </h2>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={DEMO_URL}
              className="rounded-lg bg-foreground px-5 py-2.5 text-sm text-background transition-opacity hover:opacity-90"
            >
              Book demo
            </a>
            <a
              href={TRUST_CENTER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-foreground/25 bg-background px-5 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
            >
              Explore Trust Center
            </a>
          </div>
          </div>
        </div>
      </section>
    </>
  );
}
