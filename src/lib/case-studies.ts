export interface Stat {
  value: string;
  label: string;
}

export interface GlanceInfo {
  founded?: string;
  runningSince: string;
  companyUrl: string;
  apps: string[];
}

export type ContentBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "quote"; text: string; attribution?: string }
  | { type: "image"; src: string; alt: string };

export interface CaseStudy {
  slug: string;
  company: string;
  // Optional shorter label for compact placements (e.g. the customers-page card
  // overlay) where the full company name is too long.
  shortName?: string;
  industry: string;
  headline: string;
  summary: string;
  // Search-snippet copy. The on-page `summary` is written for the card, which
  // is a different job from the ~155 characters Google shows.
  seoDescription: string;
  stats: Stat[];
  challenge: string;
  solution: string;
  results: string[];
  // Optional rich editorial content. When present, the detail page renders the
  // full case-study layout (At a Glance sidebar + body blocks) instead of the
  // simple challenge/solution/results template.
  glance?: GlanceInfo;
  body?: ContentBlock[];
  // Given more visual weight on the customers index (spans a wider card).
  featured?: boolean;
  // Set only when a story has a real video: the detail page then leads with the
  // player. Without it the page opens straight into the copy.
  videoUrl?: string;
  // Card thumbnail / video poster image.
  image?: string;
}

// Card thumbnail — only the real provided image, or undefined (show a plain
// gray placeholder). No stock/placeholder photos.
export function caseStudyImage(study: CaseStudy): string | undefined {
  return study.image;
}

// Maps each detailed industry label to a broader filter group used on the
// customers index. Keeps the filter pill set short while industries stay
// specific on each card. Order here defines pill order.
export const INDUSTRY_GROUPS: { label: string; match: string[] }[] = [
  { label: "Accounting", match: ["Accounting"] },
  { label: "Real Estate", match: ["Real Estate"] },
  { label: "Legal", match: ["Legal"] },
  { label: "Healthcare", match: ["Healthcare"] },
  { label: "Marketing & Design", match: ["Marketing", "Web Development"] },
  { label: "Professional Services", match: ["Professional Services"] },
  { label: "Hospitality", match: ["Travel", "Hospitality"] },
];

