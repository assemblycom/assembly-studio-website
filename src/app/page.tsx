import { HeroV76 } from "@/components/home/hero-v76";
import { HowItWorks } from "@/components/home/how-it-works";
import { TrustTicker } from "@/components/home/trust-ticker";
import { Testimonials } from "@/components/home/testimonials";
import { HomeFAQ } from "@/components/home/faq";
import { CTA } from "@/components/home/cta";
import { ProductionGap } from "@/components/home/production-gap";
import { WholeStack } from "@/components/home/whole-stack";
import { Reveal } from "@/components/ui/reveal";

export default function HomePage() {
  return (
    <>
      {/* Upper half shares the hero's surface — the walkthrough sits on the
          same color as the hero (see .section-follow), so they read as one
          canvas. */}
      <HeroV76 />

      {/* Content region. The grid is gone entirely — the vertical rails that
          framed this column and the horizontal rules between sections. Together
          they implied a system the rest of the page never honoured, and against
          the hero's full bleed they competed with the centred column they were
          meant to define. Sections are separated by their own vertical rhythm.
          (The TrustTicker still carries its own bottom rule; that one belongs to
          the band, not to the grid.) */}
      <div className="relative">

        {/* The "how it works" walkthrough comes first, then the three platform
            points (left-rail menu + visual). */}
        <div className="section-follow">
          {/* Fade-only (no rise): the ticker's own colored band made the
              translate read as the whole block sliding on load. */}
          <Reveal variant="fade">
            <TrustTicker />
          </Reveal>
          <Reveal>
            <HowItWorks />
          </Reveal>
          <Reveal>
            <ProductionGap />
          </Reveal>
        </div>


        {/* The lower half stays on the light hero surface too, so the whole page
            reads as one continuous light canvas until the dark CTA + footer.
            Order: testimonials → whole stack → FAQ. */}
        <div className="section-follow relative z-10">
          <Reveal>
            <Testimonials />
          </Reveal>
          <Reveal>
            <WholeStack />
          </Reveal>
          <Reveal>
            <HomeFAQ />
          </Reveal>
        </div>


        <div className="relative z-20">
          <CTA />
        </div>
      </div>
    </>
  );
}
