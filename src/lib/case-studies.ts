export interface CaseStudy {
  slug: string;
  company: string;
  industry: string;
  headline: string;
  summary: string;
  metric: string;
  metricLabel: string;
  challenge: string;
  solution: string;
  results: string[];
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "capital-one-luxury-travel",
    company: "Capital One Luxury Travel",
    industry: "Travel & Hospitality",
    headline:
      "How Capital One Luxury Travel Balanced ‘Build vs. Buy’ with Assembly",
    summary:
      "Capital One Luxury Travel combined Assembly’s off-the-shelf client portal software with platform flexibility to support a custom solution for its hotel partner program.",
    metric: "2x",
    metricLabel: "faster partner onboarding",
    challenge:
      "Capital One Luxury Travel manages a global network of hotel partners offering premium travel benefits for Capital One cardholders. As the program scaled to thousands of hotels, onboarding took 50–60 days per partner. The team previously managed partners through Google spreadsheets and email chains, creating scaling difficulties and friction.",
    solution:
      "Assembly’s platform provided the flexibility of custom development with out-of-the-box speed. Capital One implemented a secure, white-labeled portal with custom onboarding forms, review and approval workflows, client messaging, secure document sharing, embedded training modules for compliance, and automated notifications reducing manual follow-up.",
    results: [
      "Scaled from hundreds to 1,100+ hotel partners",
      "Reduced onboarding from 60 days to approximately 30 days",
      "Centralized partner engagement into one branded hub",
      "100%+ growth in portal users",
    ],
  },
  {
    slug: "valuenode-accounting",
    company: "ValueNode Accounting",
    industry: "Accounting & CPA",
    headline:
      "How ValueNode Accounting Built a Fully Digital CPA Practice with Assembly",
    summary:
      "Dr. Najlaa Kallousa transformed her CPA practice into a fully digital experience, cutting client time by 90% and onboarding new clients in under 30 minutes.",
    metric: "90%",
    metricLabel: "client time saved",
    challenge:
      "Dr. Kallousa initially explored ShareFile and CCHiFirm but found them insufficient. She needed everything to connect — file management, signatures, scheduling, and client communication — in a single integrated platform rather than a patchwork of disconnected tools.",
    solution:
      "Assembly serves as the integrated platform for ValueNode’s operations. Clients access a structured file system organized by year, sign contracts electronically with full audit trails, book appointments directly within the portal, and interact with custom-scripted Google Sheets for transaction review workflows with automatic notifications.",
    results: [
      "Onboarding reduced from 5+ hours to 10–30 minutes",
      "Electronic signatures eliminate in-person meeting requirements",
      "100% digital client experience from day one",
      "Everything managed in one place — files, messages, contracts, and scheduling",
    ],
  },
  {
    slug: "metta-health",
    company: "Metta Health",
    industry: "Healthcare",
    headline:
      "How Metta Health Scales HIPAA-Compliant Patient Authorizations with Assembly",
    summary:
      "Metta Health replaced DocuSign with Assembly to handle sensitive patient authorization forms at scale, achieving 80% cost savings and building patient trust through white-labeled communications.",
    metric: "80%",
    metricLabel: "cost savings",
    challenge:
      "Metta Health needed to obtain patient authorization forms at scale for insurance dispute cases. Generic e-signature requests from platforms like DocuSign created friction — patients didn’t recognize senders and hesitated to sign. Per-signature pricing was cost-prohibitive for a bootstrapped startup sending dozens of forms monthly across 50–60 templates.",
    solution:
      "Assembly’s flat subscription pricing and white-labeled experience solved both problems. When patients receive authorization requests, emails appear branded from Metta Health — not a generic third party. The Contracts app creates pre-filled authorization templates with timestamped receipts including signer’s IP address for legal proceedings.",
    results: [
      "Reduced cost per form from ~$10 to $1–2 (80% savings)",
      "5–10x ROI compared to DocuSign",
      "50+ authorization templates managed",
      "White-labeled emails dramatically improved signature completion rates",
    ],
  },
  {
    slug: "orca-accounting",
    company: "Orca Accounting",
    industry: "Accounting",
    headline:
      "How Orca Accounting Scaled 4.5x in 7 Months with Professional Client Portal Software",
    summary:
      "Leah McCool transformed her bookkeeping practice, growing her client base by 400% in 7 months while cutting onboarding time by 75% using Assembly’s integrated client portal.",
    metric: "400%",
    metricLabel: "client growth in 7 months",
    challenge:
      "After launching Orca Accounting, Leah relied on fragmented tools including shared Google Drives, email, and text messaging. This patchwork system made onboarding consume up to two weeks per client. The informal approach couldn’t scale with the growing practice.",
    solution:
      "After evaluating Dubsado, Karbon, and Moxo, Leah selected Assembly for ease of implementation and its modern interface. She implemented automated onboarding with custom forms, standardized file folders, the Tasks app to guide clients through required steps, contract templates, secure messaging, Calendly integration, and integrated invoicing.",
    results: [
      "Quadrupled client base within seven months",
      "75% faster client onboarding",
      "80% less email back-and-forth",
      "Every client praised the easy onboarding experience",
    ],
  },
  {
    slug: "jungle-luxe",
    company: "Jungle Luxe",
    industry: "Real Estate & Property Management",
    headline:
      "How Jungle Luxe Brings Peace of Mind to International Property Owners with Assembly",
    summary:
      "Rachel Hugenschmidt’s Tulum-based luxury property management company uses Assembly’s client portal to create transparency for remote property owners and reduce inquiries by over 50%.",
    metric: "50%+",
    metricLabel: "reduction in client inquiries",
    challenge:
      "Jungle Luxe manages vacation rental properties for over 110 owners, many living thousands of miles away. Communications were scattered across WhatsApp, emails, and texts. As Rachel described it, “It was really decentralized. People were sending documents through WhatsApp and it was just a huge mess.” The lean 16-person team couldn’t scale through hiring alone in a lower-margin business.",
    solution:
      "Each property owner now accesses a dedicated portal with organized folders containing contracts, rental licenses, insurance certificates, monthly statements, receipts, and proof of payment transfers. Assembly’s Messages App manages daily owner communications across departments, and a resource center built with the Helpdesk App enables owner self-service.",
    results: [
      "Reduced owner inquiries by at least 50%",
      "110+ property owners served through the portal",
      "Saved the cost of one full-time administrator",
      "Created a competitive advantage — no one else in Mexico is doing anything like it",
    ],
  },
  {
    slug: "zen-aegis",
    company: "Zen Aegis",
    industry: "Professional Services",
    headline:
      "How Zen Aegis Saves Clients 40+ Hours a Week With Secure, Automated Portal Software",
    summary:
      "Kody Foringer and Robert Prochnow transformed how they deliver fractional executive leadership services by building automated, secure portals — saving clients up to 90% of manual labor time.",
    metric: "40+",
    metricLabel: "hours saved per week",
    challenge:
      "The team needed more than an eclectic bunch of software for managing operations. Previously using DocuSign, Office 365, and Intercom separately, they faced limitations with disparate tools as clients demanded more personalized, secure experiences and automated efficiency.",
    solution:
      "Zen Aegis implemented Assembly’s portal platform with robust Zapier and API integrations to build tailored client experiences. They created smart workflows that dynamically adjust portal visibility, sync client responses to task management software, and trigger SMS updates through integrated booking systems.",
    results: [
      "90% reduction in manual data entry time for clients",
      "40+ hours saved per week through automation",
      "1,000+ automations triggered across client base",
      "Scaled operations without growing headcount",
    ],
  },
];

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return CASE_STUDIES.find((cs) => cs.slug === slug);
}
