import { Hero } from "@/components/home/hero";
import { CoreFlow } from "@/components/home/core-flow";
import { Comparison } from "@/components/home/comparison";
import { Testimonials } from "@/components/home/testimonials";
import { FAQ } from "@/components/home/faq";
import { CTA } from "@/components/home/cta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <CoreFlow />
      <Comparison />
      <Testimonials />
      <FAQ />
      <CTA />
    </>
  );
}
