import { HeroV76 } from "@/components/home/hero-v76";
import { WhyAssembly } from "@/components/home/why-assembly";
import { HowItWorks } from "@/components/home/how-it-works";
import { Comparison } from "@/components/home/comparison";
import { Testimonials } from "@/components/home/testimonials";
import { FAQ } from "@/components/home/faq";
import { CTA } from "@/components/home/cta";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Reveal } from "@/components/ui/reveal";

export default function HomePage() {
  return (
    <>
      {/* The announcement bar lives with the landing content (not the shell), so
          it only appears here — never on error/404 screens. */}
      <AnnouncementBar />
      {/* Upper half shares the hero's surface — the differentiators and the
          walkthrough sit on the same color as the hero (see .section-follow), so
          they read as one canvas. Each section reveals on scroll so it hands off
          smoothly from the one above. How it works fades only (no transform) to
          keep its sticky scroll-spy nav working. */}
      <HeroV76 />
      <div className="section-follow">
        <Reveal>
          <WhyAssembly />
        </Reveal>
        {/* Fade only (no transform) so the pinned chat inside can stay sticky. */}
        <Reveal variant="fade">
          <HowItWorks />
        </Reveal>
      </div>

      {/* The lower half stays on the light hero surface too, so the whole page
          reads as one continuous light canvas until the dark CTA + footer. */}
      <div className="section-follow relative z-10">
        <Reveal>
          <Testimonials />
        </Reveal>
        <Reveal>
          <Comparison />
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
