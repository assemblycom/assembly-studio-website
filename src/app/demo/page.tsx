import type { Metadata } from "next";
import { DemoForm } from "@/components/demo/demo-form";

export const metadata: Metadata = {
  title: "Book a demo",
  description:
    "See Assembly Studio in action. Book a live walkthrough tailored to your use case — and see how fast you can ship a branded, secure client app.",
};

const EXPECTATIONS = [
  "A walkthrough built around your use case",
  "See an app go from prompt to portal",
  "Straight answers on security, pricing, and rollout",
];

function CheckIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className="shrink-0 text-foreground"
      aria-hidden
    >
      <path
        d="M5 10l3.5 3.5L15 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function DemoPage() {
  return (
    <section className="px-6 pb-24 pt-28 md:pt-36">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2 md:gap-16 lg:gap-24">
        {/* Left — value proposition */}
        <div>
          <h1 className="max-w-md text-4xl font-medium tracking-tight md:text-5xl">
            See Assembly Studio in action
          </h1>
          <p className="mt-6 max-w-md text-lg text-muted-foreground">
            Schedule a live walkthrough with our team and see how quickly you
            can ship a branded, secure client app on Assembly.
          </p>

          <ul className="mt-10 flex flex-col gap-4">
            {EXPECTATIONS.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <CheckIcon />
                <span className="leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right — the form */}
        <div className="md:sticky md:top-28 md:h-fit">
          <DemoForm />
        </div>
      </div>
    </section>
  );
}
