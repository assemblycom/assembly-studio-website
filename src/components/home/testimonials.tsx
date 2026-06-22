import { Section } from "@/components/ui/section";

const TESTIMONIALS = [
  {
    quote:
      "Assembly flows directly into our internal quality control processes. Instead of duplicating work across systems, everything is connected, saving our team time and ensuring we always have the most accurate, up-to-date information.",
    author: "Phillip LaRue",
    role: "",
    company: "Capital One",
  },
  {
    quote:
      "Assembly was the only solution that let us flexibly build our own version of a client portal, uniting elements of their technology with existing external core applications that we wanted to keep using.",
    author: "Kyle Pearson",
    role: "",
    company: "Collective CPA",
  },
  {
    quote:
      "Assembly isn’t just a portal—it’s our infrastructure. We’re tying it to Microsoft Azure, automating workflows, and preparing to scale campaigns for massive organizations.",
    author: "Carlos Williams",
    role: "",
    company: "Ditto",
  },
];

export function Testimonials() {
  return (
    <Section id="testimonials" className="bg-muted">
      <div className="text-center">
        <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
          What our customers say
        </h2>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {TESTIMONIALS.map((testimonial) => (
          <div
            key={testimonial.author}
            className="rounded-xl border border-border bg-background p-8"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted" />
              <div>
                <p className="text-sm font-medium">{testimonial.author}</p>
                <p className="text-xs text-muted-foreground">
                  {testimonial.role ? `${testimonial.role}, ` : ""}{testimonial.company}
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              &ldquo;{testimonial.quote}&rdquo;
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
