import { HeroSwitcher } from "@/components/home/hero-switcher";
import { HowItWorks } from "@/components/home/how-it-works";
import { Templates } from "@/components/home/templates";
import { Comparison } from "@/components/home/comparison";
import { Testimonials } from "@/components/home/testimonials";
import { FAQ } from "@/components/home/faq";
import { CTA } from "@/components/home/cta";

export default function HomePage() {
  return (
    <>
      <HeroSwitcher />
      <HowItWorks />
      <Templates />
      <Testimonials />
      <Comparison />
      <FAQ />
      <CTA />
    </>
  );
}
