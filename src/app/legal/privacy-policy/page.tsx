import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { PRIVACY_POLICY } from "@/lib/legal-privacy-policy";
import { PAGE_SEO, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(PAGE_SEO.privacyPolicy);

export default function PrivacyPolicyPage() {
  return <LegalPage document={PRIVACY_POLICY} />;
}
