import { Section } from "@/components/ui/section";

const POINTS: { title: string; body: string }[] = [
  {
    title: "Purpose-built for client work",
    body: "Generic builders make apps. Assembly makes secure, branded client portals your clients actually log into — with permissions, folders, and your firm's identity.",
  },
  {
    title: "Secure and compliant by default",
    body: "SOC 2 Type II, HIPAA-ready, SSO, and end-to-end encryption — the controls regulated firms require, on by default for every plan.",
  },
  {
    title: "A platform, not just a builder",
    body: "Messaging, billing, e-signatures, files, and a CRM are built in — so every app you generate plugs into a complete client experience.",
  },
];

export function WhyAssembly() {
  return (
    <Section>
      <h2 className="max-w-3xl text-3xl font-medium tracking-tight md:text-4xl">
        <span className="text-muted-foreground">
          A hundred tools can generate a web app.
        </span>{" "}
        Here&apos;s what sets Assembly apart.
      </h2>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {POINTS.map((point) => (
          <div
            key={point.title}
            className="rounded-xl border border-border p-6"
          >
            <h3 className="text-lg font-medium">{point.title}</h3>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              {point.body}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
