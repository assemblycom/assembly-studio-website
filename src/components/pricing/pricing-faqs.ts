import type { FAQEntry } from "@/components/home/faq";

// Pricing-page FAQ copy (source: pricing copy spec). Rendered via the shared
// <FAQ> component on /pricing.
export const PRICING_FAQS: FAQEntry[] = [
  {
    question: "Is there really a free plan?",
    answer:
      "Yes, there is a free plan. You get 5 active contacts, 1 internal user, 50 build credits a month, and 5 apps. The apps you publish are real, live apps your clients can use. Upgrade only when your firm outgrows the limits.",
  },
  {
    question: "What are build credits?",
    answer:
      "Build credits are used when the app builder creates or edits an app. A typical app takes a few dozen credits to build from scratch, and smaller changes use less. Credits refresh every month on every plan. Using your apps does not consume build credits; once an app is live, you and your clients can use it as much as you want.",
  },
  {
    question: "Does planning an app use my credits?",
    answer:
      "No. Describing your idea, answering the builder's product questions, and reviewing your app plan are all free. Credits are only used once you approve the plan and building starts. Failed builds don't consume credits either.",
  },
  {
    question: "What happens if I run out of build credits?",
    answer:
      "Running out of credits does not break your apps. Your live apps keep running for you and your clients. On any paid plan you can add more build credits anytime, up to 10,000 a month. On the Free plan, your credits refresh next month, or upgrade to keep building now.",
  },
  {
    question: "How much do extra build credits cost?",
    answer:
      "Extra credits cost $0.60 per credit above the 200 included. This is the same flat rate on every paid plan. Adjust your monthly credit amount anytime from your plan settings: increases apply immediately, decreases at your next renewal.",
  },
  {
    question: "Do unused build credits roll over?",
    answer:
      "No, credit balances refresh to your plan's amount each month. If you're planning a heavy build month, add-on credits can be adjusted month to month on any paid plan.",
  },
  {
    question: "How many apps can I have?",
    answer:
      "Every plan includes 5 apps, whether you build them with the app builder or install from the app library, they count the same. Need more? Add extra apps for $5/month each on any paid plan. Embeds and links don't count toward the limit.",
  },
  {
    question: "What does it cost to run my apps?",
    answer:
      "Nothing beyond your plan. Other builders meter what happens after you publish — hosting tiers, AI usage, message caps. On Assembly, your 5 included apps and any $5/month extra apps come with hosting, storage, and AI usage built in, with limits generous enough that a typical firm never thinks about them. If an app ever approaches our internal limits, we'll reach out to you first. Planning something with unusual demands such as heavy AI, large data, high traffic? Talk to us before you build and we'll make sure it's set up right.",
  },
  {
    question: "What counts as an active contact?",
    answer:
      "Active contacts are the client records in your CRM (the people who can sign into your client experience). Your team members are internal users and counted separately.",
  },
  {
    question: "Can I upgrade, downgrade, or cancel anytime?",
    answer:
      "Yes, plan changes are self-serve. Upgrades take effect immediately, so you get the new limits right away; downgrades and cancellations take effect at the end of your current billing period. No contracts on self-serve plans, no cancellation fees.",
  },
  {
    question: "How does annual billing work?",
    answer:
      "Annual billing discounts the base subscription. For example, Starter is $29/month billed annually vs. $49 billed monthly. Build credits are granted monthly on both billing frequencies, and add-on credits and extra apps are billed at the same rates either way.",
  },
  {
    question: "Are there any other fees I should know about?",
    answer:
      "Only if you charge clients through Assembly: payment processing fees apply when you collect payments, and the rates improve as you move up plans — the full breakdown is in the plan details above. There are no setup fees, hosting fees, or per-client charges.",
  },
];
