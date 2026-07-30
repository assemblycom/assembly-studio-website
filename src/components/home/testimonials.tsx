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

// TODO: real attribution, portrait, and story link — this featured story must
// come from an Assembly Studio beta firm (content pending). Name/Firm and the
// portrait are placeholders for now; the quote + stats are the approved copy.
const FEATURED = {
  quote:
    "Everywhere else, we got stuck at the prototype. Assembly got it securely to our clients.",
  name: "Name",
  firm: "Firm",
  // Stand-in only, so the layout can be judged with a real photo in place.
  // Replace together with name/firm when the beta-firm content lands.
  image: "/images/customers/jungle-luxe.jpg",
  stats: [
    { value: "One week", label: "From idea to live client experience" },
    { value: "250 clients", label: "Onboarded in the first month" },
    { value: "$5,000/mo", label: "In vendor costs replaced by apps" },
  ],
  href: "/customers",
};

// Descending bar heights (md+) so the row reads as a small chart and leaves
// empty space above the last bar for the story link to sit in.
const BAR_HEIGHTS = ["md:h-[280px]", "md:h-[228px]", "md:h-[186px]"];

export function Testimonials() {
  return (
    <Section id="testimonials" className="py-16 md:py-24">
      <div className="relative mx-auto max-w-[1100px]">
        {/* Portrait — pinned upper-right (desktop only). Stand-in photo so the
            section can be judged with real content; swap with the beta firm's
            own image alongside the attribution. */}
        <div className="absolute right-0 top-0 hidden size-32 overflow-hidden rounded-xl bg-muted [[data-theme=dark]_&]:bg-white/[0.06] md:block lg:size-36">
          <Image
            src={FEATURED.image}
            alt=""
            fill
            sizes="144px"
            className="object-cover"
          />
        </div>

        {/* Avatar on mobile — sits inline above the attribution. */}
        <div className="relative mb-5 size-32 overflow-hidden rounded-xl bg-muted [[data-theme=dark]_&]:bg-white/[0.06] md:hidden">
          <Image
            src={FEATURED.image}
            alt=""
            fill
            sizes="128px"
            className="object-cover"
          />
        </div>

        {/* Attribution leads the section — small caps in the mono face, the
            colour shift (not a divider glyph) separates name from role. */}
        <p className="type-eyebrow text-foreground md:pr-44">
          {FEATURED.name}
          <span className="ml-3 text-muted-foreground">
            {FEATURED.firm}
          </span>
        </p>

        {/* Pull quote — the hero of the section. */}
        {/* font-normal, not font-medium: PP Mori maps 500 to SemiBold, which at
            this size reads bold. */}
        <blockquote className="mt-5 max-w-3xl text-[27px] font-normal leading-[1.15] tracking-[-0.02em] text-foreground md:pr-44 md:text-[38px]">
          &ldquo;{FEATURED.quote}&rdquo;
        </blockquote>

        {/* Stats. On mobile they stack as full-width rows (value left, label
            right) so the labels get room instead of wrapping in cramped
            columns. At md+ they become the descending bar chart — tallest to
            shortest — with the story link floating above the last bar. */}
        <div className="mt-12 flex flex-col gap-3 md:mt-16 md:flex-row md:items-end md:gap-5">
          {FEATURED.stats.map((s, i) => (
            <div
              key={s.label}
              // bg-muted (the palette's light gray) rather than a warm off-white
              // cream, which read as a different family from the rest of the page.
              className={`flex flex-col items-start gap-2.5 rounded-lg bg-muted p-5 [[data-theme=dark]_&]:bg-[#262626] md:flex-1 md:justify-between md:gap-0 md:p-6 ${BAR_HEIGHTS[i]}`}
            >
              <p className="text-[26px] leading-none tracking-[-0.01em] text-foreground md:text-[34px]">
                {s.value}
              </p>
              {/* Small caps label in the mono face — standing in for ABC
                  Diatype Caplock, which isn't in our bundled fonts yet. On
                  mobile it sits below the value with the full box width. */}
              <p className="type-eyebrow text-[11px] leading-snug tracking-[0.06em] text-[#16181D] [[data-theme=dark]_&]:text-muted-foreground">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Story link — floats in the whitespace above the shortest bar on
            desktop; sits below the bars on mobile. */}
        <Link
          href={FEATURED.href}
          className="group mt-6 inline-flex items-center gap-1.5 text-[15px] text-foreground md:absolute md:bottom-[210px] md:right-0 md:mt-0 lg:bottom-[218px]"
        >
          {/* Underline only the text — an underlined arrow that also nudges
              on hover reads as a rendering glitch. */}
          <span className="underline decoration-border underline-offset-4 transition-colors group-hover:decoration-foreground">
            Read firm&rsquo;s story
          </span>
          <span className="transition-transform duration-200 group-hover:translate-x-0.5">
            &rarr;
          </span>
        </Link>
      </div>
    </Section>
  );
}
