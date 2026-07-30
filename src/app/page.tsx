import { HeroV76 } from "@/components/home/hero-v76";
import { HowItWorks } from "@/components/home/how-it-works";
import { TrustTicker } from "@/components/home/trust-ticker";
import { Testimonials } from "@/components/home/testimonials";
import { HomeFAQ } from "@/components/home/faq";
import { CTA } from "@/components/home/cta";
import { ProductionGap } from "@/components/home/production-gap";
import { WholeStack } from "@/components/home/whole-stack";
import { Reveal } from "@/components/ui/reveal";

// Horizontal grid line between content sections, spanning to the vertical rails
// (1200px) so the section boundaries read as one connected grid. Desktop only.
// --border reads too faint over the near-black dark ground, so the grid lines
// get a stronger tint in dark mode (light mode already reads well). Uses a SOLID
// color, not white/opacity — where horizontal rules cross the vertical rails a
// translucent line would compound and the intersection would read brighter.
const GRID_LINE = "border-border [[data-theme=dark]_&]:border-[#383838]";

function GridDivider() {
  return (
    <div className={`mx-auto hidden max-w-[1200px] border-t md:block ${GRID_LINE}`} />
  );
}

export default function HomePage() {
  return (
    <>
      {/* Upper half shares the hero's surface — the walkthrough sits on the
          same color as the hero (see .section-follow), so they read as one
          canvas. */}
      <HeroV76 />

      {/* Content region — framed by vertical rails aligned to the 1100px
          content column. The rails start below the hero and run down through
          the sections (the wide footer sits outside this wrapper). Drawn on top
          as thin lines in the column gutter so section fills never hide them. */}
      <div className="relative">
        {/* Vertical guide rails — shown once the viewport reaches the 1200px
            content width, so the section rules have rails to meet at the corners.
            Below that (tablet/mobile) they'd hug the screen edges, so they hide. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-30 hidden justify-center min-[1200px]:flex"
        >
          <div className={`h-full w-full max-w-[1200px] border-x ${GRID_LINE}`} />
        </div>

        {/* Full-bleed divider under the hero — the single boundary line into the
            content (the stats band no longer draws its own top rule). */}
        <div className={`border-t ${GRID_LINE}`} />

        {/* The "how it works" walkthrough comes first, then the three platform
            points (left-rail menu + visual). */}
        <div className="section-follow">
          {/* Fade-only (no rise): the ticker's own colored band made the
              translate read as the whole block sliding on load. */}
          <Reveal variant="fade">
            <TrustTicker />
          </Reveal>
          {/* No GridDivider here — the TrustTicker's own bottom rule already
              separates it from How it works, so a second line would double up. */}
          <Reveal>
            <HowItWorks />
          </Reveal>
          <GridDivider />
          <Reveal>
            <ProductionGap />
          </Reveal>
        </div>

        <GridDivider />

        {/* The lower half stays on the light hero surface too, so the whole page
            reads as one continuous light canvas until the dark CTA + footer.
            Order: testimonials → whole stack → FAQ. */}
        <div className="section-follow relative z-10">
          <Reveal>
            <Testimonials />
          </Reveal>
          <GridDivider />
          <Reveal>
            <WholeStack />
          </Reveal>
          <GridDivider />
          <Reveal>
            <HomeFAQ />
          </Reveal>
        </div>

        <GridDivider />

        <div className="relative z-20">
          <CTA />
        </div>
      </div>
    </>
  );
}
