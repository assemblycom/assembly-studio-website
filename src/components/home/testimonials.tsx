import Image from "next/image";
import Link from "next/link";
import { Section } from "@/components/ui/section";
import { MaskLogo } from "@/components/customers/mask-logo";

// ─────────────────────────────────────────────────────────────────────────
// FEATURED STORY — one pull quote, a few killer stats, and a link to the
// case study (per the landing narrative doc: almost no-one clicks through
// to the other quotes, so lean into the strongest one). The doc wants this
// filled by an Assembly Studio beta firm once that content exists — until
// then Jungle Luxe carries it, the strongest outcome-shaped story we have.
// Swap FEATURED when the beta-firm content lands.
// ─────────────────────────────────────────────────────────────────────────

const FEATURED = {
  quote:
    "We've definitely reduced inquiries by owners by at least 50%. It probably saved the cost of a whole extra administrator from my company.",
  name: "Rachel Hugenschmidt",
  title: "Founder",
  firm: "Jungle Luxe",
  vertical: "Property management, 110+ owners",
  stats: [
    { value: "50%+", label: "fewer owner inquiries" },
    { value: "110+", label: "owners using the portal" },
    { value: "1 FTE", label: "cost saved" },
  ],
  slug: "jungle-luxe",
};

export function Testimonials() {
  return (
    <Section id="testimonials">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:items-stretch lg:gap-16">
        {/* Quote + stats. The pull quote leads the section — no eyebrow, no
            generic header; the customer's words are the headline. */}
        <div className="flex flex-col justify-between">
          <blockquote className="type-h3 max-w-2xl text-foreground">
            &ldquo;{FEATURED.quote}&rdquo;
          </blockquote>

          <div className="mt-10">
            <p className="text-[15px] text-foreground">
              {FEATURED.name} &middot; {FEATURED.title}, {FEATURED.firm}{" "}
              <span className="text-muted-foreground">
                &middot; {FEATURED.vertical}
              </span>
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3">
              {FEATURED.stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-border bg-muted px-5 py-6"
                >
                  <p className="type-h3 text-foreground">{s.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            <Link
              href={`/customers/${FEATURED.slug}`}
              className="mt-8 inline-block text-[15px] text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
            >
              Read {FEATURED.firm}&rsquo;s story &rarr;
            </Link>
          </div>
        </div>

        {/* Headshot + firm logo. */}
        <div className="relative min-h-[320px] overflow-hidden rounded-2xl lg:min-h-0">
          <Image
            src={`/images/customers/${FEATURED.slug}.jpg`}
            alt={FEATURED.name}
            fill
            sizes="(min-width: 1024px) 380px, 100vw"
            className="object-cover"
          />
          <div className="absolute bottom-4 left-4 text-white">
            <MaskLogo
              src={`/images/customers/${FEATURED.slug}-logo-mask.png`}
              aspect="181 / 285"
              className="w-8"
            />
          </div>
        </div>
      </div>
    </Section>
  );
}
