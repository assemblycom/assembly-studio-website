import { Section } from "@/components/ui/section";

const TESTIMONIALS = [
  {
    quote:
      "Assembly Studio transformed how our team handles customer support. We built an AI agent in minutes that now handles 60% of our tickets.",
    author: "Sarah Chen",
    role: "VP of Operations",
    company: "Placeholder Co.",
  },
  {
    quote:
      "The template library gave us a huge head start. We went from idea to production in under a day.",
    author: "Marcus Rivera",
    role: "Head of Product",
    company: "Placeholder Inc.",
  },
  {
    quote:
      "Enterprise-grade security was non-negotiable for us. Assembly Studio checked every box.",
    author: "Priya Patel",
    role: "CISO",
    company: "Placeholder Corp.",
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
            <p className="text-sm leading-relaxed text-muted-foreground">
              &ldquo;{testimonial.quote}&rdquo;
            </p>
            <div className="mt-6">
              <p className="text-sm font-medium">{testimonial.author}</p>
              <p className="text-sm text-muted-foreground">
                {testimonial.role}, {testimonial.company}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
