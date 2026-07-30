import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { PricingPlans } from "@/components/pricing/pricing-plans";
import { FeatureComparison } from "@/components/pricing/feature-comparison";
import { PricingCta } from "@/components/pricing/pricing-cta";
import { FAQ } from "@/components/home/faq";
import { PRICING_FAQS } from "@/components/pricing/pricing-faqs";

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
          {/* Fixed two-line lockup, matching the landing hero's treatment. */}
          <h1 className="type-display">
            Simple and
            <br />
            transparent pricing
          </h1>
          <p className="type-lead mx-auto mt-6 max-w-2xl text-pretty text-muted-foreground">
            Start on the free forever plan. Upgrade when you’re ready.
          </p>
          {/* CTAs now live on each plan block below (Get started + Book a demo),
              so the hero stays a clean title + subtitle. */}
        </div>
      </section>

      {/* Plans */}
      <Section className="pt-4 pb-6 md:pt-6 md:pb-8">
        <PricingPlans />
      </Section>

      {/* Feature comparison — full table on desktop, a plan-tabbed single-column
          view on mobile (the component handles both layouts). */}
      <Section className="pt-4 pb-8 md:pt-0 md:pb-20">
        <FeatureComparison />
      </Section>

      {/* Full-bleed divider under the table, before the FAQ — spans edge to edge. */}
      <div className="border-t border-border [[data-theme=dark]_&]:border-[#383838]" />

      {/* Pricing FAQ — matches /security: heading on the left, the divided
          question list on the right, wrapped in the same vertical guide rails. */}
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-30 hidden justify-center min-[1200px]:flex"
        >
          <div className="h-full w-full max-w-[1200px] border-x border-border [[data-theme=dark]_&]:border-[#383838]" />
        </div>

        <FAQ items={PRICING_FAQS} twoColumn />
      </div>

      {/* Final CTA — the shared parallax chip-field panel (frameless), matching
          the templates + security pages. */}
      {/* Full-bleed divider before the CTA — spans edge to edge. */}
      <div className="border-t border-border [[data-theme=dark]_&]:border-[#383838]" />

      <PricingCta />
    </>
  );
}
