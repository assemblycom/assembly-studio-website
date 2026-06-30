import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { CustomersHub } from "@/components/customers/customers-hub";
import { CustomersHero } from "@/components/customers/customers-hero";

export const metadata: Metadata = {
  title: "Customers",
  description:
    "Trusted by consulting, accounting, real estate, law, marketing, and tech firms with 1M+ clients and counting.",
};

export default function CustomersPage() {
  return (
    <>
      <CustomersHero />

      <Section className="pt-4 md:pt-6">
        <CustomersHub />
      </Section>
    </>
  );
}
