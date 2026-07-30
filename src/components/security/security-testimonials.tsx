import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────
// SECURITY CUSTOMER STORY — the same composition as the home page's featured
// story (attribution eyebrow, large lead line, portrait pinned upper-right,
// stats as a descending "bar chart", and a story link floating above the
// shortest bar), but leads with the case-study title instead of a pull quote.
// Healthcare story (Metta Health) for the security page's trust-sensitive,
// compliance-minded audience. Width/alignment come from the page wrapper.
// ─────────────────────────────────────────────────────────────────────────

const STORY = {
  slug: "metta-health",
  company: "Metta Health",
  industry: "Healthcare",
  title:
    "How Metta Health scales HIPAA-compliant patient authorizations with Assembly",
  stats: [
    { value: "50+", label: "HIPAA-compliant intake workflows" },
    { value: "80%", label: "cost savings" },
    { value: "5x", label: "ROI vs. alternative vendors" },
  ],
};

// Descending bar heights (md+) so the row reads as a small chart and leaves
// empty space above the last bar for the story link to sit in.
const BAR_HEIGHTS = ["md:h-[280px]", "md:h-[228px]", "md:h-[186px]"];

export function SecurityTestimonials() {
  return (
    <div className="relative">
      {/* Attribution leads — company, then industry in a colour shift. */}
      <p className="type-eyebrow text-foreground">
        {STORY.company}
        <span className="ml-3 text-muted-foreground">{STORY.industry}</span>
      </p>

      {/* Case-study title — the hero of the section. */}
      <h2 className="mt-5 max-w-3xl text-[27px] font-medium leading-[1.15] tracking-[-0.02em] text-foreground md:text-[38px]">
        {STORY.title}
      </h2>

      {/* Stats — full-width rows on mobile; a descending bar chart at md+, with
          the story link floating above the shortest bar. */}
      <div className="mt-12 flex flex-col gap-3 md:mt-16 md:flex-row md:items-end md:gap-5">
        {STORY.stats.map((s, i) => (
          <div
            key={s.label}
            className={`flex flex-col items-start gap-2.5 rounded-lg bg-muted p-5 md:flex-1 md:justify-between md:gap-0 md:p-6 ${BAR_HEIGHTS[i]}`}
          >
            <p className="text-[26px] leading-none tracking-[-0.01em] text-foreground md:text-[34px]">
              {s.value}
            </p>
            <p className="type-eyebrow text-[11px] leading-snug tracking-[0.06em] text-muted-foreground">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Story link — floats above the shortest bar on desktop. */}
      <Link
        href={`/customers/${STORY.slug}`}
        className="group mt-6 inline-flex items-center gap-1.5 text-[15px] text-foreground md:absolute md:bottom-[210px] md:right-0 md:mt-0 lg:bottom-[218px]"
      >
        <span className="underline decoration-border underline-offset-4 transition-colors group-hover:decoration-foreground">
          Read firm&rsquo;s story
        </span>
        <span className="transition-transform duration-200 group-hover:translate-x-0.5">
          &rarr;
        </span>
      </Link>
    </div>
  );
}
