import { Section } from "@/components/ui/section";

const STEPS = [
  {
    step: "01",
    title: "Describe what you want",
    description:
      "An onboarding wizard, an approvals workflow, a community space — just tell Assembly in plain English.",
  },
  {
    step: "02",
    title: "Customize to your brand",
    description:
      "Pick a template or start from scratch. Connect your data sources, set permissions, match your brand.",
  },
  {
    step: "03",
    title: "Ship to your clients",
    description:
      "Deploy to your client portal in seconds. Your clients see your brand, not ours. Monitor and iterate anytime.",
  },
];

export function CoreFlow() {
  return (
    <Section id="how-it-works" className="bg-muted">
      <div className="text-center">
        <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
          How it works
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Go from idea to live client app in minutes, not months.
        </p>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {STEPS.map((step) => (
          <div key={step.step}>
            <span className="text-xs text-muted-foreground">{step.step}</span>
            <h3 className="mt-1 text-lg font-medium">{step.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
