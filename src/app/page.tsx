import { Hero } from "@/components/home/hero";
import { WhyAssembly } from "@/components/home/why-assembly";
import { HowItWorks } from "@/components/home/how-it-works";
import { Templates } from "@/components/home/templates";
import { Comparison } from "@/components/home/comparison";
import { Testimonials } from "@/components/home/testimonials";
import { FAQ } from "@/components/home/faq";
import { CTA } from "@/components/home/cta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <WhyAssembly />
      <HowItWorks />
      {/* Scrolling out of "How it works" the page hands off to its dark lower
          half at a clean edge (no gradient) — the sections below sit on #101010
          (tokens flipped via .dark-section) and flow into the dark CTA + footer.
          data-nav-dark marks the zone so the sticky nav can boost its contrast. */}
      <div data-nav-dark>
        <div className="dark-section bg-[#101010]">
          <Templates />
          <Testimonials />
          <Comparison />
          <FAQ />
        </div>
        <CTA />
      </div>
    </>
  );
}
