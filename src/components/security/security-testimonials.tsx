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

      {/* Case-study title — the hero of the section. type-h2 (28 → 36px),
          the same step the homepage story runs at, in place of the hand-set
          27/38 that sat off the scale at both ends. The class carries weight
          400, so the title stops mapping to PP Mori's SemiBold. */}
      <h2 className="type-h2 mt-5 max-w-3xl text-foreground">{STORY.title}</h2>

      {/* On a phone the bars and the story link are ringed as one block, so the
          link reads as the end of the proof rather than a stray line under it.
          `md:contents` dissolves this wrapper at desktop, where the bars are a
          chart and the link floats in the whitespace beside them. */}
      <div className="mt-12 flex flex-col gap-3 rounded-lg border border-border p-3 md:contents">
        {/* Stats — full-width rows on mobile; a descending bar chart at md+,
            with the story link floating above the shortest bar. */}
        <div className="flex flex-col gap-3 md:mt-16 md:flex-row md:items-end md:gap-5">
          {STORY.stats.map((s, i) => (
            <div
              key={s.label}
              className={`flex flex-col items-start gap-2.5 rounded-lg bg-muted p-5 md:flex-1 md:justify-between md:gap-0 md:p-6 ${BAR_HEIGHTS[i]}`}
            >
              {/* A step down below md, matching the homepage story. */}
              <p className="type-h3 leading-none text-foreground max-md:text-[18px]">
                {s.value}
              </p>
              <p className="type-eyebrow leading-snug text-muted-foreground max-md:text-[10px]">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Story link — floats above the shortest bar on desktop; the last line
            inside the ringed block on mobile. */}
        <Link
          href={`/customers/${STORY.slug}`}
          className="type-body group inline-flex items-center gap-1.5 px-2 pb-1 pt-2 text-foreground md:absolute md:bottom-[210px] md:right-0 md:mt-0 md:p-0 lg:bottom-[218px]"
        >
          {/* Desktop only: inside the ring the rule was a second line under a
              line. */}
          <span className="decoration-border underline-offset-4 transition-colors group-hover:decoration-foreground md:underline">
            Read firm&rsquo;s story
          </span>
          <span className="transition-transform duration-200 group-hover:translate-x-0.5">
            &rarr;
          </span>
        </Link>
      </div>
    </div>
  );
}
