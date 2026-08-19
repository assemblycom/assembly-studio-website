import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  SecurityDifferentiators,
  type Differentiator,
} from "@/components/security/security-differentiators";
import { GridDivider, GridRails, GRID_LINE } from "@/components/ui/grid-lines";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { OG_IMAGE } from "@/lib/seo";
import { getTeam } from "@/lib/team-profiles";

/**
 * The about page. New rather than transferred: assembly.com has no about page —
 * its /about redirects to the homepage — so this is the company's first one.
 *
 * Every factual claim below comes from the company's own Contentful copy (the
 * careers page's description and FAQ, which state the mission, the office, the
 * funding stage, the customer count, the rebrands, and what the team is like).
 * Nothing here is inferred: no founding year, headcount, investor names, or
 * funding figures, because none of those are recorded anywhere this site reads.
 * If we want them on the page, they need to come from marketing first.
 *
 * The team section is the one live part, read from the same `teamMembers` entries
 * the careers page uses.
 */
export const revalidate = 3600;

const SEO = {
  title: "About",
  description:
    "Assembly builds the platform behind modern entrepreneurship — making it dramatically easier to start, run, and grow a professional service firm. Post–Series A, based in New York City.",
  path: "/about",
};

export const metadata: Metadata = {
  title: SEO.title,
  description: SEO.description,
  alternates: { canonical: SEO.path },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} | ${SEO.title}`,
    description: SEO.description,
    url: `${SITE_URL}${SEO.path}`,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | ${SEO.title}`,
    description: SEO.description,
    images: [OG_IMAGE.url],
  },
};

/**
 * Only figures the company states outright. Three rather than a four-up because
 * there is no honest fourth — headcount, founding year and funding raised are
 * not written down anywhere this site can read.
 */
const FACTS: { value: string; label: string }[] = [
  { value: "1,000+", label: "Paying customers" },
  { value: "Series A", label: "And post product-market fit" },
  { value: "New York", label: "900 Broadway, by Union Square" },
];

/**
 * What the team is like, drawn from the careers FAQ's own answers rather than
 * written as aspirations — each of these is something the company already tells
 * candidates about itself.
 */
const VALUES: Differentiator[] = [
  {
    title: "Kind, direct, and intense in a good way",
    shortTitle: "Kind and direct",
    description:
      "High standards without being political or abrasive. People say the thing that needs saying, and they say it to your face rather than around you.",
  },
  {
    title: "Ownership over hand-holding",
    shortTitle: "Ownership",
    description:
      "Comfort with ambiguity, and real ownership of the work. Nobody here needs everything perfectly defined before they start moving.",
  },
  {
    title: "In person, by default",
    shortTitle: "In person",
    description:
      "We work from the New York office by default, with a hybrid option on Wednesdays. The team genuinely likes being in a room together, and a lot of us stick around afterwards for chess or games.",
  },
  {
    title: "Good work, not counted days",
    shortTitle: "Good work",
    description:
      "PTO is flexible and we suggest around 20 days a year, but we care about the work being good rather than about the arithmetic. Twice a year the whole team goes somewhere interesting together.",
  },
];

// Section band, matching the 1200px column the rails frame on every other page.
function Band({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`px-6 py-16 md:py-24 ${className}`}>
      <div className="mx-auto max-w-[1200px] md:px-10">{children}</div>
    </section>
  );
}

