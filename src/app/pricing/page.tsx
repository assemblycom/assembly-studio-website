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
      <section className="px-6 pb-10 pt-24 text-left md:pt-32 md:text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-balance text-4xl font-medium tracking-tight md:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-lg text-muted-foreground md:mx-auto">
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

      {/* Feature comparison — hidden on mobile (like Notion); the wide table
          isn't usable on small screens, where the plan cards cover the need. */}
      <Section className="hidden pt-0 md:block">
        <FeatureComparison />
      </Section>
    </>
  );
}
