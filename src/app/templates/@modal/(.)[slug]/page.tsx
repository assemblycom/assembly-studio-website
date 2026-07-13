import { notFound } from "next/navigation";
import { TEMPLATES, getTemplateBySlug } from "@/lib/templates";
import {
  TemplateModalBrowser,
  type ModalTemplate,
} from "@/components/templates/template-modal";

interface Props {
  params: Promise<{ slug: string }>;
}

/**
 * Intercepted template detail — opens as a modal over the templates grid.
 * All templates are passed down so the modal's prev/next arrows flip through
 * them client-side (one interception; no further route navigation).
 */
export default async function TemplateModalPage({ params }: Props) {
  const { slug } = await params;
  if (!getTemplateBySlug(slug)) notFound();

  const templates: ModalTemplate[] = TEMPLATES.map((t) => ({
    slug: t.slug,
    title: t.title,
    description: t.description,
    longDescription: t.longDescription,
    category: t.category,
    industries: t.industries,
  }));

  return <TemplateModalBrowser templates={templates} initialSlug={slug} />;
}
