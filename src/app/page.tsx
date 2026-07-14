import { HeroV76 } from "@/components/home/hero-v76";
import { HowItWorks } from "@/components/home/how-it-works";
import { PricingTeaser } from "@/components/home/pricing-teaser";
import { Testimonials } from "@/components/home/testimonials";
import { FAQ } from "@/components/home/faq";
import { CTA } from "@/components/home/cta";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { ProductionGap } from "@/components/home/production-gap";
import { WholeStack } from "@/components/home/whole-stack";
import { ReplaceTools } from "@/components/home/replace-tools";
import { Reveal } from "@/components/ui/reveal";

export default function HomePage() {
  return (
    <>
      {/* The announcement bar lives with the landing content (not the shell), so
          it only appears here — never on error/404 screens. */}
      <AnnouncementBar />
      {/* Upper half shares the hero's surface — the walkthrough sits on the
          same color as the hero (see .section-follow), so they read as one
          canvas. How it works fades only (no transform) to keep its sticky
          scroll-spy nav working. */}
      <HeroV76 />
      <div className="section-follow">
        <Reveal variant="fade">
          <HowItWorks />
        </Reveal>
      </div>

      {/* The lower half stays on the light hero surface too, so the whole page
          reads as one continuous light canvas until the dark CTA + footer.
          Order: production gap → whole stack → replace tools → testimonials →
          pricing → FAQ (per the landing narrative doc). */}
      <div className="section-follow relative z-10">
        <Reveal>
          <ProductionGap />
        </Reveal>
        <Reveal>
          <WholeStack />
        </Reveal>
        <Reveal>
          <ReplaceTools />
        </Reveal>
        <Reveal>
          <Testimonials />
        </Reveal>
        <Reveal>
          <PricingTeaser />
        </Reveal>
        <Reveal>
          <FAQ />
        </Reveal>
      </div>

      <div className="relative z-20">
        <CTA />
      </div>
    </>
  );
}
