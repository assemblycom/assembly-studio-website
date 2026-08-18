import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { AI_POLICY } from "@/lib/legal-ai-policy";
import { PAGE_SEO, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(PAGE_SEO.aiPolicy);

export default function AiPolicyPage() {
  return <LegalPage document={AI_POLICY} />;
}
