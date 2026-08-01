"use client";

import { useState } from "react";
import { APP_URL, DEMO_URL } from "@/lib/constants";
import { useAuthState } from "@/lib/use-auth";

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
    description: "Free forever for your first clients",
    featureGroups: [
      {
        label: "Fundamentals",
        items: [
          "5 active contacts",
          "1 internal user",
          "50 build credits / month",
        ],
      },
      {
        label: "Includes",
        items: [
          "CRM",
          "Client experience",
          "30+ pre-made apps",
          "App builder",
          "Messaging and team inbox",
          "Billing and payments",
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
    priceMonthly: 49,
    priceYearly: 29,
    description: "For solo entrepreneurs",
    featureGroups: [
      {
        label: "Fundamentals",
        items: [
          "50 active contacts",
          "1 internal user",
          "200 build credits / month",
        ],
      },
      {
        label: "Everything in Free, plus",
        items: [
          "Custom domain",
          "Custom email domain",
          "API & MCP connector",
          "Add-on build credits",
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
    priceMonthly: 139,
    priceYearly: 99,
    description: "For small teams",
    featureGroups: [
      {
        label: "Fundamentals",
        items: [
          "500 active contacts",
          "3 internal users included",
          "200 build credits / month",
        ],
      },
      {
        label: "Everything in Starter, plus",
        items: [
          "Remove Assembly badge",
          "App visibility",
          "Automation builder",
          "AI model selection",
          "Multi-company contacts",
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
    priceMonthly: 599,
    priceYearly: 499,
    description: "For scaling businesses",
    featureGroups: [
      {
        label: "Fundamentals",
        items: [
          "Unlimited active contacts",
          "5 internal users included",
          "200 build credits / month",
        ],
      },
      {
        label: "Everything in Pro, plus",
        items: [
          "Audit log",
          "Client access permissions",
          "Enforced MFA",
          "HIPAA compliance (BAA)",
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
    cta: "Book demo",
    highlighted: false,
  },
];

type Billing = "monthly" | "yearly";

// Enterprise sits BELOW the tier columns as one wide card (so adding it never
// pushes the grid to five columns). Minimal: a label + one-line pitch, with the
// demo CTA on the right — no perk grid, so it reads as a quiet footnote to the
// tiers rather than a fifth plan. It's a standalone outlined card detached from
// the plans table above (gap, not a shared border) at every breakpoint.
function EnterpriseCard() {
  return (
    // Same 4-column grid as the tiers so the heading, perks, and CTA line up
    // under the columns above (heading | perks | perks | CTA). No dividers
    // between them: the grid already does the separating, and four hairlines
    // inside one row made it read as a second table under the real one.
    // Keeps its fill on desktop dark, like the tier columns above it — dropped
    // there, this card was the one row of the pricing table still sitting on the
    // page's own near-black.
    <div className="mt-6 rounded-2xl border border-border bg-card px-6 py-5 md:px-8 lg:rounded-xl lg:p-0">
      {/* Phones stack with tight spacing (the two perk groups read as one
          list); from 560 — where the tiers above go two up — the perks split
          into their two columns and the CTA stops running the full width of the
          card; desktop is the 4-column grid with inset dividers. */}
      <div className="flex flex-col min-[560px]:grid min-[560px]:grid-cols-2 min-[560px]:gap-x-8 lg:grid-cols-4 lg:gap-0">
        <div className="min-[560px]:col-span-2 lg:col-span-1 lg:p-6">
          <h3 className="text-base font-medium text-foreground">Enterprise</h3>
        </div>
        {[
          ["Unlimited users, contacts, and apps", "Custom SSO"],
          ["Volume-based build credits", "Dedicated architect & success manager"],
        ].map((col, i) => (
          <ul
            key={i}
            className={`relative flex cursor-default flex-col gap-2.5 min-[560px]:mt-5 lg:mt-0 lg:p-6 ${
              i === 0 ? "mt-5" : "mt-2.5"
            }`}
          >
            {col.map((item) => (
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
        ))}
        {/* CTA column — solid dark fill, matching the tier buttons. */}
        <div className="relative mt-5 min-[560px]:col-span-2 lg:col-span-1 lg:mt-0 lg:flex lg:items-center lg:p-6">
          {/* Full width only on a phone. Across a two-column card it became a
              600px-wide button, which reads as a banner rather than a control. */}
          <a
            href={DEMO_URL}
            className="block w-full rounded-lg bg-foreground px-5 py-2 text-center text-sm text-background transition-opacity hover:opacity-90 min-[560px]:inline-block min-[560px]:w-auto min-[560px]:px-8 lg:block lg:w-full lg:px-5"
          >
            Contact sales
          </a>
        </div>
      </div>
    </div>
  );
}

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
      {/* Invisible copy of the target digit sizes the column to THAT digit's
          natural width — otherwise a narrow "1" sat in a box as wide as the
          widest digit, leaving a gap before the next digit. The animated strip
          is overlaid absolutely and clipped to this width. */}
      <span aria-hidden className="invisible">
        {value}
      </span>
      <span
        className="absolute inset-0 flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ transform: `translateY(-${value}em)` }}
      >
        {Array.from({ length: 10 }, (_, n) => (
          <span
            key={n}
            className="flex h-[1em] items-center justify-center leading-none"
          >
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
  const [billing, setBilling] = useState<Billing>("yearly");
  // Signed-in visitors already have a plan, so the Free tier is noise — drop it
  // and show only the paid upgrade paths.
  const { authed } = useAuthState();
  const plans = authed ? PLANS.filter((plan) => plan.priceMonthly > 0) : PLANS;

  return (
    // Cap the width only while the cards are in one column (<560px), so a lone
    // card doesn't stretch across a small tablet. Past that the grid is two up
    // and the cap has to lift, or the pair sits squeezed into 448px with the
    // page's margins going to waste on either side.
    <div className="mx-auto max-w-md min-[560px]:max-w-none">
      {/* Billing toggle — enlarged on mobile (bigger tap targets, matches the
          left-aligned hero); settles back to the compact size on desktop. */}
      <div className="flex justify-start md:justify-center">
        <div
          role="radiogroup"
          aria-label="Billing period"
          className="relative grid w-full grid-cols-2 rounded-lg border border-border p-1 text-base md:inline-grid md:w-auto md:text-sm"
        >
          {/* Sliding thumb — carries the active-coloured labels inside a clipped
              window, so the highlight is REVEALED as the thumb glides rather
              than cross-fading the button text (which dipped through a
              low-contrast state on switch — the "blink"). The inner label strip
              counter-slides to stay aligned with the base labels below. */}
          <span
            aria-hidden
            className={`pointer-events-none absolute inset-y-1 left-1 z-10 w-[calc(50%-0.25rem)] overflow-hidden rounded-md bg-foreground transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
              billing === "yearly" ? "translate-x-full" : ""
            }`}
          >
            <span
              className={`absolute inset-0 grid w-[200%] grid-cols-2 text-background transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                billing === "yearly" ? "-translate-x-1/2" : ""
              }`}
            >
              <span className="flex items-center justify-center">
                <span className="hidden md:inline">Pay&nbsp;</span>Monthly
              </span>
              <span className="flex items-center justify-center">
                <span className="hidden md:inline">Pay&nbsp;</span>Yearly
              </span>
            </span>
          </span>
          <button
            role="radio"
            aria-checked={billing === "monthly"}
            onClick={() => setBilling("monthly")}
            className="relative px-5 py-2 text-center text-muted-foreground transition-colors hover:text-foreground md:px-4 md:py-1.5"
          >
            <span className="hidden md:inline">Pay&nbsp;</span>Monthly
          </button>
          <button
            role="radio"
            aria-checked={billing === "yearly"}
            onClick={() => setBilling("yearly")}
            className="relative px-5 py-2 text-center text-muted-foreground transition-colors hover:text-foreground md:px-4 md:py-1.5"
          >
            <span className="hidden md:inline">Pay&nbsp;</span>Yearly
          </button>
        </div>
      </div>

      {/* Plans — tucked closer under the toggle on mobile; roomier on desktop.
          Column count tracks the visible plans so hiding Free (signed-in)
          reflows to three even columns rather than leaving a gap. */}
      <div className="mt-5 md:mt-12 lg:overflow-hidden lg:rounded-xl">
        <div
          // Two up from 560 rather than sm's 640: between those widths a single
          // column left the cards running the full width of the page with the
          // price stranded on one side of it.
          className={`grid gap-6 min-[560px]:grid-cols-2 lg:gap-0 lg:grid-rows-[auto_auto_auto_auto_auto] ${
            plans.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"
          }`}
        >
        {plans.map((plan, idx) => {
          const price = billing === "yearly" ? plan.priceYearly : plan.priceMonthly;
          // The card AFTER the highlighted one drops its gray left divider, so
          // it doesn't double the highlighted card's blue right edge.
          const dropLeftDivider = plans[idx - 1]?.highlighted;
          // Original structure kept: filled header panel (price pinned to the
          // bottom) → detached button → features. The only addition is an
          // outline around the WHOLE card (outer wrapper); the header panel no
          // longer carries its own border so the outline reads once, around all.
          return (
            <div
              key={plan.name}
              // Every card carries a subtle filled surface so the outline reads
              // as an edge rather than the brightest thing on the card. The
              // highlighted plan is marked only by its "Most popular" tag; its
              // border matches every other card so no card outshouts the rest.
              // The desktop grid drops the card fill so the four columns read as
              // one table on the light page. In dark that left the whole table
              // on the page's near-black with nothing but hairlines to hold it,
              // so there the fill stays on at every width.
              className={`relative isolate flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card p-4 lg:grid lg:grid-rows-subgrid lg:row-span-5 lg:rounded-none lg:border-y lg:border-l lg:border-r-0 lg:border-solid lg:border-border lg:bg-transparent lg:[[data-theme=dark]_&]:bg-card lg:p-6 lg:first:!rounded-l-xl lg:last:!rounded-r-xl lg:[&:last-child]:border-r ${
                dropLeftDivider ? "lg:[[data-theme=dark]_&]:border-l-0" : ""
              } ${
                plan.highlighted
                  ? "[[data-theme=dark]_&]:!border-[#7DA4FF]/40 lg:[[data-theme=dark]_&]:border-r lg:[[data-theme=dark]_&]:[border-image:linear-gradient(to_bottom,rgba(125,164,255,0.55),#383838_75%)_1]"
                  : ""
              }`}
            >
              {/* Aurora wash blooming up from behind the header panel (-z-10
                  inside an isolated context). Every card carries one now, so the
                  four read as one set; only the highlighted plan's is brand
                  blue, the rest take a neutral gray at the same lengths. */}
              <div
                aria-hidden
                className={`pointer-events-none absolute inset-0 -z-10 ${
                  plan.highlighted
                    ? "[background:linear-gradient(to_bottom,#7DA4FF,transparent_180px)] lg:[background:linear-gradient(to_bottom,#7DA4FF,transparent_224px)] [[data-theme=dark]_&]:[background:linear-gradient(to_bottom,rgba(125,164,255,0.28),transparent_170px)]"
                    // Palette tokens, not hand-mixed grays. Light takes --muted,
                    // its surface tone on white. Dark has no token between
                    // --muted (a hair off the card, so it barely showed) and
                    // --border (a bright band across the top), so it takes the
                    // hairline tone held back to just over half — derived from
                    // the scale rather than a new gray. Dark matches the
                    // highlighted plan's 170px fade.
                    : "[background:linear-gradient(to_bottom,var(--muted),transparent_180px)] lg:[background:linear-gradient(to_bottom,var(--muted),transparent_224px)] [[data-theme=dark]_&]:[background:linear-gradient(to_bottom,color-mix(in_srgb,var(--border)_55%,transparent),transparent_170px)]"
                }`}
              />

              {/* Header panel holding the price block. Opaque, and squared off at
                  the bottom: it masks the middle of the bloom so the wash reads
                  as a halo around the panel rather than a tint across the card. */}
              <div
                // lg:bg-background is what hides this panel against the unfilled
                // desktop card while still masking the aurora. In dark the card
                // carries a fill, so the page black would read as a hole punched
                // in it — take the card's own tone there.
                className="flex min-h-[200px] flex-col justify-between rounded-xl rounded-b-none border border-transparent bg-card p-5 lg:bg-background lg:[[data-theme=dark]_&]:bg-card"
              >
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

              {/* Detached CTA — our standard rounded-lg button. "Book demo"
                  plans route to the demo page; the rest to signup. */}
              <a
                href={plan.cta === "Book demo" ? DEMO_URL : APP_URL}
                className="mt-3 rounded-lg bg-foreground px-5 py-2 text-center text-sm text-background transition-opacity hover:opacity-90"
              >
                {plan.cta}
              </a>

              <div className="mt-6 flex flex-1 cursor-default flex-col px-2 pb-2 lg:contents">
                {plan.featureGroups.map((group) => (
                  <div
                    key={group.label}
                    className="border-t border-border pt-5 [&:not(:first-child)]:mt-5"
                  >
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

      {/* Enterprise — a standalone outlined card below the plans table, detached
          by a gap rather than sharing the table's border. */}
      <EnterpriseCard />
    </div>
  );
}
