import type { Metadata } from "next";
import { DemoForm } from "@/components/demo/demo-form";

export const metadata: Metadata = {
  title: "Book a demo",
  description:
    "See Assembly Studio in action. Book a live walkthrough tailored to your use case — and see how fast you can ship a branded, secure client app.",
};

// Reuses the hero's logo strip so the social proof reads consistently.
const LOGOS = [
  "Capital One",
  "Collective",
  "Ditto",
  "Heritage Law",
  "Waymaker",
  "Aura",
];

const EXPECTATIONS = [
  {
    title: "A walkthrough built around your use case",
    body: "No generic pitch — we tailor the session to the clients and workflows you serve.",
  },
  {
    title: "See an app go from prompt to portal",
    body: "Watch how fast you can generate a branded, secure client app and publish it live.",
  },
  {
    title: "Straight answers on security, pricing, and rollout",
    body: "Bring your questions on SOC 2, HIPAA, SSO, and what a rollout looks like for your team.",
  },
];

function CheckIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className="mt-0.5 shrink-0 text-foreground"
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
        {/* Left — value proposition and social proof */}
        <div>
          <p className="text-sm text-muted-foreground">Book a demo</p>
          <h1 className="mt-3 max-w-md text-4xl font-medium tracking-tight md:text-5xl">
            See Assembly Studio in action
          </h1>
          <p className="mt-6 max-w-md text-lg text-muted-foreground">
            Schedule a live walkthrough with our team and see how quickly you
            can ship a branded, secure client app on Assembly.
          </p>

          <ul className="mt-10 flex flex-col gap-5">
            {EXPECTATIONS.map((item) => (
              <li key={item.title} className="flex gap-3">
                <CheckIcon />
                <div>
                  <p className="font-medium leading-snug">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {/* Social proof — a customer quote over a compact logo strip */}
          <figure className="mt-12 border-l-2 border-border pl-5">
            <blockquote className="text-lg leading-relaxed tracking-tight">
              &ldquo;Assembly isn&rsquo;t just a portal — it&rsquo;s our
              infrastructure.&rdquo;
            </blockquote>
            <figcaption className="mt-3 text-sm text-muted-foreground">
              Carlos Williams · Ditto
            </figcaption>
          </figure>

          <div className="mt-10">
            <p className="text-sm text-muted-foreground">
              Trusted by teams at
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
              {LOGOS.map((name) => (
                <span
                  key={name}
                  className="text-base font-medium text-muted-foreground"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right — the form */}
        <div className="md:sticky md:top-28 md:h-fit">
          <DemoForm />
        </div>
      </div>
    </section>
  );
}
