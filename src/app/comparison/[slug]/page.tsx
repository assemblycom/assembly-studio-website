import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComparisonBody } from "@/components/comparison/comparison-body";
import { cmsPageMetadata } from "@/lib/cms-page-metadata";
import { getComparison, getComparisons } from "@/lib/comparisons";

/**
 * One competitor comparison, on the same /comparison/<slug> URL assembly.com
 * serves it from — the CMS slugs ("assembly-vs-moxo-alternative") are kept as
 * they are, since they carry the search traffic these pages exist for.
 */
export const revalidate = 3600;

export async function generateStaticParams() {
  const pages = await getComparisons();
  return pages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getComparison(slug);
  if (!page) return {};
  return cmsPageMetadata(page, `/comparison/${page.slug}`);
}

export default async function ComparisonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getComparison(slug);
  if (!page) notFound();
  return <ComparisonBody page={page} />;
}
