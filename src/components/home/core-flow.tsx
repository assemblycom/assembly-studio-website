import { Section } from "@/components/ui/section";

const STEPS = [
  {
    step: "01",
    title: "Describe your workflow",
    description:
      "Tell Assembly what you want to automate using natural language. No technical knowledge required.",
  },
  {
    step: "02",
    title: "Customize and configure",
    description:
      "Fine-tune your AI agent with templates, data sources, and business rules specific to your needs.",
  },
  {
    step: "03",
    title: "Deploy and monitor",
    description:
      "Launch your workflow in seconds. Track performance, iterate, and scale across your organization.",
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
          Go from idea to production AI workflow in three simple steps.
        </p>
      </div>

      <div className="mt-16 grid gap-12 md:grid-cols-3">
        {STEPS.map((step) => (
          <div key={step.step}>
            <span className="text-sm font-medium text-accent">
              {step.step}
            </span>
            <h3 className="mt-3 text-xl font-medium">{step.title}</h3>
            <p className="mt-2 text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
