import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CmsPageBody } from "@/components/cms/cms-page-body";
import { cmsPageMetadata } from "@/lib/cms-page-metadata";
import { getFeaturePage, getFeaturePages, isFeatureSlug } from "@/lib/features";

/**
 * The feature pages, on the same top-level URLs the marketing site uses
 * (/client-portal, /invoicing, …). A root dynamic segment, because those URLs
 * carry no prefix to nest them under and keeping them is the point.
 *
 * It cannot shadow a real page: Next matches a static segment ahead of a dynamic
 * one, so /pricing, /security, /blog and the rest still resolve to their own
 * routes. Anything else single-segment 404s here exactly as it did before, via
 * the slug guard below.
 */
export const revalidate = 3600;

export async function generateStaticParams() {
  const pages = await getFeaturePages();
  return pages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!isFeatureSlug(slug)) return {};
  const page = await getFeaturePage(slug);
  if (!page) return {};
  return cmsPageMetadata(page, `/${page.slug}`);
}

export default async function FeaturePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // Checked before the fetch so an unrelated URL 404s without a CMS round trip.
  if (!isFeatureSlug(slug)) notFound();
  const page = await getFeaturePage(slug);
  if (!page) notFound();
  return <CmsPageBody page={page} />;
}