export default async function AboutPage() {
  const team = await getTeam();

  return (
    <>
      <section className="px-6 pb-16 pt-24 text-center md:pb-24 md:pt-32">
        <div className="mx-auto max-w-3xl">
          <h1 className="type-display text-balance">
            We&rsquo;re building the platform behind modern entrepreneurship
          </h1>
          <p className="type-lead mx-auto mt-6 max-w-2xl text-pretty text-muted-foreground">
            Our goal is to make it dramatically easier to start, run, and grow a
            professional service firm.
          </p>
        </div>
      </section>

      <div className="relative">
        <GridRails />
        <div className={`border-t ${GRID_LINE}`} />

        {/* The same hairline cell grid /security uses for its compliance seals —
            gap-px over a border-coloured bed, each cell repainting the page
            ground over it. */}
        <section className="mx-auto max-w-[1200px] px-6 md:max-[1199px]:px-10 min-[1200px]:px-0">
          <div
            className={`-mx-6 grid grid-cols-1 gap-px bg-border sm:mx-0 sm:grid-cols-3 [[data-theme=dark]_&]:bg-[#383838]`}
          >
            {FACTS.map((fact) => (
              <div
                key={fact.label}
                className="flex flex-col items-center bg-background px-6 py-10 text-center md:py-14"
              >
                <span className="font-mono text-3xl tabular-nums text-foreground md:text-4xl">
                  {fact.value}
                </span>
                <span className="type-caption mt-3 text-muted-foreground">
                  {fact.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        <GridDivider />

        <Band>
          <div className="grid gap-10 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] md:gap-16">
            <h2 className="type-h2 text-balance">What we build</h2>
            <div className="max-w-2xl">
              <p className="type-lead text-pretty text-muted-foreground">
                Professional service firms run on client work, and the software
                for it has always been split across a dozen tools that never
                quite fit. Assembly puts the whole client experience in one
                place: a branded portal where clients message, sign, pay, share
                files, and follow along, and a dashboard where the firm runs it.
              </p>
              <p className="type-lead mt-5 text-pretty text-muted-foreground">
                Assembly Studio is the next step. Rather than asking firms to
                settle for the features we shipped, it lets them describe the app
                their firm actually needs and have it built — production-ready,
                authenticated, and inside the portal their clients already use.
              </p>
              <p className="type-lead mt-5 text-pretty text-muted-foreground">
                Over 1,000 paying firms run on the platform today, across
                accounting, legal, real estate, marketing, and consulting.
              </p>
              <Link
                href="/customers"
                className="type-body mt-6 inline-block text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
              >
                Read what firms have built
              </Link>
            </div>
          </div>
        </Band>

        <GridDivider />

        <Band>
          <div className="max-w-3xl">
            <h2 className="type-h2 text-balance">How we work</h2>
          </div>
          {/* The site's numbered-row list. It lives under components/security
              because that page introduced it, but it takes its rows as a prop and
              is the established shape for this — so it is reused rather than
              restyled into a second version of itself. */}
          <div className="mt-10">
            <SecurityDifferentiators items={VALUES} />
          </div>
        </Band>

        <GridDivider />

        {/* Three names in the CMS carry no role and one carries no photo, so both
            are optional per card rather than the section assuming a full record. */}
        {team.length > 0 && (
          <>
            <Band>
              <div className="max-w-3xl">
                <h2 className="type-h2 text-balance">The team</h2>
                <p className="type-lead mt-5 text-pretty text-muted-foreground">
                  A small team in New York, building for firms we talk to every
                  week.
                </p>
              </div>
              {/* Six up, not four. Twelve people divide evenly into it, and the
                  portraits in the CMS run from 64px to 259px wide — at a 260px
                  card every one of them was being upscaled. A ~180px card leaves
                  most of them at or above their natural size. */}
              <ul className="mt-12 grid grid-cols-3 gap-x-5 gap-y-8 sm:grid-cols-4 lg:grid-cols-6">
                {team.map((member) => {
                  const card = (
                    <>
                      {member.photo ? (
                        <Image
                          src={member.photo.url}
                          alt={member.photo.alt}
                          width={member.photo.width}
                          height={member.photo.height}
                          quality={90}
                          sizes="(min-width: 1024px) 180px, (min-width: 640px) 25vw, 33vw"
                          className="aspect-square w-full rounded-xl object-cover"
                        />
                      ) : (
                        // Keeps the grid on its rhythm when an entry has no
                        // portrait, rather than letting one card ride up.
                        <div className="aspect-square w-full rounded-xl bg-muted" />
                      )}
                      <p className="type-body mt-4 text-foreground">
                        {member.name}
                      </p>
                      {member.about && (
                        <p className="type-caption mt-1 text-muted-foreground">
                          {member.about}
                        </p>
                      )}
                    </>
                  );
                  return (
                    <li key={member.name}>
                      {member.profileLink ? (
                        <a
                          href={member.profileLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group block transition-opacity hover:opacity-90"
                        >
                          {card}
                        </a>
                      ) : (
                        card
                      )}
                    </li>
                  );
                })}
              </ul>
            </Band>

            <GridDivider />
          </>
        )}

        {/* Worth stating plainly: the old names are still all over the internet,
            and someone landing here from a 2022 article deserves an answer. */}
        <Band>
          <div className="grid gap-10 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] md:gap-16">
            <h2 className="type-h2 text-balance">Portal, then Copilot, now Assembly</h2>
            <p className="type-lead max-w-2xl text-pretty text-muted-foreground">
              We&rsquo;ve rebranded twice as the company and the product changed,
              so older articles, job posts, and forum threads still call us Portal
              or Copilot. Same company, same team, and a fair amount of the
              codebase still says Copilot too.
            </p>
          </div>
        </Band>

        <GridDivider />
      </div>

      <section className="px-6 py-16 text-center md:py-24">
        <h2 className="type-display mx-auto max-w-md text-balance text-foreground md:max-w-2xl">
          Come build it with us
        </h2>
        <p className="type-lead mx-auto mt-5 max-w-sm text-pretty text-muted-foreground sm:max-w-xl">
          We hire for high standards and real ownership, mostly in New York.
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href="/jobs"
            className="rounded-lg bg-foreground px-5 py-2.5 text-center text-sm text-background transition-opacity hover:opacity-90"
          >
            See open roles
          </Link>
        </div>
      </section>
    </>
  );
}
