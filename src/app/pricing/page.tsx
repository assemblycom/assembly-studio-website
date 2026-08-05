import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { PricingPlans } from "@/components/pricing/pricing-plans";
import { FeatureComparison } from "@/components/pricing/feature-comparison";
import { PricingCta } from "@/components/pricing/pricing-cta";
import { FAQ } from "@/components/home/faq";
import { PRICING_FAQS } from "@/components/pricing/pricing-faqs";
import { GRID_LINE, GridRails } from "@/components/ui/grid-lines";
import { PAGE_SEO, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(PAGE_SEO.pricing);

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

      {/* Pricing FAQ — matches /security: heading on the left, the divided
          question list on the right, framed by the shared rails. Extra room
          underneath: the FAQ's own py-24 left the last question sitting close to
          the rule and the CTA heading right behind it, so the two sections read
          as one block. */}
      {/* Full-bleed rule into the FAQ, edge to edge like the one before the CTA
          below — the two rules that bracket this section are the same kind. */}
      <div className={`border-t ${GRID_LINE}`} />
      <div className="relative pb-16 md:pb-24">
        <GridRails />
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
