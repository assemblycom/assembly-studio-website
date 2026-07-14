"use client";

import { useState } from "react";
import { APP_URL } from "@/lib/constants";

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
    description: "For teams serving more clients.",
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
    description: "For compliance-focused firms.",
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
          className="relative grid w-full grid-cols-2 rounded-lg border border-border p-1 text-base md:inline-grid md:w-auto md:text-sm"
        >
          {/* Sliding thumb — one surface gliding between the halves, so the
              switch animates instead of the fill jumping across. */}
          <span
            aria-hidden
            className={`absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-md bg-foreground transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
              billing === "yearly" ? "translate-x-full" : ""
            }`}
          />
          <button
            role="radio"
            aria-checked={billing === "monthly"}
            onClick={() => setBilling("monthly")}
            className={`relative px-5 py-2 text-center transition-colors duration-300 md:px-4 md:py-1.5 ${
              billing === "monthly"
                ? "text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Monthly
          </button>
          <button
            role="radio"
            aria-checked={billing === "yearly"}
            onClick={() => setBilling("yearly")}
            className={`relative flex items-center justify-center gap-2 px-5 py-2 transition-colors duration-300 md:px-4 md:py-1.5 ${
              billing === "yearly"
                ? "text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Yearly
          </button>
        </div>
      </div>

      {/* Plans — tucked closer under the toggle on mobile; roomier on desktop. */}
      <div className="mt-5 grid gap-6 sm:grid-cols-2 md:mt-12 lg:grid-cols-4">
        {PLANS.map((plan) => {
          const price = billing === "yearly" ? plan.priceYearly : plan.priceMonthly;
          // Original structure kept: filled header panel (price pinned to the
          // bottom) → detached button → features. The only addition is an
          // outline around the WHOLE card (outer wrapper); the header panel no
          // longer carries its own border so the outline reads once, around all.
          return (
            <div
              key={plan.name}
              // The highlighted (most popular) plan swaps its static border
              // for the animated gradient ring — same 1px of layout either way.
              className={`flex flex-col rounded-2xl border p-3 ${
                plan.highlighted ? "plan-ring-popular relative border-transparent" : "border-border"
              }`}
            >
              {/* Filled header panel — uniform light surface across all plans. */}
              <div className="flex min-h-[200px] flex-col justify-between rounded-xl bg-muted p-5">
                <div>
                  <h3 className="text-lg font-medium">{plan.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <AnimatedPrice value={price} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {planSubtitle(plan, billing)}
                  </p>
                </div>
              </div>

              {/* Detached CTA — our standard rounded-lg button. */}
              <a
                href={APP_URL}
                className="mt-3 rounded-lg bg-foreground px-5 py-2.5 text-center text-sm text-background transition-opacity hover:opacity-90"
              >
                {plan.cta}
              </a>

              <div className="mt-6 flex flex-1 flex-col gap-6 px-2 pb-2">
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
