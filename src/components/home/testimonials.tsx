import Image from "next/image";
import Link from "next/link";
import { Section } from "@/components/ui/section";

// ─────────────────────────────────────────────────────────────────────────
// CUSTOMER STORIES — one featured story, composed editorially: attribution
// leads, then a large pull quote, a portrait pinned upper-right, and the
// stats as a descending "bar chart" (tallest → shortest). The story link
// floats in the whitespace above the shortest bar. Same copy as before —
// only the composition changed.
//
// The featured story wants a real Assembly Studio beta firm once that
// content exists; until then Jungle Luxe carries it — the strongest
// outcome-shaped story we have. Swap FEATURED when the beta content lands.
// ─────────────────────────────────────────────────────────────────────────

const FEATURED = {
  quote:
    "We've reduced owner inquiries by at least 50%. It probably saved the cost of a whole extra administrator.",
  name: "Rachel Hugenschmidt",
  title: "Founder",
  firm: "Jungle Luxe",
  vertical: "Property management",
  stats: [
    { value: "50%+", label: "fewer owner inquiries" },
    { value: "110+", label: "owners on the portal" },
    { value: "1 FTE", label: "cost saved" },
  ],
  slug: "jungle-luxe",
};

// Descending bar heights (md+) so the row reads as a small chart and leaves
// empty space above the last bar for the story link to sit in.
const BAR_HEIGHTS = ["md:h-[280px]", "md:h-[228px]", "md:h-[186px]"];

export function Testimonials() {
  return (
    <Section id="testimonials">
      <div className="relative">
        {/* Portrait — pinned upper-right (desktop only, to avoid overlapping
            the quote on narrow screens). */}
        <div className="absolute right-0 top-0 hidden size-32 overflow-hidden rounded-xl md:block lg:size-36">
          <Image
            src={`/images/customers/${FEATURED.slug}.jpg`}
            alt={FEATURED.name}
            fill
            sizes="144px"
            className="object-cover"
          />
        </div>

        {/* Attribution leads the section — small caps in the mono face, the
            colour shift (not a divider glyph) separates name from role. */}
        <p className="font-[family-name:var(--font-diatype-mono)] text-[12px] uppercase tracking-[0.08em] text-foreground md:pr-44">
          {FEATURED.name}
          <span className="ml-3 text-muted-foreground">
            {FEATURED.title}, {FEATURED.firm}
          </span>
        </p>

        {/* Pull quote — the hero of the section. */}
        <blockquote className="mt-5 max-w-3xl text-[27px] font-medium leading-[1.15] tracking-[-0.02em] text-foreground md:pr-44 md:text-[38px]">
          &ldquo;{FEATURED.quote}&rdquo;
        </blockquote>

        {/* Stats as a descending bar chart. */}
        <div className="mt-12 flex items-end gap-3 md:mt-16 md:gap-5">
          {FEATURED.stats.map((s, i) => (
            <div
              key={s.label}
              className={`flex h-40 flex-1 flex-col justify-between rounded-lg bg-muted p-5 md:p-6 ${BAR_HEIGHTS[i]}`}
            >
              <p className="text-[24px] leading-none tracking-[-0.01em] text-foreground md:text-[34px]">
                {s.value}
              </p>
              {/* Small caps label in the mono face — standing in for ABC
                  Diatype Caplock, which isn't in our bundled fonts yet. */}
              <p className="font-[family-name:var(--font-diatype-mono)] text-[11px] uppercase leading-snug tracking-[0.06em] text-muted-foreground">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Story link — floats in the whitespace above the shortest bar on
            desktop; sits below the bars on mobile. */}
        <Link
          href={`/customers/${FEATURED.slug}`}
          className="group mt-6 inline-flex items-center gap-1.5 text-[15px] text-foreground md:absolute md:bottom-[210px] md:right-0 md:mt-0 lg:bottom-[218px]"
        >
          {/* Underline only the text — an underlined arrow that also nudges
              on hover reads as a rendering glitch. */}
          <span className="underline decoration-border underline-offset-4 transition-colors group-hover:decoration-foreground">
            Read full story
          </span>
          <span className="transition-transform duration-200 group-hover:translate-x-0.5">
            &rarr;
          </span>
        </Link>
      </div>
    </Section>
  );
}
