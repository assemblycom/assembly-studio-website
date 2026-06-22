import { Section } from "@/components/ui/section";

const FEATURES = [
  { name: "No-code setup", assembly: true, others: false },
  { name: "Enterprise security", assembly: true, others: "Varies" },
  { name: "Custom AI agents", assembly: true, others: "Limited" },
  { name: "Template library", assembly: true, others: false },
  { name: "Real-time monitoring", assembly: true, others: "Limited" },
  { name: "Team collaboration", assembly: true, others: "Limited" },
];

function CheckIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className="text-accent"
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

function XIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className="text-muted-foreground/50"
    >
      <path
        d="M7 7l6 6M13 7l-6 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Comparison() {
  return (
    <Section id="comparison">
      <div className="text-center">
        <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
          Why Assembly Studio
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          See how Assembly Studio compares to other AI workflow platforms.
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-4 text-left font-medium">Feature</th>
              <th className="pb-4 text-center font-medium">
                Assembly Studio
              </th>
              <th className="pb-4 text-center font-medium text-muted-foreground">
                Others
              </th>
            </tr>
          </thead>
          <tbody>
            {FEATURES.map((feature) => (
              <tr key={feature.name} className="border-b border-border">
                <td className="py-4">{feature.name}</td>
                <td className="py-4 text-center">
                  <span className="inline-flex justify-center">
                    {feature.assembly === true ? <CheckIcon /> : feature.assembly}
                  </span>
                </td>
                <td className="py-4 text-center">
                  <span className="inline-flex justify-center text-muted-foreground">
                    {feature.others === true ? (
                      <CheckIcon />
                    ) : feature.others === false ? (
                      <XIcon />
                    ) : (
                      feature.others
                    )}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}
