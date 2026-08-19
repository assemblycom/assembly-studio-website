import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { GridDivider, GridRails } from "@/components/ui/grid-lines";
import { RichText } from "@/components/ui/rich-text";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { OG_IMAGE } from "@/lib/seo";
import { getJobListings, getRole } from "@/lib/careers";

export const revalidate = 3600;

export async function generateStaticParams() {
  // Every written-up role, including any whose posting has since closed — those
  // render as a redirect, which still needs the route to exist.
  const listings = await getJobListings();
  return listings.map((listing) => ({ slug: listing.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const role = await getRole(slug);
  if (!role) return {};

  const title = `${role.listing.name} · Careers`;
  const description = role.posting
    ? `${role.listing.name} at Assembly — ${[role.posting.location, role.posting.employmentType].filter(Boolean).join(", ")}.`
    : `${role.listing.name} at Assembly.`;

  return {
    title,
    description,
    alternates: { canonical: `/jobs/${slug}` },
    // A closed role redirects, so it must not invite indexing on the way.
    ...(role.posting ? {} : { robots: { index: false, follow: true } }),
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: `${SITE_NAME} | ${title}`,
      description,
      url: `${SITE_URL}/jobs/${slug}`,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: `${SITE_NAME} | ${title}`,
      description,
      images: [OG_IMAGE.url],
    },
  };
}

export default async function JobPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const role = await getRole(slug);
  if (!role) notFound();

  const { listing, posting } = role;
  // No live Ashby posting means the role has closed. The URL keeps working — it
  // has been linked and indexed — but it sends people to what IS open instead of
  // showing a salary band and an apply button that lead nowhere.
  if (!posting) redirect("/jobs");

  const meta = [
    posting.department,
    posting.isRemote ? `${posting.location} · Remote` : posting.location,
    posting.employmentType,
    posting.compensation,
  ].filter(Boolean);

  const applyButton = (
    <a
      href={posting.applyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block rounded-lg bg-foreground px-5 py-2.5 text-center text-sm text-background transition-opacity hover:opacity-90"
    >
      Apply for this role
    </a>
  );

  return (
    <>
      <section className="px-6 pb-12 pt-24 md:pb-16 md:pt-32">
        <div className="mx-auto max-w-3xl">
          <nav aria-label="Breadcrumb" className="type-caption text-muted-foreground">
            <Link href="/jobs" className="transition-colors hover:text-foreground">
              Careers
            </Link>
            <span aria-hidden className="px-2 text-foreground/30">
              /
            </span>
            <span className="text-foreground">{listing.name}</span>
          </nav>

          <h1 className="type-display mt-6 text-balance">{listing.name}</h1>
          <p className="type-caption mt-5 text-muted-foreground">
            {meta.join(" · ")}
          </p>
          <div className="mt-8">{applyButton}</div>
        </div>
      </section>

      <div className="relative">
        <GridRails />
        <div className="border-t border-border [[data-theme=dark]_&]:border-[#383838]" />

        <article className="mx-auto max-w-[1200px] px-6 pb-20 pt-16 md:px-10 md:pb-28 md:pt-24">
          <div className="max-w-3xl">
            <RichText document={listing.description} />

            {listing.team.length > 0 && (
              <div className="mt-14">
                <h2 className="type-h4 text-foreground">Who you&rsquo;ll work with</h2>
                <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-5">
                  {listing.team.map((member) => {
                    const body = (
                      <>
                        {member.image && (
                          <Image
                            src={member.image.url}
                            alt={member.image.alt}
                            width={40}
                            height={40}
                            className="size-10 rounded-full object-cover"
                          />
                        )}
                        <span className="type-body text-muted-foreground">
                          {member.name}
                        </span>
                      </>
                    );
                    return (
                      <li key={member.name}>
                        {member.profileLink ? (
                          <a
                            href={member.profileLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 transition-colors hover:[&>span]:text-foreground"
                          >
                            {body}
                          </a>
                        ) : (
                          <span className="flex items-center gap-3">{body}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <div className="mt-14">{applyButton}</div>
          </div>
        </article>

        <GridDivider />
      </div>
    </>
  );
}
