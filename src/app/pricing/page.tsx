import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { PricingPlans } from "@/components/pricing/pricing-plans";
import { FeatureComparison } from "@/components/pricing/feature-comparison";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for Assembly Studio. Start free and scale as you grow.",
};

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <section className="px-6 pb-10 pt-24 text-center md:pt-32">
        <div className="mx-auto max-w-3xl">
          <h1 className="type-display text-balance">
            Simple, transparent pricing
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
            Start free, scale as you grow. Save ~17% when billed annually.
          </p>
          {/* CTAs now live on each plan block below (Get started + Book a demo),
              so the hero stays a clean title + subtitle. */}
        </div>
      </section>

      {/* Plans */}
      <Section className="pt-4 md:pt-6">
        <PricingPlans />
      </Section>

      {/* Feature comparison — full table on desktop, a plan-tabbed single-column
          view on mobile (the component handles both layouts). */}
      <Section className="pt-0">
        <FeatureComparison />
      </Section>
    </>
  );
}
