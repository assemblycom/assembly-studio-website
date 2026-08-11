import { HeroV76 } from "@/components/home/hero-v76";
import { getVisibleTemplates } from "@/lib/visible-templates";
import { HowItWorks } from "@/components/home/how-it-works";
import { TrustTicker } from "@/components/home/trust-ticker";
import { Testimonials } from "@/components/home/testimonials";
import { HomeFAQ } from "@/components/home/faq";
import { CTA } from "@/components/home/cta";
import { ProductionGap } from "@/components/home/production-gap";
import { WholeStack } from "@/components/home/whole-stack";
import { Reveal } from "@/components/ui/reveal";
import { GridDivider, GridRails } from "@/components/ui/grid-lines";

// Re-resolved against Contentful every few minutes rather than only at deploy.
// Prerendered once, an editor hiding a template in the CMS had no effect until
// somebody happened to ship — which is not what "the CMS is the catalogue" can
// mean in practice. Five minutes is short enough that a change lands while the
// person who made it is still looking, and long enough that crawlers aren't
// re-running the query on every hit.
export const revalidate = 300;

export default async function HomePage() {
  const templates = await getVisibleTemplates();
  return (
    <>
      {/* Upper half shares the hero's surface — the walkthrough sits on the
          same color as the hero (see .section-follow), so they read as one
          canvas. */}
      <HeroV76 templates={templates} />

      {/* Content region — framed by vertical rails aligned to the 1200px
          content column. The rails start below the hero and run down through
          the sections (the wide footer sits outside this wrapper). Drawn on top
          as thin lines in the column gutter so section fills never hide them. */}
      <div className="relative">
        <GridRails />

        {/* The "how it works" walkthrough comes first, then the three platform
            points (left-rail menu + visual). */}
        <div className="section-follow">
          {/* Fade-only (no rise): the ticker's own colored band made the
              translate read as the whole block sliding on load. */}
          {/* Opens the stats band, and drawn here rather than inside it so both
              ends land on the vertical rails — the band's own column is capped
              narrower than the rails and nudged off-centre, so a rule drawn there
              stopped short at both ends. */}
          <GridDivider />
          <Reveal variant="fade">
            <TrustTicker />
          </Reveal>
          {/* Closes the band, on the same rails. */}
          <GridDivider />
          <Reveal variant="fade">
            <HowItWorks />
          </Reveal>
          <GridDivider />
          <Reveal variant="fade">
            <ProductionGap />
          </Reveal>
        </div>

        <GridDivider />

        {/* The lower half stays on the light hero surface too, so the whole page
            reads as one continuous light canvas until the dark CTA + footer.
            Order: testimonials → whole stack → FAQ. */}
        <div className="section-follow relative z-10">
          <Reveal variant="fade">
            <Testimonials />
          </Reveal>
          <GridDivider />
          <Reveal variant="fade">
            <WholeStack />
          </Reveal>
          <GridDivider />
          <Reveal variant="fade">
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
