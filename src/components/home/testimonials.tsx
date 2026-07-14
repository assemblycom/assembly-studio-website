import Image from "next/image";
import Link from "next/link";
import { Section } from "@/components/ui/section";

// ─────────────────────────────────────────────────────────────────────────
// CUSTOMER STORIES — one featured story treated as a proper card: quote +
// stats + portrait on a single surface, not floating on black.
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

export function Testimonials() {
  return (
    <Section id="testimonials">
      <p className="type-eyebrow text-muted-foreground">Customer stories</p>

      {/* Featured story — quote + stats + portrait on one surface. */}
      <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-muted/40 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)]">
        <div className="flex flex-col justify-between gap-10 p-8 md:p-12">
          <blockquote className="max-w-xl text-[22px] leading-[1.32] tracking-[-0.01em] text-foreground md:text-[27px]">
            &ldquo;{FEATURED.quote}&rdquo;
          </blockquote>

          <div>
            <p className="text-[15px] text-foreground">
              {FEATURED.name}
              <span className="text-muted-foreground">
                {" "}
                &middot; {FEATURED.title}, {FEATURED.firm} &middot;{" "}
                {FEATURED.vertical}
              </span>
            </p>

            {/* Stats — plain number/label columns split by hairlines; no
                nested cards, which read busy inside a card. */}
            <div className="mt-8 grid grid-cols-3 border-t border-border">
              {FEATURED.stats.map((s, i) => (
                <div
                  key={s.label}
                  className={`pt-5 ${i > 0 ? "border-l border-border pl-5" : ""}`}
                >
                  <p className="text-[26px] leading-none tracking-[-0.01em] text-foreground">
                    {s.value}
                  </p>
                  <p className="mt-2 text-[13px] leading-snug text-muted-foreground">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            <Link
              href={`/customers/${FEATURED.slug}`}
              className="group mt-8 inline-flex items-center gap-1.5 text-[15px] text-foreground"
            >
              Read {FEATURED.firm}&rsquo;s story
              <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                &rarr;
              </span>
            </Link>
          </div>
        </div>

        {/* Portrait — bleeds to the card's edges. */}
        <div className="relative h-64 lg:h-auto">
          <Image
            src={`/images/customers/${FEATURED.slug}.jpg`}
            alt={FEATURED.name}
            fill
            sizes="(min-width: 1024px) 400px, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </Section>
  );
}
