import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { TERMS_OF_SERVICE } from "@/lib/legal-terms-of-service";
import { PAGE_SEO, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(PAGE_SEO.termsOfService);

export default function TermsOfServicePage() {
  return <LegalPage document={TERMS_OF_SERVICE} />;
}
