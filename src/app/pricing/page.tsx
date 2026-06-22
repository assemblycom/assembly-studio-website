import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { APP_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for Assembly Studio. Start free and scale as you grow.",
};

interface PlanFeatureGroup {
  label: string;
  items: string[];
}

interface Plan {
  name: string;
  price: string;
  period: string;
  subtitle: string;
  description: string;
  featureGroups: PlanFeatureGroup[];
  cta: string;
  highlighted: boolean;
}

const PLANS: Plan[] = [
  {
    name: "Free",
    price: "$0",
    period: "",
    subtitle: "Free forever",
    description: "Try Studio with a live client.",
    featureGroups: [
      {
        label: "Fundamentals",
        items: [
          "5 active contacts",
          "1 internal user",
          "30 build credits / month",
        ],
      },
      {
        label: "Includes",
        items: [
          "CRM",
          "Client experience",
          "App builder",
          "Messaging and team inbox",
          "Billing and payments",
          "Contracts, forms, file-sharing, and tasks",
        ],
      },
      {
        label: "Support",
        items: ["Community support"],
      },
    ],
    cta: "Get started",
    highlighted: false,
  },
  {
    name: "Starter",
    price: "$29",
    period: "/mo",
    subtitle: "Billed monthly",
    description: "For solo firms getting set up.",
    featureGroups: [
      {
        label: "Fundamentals",
        items: [
          "50 active contacts",
          "1 internal user",
          "100 build credits / month",
        ],
      },
      {
        label: "Everything in Free, plus",
        items: [
          "API, Zapier & Make",
          "Custom domain for client experience",
          "Custom email domain for notifications",
        ],
      },
      {
        label: "Support",
        items: ["Email support"],
      },
    ],
    cta: "Get started",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "$99",
    period: "/mo",
    subtitle: "Billed monthly",
    description: "For growing teams serving more clients.",
    featureGroups: [
      {
        label: "Fundamentals",
        items: [
          "500 active contacts",
          "3 internal users (+$39/user)",
          "300 build credits / month",
        ],
      },
      {
        label: "Everything in Starter, plus",
        items: [
          "Full white-labeling",
          "App visibility",
          "Automations",
          "Multi-company clients",
        ],
      },
      {
        label: "Support",
        items: ["Priority email support"],
      },
    ],
    cta: "Get started",
    highlighted: true,
  },
  {
    name: "Advanced",
    price: "$299",
    period: "/mo",
    subtitle: "Billed monthly",
    description: "For scaling firms with compliance needs.",
    featureGroups: [
      {
        label: "Fundamentals",
        items: [
          "Unlimited active contacts",
          "5 internal users (+$59/user)",
          "1,000 build credits / month",
        ],
      },
      {
        label: "Everything in Pro, plus",
        items: [
          "Audit log",
          "Client access permissions",
          "Advanced security",
          "HIPAA compliance",
        ],
      },
      {
        label: "Support",
        items: [
          "Priority email support",
          "Priority call support",
          "Personalized onboarding",
        ],
      },
    ],
    cta: "Get started",
    highlighted: false,
  },
];

function CheckIcon() {
  return (
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
  );
}

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
            Start free, scale as you grow. Save ~17% when billed annually.
          </p>
        </div>
      </section>

      {/* Plans */}
      <Section>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col rounded-xl border p-8 ${
                plan.highlighted
                  ? "border-foreground"
                  : "border-border"
              }`}
            >
              <h3 className="text-lg font-medium">{plan.name}</h3>
              <p className="mt-1 min-h-[40px] text-sm text-muted-foreground">
                {plan.description}
              </p>

              <div className="mt-6 flex items-baseline">
                <span className="text-4xl font-medium">{plan.price}</span>
                {plan.period && (
                  <span className="ml-1 text-muted-foreground">
                    {plan.period}
                  </span>
                )}
              </div>
              <p className="mt-1 min-h-[16px] text-xs text-muted-foreground">
                {plan.subtitle}
              </p>

              <a
                href={APP_URL}
                className={`mt-6 rounded-lg px-6 py-3 text-center text-sm transition-opacity hover:opacity-90 ${
                  plan.highlighted
                    ? "bg-foreground text-background"
                    : "border border-border text-foreground hover:bg-muted"
                }`}
              >
                {plan.cta}
              </a>

              <div className="mt-8 flex flex-1 flex-col gap-6">
                {plan.featureGroups.map((group) => (
                  <div key={group.label}>
                    <p className="text-sm font-medium">{group.label}</p>
                    <ul className="mt-3 flex flex-col gap-2.5">
                      {group.items.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <span className="mt-0.5">
                            <CheckIcon />
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
