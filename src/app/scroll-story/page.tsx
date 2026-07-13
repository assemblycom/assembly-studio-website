import type { Metadata } from "next";
import { ScrollStory } from "./scroll-story";
import { WhyAssembly } from "@/components/home/why-assembly";

export const metadata: Metadata = {
  title: "Scroll story exploration — Assembly",
  robots: { index: false },
};

// Prototype route: hero → next-section scroll transition exploration. After
// the scripted story releases, the page continues into the real sections so
// the handoff back to normal flow is part of what's being evaluated.
export default function ScrollStoryPage() {
  return (
    <>
      <ScrollStory />
      <div className="section-follow">
        <WhyAssembly />
      </div>
    </>
  );
}
