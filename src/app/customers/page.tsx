import type { Metadata } from "next";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Customers",
  description:
    "See how leading companies use Assembly Studio to automate their AI workflows.",
};

const CASE_STUDIES = [
  {
    company: "Company A",
    industry: "Financial Services",
    headline: "Reduced ticket resolution time by 60%",
    summary:
      "Deployed an AI-powered support agent that handles tier-1 customer inquiries, freeing the team to focus on complex cases.",
    metric: "60%",
    metricLabel: "faster resolution",
  },
  {
    company: "Company B",
    industry: "Healthcare",
    headline: "Automated patient intake workflows",
    summary:
      "Built a HIPAA-compliant intake workflow that processes 1,000+ patient forms daily with 99.5% accuracy.",
    metric: "1,000+",
    metricLabel: "forms per day",
  },
  {
    company: "Company C",
    industry: "E-commerce",
    headline: "Scaled customer support without adding headcount",
    summary:
      "Created AI agents that handle product questions, order tracking, and returns across multiple channels.",
    metric: "3x",
    metricLabel: "support capacity",
  },
  {
    company: "Company D",
    industry: "Technology",
    headline: "Streamlined internal knowledge management",
    summary:
      "Deployed an enterprise knowledge agent that connects to internal docs, Slack, and Confluence for instant answers.",
    metric: "40%",
    metricLabel: "less time searching",
  },
  {
    company: "Company E",
    industry: "Real Estate",
    headline: "Automated lead qualification at scale",
    summary:
      "Built an AI qualification workflow that scores and routes inbound leads, increasing conversion rates significantly.",
    metric: "2.5x",
    metricLabel: "conversion rate",
  },
  {
    company: "Company F",
    industry: "Education",
    headline: "Personalized student onboarding",
    summary:
      "Created adaptive onboarding flows that tailor the experience based on student background and learning goals.",
    metric: "85%",
    metricLabel: "completion rate",
  },
];

export default function CustomersPage() {
  return (
    <>
      {/* Hero */}
      <section className="px-6 pb-16 pt-24 text-center md:pt-32">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-medium tracking-tight md:text-5xl">
            Trusted by innovative teams
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            See how companies across industries use Assembly Studio to build
            AI-powered workflows that drive real results.
          </p>
        </div>
      </section>

      {/* Case studies grid */}
      <Section>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {CASE_STUDIES.map((study) => (
            <article
              key={study.company}
              className="flex flex-col rounded-xl border border-border p-8"
            >
              <span className="text-xs text-muted-foreground">
                {study.industry}
              </span>
              <h3 className="mt-2 text-lg font-medium">{study.headline}</h3>
              <p className="mt-3 flex-1 text-sm text-muted-foreground">
                {study.summary}
              </p>
              <div className="mt-6 border-t border-border pt-6">
                <span className="text-2xl font-medium text-accent">
                  {study.metric}
                </span>
                <span className="ml-2 text-sm text-muted-foreground">
                  {study.metricLabel}
                </span>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
