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
// Carried by Advertai Marketing, the first Assembly Studio firm with a full
// story behind it — the attribution, portrait, and stats are theirs, and the
// link goes to their case study rather than the customers index.
// ─────────────────────────────────────────────────────────────────────────

const FEATURED = {
  quote:
    "We’ve built out apps within weeks that I doubt we could have done within five to ten years before.",
  name: "Garrett",
  firm: "Advertai Marketing",
  image: "/images/customers/advertai-marketing.jpg",
  stats: [
    // The number is the claim; the caption only has to say what it counts. Set
    // in mono caps, every extra word is a long line under a short headline.
    { value: "5 weeks", label: "Development to launch" },
    { value: "200+ clients", label: "Using applications" },
    { value: "5+ tools", label: "Consolidated and saved" },
  ],
  href: "/customers/advertai-marketing",
};

// Descending bar heights (md+) so the row reads as a small chart and leaves
// empty space above the last bar for the story link to sit in.
const BAR_HEIGHTS = ["md:h-[280px]", "md:h-[228px]", "md:h-[186px]"];

export function Testimonials() {
  return (
    // px-0 on the Section so the measure below owns the horizontal inset: this
    // section's edges have to land on the same line as the one under it, and
    // 1100px inside the Section's own padding sat 10px short on either side.
    <Section id="testimonials" className="px-0 py-16 md:py-24">
      <div className="relative mx-auto max-w-[1200px] px-6 md:px-10">
        {/* Portrait — pinned upper-right (desktop only).
            right-10, not right-0: absolute offsets resolve against the padding
            box, so right-0 parked it on the measure's outer edge — 40px past the
            column every other element in the section lines up on. */}
        <div className="absolute right-10 top-0 hidden size-32 overflow-hidden rounded-xl bg-muted [[data-theme=dark]_&]:bg-white/[0.06] md:block lg:size-36">
          <Image
            src={FEATURED.image}
            alt=""
            fill
            // Declared well above the 144px box: object-cover scales the source
            // by its short side, so the file has to be wider than the frame
            // before the crop, and a retina screen doubles that again. At 144
            // the optimizer returned a file narrower than the crop needed and
            // the portrait was visibly soft. Quality has to be one of the values
            // in next.config's `qualities` — anything else falls back to 75.
            sizes="288px"
            quality={90}
            className="object-cover"
          />
        </div>

        {/* Avatar on mobile — sits inline above the attribution. */}
        <div className="relative mb-5 size-32 overflow-hidden rounded-xl bg-muted [[data-theme=dark]_&]:bg-white/[0.06] md:hidden">
          <Image
            src={FEATURED.image}
            alt=""
            fill
            sizes="256px"
            quality={90}
            className="object-cover"
          />
        </div>

        {/* Attribution leads the section — small caps in the mono face, the
            colour shift (not a divider glyph) separates name from role. */}
        <p className="type-eyebrow text-foreground md:pr-44">
          {FEATURED.name}
          <span className="ml-3 text-muted-foreground">{FEATURED.firm}</span>
        </p>

        {/* Pull quote — the hero of the section. type-h2 (28 → 36px) rather
            than the hand-set 27/38 it used to carry: those were a step off the
            scale in both directions, and the desktop end was running larger
            than the section needs. The class brings its own weight (400, so PP
            Mori doesn't map to SemiBold), tracking and leading. */}
        {/* Desktop only: the opening mark hangs in the margin (negative
            first-line indent, so it applies to that line alone). Punctuation
            carries almost no visual weight, and with it in the column the word
            the quote opens on sat a glyph short of the name above it. On a
            phone the marks come off entirely — the column is narrow enough that
            a hanging glyph reads as a stray character and every wrapped line
            looked indented against it. The blockquote already says it's a
            quote. */}
        <blockquote className="type-h2 mt-5 max-w-3xl text-foreground md:pr-44 md:[text-indent:-0.4em]">
          <span className="hidden md:inline">&ldquo;</span>
          {FEATURED.quote}
          <span className="hidden md:inline">&rdquo;</span>
        </blockquote>

        {/* On a phone the bars and the story link are ringed as one block, so
            the link reads as the end of the proof rather than a stray line
            under it. `md:contents` dissolves this wrapper at desktop, where the
            bars are a chart and the link floats in the whitespace beside them —
            so the grouping costs the desktop layout nothing. */}
        <div className="mt-12 flex flex-col gap-3 rounded-lg border border-border p-3 md:contents">
          {/* Stats. On mobile they stack as full-width rows (value left, label
              right) so the labels get room instead of wrapping in cramped
              columns. At md+ they become the descending bar chart — tallest to
              shortest — with the story link floating above the last bar. */}
          <div className="flex flex-col gap-3 md:mt-16 md:flex-row md:items-end md:gap-5">
            {FEATURED.stats.map((s, i) => (
              <div
                key={s.label}
                // bg-muted (the palette's light gray) rather than a warm off-white
                // cream, which read as a different family from the rest of the page.
                // No dark override either: the #262626 it used to carry sat a
                // step above the FAQ cards, so the two blocks of the same kind
                // read as different surfaces on the same page.
                className={`flex flex-col items-start gap-2.5 rounded-lg bg-muted p-5 md:flex-1 md:justify-between md:gap-0 md:p-6 ${BAR_HEIGHTS[i]}`}
              >
                {/* A step down below md: at 22px over a 12px mono label the
                    pair filled a phone-width block edge to edge and read as a
                    headline rather than a figure. Desktop is untouched. */}
                <p className="type-h3 leading-none text-foreground max-md:text-[18px]">
                  {s.value}
                </p>
                {/* Small caps label in the mono face — standing in for ABC
                  Diatype Caplock, which isn't in our bundled fonts yet. On
                  mobile it sits below the value with the full box width. */}
                {/* Muted in both themes: at full-strength ink the caption read
                    as loud as the figure above it, which is the mark the block
                    exists for. */}
                <p className="type-eyebrow leading-snug text-muted-foreground max-md:text-[10px]">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* Story link — floats in the whitespace above the shortest bar on
            desktop; the last line inside the ringed block on mobile. */}
          <Link
            href={FEATURED.href}
            className="type-body group inline-flex items-center gap-1.5 px-2 pb-1 pt-2 text-foreground md:absolute md:bottom-[210px] md:right-10 md:mt-0 md:p-0 lg:bottom-[218px]"
          >
            {/* No rule under the text: the arrow beside it already reads as a
              link, and the underline was a third horizontal line in a block
              that is mostly horizontal lines. Hover brightens instead. */}
            <span className="transition-colors group-hover:text-foreground">
              Read firm&rsquo;s story
            </span>
            <span className="transition-transform duration-200 group-hover:translate-x-0.5">
              &rarr;
            </span>
          </Link>
        </div>
      </div>
    </Section>
  );
}