export function getIndustryGroup(industry: string): string | null {
  const group = INDUSTRY_GROUPS.find((g) =>
    g.match.some((m) => industry.includes(m)),
  );
  return group?.label ?? null;
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "capital-one-luxury-travel",
    company: "Capital One Luxury Travel",
    seoDescription:
      "How Capital One Luxury Travel weighed build vs. buy, then used Assembly Studio to onboard 1,100+ hotel partners and grow client experience adoption.",
    industry: "Travel & Hospitality",
    featured: true,
    image: "/images/customers/capital-one-hero.jpg",
    headline:
      "How Capital One Luxury Travel Balanced 'Build vs. Buy' with Assembly",
    summary:
      "Capital One Luxury Travel combined Assembly's off-the-shelf client portal software with platform flexibility to support a custom solution for its hotel partner program.",
    stats: [
      { value: "2x", label: "faster partner onboarding" },
      { value: "1,100+", label: "hotel partners" },
      { value: "100%+", label: "growth in portal users" },
    ],
    challenge:
      "Capital One Luxury Travel manages a global network of hotel partners offering premium travel benefits for Capital One cardholders. As the program scaled to thousands of hotels, onboarding took 50–60 days per partner. The team previously managed partners through Google spreadsheets and email chains, creating scaling difficulties and friction.",
    solution:
      "Assembly's platform provided the flexibility of custom development with out-of-the-box speed. Capital One implemented a secure, white-labeled portal with custom onboarding forms, review and approval workflows, client messaging, secure document sharing, embedded training modules for compliance, and automated notifications reducing manual follow-up.",
    results: [
      "Scaled from hundreds to 1,100+ hotel partners",
      "Reduced onboarding from 60 days to approximately 30 days",
      "Centralized partner engagement into one branded hub",
      "Created a secondary internal portal connecting partner data to quality assurance processes",
    ],
    glance: {
      runningSince: "2023",
      companyUrl: "https://capitalonetravel.com/",
      apps: ["Messages App", "Forms App", "Contracts App", "Helpdesk App"],
    },
    body: [
      {
        type: "heading",
        text: "The Challenge: Scaling Onboarding and Partner Communications",
      },
      {
        type: "paragraph",
        text: "Capital One Luxury Travel manages a growing global network of hotel partners who offer premium travel benefits for Capital One cardholders. As the partner program grew to thousands of hotels, Capital One Luxury Travel saw an opportunity to elevate their hotel partners’ experience and streamline their program management with one solution.",
      },
      {
        type: "paragraph",
        text: "Previously, onboarding a single hotel partner could take between 50 and 60 days, according to the team.",
      },
      {
        type: "paragraph",
        text: "“Before Assembly, we were managing hotel partners through Google spreadsheets and long email chains,” said Phillip LaRue, Senior Director of Luxury Travel at Capital One. “It became hard to scale and created friction for everyone.”",
      },
      {
        type: "paragraph",
        text: "The Luxury Travel team looked to create a new product that could give a branded experience to hotel partners and improve the program’s management. In doing so, they encountered a common dilemma for innovative teams at large enterprises: was it worth investing in building in-house solutions or buying an out-of-the-box solution?",
      },
      {
        type: "paragraph",
        text: "The answer: Assembly, which allowed Capital One Luxury Travel to get the best of both worlds.",
      },
      {
        type: "heading",
        text: "Beyond “Build vs. Buy” with Assembly: Faster, Custom Client Experiences",
      },
      {
        type: "paragraph",
        text: "The top considerations for the Capital One Luxury Travel team would normally suggest a time-consuming in-house solution: from the ability to ensure consistent branding for their hotel partners, the flexibility to integrate to their existing approval flows, and having a single place for communication and information sharing for both the internal team and the hotel partners.",
      },
      {
        type: "paragraph",
        text: "But the team found that Assembly’s client portal software gave them all the flexibility they needed in an out-of-the-box solution and the speed of custom development with Assembly’s expert developer ecosystem to give their hotel partners a better experience without months of development.",
      },
      {
        type: "image",
        src: "/images/capital-one-portal.png",
        alt: "Capital One Luxury Travel white-labeled partner portal sign-in screen",
      },
      {
        type: "paragraph",
        text: "Using Assembly’s platform, the team implemented a secure, white-labeled portal branded for Capital One Luxury Travel hotel partners. The portal gave their clients a seamless onboarding experience, including:",
      },
      {
        type: "list",
        items: [
          "Custom onboarding forms, with review and approval flows",
          "Client messaging, secure document and form-sharing",
          "Embedded training modules to ensure hotel staff completed compliance requirements",
          "Automated notifications and reminders, reducing manual follow-up",
        ],
      },
      {
        type: "paragraph",
        text: "This hybrid approach allowed Capital One Luxury Travel to scale efficiently while still developing and tailoring its portal to its program’s requirements, without disrupting the hotel partners' experience.",
      },
      {
        type: "heading",
        text: "Results: Actionable Process Change Externally and Internally",
      },
      {
        type: "paragraph",
        text: "Within two years since launching their custom portal, Capital One Luxury Travel has:",
      },
      {
        type: "list",
        items: [
          "Scaled from hundreds to more than 1,100 hotel partners.",
          "Cut onboarding times from 60 days to around 30 days, with more improvements on the way.",
          "Centralized hotel partner engagement — onboarding, training, communications, and resources — into one branded hub.",
        ],
      },
      {
        type: "paragraph",
        text: "What’s more, Capital One Luxury Travel was also able to expand the benefits of their partner portal back to the team’s internal processes. The team found an opportunity to build a second portal that connected their partner-provided data to their internal quality assurance and compliance review program.",
      },
      {
        type: "quote",
        text: "What excites me is how our partner data collected in Assembly flows directly into our internal quality control processes. Instead of duplicating work across systems, everything is connected, saving our team time and ensuring we always have the most accurate, up-to-date information.",
        attribution: "Phillip LaRue, Sr. Director of Luxury Travel at Capital One",
      },
      {
        type: "paragraph",
        text: "The opportunities to leverage partner-provided data to enrich everything from internal team processes to potential customer-facing traveler experiences means that with Assembly, Capital One Luxury Travel didn’t have to choose between building or buying. They did both — and created a scalable foundation for their Luxury Travel program.",
      },
    ],
  },
  {
    slug: "valuenode-accounting",
    company: "ValueNode Accounting",
    seoDescription:
      "How ValueNode Accounting built a fully digital CPA practice on Assembly Studio's client experience platform.",
    industry: "Accounting & CPA",
    image: "/images/customers/valuenode-accounting.jpg",
    headline:
      "How ValueNode Accounting Built a Fully Digital CPA Practice with Assembly",
    summary:
      "Dr. Najlaa Kallousa transformed her CPA practice into a fully digital experience, cutting client time by 90% and onboarding new clients in under 30 minutes.",
    stats: [
      { value: "90%", label: "client time saved" },
      { value: "<30 min", label: "new client onboarding" },
      { value: "100%", label: "digital experience" },
    ],
    challenge:
      "Dr. Kallousa initially explored ShareFile and CCHiFirm but found them insufficient. She needed everything to connect — file management, signatures, scheduling, and client communication — in a single integrated platform rather than a patchwork of disconnected tools.",
    solution:
      "Assembly serves as the integrated platform for ValueNode's operations. Clients access a structured file system organized by year, sign contracts electronically with full audit trails, book appointments directly within the portal, and interact with custom-scripted Google Sheets for transaction review workflows with automatic notifications.",
    results: [
      "Onboarding reduced from 5+ hours to 10–30 minutes",
      "Electronic signatures eliminate in-person meeting requirements",
      "100% digital client experience from day one",
      "Everything managed in one place — files, messages, contracts, and scheduling",
    ],
    glance: {
      founded: "2024",
      runningSince: "2025",
      companyUrl: "https://valuenode.ca",
      apps: [
        "Files App",
        "Messages App",
        "Contracts App",
        "Looker Studio",
        "Google Docs",
        "Google Sheets",
        "Calendly",
      ],
    },
    body: [
      {
        type: "heading",
        text: "From Academia to a Practice Built for the Future",
      },
      {
        type: "paragraph",
        text: "Dr. Najlaa Kallousa, PhD, MBA, CPA, CGA transitioned from academia to founding ValueNode Accounting. With a PhD in financial accounting from the University of Calgary and a postdoctoral fellowship in taxation, she taught at institutions including Concordia University, University of Dubai, Koç University, and Trent University.",
      },
      {
        type: "quote",
        text: "I wanted to distinguish ValueNode to be not a traditional practice in Calgary. I wanted to utilize all my knowledge, my education, my research skills to come up with a systemized practice where everything can be handled electronically and digitally.",
      },
      {
        type: "paragraph",
        text: "She initially evaluated ShareFile and CCHiFirm but found them insufficient. “ShareFile didn’t give me the integration I was looking for. I’m not only looking for a place to share files securely — I needed everything to connect.” She discovered Assembly through organic search and confirmed its fit during a two-week trial.",
      },
      {
        type: "heading",
        text: "One Portal to Connect Everything",
      },
      {
        type: "quote",
        text: "What I liked about Assembly is that I have everything in one place.",
      },
      {
        type: "paragraph",
        text: "Inside the Assembly portal, ValueNode clients access organized file systems with subfolders for bank statements, employee information, government reports, invoices, and bills. Dr. Kallousa embedded custom Google Sheets for interactive transaction review workflows with automatic notifications. Contracts and engagement letters are signed electronically with full audit trails. Clients book appointments directly within the portal.",
      },
      {
        type: "image",
        src: "/images/valuenode-portal.png",
        alt: "ValueNode Accounting client portal showing organized file folders",
      },
      {
        type: "paragraph",
        text: "Dr. Kallousa is integrating Looker Studio dashboards to provide real-time financial visibility. “My clients stress that visualization makes a difference. I agree: visualization is the most important part.”",
      },
      {
        type: "heading",
        text: "The Results: A Scalable Foundation From Day One",
      },
      {
        type: "paragraph",
        text: "Previously, new client file setup required over five hours. Now it takes minutes through folder template duplication.",
      },
      {
        type: "quote",
        text: "It saves me more than 90% of my setup time for a new client. What would take me at least five hours, I do in Assembly in 10 to 30 minutes.",
      },
      {
        type: "paragraph",
        text: "Electronic signatures eliminated in-person meeting requirements: “I don’t have to go meet a client in person to get a signature. I can send everything electronically, and I have the full trail showing they signed it. That saves a lot of time.”",
      },
      {
        type: "paragraph",
        text: "ValueNode serves businesses across childcare, healthcare, oil and gas, and nonprofit sectors in Calgary, with active marketing expansion plans.",
      },
      {
        type: "quote",
        text: "It saves me so much time — just knowing exactly where to find things, and having everything streamlined in one secure place. I can get back to the work that actually matters.",
        attribution: "Dr. Najlaa Kallousa, Founder, ValueNode Accounting",
      },
    ],
  },
  {
    slug: "metta-health",
    company: "Metta Health",
    seoDescription:
      "How Metta Health runs HIPAA-compliant patient authorizations at scale inside its Assembly Studio client experience.",
    industry: "Healthcare",
    image: "/images/customers/metta-health.jpg",
    headline:
      "How Metta Health Scales HIPAA-Compliant Patient Authorizations with Assembly",
    summary:
      "Metta Health replaced DocuSign with Assembly to handle sensitive patient authorization forms at scale, achieving 80% cost savings and building patient trust through white-labeled communications.",
    stats: [
      { value: "80%", label: "cost savings" },
      { value: "5–10x", label: "ROI vs. DocuSign" },
      { value: "50+", label: "templates managed" },
    ],
    challenge:
      "Metta Health needed to obtain patient authorization forms at scale for insurance dispute cases. Generic e-signature requests from platforms like DocuSign created friction — patients didn't recognize senders and hesitated to sign. Per-signature pricing was cost-prohibitive for a bootstrapped startup sending dozens of forms monthly across 50–60 templates.",
    solution:
      "Assembly's flat subscription pricing and white-labeled experience solved both problems. When patients receive authorization requests, emails appear branded from Metta Health — not a generic third party. The Contracts app creates pre-filled authorization templates with timestamped receipts including signer's IP address for legal proceedings.",
    results: [
      "Reduced cost per form from ~$10 to $1–2 (80% savings)",
      "5–10x ROI compared to DocuSign",
      "50+ authorization templates managed",
      "White-labeled emails dramatically improved signature completion rates",
    ],
    glance: {
      founded: "2022",
      runningSince: "2023",
      companyUrl: "https://mettahealth.org",
      apps: ["Contracts App"],
    },
    body: [
      {
        type: "heading",
        text: "Solving the High Cost of Patient Signatures at Scale",
      },
      {
        type: "paragraph",
        text: "Metta Health is an AI-powered revenue cycle management consultancy helping medical practices navigate insurance reimbursements. Founded in 2022 by Robin Patel, the company operates with a lean 20-person team, battling insurance companies on behalf of healthcare providers to get claims paid and processing state and federal arbitration cases at scale.",
      },
      {
        type: "paragraph",
        text: "A critical part of the work involves obtaining patient authorization forms known as Designated Authorized Representative (DAR) forms.",
      },
      {
        type: "quote",
        text: "That signature document is critical because it gives us the right to fight on behalf of the patient in our battles with insurance to get paid for the claims.",
        attribution: "Robin Patel, Founder, Metta Health",
      },
      {
        type: "paragraph",
        text: "Metta Health evaluated several platforms including DocuSign and PandaDoc. Generic e-signature requests created friction — patients didn’t recognize the sender and hesitated to sign unfamiliar documents. Per-signature pricing was cost-prohibitive for a self-funded startup sending dozens of forms monthly across 50 to 60 templates.",
      },
      {
        type: "heading",
        text: "Building Patient Trust Through White-Labeled Communications",
      },
      {
        type: "paragraph",
        text: "Metta Health chose Assembly for its flat subscription pricing and white-labeled experience. When patients receive authorization requests, emails come branded from Metta Health — not a generic third-party platform. Provider staff notify patients to expect documents from Metta Health specifically, so when the white-labeled email arrives, patients recognize and trust it — dramatically improving signature completion rates.",
      },
      {
        type: "image",
        src: "/images/metta-health-portal.png",
        alt: "Metta Health white-labeled authorization request",
      },
      {
        type: "paragraph",
        text: "The team uses Assembly’s Contracts app to create pre-filled authorization templates, send them for electronic signature with automated branded emails, and receive timestamped receipts including the signer’s IP address — critical evidence for legal proceedings. The workflow prioritizes speed: patients need only review and sign, taking just a couple of minutes.",
      },
      {
        type: "heading",
        text: "80% Cost Savings and Legal-Grade Documentation",
      },
      {
        type: "paragraph",
        text: "Robin estimates that traditional approaches — manual form completion plus DocuSign fees — cost roughly $10 per form when factoring in labor and per-signature charges. With Assembly, Metta Health reduced that to approximately $1–2 per form.",
      },
      {
        type: "quote",
        text: "Assembly definitely offers at least a 5 to 10x cost savings over DocuSign. I would estimate about 80% cost savings on the form fill.",
        attribution: "Robin Patel, Founder, Metta Health",
      },
      {
        type: "paragraph",
        text: "Beyond cost, Assembly provided operational infrastructure allowing a small team to scale efficiently. As the company grows and uses secure AI-powered techniques to improve reimbursement rates for providers, Assembly’s combination of white-label branding, affordable eSignatures, and legal-grade documentation positions them to scale without sacrificing patient trust.",
      },
    ],
  },
  {
    slug: "orca-accounting",
    company: "Orca Accounting",
    seoDescription:
      "How Orca Accounting scaled 4.5x in seven months by running its client experience on Assembly Studio.",
    industry: "Accounting",
    image: "/images/customers/orca-hero.jpg",
    headline:
      "How Orca Accounting Scaled 4.5x in 7 Months with Professional Client Portal Software",
    summary:
      "Leah McCool transformed her bookkeeping practice, growing her client base by 400% in 7 months while cutting onboarding time by 75% using Assembly's integrated client portal.",
    stats: [
      { value: "400%", label: "client growth" },
      { value: "75%", label: "faster onboarding" },
      { value: "80%", label: "less email" },
    ],
    challenge:
      "After launching Orca Accounting, Leah relied on fragmented tools including shared Google Drives, email, and text messaging. This patchwork system made onboarding consume up to two weeks per client. The informal approach couldn't scale with the growing practice.",
    solution:
      "After evaluating Dubsado, Karbon, and Moxo, Leah selected Assembly for ease of implementation and its modern interface. She implemented automated onboarding with custom forms, standardized file folders, the Tasks app to guide clients through required steps, contract templates, secure messaging, Calendly integration, and integrated invoicing.",
    results: [
      "Quadrupled client base within seven months",
      "75% faster client onboarding",
      "80% less email back-and-forth",
      "Every client praised the easy onboarding experience",
    ],
    glance: {
      founded: "2024",
      runningSince: "2024",
      companyUrl: "https://orca-accounting.com",
      apps: [
        "Tasks",
        "Files App",
        "Payments App",
        "Messages App",
        "Contracts App",
        "Calendly",
      ],
    },
    body: [
      {
        type: "heading",
        text: "Moving Beyond Informal Client Management",
      },
      {
        type: "paragraph",
        text: "When Leah McCool launched Orca Accounting in April 2024, she prioritized client experience. With experience in both public accounting and startups, she wanted to move away from informal communication practices.",
      },
      {
        type: "quote",
        text: "I didn’t love the informal approach of the startup environment. Most client communication happened over email, but I wanted to create a more branded, professional client experience.",
        attribution: "Leah McCool, Founder, Orca Accounting",
      },
      {
        type: "paragraph",
        text: "Initially, Leah managed clients virtually using fragmented tools: shared Google Drives, email, and text messages. This approach made onboarding stretch to approximately two weeks per client.",
      },
      {
        type: "heading",
        text: "Streamlined Onboarding with a Branded Client Experience",
      },
      {
        type: "paragraph",
        text: "After evaluating Dubsado, Karbon, and Moxo, Leah selected Assembly for its implementation ease, modern design, and pricing. She sought “a portal that was easy to implement, that I could do in a weekend, that was modern and that was just easy to use.”",
      },
      {
        type: "paragraph",
        text: "She implemented custom onboarding forms, automated file folder setups, and Assembly’s Tasks app to guide clients through required steps, with contract templates sent during onboarding. Clients now access secure messaging, schedule check-ins via Calendly integration, receive shared reports in secure file channels, and pay invoices through the platform.",
      },
      {
        type: "image",
        src: "/images/orca-accounting-portal.png",
        alt: "Orca Accounting branded client onboarding portal",
      },
      {
        type: "heading",
        text: "Dramatic Growth and Client Satisfaction",
      },
      {
        type: "paragraph",
        text: "Within seven months, Orca Accounting quadrupled its client base. Leah attributes this directly to her portal’s professionalism and efficiency. The centralized approach eliminated time-consuming multi-channel communication, and task management provides accountability and visibility for outstanding items.",
      },
      {
        type: "quote",
        text: "Every client said this was such an easy onboarding experience. The first step of working together feels effortless, and that creates a powerful first impression.",
        attribution: "Leah McCool, Founder, Orca Accounting",
      },
      {
        type: "paragraph",
        text: "Leah plans to hire team members within the next quarter, confident the professional systems will scale appropriately.",
      },
      {
        type: "quote",
        text: "The client feedback has been overwhelmingly positive. My clients love the platform, and I love using it. The Tasks app and the entire process have been fantastic for our practice.",
        attribution: "Leah McCool, Founder, Orca Accounting",
      },
    ],
  },
  {
    slug: "jungle-luxe",
    company: "Jungle Luxe",
    seoDescription:
      "How Jungle Luxe built a client experience for international property owners in one week, onboarding 250 clients in the first month.",
    industry: "Real Estate & Property Management",
    image: "/images/customers/jungle-luxe.jpg",
    headline:
      "How Jungle Luxe Brings Peace of Mind to International Property Owners with Assembly",
    summary:
      "Rachel Hugenschmidt's Tulum-based luxury property management company uses Assembly's client portal to create transparency for remote property owners and reduce inquiries by over 50%.",
    stats: [
      { value: "50%+", label: "fewer inquiries" },
      { value: "110+", label: "property owners" },
      { value: "1 FTE", label: "cost saved" },
    ],
    challenge:
      "Jungle Luxe manages vacation rental properties for over 110 owners, many living thousands of miles away. Communications were scattered across WhatsApp, emails, and texts. The lean 16-person team couldn't scale through hiring alone in a lower-margin business.",
    solution:
      "Each property owner now accesses a dedicated portal with organized folders containing contracts, rental licenses, insurance certificates, monthly statements, receipts, and proof of payment transfers. Assembly's Messages App manages daily owner communications across departments, and a resource center built with the Helpdesk App enables owner self-service.",
    results: [
      "Reduced owner inquiries by at least 50%",
      "110+ property owners served through the portal",
      "Saved the cost of one full-time administrator",
      "Created a competitive advantage — no one else in Mexico is doing anything like it",
    ],
    glance: {
      founded: "2022",
      runningSince: "2024",
      companyUrl: "https://jungleluxe.mx",
      apps: [
        "Files App",
        "Messages App",
        "Helpdesk App",
        "Forms App",
        "Profile Manager",
      ],
    },
    body: [
      {
        type: "heading",
        text: "The Challenge of Managing Properties from Thousands of Miles Away",
      },
      {
        type: "paragraph",
        text: "Jungle Luxe is a luxury property management, real estate, and interior design company based in Tulum, Mexico. Founded by Rachel Hugenschmidt in December 2022, the company manages vacation rental properties for more than 110 owners, many of whom live thousands of miles away from their properties.",
      },
      {
        type: "paragraph",
        text: "Vacation rental investors tend to be highly engaged — there’s constant activity with bookings, maintenance, and financials to track. “These owners live very far away from their properties,” Rachel explains. “They want to know what’s happening with their units.”",
      },
      {
        type: "quote",
        text: "It was really decentralized. People were sending documents through WhatsApp and it was just a huge mess.",
        attribution: "Rachel Hugenschmidt, Founder, Jungle Luxe",
      },
      {
        type: "paragraph",
        text: "With a lean team of 16 on the property management side, Rachel knew she couldn’t scale by simply adding headcount. “In property management, it’s a lower margin business — we have to keep it lean.” What she needed was a way to centralize owner communications while creating what she calls “inner peace” for her team.",
      },
      {
        type: "heading",
        text: "A Centralized Hub for Owner Transparency",
      },
      {
        type: "paragraph",
        text: "After researching client portal solutions, Rachel chose Assembly for its customizability and comprehensive feature set. Instead of spending even more on custom software development, she opted for Assembly to create the Jungle Luxe owner portal.",
      },
      {
        type: "paragraph",
        text: "Today, Jungle Luxe uses Assembly as the source of truth for every property owner relationship. Each owner has access to a dedicated portal containing organized folders with their contracts, rental licenses, insurance certificates, monthly statements, receipts, tax payments, and proof of any payment transfers.",
      },
      {
        type: "image",
        src: "/images/jungle-luxe-portal.png",
        alt: "Jungle Luxe owner portal with organized property folders",
      },
      {
        type: "paragraph",
        text: "Assembly’s Messages App has become critical to managing the daily flow of owner communications — at any given time, 10 to 15 owners may be actively communicating with the team, and multiple departments can view the history and stay aligned. The company also built a robust resource center using the Helpdesk App, giving owners self-service options that reduce repetitive questions.",
      },
      {
        type: "heading",
        text: "Creating Calm Across Continents",
      },
      {
        type: "quote",
        text: "We’ve definitely reduced inquiries by owners by at least 50%. It probably saved the cost of a whole extra administrator from my company.",
        attribution: "Rachel Hugenschmidt, Founder, Jungle Luxe",
      },
      {
        type: "paragraph",
        text: "The benefits extend beyond operational efficiency. For property owners who have invested in a foreign country — often their first such investment — the portal provides crucial peace of mind. “They have something tangible. They have records,” Rachel explains. “I think they feel more organized now.”",
      },
      {
        type: "paragraph",
        text: "As Jungle Luxe continues to grow — with plans to integrate AI-powered responses and additional automation — Assembly remains at the center of their client experience strategy.",
      },
    ],
  },
  {
    slug: "zen-aegis",
    company: "Zen Aegis",
    seoDescription:
      "How Zen Aegis saves clients 40+ hours a week with a streamlined Assembly Studio client experience.",
    industry: "Professional Services",
    image: "/images/customers/zen-aegis-hero2.jpg",
    headline:
      "How Zen Aegis Saves Clients 40+ Hours a Week With Secure, Automated Portal Software",
    summary:
      "Kody Foringer and Robert Prochnow transformed how they deliver fractional executive leadership services by building automated, secure portals — saving clients up to 90% of manual labor time.",
    stats: [
      { value: "40+", label: "hours saved/week" },
      { value: "90%", label: "less manual entry" },
      { value: "1,000+", label: "automations triggered" },
    ],
    challenge:
      "The team needed more than an eclectic bunch of software for managing operations. Previously using DocuSign, Office 365, and Intercom separately, they faced limitations with disparate tools as clients demanded more personalized, secure experiences and automated efficiency.",
    solution:
      "Zen Aegis implemented Assembly's portal platform with robust Zapier and API integrations to build tailored client experiences. They created smart workflows that dynamically adjust portal visibility, sync client responses to task management software, and trigger SMS updates through integrated booking systems.",
    results: [
      "90% reduction in manual data entry time for clients",
      "40+ hours saved per week through automation",
      "1,000+ automations triggered across client base",
      "Scaled operations without growing headcount",
    ],
    glance: {
      founded: "2021",
      runningSince: "2021",
      companyUrl: "https://zenaegis.com",
      apps: [
        "Files App",
        "Messages App",
        "Payments App",
        "Forms App",
        "Contracts App",
      ],
    },
    body: [
      {
        type: "heading",
        text: "Collaboration Sparks Business Innovation for Zen Aegis",
      },
      {
        type: "paragraph",
        text: "Kody Foringer started using Assembly nearly four years ago when a Copper City Marketing client needed portal capabilities for document signing and invoicing. This initial implementation evolved into his preferred platform for managing client operations. Robert Prochnow joined as a partner, and together they built Zen Aegis — a firm combining fractional executive leadership with technical infrastructure to deliver outcomes. Unlike traditional consultants, they embed as strategic partners.",
      },
      {
        type: "quote",
        text: "We look at the website as a hub for revenue operations. How clients engage on the front end, how that translates into sales… we offer a full holistic approach.",
        attribution: "Robert Prochnow, Partner, Zen Aegis",
      },
      {
        type: "paragraph",
        text: "Previously, Kody relied on disconnected tools: “I think I was using DocuSign for document signing, Office 365 for shared folders, and maybe Intercom for messaging.”",
      },
      {
        type: "heading",
        text: "Custom Client Portal Solutions with Integrations",
      },
      {
        type: "paragraph",
        text: "Zen Aegis operates its own portal through Assembly and builds white-label solutions for clients needing secure experiences. “Assembly saves us from coding a whole portal solution,” Robert states. For healthcare clients requiring HIPAA compliance, they rapidly deploy solutions.",
      },
      {
        type: "image",
        src: "/images/zen-aegis-portal.png",
        alt: "Zen Aegis automated client workflow in Assembly",
      },
      {
        type: "paragraph",
        text: "Through Zapier and API integrations, they automate complex workflows. Kody notes: “I would say the biggest value-add right now that stands out to me is saved time through leveraged automations.”",
      },
      {
        type: "heading",
        text: "90% Time Saved and Lasting Value with Clients",
      },
      {
        type: "paragraph",
        text: "Their nonprofit client operating an apparel line for children in need achieved dramatic results. Robert shares: “It probably took them like four hours a day to do manual data entry. And with Assembly, I think it takes like 15 minutes now.” Some clients recovered approximately 40 hours weekly through automating onboarding, data collection, approvals, and application review.",
      },
      {
        type: "paragraph",
        text: "Internally, Assembly enables Zen Aegis to scale without expanding headcount. Clients submit requests directly through the portal and track progress in real time.",
      },
      {
        type: "quote",
        text: "Assembly saves us from building custom portals from scratch. We can go fast and create lasting value for the businesses we serve.",
        attribution: "Robert Prochnow, Partner, Zen Aegis",
      },
    ],
  },
  {
    slug: "ditto-by-dbc",
    company: "Ditto by DBC",
    seoDescription:
      "How Ditto by DBC uses Assembly Studio to scale secure, data-driven marketing campaigns across its client experience.",
    industry: "Marketing & Design",
    image: "/images/customers/ditto-by-dbc.jpg",
    headline:
      "Scaling Secure, Data-Driven Campaigns with Assembly: How DBC Launched Ditto",
    summary:
      "Marketing firm founder Carlos Williams created Ditto, a service that transforms client data into personalized marketing collateral at scale while maintaining strict security and compliance standards.",
    stats: [
      { value: "118K+", label: "assets generated" },
      { value: "60+", label: "satisfied clients" },
      { value: "12+", label: "years experience" },
    ],
    challenge:
      "Productizing data-driven marketing campaigns required a secure method for clients to share proprietary customer information. The company needed SOC 2 compliance to handle sensitive personal data responsibly, particularly when working with enterprise clients managing large-scale campaigns.",
    solution:
      "Assembly's white-labeled, SOC 2 and HIPAA-compliant portal serves as the backbone for client onboarding, data management, and asset delivery. The platform consolidates data ingestion, approvals, and asset delivery through a centralized Data Vault repository, replacing fragmented email and Google Drive workflows.",
    results: [
      "118,000+ marketing assets generated",
      "60+ satisfied clients served",
      "100,000-asset microsite campaign completed for National Park Service",
      "SOC 2 compliance enabled enterprise client acquisition",
    ],
    glance: {
      founded: "2013",
      runningSince: "2025",
      companyUrl: "https://dittoditto.io",
      apps: ["Files App", "Messages App", "Payments App", "OneDrive"],
    },
    body: [
      {
        type: "heading",
        text: "Turning Raw Data into Scalable Campaigns — Securely",
      },
      {
        type: "paragraph",
        text: "Carlos Williams, founder of DBC, recognized an opportunity to productize the agency’s data-driven personalized marketing campaigns — similar to Spotify Wrapped — into a new service called Ditto. The tool transforms client data into personalized marketing collateral at scale, generating hundreds of thousands of individualized assets on demand.",
      },
      {
        type: "paragraph",
        text: "A critical requirement for this expansion involved ensuring robust data security.",
      },
      {
        type: "quote",
        text: "Asking clients for their customers’ proprietary data without a formal API setup, especially for one-off campaigns, meant we needed the most secure method possible.",
        attribution: "Carlos Williams, Founder, DBC",
      },
      {
        type: "paragraph",
        text: "After evaluating alternatives, Ditto rejected another platform upon discovering its SOC 2 compliance wouldn’t arrive until 2026. “That was a dealbreaker,” Carlos states. “We’re talking about delivering thousands — sometimes hundreds of thousands — of assets using client data.” Assembly’s SOC 2 and HIPAA-compliant portal became the solution.",
      },
      {
        type: "heading",
        text: "Assembly as the Backbone for Onboarding, Data, and Delivery",
      },
      {
        type: "paragraph",
        text: "Ditto uses Assembly as its white-labeled portal for data ingestion, approvals, asset delivery, and client management. Clients access a customized portal to upload campaign data to the “Data Vault” — a secure file repository serving as the single source of truth.",
      },
      {
        type: "image",
        src: "/images/ditto-by-dbc-portal.png",
        alt: "Ditto by DBC Data Vault portal for secure campaign data",
      },
      {
        type: "quote",
        text: "Before Assembly, we’d get data via email, upload it to Google Drive, and have to track versioning manually. Now we’ve centralized everything in one secure location.",
        attribution: "Carlos Williams, Founder, DBC",
      },
      {
        type: "heading",
        text: "The Result: Scalable Infrastructure for Enterprise Clients",
      },
      {
        type: "paragraph",
        text: "Before full public launch, Ditto successfully completed pilots including a 100,000-asset campaign for the National Park Service. Assembly provides the infrastructure foundation enabling secure scaling for high-profile enterprise clients.",
      },
      {
        type: "quote",
        text: "Assembly isn’t just a portal — it’s our infrastructure. We’re tying it to Microsoft Azure, automating workflows, and preparing to scale campaigns for massive organizations.",
        attribution: "Carlos Williams, Founder, DBC",
      },
      {
        type: "paragraph",
        text: "The platform also provides a competitive advantage and demonstrates commitment to data security, helping enterprise clients feel confident sharing sensitive information.",
      },
    ],
  },
  {
    slug: "vacation-rental-license",
    company: "Vacation Rental License",
    seoDescription:
      "How Vacation Rental License streamlined client operations by building on Assembly Studio's client experience.",
    industry: "Real Estate & Licensing",
    headline:
      "How Vacation Rental License Streamlines Client Operations with Assembly",
    summary:
      "Vacation Rental License helps property owners navigate short-term rental licensing across U.S. jurisdictions, using Assembly's portal to manage complex multi-state workflows and coordinate a distributed global team.",
    stats: [
      { value: "1,000+", label: "files shared" },
      { value: "750+", label: "licenses processed" },
      { value: "100+", label: "hours saved" },
    ],
    challenge:
      "The company struggled with managing clients across different jurisdictions while maintaining team alignment. They initially used Basecamp but faced limitations in file organization, client notifications, task visibility, and client engagement with the platform.",
    solution:
      "Assembly provides a centralized client portal enabling direct document uploads, e-signature capabilities for contracts, task notifications and required action alerts, real-time application progress tracking, and custom AI automation that reads Monday.com updates and sends automatic status messages to clients.",
    results: [
      "1,000+ files shared securely",
      "750+ licenses processed through the portal",
      "100+ hours saved on manual workflows",
      "Improved client engagement and satisfaction",
    ],
    glance: {
      founded: "2024",
      runningSince: "2025",
      companyUrl: "https://vacationrentallicense.com",
      apps: ["Files App", "Messages App", "Google Drive", "Payments App", "Monday"],
    },
    body: [
      {
        type: "heading",
        text: "A Smarter Way to Serve Vacation Rental Clients",
      },
      {
        type: "paragraph",
        text: "Vacation Rental License helps property owners navigate short-term rental licensing across US jurisdictions. Originally using Basecamp, the company faced limitations with file organization, client notifications, and task visibility. Clients showed low engagement, prompting a search for better solutions.",
      },
      {
        type: "quote",
        text: "Assembly is one of the best things that happened in our team. We now have a central place for client communication that allows for transparency, so clients can view updates and track progress in real time.",
        attribution: "Shey Lagnason, Licensing Team Supervisor",
      },
      {
        type: "heading",
        text: "Enhanced Operational Efficiency with an All-in-One Portal",
      },
      {
        type: "paragraph",
        text: "Founder Guy Benhanan, familiar with Assembly from prior roles, implemented it company-wide. The team adopted it for its versatility and user-friendly design.",
      },
      {
        type: "quote",
        text: "I love how it makes everything streamlined and in one place, because we’re dealing with city, county and state to get licenses.",
        attribution: "Guy Benhanan, Founder, Vacation Rental License",
      },
      {
        type: "paragraph",
        text: "The platform enables clients to upload home information documents to shared folders, e-sign documents and contracts, receive task notifications, and track application progress.",
      },
      {
        type: "image",
        src: "/images/vacation-rental-license-portal.png",
        alt: "Vacation Rental License client portal tracking application progress",
      },
      {
        type: "paragraph",
        text: "Guy set up custom AI automation using n8n, integrating Monday.com task updates with automatic client status messages through Assembly.",
      },
      {
        type: "heading",
        text: "Better Processes, Happier Clients, and a More Efficient Team",
      },
      {
        type: "paragraph",
        text: "Assembly reduced internal communication overhead and increased operational clarity. Clients appreciate self-service capabilities, centralized document access, and timely updates. License renewals and prior record access became simpler and more reliable.",
      },
    ],
  },
  {
    slug: "collective-cpa",
    company: "Collective CPA & Advisors",
    seoDescription:
      "How Collective CPA & Advisors unified fragmented accounting services into one client experience as its client teams grew.",
    shortName: "Collective CPA",
    industry: "Accounting & Advisory",
    image: "/images/customers/collective-cpa.jpg",
    headline:
      "How Collective CPA & Advisors Unifies Accounting Services for Clients",
    summary:
      "Kyle Pearson's firm transitioned from fifty disconnected SaaS apps to Assembly's unified client portal, achieving 4x faster change management and their fastest intake process in company history.",
    stats: [
      { value: "4x", label: "faster change mgmt" },
      { value: "200+", label: "tax clients migrated" },
      { value: "100%", label: "improved intake" },
    ],
    challenge:
      "The firm juggled numerous disconnected SaaS applications, creating friction with clients. Clients lacked visibility into their books between tax seasons, and previous technology migrations took months.",
    solution:
      "Collective implemented Assembly's all-in-one client portal, consolidating engagement letters, document uploads, intake questionnaires via JotForm, task management, and secure file sharing. The platform offered flexibility to integrate with existing tools while maintaining a consistent client experience.",
    results: [
      "4x faster change management",
      "200+ tax clients migrated in first implementation",
      "Fastest intake process in company history",
      "Data transfer completed in 1 week versus months previously",
    ],
    glance: {
      founded: "2012",
      runningSince: "2025",
      companyUrl: "https://mycollectivecpa.com",
      apps: ["Tasks", "Messages App", "Contracts App", "Jotform", "Google Drive"],
    },
    body: [
      {
        type: "heading",
        text: "Beyond Basic CPA Relationships and Tools",
      },
      {
        type: "paragraph",
        text: "Collective CPA & Advisors, established in 2012 by Kyle Pearson, serves entrepreneurs and small businesses up to $25 million in revenue with comprehensive accounting and tax services. The firm addresses a gap in the market where clients needed ongoing advisory support beyond tax season.",
      },
      {
        type: "paragraph",
        text: "Kyle noted a common client complaint: “You’re my advisory group, but you don’t have time to give advice.” Collective differentiated itself with relational tax and accounting services and year-round intentional relationships with clients, not just a seasonal transaction.",
      },
      {
        type: "quote",
        text: "When you start using fifty of them… you’re creating a lot of friction with the client.",
        attribution: "Kyle Pearson, Founder, Collective CPA & Advisors",
      },
      {
        type: "heading",
        text: "A Unified Client Experience for Tax Season",
      },
      {
        type: "paragraph",
        text: "After evaluating alternatives like Canopy and Karbon, Collective built their portal with Assembly. Kyle selected Assembly because “it let us flexibly build our own version of a client portal, uniting elements of their technology with existing external core applications.”",
      },
      {
        type: "image",
        src: "/images/collective-cpa-portal.png",
        alt: "Collective CPA & Advisors unified client portal",
      },
      {
        type: "paragraph",
        text: "In January 2025, Collective routed over 200 tax clients through their new portal with templated task flows for engagement signatures, document uploads, and JotForm intake questionnaires. Assembly enabled consistent client experiences while streamlining backend processes — a Google Drive migration completed in one week instead of months.",
      },
      {
        type: "heading",
        text: "Faster Client Intake and a Scalable Future",
      },
      {
        type: "quote",
        text: "We had more tax returns in the door, ready to start being prepped, earlier than ever this year than in our entire history.",
        attribution: "Kyle Pearson, Founder, Collective CPA & Advisors",
      },
      {
        type: "paragraph",
        text: "Looking forward, Collective plans to double its client base to 400. Kyle envisions Assembly’s upcoming features enabling “one single place for them to go regardless of whom they work with” to access unified critical information.",
      },
    ],
  },
  {
    slug: "heritage-law-partners",
    company: "Heritage Law Partners",
    seoDescription:
      "How Heritage Law Partners delivers exceptional client service through its Assembly Studio client experience.",
    industry: "Legal & Estate Planning",
    image: "/images/customers/heritage-law-partners.jpg",
    headline:
      "How Heritage Law Partners Delivers Exceptional Client Service with Assembly",
    summary:
      "A St. Louis-based estate planning firm leveraged Assembly's customizable client portal to replace inadequate practice management software, enabling secure client communication and document sharing.",
    stats: [
      { value: "500+", label: "annual cases" },
      { value: "100+", label: "hours saved" },
      { value: "1,000+", label: "satisfied clients" },
    ],
    challenge:
      "Traditional legal practice management platforms offered built-in client portals that felt bolted-on with confusing interfaces, limited customization, and weak branding options. The firm needed a standalone solution independent of any single practice management system.",
    solution:
      "Heritage Law Partners implemented Assembly's standalone, branded client portal integrating with their existing tech stack including Calendly and DecisionVault. The portal provides secure document access, estate planning information libraries, and direct attorney communication in one intuitive interface.",
    results: [
      "500+ annual cases handled through the portal",
      "100+ hours saved annually on client communication",
      "1,000+ satisfied clients served",
      "Top-tier client care among estate planning firms",
    ],
    glance: {
      founded: "2024",
      runningSince: "2024",
      companyUrl: "https://heritagelawpartners.com",
      apps: ["Files App", "Messages App", "Payments App", "Calendly"],
    },
    body: [
      {
        type: "heading",
        text: "The Challenge of Traditional Legal Practice Management Software",
      },
      {
        type: "paragraph",
        text: "Heritage Law Partners is a close-knit team of attorneys in the St. Louis, Missouri area led by managing attorney Eliana Emery, who specializes in estate planning and special needs planning for an average of over 400 clients a year.",
      },
      {
        type: "paragraph",
        text: "Before Assembly, Eliana managed her clients with the built-in client portals of popular legal practice management software like Clio. But those tools created frustration for both her and her clients — confusing login processes, unbranded interfaces, and limited functionality.",
      },
      {
        type: "quote",
        text: "It felt like bolted-on software, an afterthought.",
        attribution: "Eliana Emery, Managing Attorney, Heritage Law Partners",
      },
      {
        type: "paragraph",
        text: "Eliana knew she needed a more intuitive, customizable solution that reflected her firm’s professional image and wouldn’t lock her into one practice management platform.",
      },
      {
        type: "heading",
        text: "A Standalone, Customizable Portal for Top-Tier Client Service",
      },
      {
        type: "paragraph",
        text: "Heritage Law Partners built their standalone estate planning client portal with Assembly, giving them flexibility around legal software integrations and branded interactions. Clients and their families now receive secure access to a library of important information, digital copies of estate planning documents, and online communication with their attorney — all in one place.",
      },
      {
        type: "image",
        src: "/images/heritage-law-partners-portal.png",
        alt: "Heritage Law Partners branded estate planning client portal",
      },
      {
        type: "quote",
        text: "I really like how smooth it is and intuitive for our clients to use. Our approach definitely puts us in the top tier for client care among estate planning firms.",
        attribution: "Eliana Emery, Managing Attorney, Heritage Law Partners",
      },
      {
        type: "paragraph",
        text: "The portal integrates with their broader tech stack, including Calendly for scheduling and DecisionVault for estate planning intake. Thanks to Assembly’s flexible API, the firm’s custom onboarding and workflows plug into the client portal without sacrificing a seamless client experience.",
      },
      {
        type: "heading",
        text: "Saving Time and Expanding Business in One Platform",
      },
      {
        type: "quote",
        text: "Our portal really improves our client satisfaction with our firm and definitely saves time. Having everything in one spot is huge. Assembly is a powerful tool to make us more efficient and give extra peace of mind to our clients.",
        attribution: "Eliana Emery, Managing Attorney, Heritage Law Partners",
      },
      {
        type: "paragraph",
        text: "Eliana expects the portal will strengthen long-term client relationships and position the firm as a modern, client-first practice.",
      },
    ],
  },
  {
    slug: "durrick-designs",
    company: "Durrick Designs",
    seoDescription:
      "How Durrick Designs centralized client collaboration in one branded Assembly Studio client experience.",
    industry: "Web Development & Design",
    headline:
      "How Durrick Designs Centralizes Client Collaboration with Assembly",
    summary:
      "Mallory Durrick's boutique web development agency uses Assembly's client portal to organize project assets, contracts, and client communications — and resells it as a managed service to her own clients.",
    stats: [
      { value: "50+", label: "satisfied clients" },
      { value: "100+", label: "projects completed" },
      { value: "35+", label: "years experience" },
    ],
    challenge:
      "Client files scattered across Google Drive and other platforms made it impossible to locate materials efficiently. A previous solution, SuiteDash, offered an inadequate user experience that didn't meet the agency's standards.",
    solution:
      "Assembly provides a centralized, branded client portal dashboard integrating contracts, design assets, files, and billing. The platform embeds tools like Airtable and Google Drive, eliminating scattered file management across multiple services.",
    results: [
      "50+ satisfied clients served",
      "100+ projects completed through the portal",
      "Launched uSPACES — reselling Assembly as a managed service",
      "Eliminated scattered file management across platforms",
    ],
    glance: {
      founded: "2005",
      runningSince: "2024",
      companyUrl: "https://durrickdesigns.com",
      apps: [
        "Files App",
        "Messages App",
        "Contracts App",
        "Payments App",
        "Profile Manager",
        "Helpdesk App",
        "Google Drive",
        "Tasks",
        "Calendly",
      ],
    },
    body: [
      {
        type: "heading",
        text: "Durrick Designs’ Specialized Services",
      },
      {
        type: "paragraph",
        text: "Mallory Durrick founded her boutique web development and design agency focusing on specialized site types: eCommerce, eLearning, membership portals, communities, and business directories. She expanded her offerings to include client portals and Make.com automation but struggled with file management.",
      },
      {
        type: "paragraph",
        text: "“No one can ever find anything in Google Drive,” she noted. After trying SuiteDash and finding its user experience inadequate, she discovered Assembly.",
      },
      {
        type: "quote",
        text: "Assembly eliminates all the clutter. It keeps everything streamlined, centralized, and easy to manage. Clients also love it at first glance because of its convenience.",
        attribution: "Mallory Durrick, Founder, Durrick Designs",
      },
      {
        type: "heading",
        text: "A Central Hub for Client Assets",
      },
      {
        type: "paragraph",
        text: "Assembly provided an all-in-one solution with a dedicated portal on her custom domain. “I 100% appreciate the organization Assembly gives me and my clients. It keeps everything streamlined, centralized, and easy to manage.”",
      },
      {
        type: "image",
        src: "/images/durrick-designs-portal.png",
        alt: "Durrick Designs branded client portal on a custom domain",
      },
      {
        type: "quote",
        text: "Mallory’s process is super efficient, organized, and collaborative, and working with her has been nothing short of pleasant and stress-free.",
        attribution: "Alex Siwik, 4Front Film Co",
      },
      {
        type: "heading",
        text: "Scaling Client Portal Management as a Service",
      },
      {
        type: "paragraph",
        text: "Durrick now recommends Assembly to clients, branding her service as “uSPACES” (unified secure portal for online client engagement and services). She manages setup while clients maintain ownership.",
      },
      {
        type: "quote",
        text: "Assembly saves me so much time — just knowing exactly where to find things is a game changer. It’s quick, easy, and lets me get back to the work that actually matters.",
        attribution: "Mallory Durrick, Founder, Durrick Designs",
      },
    ],
  },
  {
    slug: "sargent-cpa",
    company: "Sargent CPAs",
    seoDescription:
      "How Sargent CPAs built custom client apps with Assembly Studio, consolidated third-party tools, and kept a portal that feels like the firm.",
    industry: "Accounting & Advisory",
    headline:
      "How Sargent CPAs Built a Custom Client Experience with Assembly Studio",
    summary:
      "Sargent CPAs is an accounting firm built on close client relationships. Operations Manager Anthony Drozd explains how Assembly Studio lets their team offer a warm, custom-branded client experience and replace third-party software.",
    stats: [
      { value: "100+", label: "clients in one portal" },
      { value: "2", label: "custom apps built with Studio" },
      { value: "3+", label: "third-party tools consolidated" },
    ],
    challenge:
      "Sargent CPAs is a boutique accounting and advisory practice whose growth comes entirely through referrals, so every client relationship carries outsized weight. The team spent a long time assessing accounting-specific platforms like TaxDome and Canopy, but on the client side those felt corporate rather than inviting, and the firm's differentiation is warmth.",
    solution:
      "Assembly became the single front door for client interaction: communications, task lists, document intake, e-signatures, and billing in one branded environment. Behind it, Assembly's API and Automations took the repetitive mechanics of a tax practice off the team's plate, and Assembly Studio let Anthony build client-facing apps, starting with a meeting manager that syncs to the team's Google Calendar.",
    results: [
      "Over 100 clients managed in one branded portal",
      "Three or more third-party tools consolidated into Assembly",
      "Recurring obligations show up as portal tasks instead of email nudges",
      "Custom apps built by describing them in plain language, with no third-party software to license or explain",
    ],
    glance: {
      founded: "2016",
      runningSince: "2025",
      companyUrl: "https://www.sargentpc.com/",
      apps: [
        "Files",
        "Messages",
        "Tasks",
        "Contracts",
        "Invoicing",
        "Forms",
        "Automations",
        "Assembly Studio",
        "Airtable",
        "QuickBooks",
        "Google Calendar",
      ],
    },
    body: [
      {
        type: "heading",
        text: "A Relationship-First Firm That Refused to Feel Corporate",
      },
      {
        type: "paragraph",
        text: "Sargent CPAs is a boutique accounting and advisory practice that serves clients across the United States and internationally. They offer bookkeeping, tax preparation, and on-demand consulting. Growth has come entirely through referrals, which means every client relationship carries outsized weight.",
      },
      {
        type: "quote",
        text: "We specialize in individual and freelancing clients. We really love helping our clients and building a relationship with them.",
        attribution: "Anthony Drozd, Operations Manager, Sargent CPAs",
      },
      {
        type: "paragraph",
        text: "That relationship-first model shaped how the firm evaluated software. The team spent a long time assessing the accounting-specific platforms like TaxDome and Canopy. None of them fit.",
      },
      {
        type: "quote",
        text: "TaxDome and Canopy may do everything you want in one box, but on the client side it feels very corporate. It didn’t look friendly or seem inviting.",
        attribution: "Anthony Drozd, Operations Manager, Sargent CPAs",
      },
      {
        type: "paragraph",
        text: "Assembly offered a more flexible, customized experience that allowed Sargent CPAs to offer a warm, client-first experience.",
      },
      {
        type: "quote",
        text: "When we looked at other software, it felt too corporate and hard around the edges. Assembly came the closest to letting us give our clients the experience we wanted.",
        attribution: "Anthony Drozd, Operations Manager, Sargent CPAs",
      },
      {
        type: "heading",
        text: "One Branded Portal for Communications, Tasks, and Documents",
      },
      {
        type: "paragraph",
        text: "Sargent CPAs rolled out Assembly as the single front door for client interaction during their last renewal season. Communications, task lists, document intake, e-signatures, and billing all live in the same branded environment, replacing a stack of disconnected tools.",
      },
      {
        type: "paragraph",
        text: "The firm’s core client workflow now runs through the Tasks app. Recurring obligations that used to require an email nudge, like paying estimated quarterly taxes, signing forms, and returning requested documents, now appear as tasks in the client’s portal with a clear next action.",
      },
      {
        type: "quote",
        text: "Our clients really liked that we had an integrated system where all of their communications and the tasks they needed to do were in one central location.",
        attribution: "Anthony Drozd, Operations Manager, Sargent CPAs",
      },
      {
        type: "paragraph",
        text: "Branding was non-negotiable for a firm whose differentiation is warmth. Assembly’s customization lets Sargent CPAs deliver a portal that reads as an extension of the firm rather than a vendor’s software.",
      },
      {
        type: "quote",
        text: "When clients log into the portal, they see our branded colors and our logos. They feel like it’s a safe, trusted place, with custom features in the side menu that are exactly what we need for our clients.",
        attribution: "Anthony Drozd, Operations Manager, Sargent CPAs",
      },
      {
        type: "paragraph",
        text: "Behind that client-facing simplicity, Anthony has built a heavily automated back office. Using Assembly’s API and Automations, he has taken the repetitive mechanics of a tax practice off his team’s plate.",
      },
      {
        type: "quote",
        text: "Assembly has allowed our team to work better by streamlining client communications, document intake, and form signing. With automations and integrations, we’ve automated a lot of the tedious work: downloading documents, uploading files for clients to sign on a regular basis, that doesn’t need the expertise of a CPA.",
        attribution: "Anthony Drozd, Operations Manager, Sargent CPAs",
      },
      {
        type: "heading",
        text: "Building Custom Experiences Inside Assembly Studio",
      },
      {
        type: "paragraph",
        text: "Using Assembly’s new AI-powered app builder, Sargent CPAs were able to even further customize their client experience, starting with helping clients with their meeting management.",
      },
      {
        type: "paragraph",
        text: "The concept was simple: a client-facing area in their portal that securely syncs with the team’s Google Calendar, finds upcoming meetings, and displays the date, time, and which Sargent CPAs team member they’re meeting, with a reschedule request built directly into the app. Most importantly, the internal team could control if and when the client’s rescheduling requests are approved.",
      },
      {
        type: "quote",
        text: "It’s a really awesome feature for our clients. A centralized location where they can log in and see any upcoming meetings they might have.",
        attribution: "Anthony Drozd, Operations Manager, Sargent CPAs",
      },
      {
        type: "paragraph",
        text: "Anthony was able to describe the app in plain language, connect to Google Calendar, and have a working app ready to be used by clients.",
      },
      {
        type: "paragraph",
        text: "With a client-facing application under his belt, Anthony next plans to replace more complicated email-based tax document collection with a request list built into the portal.",
      },
      {
        type: "quote",
        text: "This is a common feature we see with other third-party software, but we wanted it integrated directly into our portal, and no third-party software does that. The client experience is really important to us. Being able to build something directly into the client portal was really important.",
        attribution: "Anthony Drozd, Operations Manager, Sargent CPAs",
      },
      {
        type: "paragraph",
        text: "Every custom app the firm builds is a third-party tool it doesn’t have to license, integrate, or explain to clients, while keeping the portal experience unbroken.",
      },
      {
        type: "quote",
        text: "You can build it any way you want and make it perfect for your clients and your business. With the ability to customize and build new apps, you save a lot of money instead of integrating third-party software.",
        attribution: "Anthony Drozd, Operations Manager, Sargent CPAs",
      },
      {
        type: "heading",
        text: "Lower Costs and an Experience that Clients Love",
      },
      {
        type: "paragraph",
        text: "By integrating Assembly into their client process, Sargent CPAs have consolidated multiple software tools into one central location: billing, form signing, document requests, all while offering a client experience unique to their firm.",
      },
      {
        type: "quote",
        text: "Paying for multiple third-party tools gets expensive. Now it’s all under one hood for all our clients.",
        attribution: "Anthony Drozd, Operations Manager, Sargent CPAs",
      },
      {
        type: "paragraph",
        text: "The client-side payoff is the one that matters most to a referral-driven firm. Meeting questions that used to arrive by email now resolve in the portal. Quarterly tax obligations show up as tasks rather than accountants chasing clients via email. And every interaction happens inside an interface that looks and feels like Sargent CPAs.",
      },
      {
        type: "quote",
        text: "I love being able to think of any idea we come up with and implement it directly into the portal. We’ve created custom things that are really unique for our clients, and they’ve found them very helpful.",
        attribution: "Anthony Drozd, Operations Manager, Sargent CPAs",
      },
      {
        type: "paragraph",
        text: "With Assembly’s client experience platform and AI building features helping streamline custom experiences, Sargent CPAs is building toward a practice where the technology disappears and the advisory relationship is all the client sees.",
      },
    ],
  },
  {
    slug: "advertai-marketing",
    company: "AdvertAI Marketing",
    seoDescription:
      "How AdvertAI Marketing replaced five tools with six apps built on Assembly Studio, and made its client experience the reason agencies pick it.",
    industry: "Marketing & Web Development",
    headline:
      "How AdvertAI Marketing Differentiates with Assembly’s Client Experience",
    summary:
      "Garrett Leonard’s white-label web development agency came to Assembly to fix scattered client communication. With Assembly Studio, they replaced their entire supporting tool stack and now differentiate on their client experience.",
    stats: [
      { value: "6+", label: "apps built" },
      { value: "5+", label: "tools eliminated" },
      { value: "5 weeks", label: "development to launch" },
    ],
    challenge:
      "AdvertAI Marketing builds premium websites for brands worldwide and white-labels fulfillment for other agencies, where every partner brings multiple concurrent projects. ClickUp handled internal tasks but had no client-facing layer, so intake ran through Google Forms, feedback through Markup.io, files through Google Drive, and everything else over email.",
    solution:
      "AdvertAI gave every client and agency partner one branded portal with its CRM structured to mirror the partner model, then used Assembly Studio to build the missing half: a message center that unifies Assembly messages, Gmail, ClickUp due dates and billing history, plus in-house replacements for design feedback, SEO reporting, onboarding and project provisioning.",
    results: [
      "Built six or more custom apps in a few weeks each",
      "Retiring Markup.io, Google Drive, Bright Local, Keyword.com and Google Forms",
      "Project managers stopped clicking between platforms to run a client day",
      "Client approvals, feedback and reporting all stay inside AdvertAI’s branded portal",
    ],
    glance: {
      founded: "2023",
      runningSince: "2025",
      companyUrl: "https://www.advertaimarketing.com/",
      apps: ["Messages", "Files", "Forms", "Billing", "Gmail", "ClickUp"],
    },
    body: [
      { type: "heading", text: "Selling an Experience, Not Just a Website" },
      {
        type: "paragraph",
        text: "AdvertAI Marketing builds premium websites for businesses and brands around the world. Founded in 2023 by Garrett Leonard, the 11-person agency also engages with other agency partners to white-label fulfillment under that agency’s existing brand.",
      },
      {
        type: "paragraph",
        text: "In this agency partner model, every new client brings multiple concurrent projects, each with its own timeline, stakeholders, and approval cycle, putting enormous weight on the project management experience. Here, Garrett saw the opportunity to differentiate himself with a better client experience.",
      },
      {
        type: "paragraph",
        text: "The problem was his tooling: ClickUp handled internal task management well, but it had no client-facing layer. Intake ran through Google Forms. Feedback and approvals lived in Markup.io. Files sat in Google Drive. Everything else happened over email.",
      },
      {
        type: "quote",
        text: "We were dealing with scattered emails and no good way to share information with clients.",
        attribution: "Garrett Leonard, Founder, AdvertAI Marketing",
      },
      {
        type: "paragraph",
        text: "He looked at Notion, considered building something custom on his own site, and explored stretching ClickUp’s native features to cover client communication. None of it fit. “There wasn’t a solution I found that was as simple and clear of an offering as Assembly.”",
      },
      {
        type: "heading",
        text: "One Branded Portal, Structured Around Agency Partners",
      },
      {
        type: "paragraph",
        text: "AdvertAI adopted Assembly in 2025 with a specific goal: give every client and agency partner one branded place to see their projects, talk to the team, and get what they need.",
      },
      {
        type: "paragraph",
        text: "Garrett structured Assembly’s CRM to mirror his business model directly. A partner logging in sees all of their projects in organized tabs: status, files, messages, and deliverables. Gone were the days of hunting through email threads for the current state of five simultaneous websites.",
      },
      {
        type: "paragraph",
        text: "That structure closed the gap his previous stack couldn’t. Clients stopped asking where things stood, because they could see it.",
      },
      {
        type: "quote",
        text: "That was actually why we came to Assembly in the first place: to find something that made us feel different from other marketing agencies and web design agencies. Something that felt unique, an experience you don’t typically get in this industry.",
        attribution: "Garrett Leonard, Founder, AdvertAI Marketing",
      },
      {
        type: "paragraph",
        text: "The all-in-one portal experience became central to AdvertAI’s positioning in differentiating itself among other marketing and web development agencies.",
      },
      {
        type: "heading",
        text: "Building the Missing Half: AdvertAI on Assembly Studio",
      },
      {
        type: "paragraph",
        text: "Assembly solved the client-facing side. But one gap persisted: the connection between client conversations in Assembly and the internal work happening in ClickUp. Every client request still had to be manually re-entered as a task and routed to the right team member.",
      },
      {
        type: "quote",
        text: "We use ClickUp for a lot of our project management and internal task-related items. We’ve always been missing the opportunity to connect that with the front-facing, client-related tools like Assembly.",
        attribution: "Garrett Leonard, Founder, AdvertAI Marketing",
      },
      {
        type: "paragraph",
        text: "The first tool that Garrett built was a comprehensive message center for his business, rivaling category-defining software tools like Front.",
      },
      {
        type: "paragraph",
        text: "The Message Center sits on top of Assembly’s native Messages app, extended with the workflow logic AdvertAI’s project managers actually need to run a day of client communication. It has become the app the team lives in, including:",
      },
      {
        type: "list",
        items: [
          "Follow-up tracking driven by ClickUp: project managers can manage follow-ups corresponding to the relevant ClickUp project",
          "Integrations with Gmail: client emails appear in the same message list alongside Assembly messages, plus upcoming ClickUp due dates, internal notes, and billing history. The team added talk-to-text for longer messages and custom sound alerts for notifications",
          "Ownership: messages can be assigned to specific internal team members, with the ability to restrict who’s allowed to respond to which clients",
          "Reply later and internal tagging: team members can flag a message for later and receive a notification banner at the end of the day, or tag a colleague with a question directly on the conversation",
          "Response templates: AdvertAI sends five to ten standard response and update types every week, and those now live in the app as templates",
          "Suggest a Reply: new team members can draft a response and route it to a team lead for review before it goes out, a training mechanism built directly into the workflow",
        ],
      },
      {
        type: "quote",
        text: "That’s been a really great feature in training people.",
        attribution: "Garrett Leonard, Founder, AdvertAI Marketing",
      },
      { type: "heading", text: "The Rest of the Stack, Rebuilt In-House" },
      {
        type: "paragraph",
        text: "The Message Center was the first app, not the last. In just a few weeks, AdvertAI also built out:",
      },
      {
        type: "list",
        items: [
          "A design feedback app, an Assembly-native replacement for Markup.io, keeping client approvals inside the branded portal",
          "An agency rewards program, a loyalty app for partner agencies that tracks project milestone progress and unlocks tiered discounts after every 5 or 10 sites completed in a year",
          "An SEO dashboard for client-facing visibility into deliverables and reporting, plus internal site issue detection, replacing Bright Local and Keyword.com",
          "A project hub for custom onboarding forms, client surveys, and an AI content writing tool built around AdvertAI’s specific copy process",
          "A project starter app that provisions a new project across every Assembly app and ClickUp simultaneously",
        ],
      },
      {
        type: "quote",
        text: "We’ve been able to build out apps in just a few weeks that I don’t know if we could have done within five to ten years before Assembly Studio. It’s allowed me to create automations and workflows that I didn’t realize were going to be possible.",
        attribution: "Garrett Leonard, Founder, AdvertAI Marketing",
      },
      {
        type: "heading",
        text: "Fewer Tools, and a Client Experience Competitors Can’t Beat",
      },
      {
        type: "paragraph",
        text: "The most immediate result was consolidation. AdvertAI is in the process of retiring Markup.io, Google Drive, Bright Local, Keyword.com, and Google Forms, replaced by apps the team built themselves inside their own portal.",
      },
      {
        type: "quote",
        text: "It’s not only saved us money, it’s greatly improved the internal workflows we have, because there’s much less clicking between different platforms for all of our project managers to complete the day-to-day tasks we need with each client. It’s saved them a ton of time, and it’s been much less of a headache for them, not having to figure out where to go for the next thing. They can stay on Assembly for just about everything they do every day.",
        attribution: "Garrett Leonard, Founder, AdvertAI Marketing",
      },
      {
        type: "paragraph",
        text: "For Garrett, the savings show up as reclaimed hours and less operational overhead.",
      },
      {
        type: "quote",
        text: "I’m already starting to see myself get hours back each week, because there’s less maintenance and fewer things I need to stay on top of. The apps are doing a lot of this themselves.",
        attribution: "Garrett Leonard, Founder, AdvertAI Marketing",
      },
      {
        type: "paragraph",
        text: "The part he weights most heavily, though, is what clients see. Approvals, feedback, reporting, and communication all now happen inside AdvertAI’s own branded environment.",
      },
      {
        type: "quote",
        text: "Everything stays within the client portal now. They don’t have to jump to another tool for feedback: everything stays within our own branded area.",
        attribution: "Garrett Leonard, Founder, AdvertAI Marketing",
      },
      {
        type: "quote",
        text: "Our clients have said nothing but great things about all the apps we’ve shared with them. We’ve heard how professional everything feels, and how it’s really unique compared to any other experience they’ve had.",
        attribution: "Garrett Leonard, Founder, AdvertAI Marketing",
      },
      {
        type: "paragraph",
        text: "As AdvertAI continues shifting toward an agency-first model, that differentiated experience is the growth engine, and the rewards program is already doing double duty as a pitch asset for new partners.",
      },
      {
        type: "quote",
        text: "Assembly Studio is something I’d definitely recommend to other agency owners, and really any business looking to not only make things easier for them, but make the experience a lot better for the clients they work with.",
        attribution: "Garrett Leonard, Founder, AdvertAI Marketing",
      },
    ],
  },
];

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return CASE_STUDIES.find((cs) => cs.slug === slug);
}

// The three flagship stories featured as cards in the customers-page hero.
// Everything else flows into the story table below. Single source of truth so
// the hero and the table never double-list a study.
export const HERO_STUDY_SLUGS = [
  "capital-one-luxury-travel",
  "ditto-by-dbc",
  "jungle-luxe",
  "collective-cpa",
] as const;

export const HERO_STUDIES: CaseStudy[] = HERO_STUDY_SLUGS.map(
  (slug) => CASE_STUDIES.find((s) => s.slug === slug),
).filter((s): s is CaseStudy => Boolean(s));

// First testimonial quote from a study's body, split into speaker name + role
// (attribution is "Name, Role at Company"). Used by the customers-page cards.
export interface FeaturedQuote {
  text: string;
  name: string;
  role: string;
}

export function firstQuote(study: CaseStudy): FeaturedQuote | null {
  const block = study.body?.find(
    (b): b is Extract<ContentBlock, { type: "quote" }> => b.type === "quote",
  );
  if (!block) return null;
  const attribution = block.attribution ?? "";
  const [name, ...rest] = attribution.split(",");
  return {
    text: block.text,
    name: name.trim(),
    role: rest.join(",").trim(),
  };
}
