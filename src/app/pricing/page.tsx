import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { APP_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for Assembly Studio. Start free and scale as you grow.",
};

const PLANS = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "For individuals exploring AI workflows.",
    features: [
      "Up to 3 workflows",
      "1,000 runs per month",
      "Community support",
      "Core templates",
    ],
    cta: "Get started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$49",
    period: "/month",
    description: "For teams building production workflows.",
    features: [
      "Unlimited workflows",
      "10,000 runs per month",
      "Priority support",
      "All templates",
      "Team collaboration",
      "Custom integrations",
    ],
    cta: "Start free trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For organizations with advanced requirements.",
    features: [
      "Unlimited everything",
      "SSO & SAML",
      "Dedicated support",
      "Custom SLA",
      "Data residency",
      "Audit logging",
      "HIPAA & SOC 2",
    ],
    cta: "Contact sales",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <section className="px-6 pb-16 pt-24 text-center md:pt-32">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-medium tracking-tight md:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Start free, scale as you grow. No hidden fees, no surprises.
          </p>
        </div>
      </section>

      {/* Plans */}
      <Section>
        <div className="grid gap-8 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col rounded-xl border p-8 ${
                plan.highlighted
                  ? "border-accent bg-accent/5"
                  : "border-border"
              }`}
            >
              <h3 className="text-lg font-medium">{plan.name}</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-medium">{plan.price}</span>
                {plan.period && (
                  <span className="ml-1 text-muted-foreground">
                    {plan.period}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {plan.description}
              </p>

              <ul className="mt-8 flex flex-1 flex-col gap-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="shrink-0 text-accent"
                    >
                      <path
                        d="M4 8l2.5 2.5L12 5.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <a
                href={APP_URL}
                className={`mt-8 rounded-lg px-6 py-3 text-center text-sm transition-opacity hover:opacity-90 ${
                  plan.highlighted
                    ? "bg-accent text-accent-foreground"
                    : "border border-border text-foreground hover:bg-muted"
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
