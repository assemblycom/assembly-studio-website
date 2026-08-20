import type { Metadata } from "next";
import type { FAQEntry } from "@/components/home/faq";
import {
  ProgramPage,
  type ProgramCategory,
  type ProgramStep,
} from "@/components/programs/program-page";
import {
  EXPERT_APPLY_URL,
  EXPERTS_DIRECTORY_URL,
  PARTNERSHIPS_EMAIL,
} from "@/lib/constants";
import { PAGE_SEO, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(PAGE_SEO.expertsProgram);

const CATEGORIES: ProgramCategory[] = [
  {
    title: "Workspace setup",
    description:
      "Set up Assembly workspaces from scratch: connect landing pages, configure customizations and automations, and get a firm running.",
  },
  {
    title: "Migrations",
    description:
      "Move businesses over from other products, including client and file migrations and switching payment processors.",
  },
  {
    title: "Automations",
    description:
      "Configure automations with Zapier and Make to streamline client onboarding, cut human error, and save teams time.",
  },
  {
    title: "Custom apps",
    description:
      "Build custom apps for firms whose requirements the out-of-the-box features don't fully cover.",
  },
];

const STEPS: ProgramStep[] = [
  {
    title: "Apply",
    description:
      "Hear back from our team in less than seven days. The surest way to be approved is to have already helped firms with Assembly deployments.",
  },
  {
    title: "Customize",
    description:
      "You'll be invited to PartnerStack for educational resources and referral tracking, and to PartnerPage to get listed in our Experts directory.",
  },
  {
    title: "Implement",
    description:
      "We send business your way through our network and the directory, and you can pitch Assembly wherever you think we're a good fit.",
  },
  {
    title: "Earn",
    description:
      "Earn 20% commission automatically on firms that sign up through your link, or on workspaces where you're invited as the first expert.",
  },
];

const FAQS: FAQEntry[] = [
  {
    question: "Is revenue share retroactive if I join later?",
    answer:
      "No. Revenue share only applies to workspaces referred or joined after you're in the program.",
  },
  {
    question: "What if a customer adds seats or upgrades later?",
    answer:
      "Rewards are generated for every new transaction, and that includes both seat upgrades and plan upgrades.",
  },
  {
    question: "If I leave a team, do I stop receiving revenue share?",
    shortQuestion: "What if I leave a team?",
    answer:
      "Yes. If you're earning through the second path, joining a workspace as its first Assembly expert, you have to remain an internal user on that team to keep earning.",
  },
  {
    question: "How can I ask additional questions?",
    answer: `If you have more questions, email us at ${PARTNERSHIPS_EMAIL}.`,
    links: [
      { label: PARTNERSHIPS_EMAIL, href: `mailto:${PARTNERSHIPS_EMAIL}` },
    ],
  },
];

export default function ExpertsProgramPage() {
  return (
    <ProgramPage
      title="Assembly Experts Program"
      lede="Agencies and freelancers who set up Assembly workspaces or build custom client solutions earn a recurring revenue share, an Experts directory listing, and access to an exclusive Slack group."
      actions={[
        { label: "Apply now", href: EXPERT_APPLY_URL, external: true },
        {
          label: "View directory",
          href: EXPERTS_DIRECTORY_URL,
          external: true,
        },
      ]}
      categoriesHeading="Made for agencies and freelancers who help firms succeed on Assembly"
      categories={CATEGORIES}
      stepsHeading="Apply now, get accepted tomorrow, and start earning"
      steps={STEPS}
      faqs={FAQS}
    />
  );
}
