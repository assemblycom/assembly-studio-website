import type { Metadata } from "next";
import type { FAQEntry } from "@/components/home/faq";
import {
  ProgramPage,
  type ProgramCategory,
  type ProgramStep,
} from "@/components/programs/program-page";
import { AFFILIATE_APPLY_URL, PARTNERSHIPS_EMAIL } from "@/lib/constants";
import { PAGE_SEO, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(PAGE_SEO.affiliatesProgram);

const CATEGORIES: ProgramCategory[] = [
  {
    title: "Video creators",
    description:
      "Add affiliate links to videos about starting a business, setting up best-in-class software, and the tools you run on.",
  },
  {
    title: "Influencers",
    description:
      "Social media creators can earn by sharing their own Assembly experience with their community.",
  },
  {
    title: "Bloggers",
    description:
      "Add affiliate links to your newsletter, blog posts, reviews, or any written material.",
  },
  {
    title: "Networks",
    description:
      "News aggregators, outlets, and directories can use Assembly affiliate links to earn from their audience.",
  },
];

const STEPS: ProgramStep[] = [
  {
    title: "Apply",
    description:
      "Apply to be an affiliate and hear back from our team in less than seven days.",
  },
  {
    title: "Create",
    description:
      "Make videos on YouTube or TikTok, write in your blog, or record a podcast.",
  },
  {
    title: "Share",
    description:
      "Share your unique link as much as you want, in any medium you choose.",
  },
  {
    title: "Earn",
    description:
      "Earn 20% commission automatically on businesses that sign up through your link.",
  },
];

const FAQS: FAQEntry[] = [
  {
    question: "How do I create, track, and promote my affiliate link?",
    shortQuestion: "How do I track my link?",
    answer:
      "You can create multiple links and see your stats in your PartnerStack dashboard. Once you have your personalized link, promote it wherever you publish: your blog, your social profiles, your site, your videos. The more places the better.\n\nWhenever you post about Assembly, your message has to make it obvious that you have a financially compensated relationship with us. All promotions need to be FTC compliant.",
  },
  {
    question: "What qualifies as a successful conversion?",
    answer:
      "A net new workspace that upgrades to a paid plan within 180 days of clicking your affiliate link. Commissions are paid on a last-click basis, so your link has to be the last touch point before the signup.",
  },
  {
    question:
      "What if a customer adds seats or upgrades after their first invoice?",
    shortQuestion: "What about seats and upgrades?",
    answer:
      "Rewards are generated for every new transaction, and that includes both seat upgrades and plan upgrades.",
  },
  {
    question: "Can I refer myself?",
    answer:
      "No. Self-referrals aren't allowed. The program exists to reward you for referring other people, not as a way to discount your own account.",
  },
  {
    question: "How can I ask additional questions?",
    answer: `If you have more questions, email us at ${PARTNERSHIPS_EMAIL}.`,
    links: [
      { label: PARTNERSHIPS_EMAIL, href: `mailto:${PARTNERSHIPS_EMAIL}` },
    ],
  },
];

export default function AffiliatesProgramPage() {
  return (
    <ProgramPage
      title="Assembly Affiliate Program"
      lede="Refer Assembly to your friends and followers, and earn 20% of all referred payments for a year. There's no limit to how much you can earn."
      actions={[
        { label: "Apply now", href: AFFILIATE_APPLY_URL, external: true },
      ]}
      categoriesHeading="For people with an audience that can benefit from Assembly"
      categories={CATEGORIES}
      quote={{
        quote:
          "Assembly is a super flexible client portal solution. They have an interesting take on the client experience layer.",
        name: "Jason Staats",
        role: "Founder, Realize CPA",
      }}
      stepsHeading="Apply now, get accepted tomorrow, and start earning"
      steps={STEPS}
      faqs={FAQS}
    />
  );
}
