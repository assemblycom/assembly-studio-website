import { HeroV76 } from "@/components/home/hero-v76";
import { HeroAurora } from "@/components/home/hero-aurora";
import { HowItWorks } from "@/components/home/how-it-works";
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
          canvas. How it works fades only (no transform) to keep its sticky
          scroll-spy nav working. */}
      <HeroV76 />
      {/* Brand aurora spilling out of the hero into the walkthrough — the
          footer aurora, flipped (see HeroAurora). */}
      <HeroAurora />
      <div className="section-follow">
        <Reveal variant="fade">
          <HowItWorks />
        </Reveal>
      </div>

      {/* The lower half stays on the light hero surface too, so the whole page
          reads as one continuous light canvas until the dark CTA + footer.
          Order: production gap → whole stack → testimonials → FAQ (per the
          landing narrative doc page map — no pricing or replace-tools
          sections; the final CTA carries the free-plan line instead). */}
      <div className="section-follow relative z-10">
        <Reveal>
          <ProductionGap />
        </Reveal>
        <Reveal>
          <WholeStack />
        </Reveal>
        <Reveal>
          <Testimonials />
        </Reveal>
        <Reveal>
          <HomeFAQ />
        </Reveal>
      </div>

      <div className="relative z-20">
        <CTA />
      </div>
    </>
  );
}
