import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CmsPageBody } from "@/components/cms/cms-page-body";
import { cmsPageMetadata } from "@/lib/cms-page-metadata";
import { getSolution, getSolutions } from "@/lib/solutions";

// Re-resolved against Contentful rather than only at deploy, so a copy edit
// lands without shipping. Matches the glossary's window.
export const revalidate = 3600;

export async function generateStaticParams() {
  const solutions = await getSolutions();
  return solutions.map((solution) => ({ slug: solution.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const solution = await getSolution(slug);
  if (!solution) return {};
  return cmsPageMetadata(solution, `/solutions/${solution.slug}`);
}

export default async function SolutionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const solution = await getSolution(slug);
  if (!solution) notFound();
  return <CmsPageBody page={solution} />;
}
