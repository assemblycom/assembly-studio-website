"use client";

import { useState } from "react";
import Link from "next/link";
import { APP_URL, DEMO_URL } from "@/lib/constants";

interface PlanFeatureGroup {
  label: string;
  items: string[];
}

interface Plan {
  name: string;
  priceMonthly: number;
  priceYearly: number; // effective per-month price when billed annually
  description: string;
  featureGroups: PlanFeatureGroup[];
  cta: string;
  highlighted: boolean;
}

const PLANS: Plan[] = [
  {
    name: "Free",
    priceMonthly: 0,
    priceYearly: 0,
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
    priceMonthly: 29,
    priceYearly: 24,
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
    priceMonthly: 99,
    priceYearly: 82,
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
    priceMonthly: 299,
    priceYearly: 249,
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

type Billing = "monthly" | "yearly";

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

function planSubtitle(plan: Plan, billing: Billing) {
  if (plan.priceMonthly === 0) return "Free forever";
  return billing === "yearly" ? "Billed annually" : "Billed monthly";
}

/**
 * A single odometer digit: a vertical 0–9 strip that slides to the target digit
 * whenever `value` changes, giving the firecrawl-style rolling price effect.
 */
function RollingDigit({ value }: { value: number }) {
  return (
    <span className="relative inline-flex h-[1em] overflow-hidden tabular-nums">
      <span
        className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ transform: `translateY(-${value}em)` }}
      >
        {Array.from({ length: 10 }, (_, n) => (
          <span key={n} className="flex h-[1em] items-center leading-none">
            {n}
          </span>
        ))}
      </span>
    </span>
  );
}

function AnimatedPrice({ value }: { value: number }) {
  const digits = String(value).split("");
  return (
    <span className="inline-flex items-baseline text-4xl font-medium">
      <span>$</span>
      {digits.map((d, i) => (
        <RollingDigit key={i} value={Number(d)} />
      ))}
    </span>
  );
}

export function PricingPlans() {
  const [billing, setBilling] = useState<Billing>("monthly");

  return (
    <div>
      {/* Billing toggle — enlarged on mobile (bigger tap targets, matches the
          left-aligned hero); settles back to the compact size on desktop. */}
      <div className="flex justify-start md:justify-center">
        <div
          role="radiogroup"
          aria-label="Billing period"
          className="inline-flex items-center gap-1 rounded-full border border-border p-1.5 text-base md:p-1 md:text-sm"
        >
          <button
            role="radio"
            aria-checked={billing === "monthly"}
            onClick={() => setBilling("monthly")}
            className={`rounded-full px-5 py-2.5 transition-colors md:px-4 md:py-1.5 ${
              billing === "monthly"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Monthly
          </button>
          <button
            role="radio"
            aria-checked={billing === "yearly"}
            onClick={() => setBilling("yearly")}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 transition-colors md:px-4 md:py-1.5 ${
              billing === "yearly"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Yearly
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                billing === "yearly"
                  ? "bg-background/20 text-background"
                  : "bg-accent/10 text-accent"
              }`}
            >
              Save 17%
            </span>
          </button>
        </div>
      </div>

      {/* Plans — tucked closer under the toggle on mobile; roomier on desktop. */}
      <div className="mt-5 grid gap-6 sm:grid-cols-2 md:mt-12 lg:grid-cols-4">
        {PLANS.map((plan) => {
          const price = billing === "yearly" ? plan.priceYearly : plan.priceMonthly;
          return (
            <div
              key={plan.name}
              className={`flex flex-col rounded-xl border p-8 ${
                plan.highlighted ? "border-foreground" : "border-border"
              }`}
            >
              <h3 className="text-lg font-medium">{plan.name}</h3>
              <p className="mt-1 min-h-[40px] text-sm text-muted-foreground">
                {plan.description}
              </p>

              <div className="mt-6 flex items-baseline">
                <AnimatedPrice value={price} />
                {plan.priceMonthly > 0 && (
                  <span className="ml-1 text-muted-foreground">/mo</span>
                )}
              </div>
              <p className="mt-1 min-h-[16px] text-xs text-muted-foreground">
                {planSubtitle(plan, billing)}
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
              {/* Secondary CTA under each plan — a quiet "Book a demo" so it
                  doesn't compete with the primary Get started action. */}
              <Link
                href={DEMO_URL}
                className="mt-2 rounded-lg px-6 py-3 text-center text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Book a demo
              </Link>

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
          );
        })}
      </div>
    </div>
  );
}
