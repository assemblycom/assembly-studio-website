import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FAQ } from "@/components/home/faq";
import { GridDivider, GridRails } from "@/components/ui/grid-lines";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { OG_IMAGE } from "@/lib/seo";
import { getCareersPage, getOpenRoles } from "@/lib/careers";

// The open roles come from Ashby, so the page has to re-resolve rather than being
// pinned at deploy — a role closing should take itself off the page.
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCareersPage();
  if (!page) return {};
  const { title, description } = page.seo;
  return {
    title,
    description,
    alternates: { canonical: "/jobs" },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: `${SITE_NAME} | ${title}`,
      description,
      url: `${SITE_URL}/jobs`,
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

function Band({ children }: { children: React.ReactNode }) {
  return (
    <section className="px-6 py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] md:px-10">{children}</div>
    </section>
  );
}

export default async function JobsPage() {
  const [page, roles] = await Promise.all([getCareersPage(), getOpenRoles()]);
  // The page's own copy lives in Contentful; without it there is nothing to show
  // but a bare list, so this is a 404 rather than a half-page.
  if (!page) notFound();

  return (
    <>
      <section className="px-6 pb-16 pt-24 text-center md:pb-24 md:pt-32">
        <div className="mx-auto max-w-[1200px] md:px-10">
          <div className="mx-auto max-w-3xl">
            <h1 className="type-display text-balance">{page.title}</h1>
            {page.description && (
              <p className="type-lead mx-auto mt-6 max-w-2xl text-pretty text-muted-foreground">
                {page.description}
              </p>
            )}
          </div>
          {page.banner && (
            <Image
              src={page.banner.url}
              alt={page.banner.alt}
              width={page.banner.width}
              height={page.banner.height}
              quality={90}
              sizes="(min-width: 1200px) 1120px, 100vw"
              priority
              className="mt-14 w-full rounded-xl"
            />
          )}
        </div>
      </section>

      <div className="relative">
        <GridRails />
        <div className="border-t border-border [[data-theme=dark]_&]:border-[#383838]" />

        <Band>
          <h2 className="type-h2">{page.sectionTitles.roles}</h2>
          {roles.length === 0 ? (
            // Ashby unreachable, or genuinely nothing open. Either way the honest
            // thing is to say so rather than list roles we can't confirm.
            <p className="type-lead mt-5 max-w-2xl text-muted-foreground">
              No open roles right now. Check back soon.
            </p>
          ) : (
            <ul className="mt-10">
              {roles.map((role) => {
                // Our own page when Contentful has written the role up;
                // otherwise the Ashby posting, which always exists.
                const href = role.slug ? `/jobs/${role.slug}` : role.jobUrl;
                const external = !role.slug;
                const meta = [
                  role.department,
                  role.isRemote ? `${role.location} · Remote` : role.location,
                  role.employmentType,
                  role.compensation,
                ].filter(Boolean);
                return (
                  <li
                    key={role.title}
                    className="border-t border-border last:border-b [[data-theme=dark]_&]:border-[#383838]"
                  >
                    <Link
                      href={href}
                      {...(external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className="group flex flex-col gap-2 py-6 transition-colors hover:bg-foreground/[0.02] sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                    >
                      <span className="type-h4 text-foreground">
                        {role.title}
                      </span>
                      <span className="type-caption text-muted-foreground">
                        {meta.join(" · ")}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Band>

        {page.media.length > 0 && (
          <>
            <GridDivider />
            <Band>
              <h2 className="type-h2">{page.sectionTitles.media}</h2>
              <ul className="mt-10">
                {page.media.map((item) => (
                  <li
                    key={item.link}
                    className="border-t border-border last:border-b [[data-theme=dark]_&]:border-[#383838]"
                  >
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col gap-1 py-5 transition-colors hover:bg-foreground/[0.02] sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                    >
                      <span className="type-body text-foreground">
                        {item.name}
                      </span>
                      <span className="type-caption text-muted-foreground">
                        {[item.author, item.date].filter(Boolean).join(" · ")}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </Band>
          </>
        )}

        {page.benefits.length > 0 && (
          <>
            <GridDivider />
            <Band>
              <h2 className="type-h2">{page.sectionTitles.benefits}</h2>
              <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {page.benefits.map((benefit) => (
                  <div
                    key={benefit.title}
                    className="rounded-[8px] bg-muted p-5"
                  >
                    <h3 className="type-h4 text-foreground">{benefit.title}</h3>
                    <p className="type-body mt-2 text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                ))}
              </div>
            </Band>
          </>
        )}

        {page.faqs.length > 0 && (
          <>
            <GridDivider />
            <FAQ heading="Frequently asked questions" items={page.faqs} twoColumn />
          </>
        )}

        <GridDivider />
      </div>
    </>
  );
}
