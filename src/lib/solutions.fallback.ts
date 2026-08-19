// A frozen copy of the eight indexed /solutions pages, used only when
// Contentful is unreachable or unconfigured (a local checkout with no token, a
// CMS outage mid-build). Contentful is the source — see solutions.ts — so this
// is a floor, not a second place to edit: a copy change made here and not in
// Contentful is invisible the moment the CMS answers again.
//
// Generated from the same entries this site queries. It carries no imagery:
// the screenshots are CMS assets, so a fallback render is copy-only rather than
// pointing at asset URLs that could be replaced or unpublished independently. The ninth page,
// small-business-smb-client-portal, is deliberately absent: it is noIndex in
// Contentful, so it has no business being served from a stale local copy.
import type { Solution } from "./solutions";
import {
  DEMO_URL,
  GUIDE_URL,
  SIGNUP_URL,
  TRUST_CENTER_URL,
} from "./constants";

export const FALLBACK_SOLUTIONS: Solution[] = [
  {
    slug: "accounting-client-portal",
    seo: {
      title: "Top Client Portal Software For Accountants",
      description: "Highest rated white-label accounting client portal software made for accounting firms. Secure file sharing, automations, QuickBooks integrations, and more.",
    },
    noIndex: false,
    hero: {
      layout: "left",
      title: "The accounting client portal your clients won't ignore",
      description: "Built for how accountants work and designed for how clients think — so your branded portal becomes the hub your clients actually return to. Onboarding, file requests, contracts, billing, and messaging in one place.",
      ctas: [{ label: "Get started", href: SIGNUP_URL }],
    },
    sections: [
      {
        kind: "features",
        title: "Stop duct-taping your accounting workflow together",
        description: "Assembly replaces the chaos of juggling ShareFile for files, DocuSign for contracts, and email back-and-forth with a single branded portal your team sets up in an afternoon — and your clients navigate in minutes.",
        ctas: [{ label: "Get started", href: SIGNUP_URL }, { label: "See a demo portal", href: "https://portal.blacklighttax.com/login?step=signUp&demoportal=true" }],
        features: [
          {
            label: "Onboarding",
            heading: "Streamline your client onboarding",
            body: "Quickly set up an onboarding experience that walks clients through a clear task checklist —from submitting forms, signing contracts, to paying the first invoice — so nothing falls through the cracks.",
            href: "/customers/collective-cpa",
          },
        ],
        quote: {
          quote: "Assembly was the only one that let us flexibly build our own version of a client portal, uniting elements of their technology with existing external core applications that we wanted to keep using.",
          name: "Kyle Pearson",
          role: "Founder & CEO, Collective CPA",
          href: "/customers/collective-cpa",
        },
      },
      {
        kind: "features",
        title: "From first impression to final invoice — all in one place",
        description: "No more chasing and reminders. Leverage automated invoices, subscriptions, and self-serve payments offerings that you create. Accept ACH or credit card through secure checkout, so you get paid faster.",
        features: [
          {
            label: "Invoicing",
            heading: "Request payments",
            body: "Let clients pay directly from your portal.",
          },
          {
            label: "Messaging",
            heading: "Manage clients in one place",
            body: "Keep client work simple with integrated messaging, billing, and task management—all connected in one platform.",
          },
          {
            label: "Forms",
            heading: "Request forms and submissions",
            body: "Create custom forms for everything from service requests, onboarding intake, project outlines, and more.",
          },
        ],
      },
      {
        kind: "features",
        title: "See how real accountants use Assembly",
        description: "Watch Jason on Firms discuss how to use Assembly for your CPA or bookkeeping firm.",
        video: "https://youtu.be/2BbtFBjeEEw?si=o8-yItyWU1WG9nBh",
      },
      {
        kind: "story",
        body: "Leah McCool transformed her bookkeeping practice, rapidly growing her client base while cutting onboarding time by 75%, using Assembly's integrated client portal platform.",
        stats: [
          { value: "400%", label: "Client growth" },
          { value: "75%", label: "Faster onboarding" },
          { value: "80%", label: "Less email back-and-forth" },
        ],
        caseStudy: "orca-accounting",
      },
      {
        kind: "grid",
        title: "More than just a client portal",
        items: [
          {
            title: "Invoicing",
            description: "Create invoices for your clients to pay via credit card or ACH.",
            href: "https://assembly.com/invoicing",
          },
          {
            title: "Automations",
            description: "Set up workflows that save you time with client management.",
            href: "https://assembly.com/platform",
          },
          {
            title: "Subscriptions",
            description: "Automate recurring payments and billing cycles for predictable revenue",
            href: "https://assembly.com/guide/assembly-billing-app#subscriptions",
          },
          {
            title: "File-sharing",
            description: "Share files and documents securely with easy client access and permissions.",
            href: "https://assembly.com/file-sharing",
          },
          {
            title: "Tasks",
            description: "Manage tasks seamlessly across your team and clients in one place.",
            href: "https://assembly.com/apps/directory/tasks",
          },
          {
            title: "Security",
            description: "Keep data safe with enterprise-grade SOC 2 and HIPAA compliance.",
            href: TRUST_CENTER_URL,
          },
          {
            title: "CRM",
            description: "Manage client relationships and track every interaction in one hub.",
            href: "https://assembly.com/client-management",
          },
          {
            title: "Forms",
            description: "Create custom intake forms to collect client information efficiently.",
            href: "https://assembly.com/apps/directory/forms-app",
          },
          {
            title: "Contracts",
            description: "Send professional agreements with built-in eSignatures.",
            href: "https://assembly.com/esignature",
          },
        ],
      },
      {
        kind: "faq",
        title: "Frequently asked questions",
        items: [
          {
            question: "Does Assembly work for accounting and tax firms?",
            answer: "Yes — Assembly serves accounting, bookkeeping, and tax firms with a full suite of client management tools including a branded client portal, document sharing, eSignatures, invoicing, payment processing, task management, and workflow automation. Firms can embed specialized tools like tax organizers and reporting dashboards directly into the client portal.",
          },
          {
            question: "Can clients with multiple businesses or both personal and business accounts use one login?",
            answer: "Yes—Assembly was specifically designed for this. You can assign a single client to multiple companies, and companies can represent anything: separate businesses, divisions, family entities, personal vs. business accounts, and more. You can even rename \"company\" to whatever term fits your practice—space, family, organization, etc.\n\nOn the client side, when someone belongs to multiple companies, a sidebar switcher appears (similar to Slack's workspace switcher) so they can seamlessly move between entities with one login. No separate accounts, no duplicate credentials. This is a common pain point with other tools—Canopy, for example, requires married couples to have entirely separate client accounts with no way to link them.",
          },
          {
            question: "How does Assembly compare to TaxDome / Karbon / Canopy?",
            answer: "Tools like TaxDome, Karbon, and Canopy are great for internal practice management—workflows, task tracking, and tax-specific features. Assembly shines on both the internal and client-facing side, giving your clients a modern, branded portal they'll actually enjoy using. Firms switching from these tools consistently tell us their old portals felt \"not intuitive,\" \"overly complex,\" or like an afterthought.\n\nBeyond the client experience, two things set Assembly apart: First, it's an open platform—not a walled garden. With the most comprehensive API in the space, plus native Zapier, Make, and custom app support, you can build a client experience competitors simply can't match. Second, pricing is simple and scales with you. No per-contact billing that balloons as you grow, no confusing add-on charges for features you actually need.",
          },
          {
            question: "Will my clients actually use this client portal?",
            answer: "Yes—and this is where Assembly shines. Assembly's client-facing portal feels simple and modern, not like intimidating accounting software. Clients can log in, upload documents, sign contracts, and communicate with your team without any training. 69% of Assembly's G2 reviews highlight the client experience as a standout strength. When your clients actually use the portal, your firm saves hours on email follow-ups and document chasing.",
          },
          {
            question: "How long does it take to get set up?",
            answer: "Most accounting firms are fully up and running on Assembly within a single day—no lengthy onboarding process or training academy required. The platform is designed to be intuitive from the start, so you can import your clients, customize your portal branding, and begin onboarding within hours of signing up. 52% of Assembly's G2 reviews highlight ease of use, and 18% specifically praise quick setup.",
          },
          {
            question: "Does Assembly integrate with QuickBooks / Xero?",
            answer: "Yes, Assembly has native billing integrations with one-way sync for QuickBooks and Xero, allowing you to map Assembly products to items in your preferred accounting software and automatically sync when you invoice clients through Assembly. Learn more about the [QuickBooks integration](https://assembly.com/apps/directory/quickbooks) and [Xero integration](https://assembly.com/apps/directory/xero) for Assembly.",
          },
          {
            question: "Can I white-label the portal with my firm's branding?",
            answer: "Absolutely. Assembly gives you full control over your client portal's branding—custom domain, logo, colors, and more. Your clients see your firm's brand, not ours. For firms positioning themselves as premium advisors, brand consistency across every client touchpoint matters. 20% of Assembly's G2 reviews specifically praise branding and customization options.",
          },
          {
            question: "How does pricing work? Are there hidden costs?",
            answer: "Assembly uses transparent per-seat pricing with no hidden fees for support, onboarding, or essential features. You know exactly what you're paying for upfront, and onboarding support is included at no extra charge. While point solutions may appear cheaper initially, firms often end up stitching together 3-5 separate tools. Assembly consolidates contracts, invoicing, file sharing, forms, and messaging into one platform—often reducing total software spend.",
          },
          {
            question: "Do I need separate tools for contracts, invoicing, and file sharing?",
            answer: "No. Assembly is an all-in-one client portal that includes contracts and e-signatures, invoicing and payments, secure file sharing, custom forms, client messaging, and task management—all built in. 16% of Assembly's G2 reviews specifically praise this consolidation. Everything lives in one branded portal, giving you a single source of truth for every client relationship.",
          },
          {
            question: "Is it hard to learn? Do my staff need training?",
            answer: "No training required. Assembly is designed so both your staff and clients find it intuitive from day one. Your team doesn't need a certification course or hours of training videos—the interface is clean and logical, with features that work the way you'd expect. Most firms are productive immediately, and 52% of Assembly's G2 reviews highlight the platform's ease of use.",
          },
          {
            question: "Can I handle client onboarding and intake forms through the portal?",
            answer: "Yes—and this is one of Assembly's most-used features for accounting firms. Assembly includes customizable forms and intake questionnaires for tax prep document requests, new client onboarding checklists, engagement letters, and recurring information collection. Everything happens within your branded portal, and clients receive a clean, guided experience for submitting documents and completing intake steps.",
          },
          {
            question: "Is my clients' data secure?",
            answer: "Absolutely. Assembly provides SOC 2 compliance, end-to-end encryption, and secure file sharing with access controls. The branded portal also reinforces professionalism—when clients log into a polished, secure environment with your firm's branding, it builds trust in your practice. Whether your clients are individuals, businesses, or organizations handling sensitive financial data, they can feel confident their documents and communications are protected.",
          },
        ],
      },
    ],
    closing: {
      title: "Your clients deserve it. And so do you.",
      ctas: [{ label: "Get started", href: SIGNUP_URL }, { label: "Book a demo", href: DEMO_URL }],
    },
  },
  {
    slug: "consulting-client-portal",
    seo: {
      title: "Best Client Portal For Consulting Firms",
      description: "Highest rated white label client portal software for modern consulting firms. Gives your clients a streamlined one-stop shop experience.",
    },
    noIndex: false,
    hero: {
      layout: "left",
      title: "Run a modern, tech-enabled consulting firm.",
      description: "Differentiate your consulting firm with a white-label portal that gives your clients a one-stop shop to access dashboards, submit tickets, send messages, make payments, and more.",
      ctas: [{ label: "Get started", href: SIGNUP_URL }],
    },
    sections: [
      {
        kind: "features",
        title: "Deliver a delightful client experience.",
        description: "Create a branded client portal to manage consulting clients at every stage of your relationship.",
        features: [
          {
            label: "Tasks",
            heading: "Keep clients updated about projects",
            body: "Use task management apps to share project statuses and streamline the communication between you and your clients.",
          },
          {
            label: "Invoicing",
            heading: "Request payments",
            body: "Let clients pay directly from your portal.",
          },
          {
            label: "Forms",
            heading: "Request forms and submissions",
            body: "Create custom forms for everything from service requests, onboarding intake, project outlines, and more.",
          },
          {
            label: "eSignatures",
            heading: "Request eSignature contracts",
            body: "Send contracts and let clients sign directly in your portal.",
          },
          {
            label: "Helpdesk",
            heading: "Share resources",
            body: "Let your clients access important information and articles from your Helpdesk.",
          },
        ],
      },
      {
        kind: "story",
        body: "Kody Foringer and Robert Prochnow transformed how they deliver fractional executive leadership services by building automated, secure portals for customers with Assembly’s client portal software — saving everyone up to 90% of manual labor time.",
        stats: [
          { value: "90%+", label: "Time back" },
          { value: "40+", label: "Weekly hours saved" },
          { value: "1000+", label: "Automations triggered" },
        ],
        caseStudy: "zen-aegis",
      },
      {
        kind: "grid",
        title: "Assemble everything your clients need",
        description: "Deliver a bespoke client experience with all features included at no extra cost.",
        ctas: [{ label: "Get started", href: SIGNUP_URL }],
        items: [
          {
            title: "Branding",
            description: "Create personalized online invoices and let clients checkout on a custom domain.",
            href: "https://assembly.com/client-portal",
          },
          {
            title: "Client portal",
            description: "Give clients access to messages, contracts, files, and more.",
            href: "https://assembly.com/client-portal",
          },
          {
            title: "Client onboarding",
            description: "Save time with automatic onboarding using custom forms and messages.",
            href: "https://assembly.com/client-onboarding-system",
          },
          {
            title: "Forms",
            description: "Create custom intake forms to collect client information efficiently.",
            href: "https://assembly.com/apps/directory/forms-app",
          },
          {
            title: "File-sharing",
            description: "Share files and documents securely with easy client access and permissions.",
            href: "https://assembly.com/file-sharing",
          },
          {
            title: "Contracts",
            description: "Send professional agreements with built-in eSignatures.",
            href: "https://assembly.com/esignature",
          },
          {
            title: "Messaging",
            description: "Communicate with clients through secure, centralized channels",
            href: "https://assembly.com/apps/directory/messaging-app",
          },
          {
            title: "Reminders",
            description: "Automate payment reminders to keep clients on track and minimize overdue invoices.",
          },
          {
            title: "Security",
            description: "Keep data safe with enterprise-grade SOC 2 and HIPAA compliance.",
            href: TRUST_CENTER_URL,
          },
        ],
      },
      {
        kind: "faq",
        title: "Frequently asked questions",
        items: [
          {
            question: "What is a consulting client portal?",
            answer: "A consulting client portal is a secure, client-facing workspace where consultants share deliverables, manage communication, and track work in one place. Clients log in to view files, messages, tasks, and invoices related to their engagement instead of relying on email or shared folders.",
          },
          {
            question: "Can I white-label the portal so it looks like my own platform?",
            answer: "Yes, fully. You can add your logo, brand colors, custom domain (e.g., portal.yourfirm.com), and even send email notifications from your own domain (e.g., noreply@yourfirm.com). Your clients will never see Assembly’s branding — the experience is entirely yours. White-label features are available on Professional plans and above.",
          },
          {
            question: "How is Assembly different from products like Moxo, Accelo, or CoordinateHQ?",
            answer: "Assembly stands out in three key areas. First, it’s more flexible — unlike Moxo, which leans enterprise and can be expensive for growing firms, Assembly gives you the same white-label portal experience at a transparent flat price starting at $0/month. Unlike Accelo, which is primarily a practice management tool, Assembly is portal-first — meaning the client experience is the centerpiece, not an afterthought. And compared to CoordinateHQ, Assembly offers a fuller suite including billing, contracts with eSignatures, and a developer platform with API and Custom Apps, so you can grow without hitting feature ceilings.",
          },
          {
            question: "Can my clients pay invoices and sign contracts through the portal?",
            answer: "Absolutely. Assembly includes built-in invoicing (one-time and recurring subscriptions), payment collection via credit card and ACH, and a contracts app with legally binding eSignatures. Clients can review, sign, and pay all from their portal — no need for separate tools like DocuSign or QuickBooks.",
          },
          {
            question: "I use tools like Airtable, Calendly, and Google Drive. Can I bring those into the portal?",
            answer: "Yes. You can embed virtually any web-based tool directly into your client portal, so clients can see your Airtable project trackers, book meetings via Calendly, or access Google Drive folders without leaving the portal. Assembly is an open platform with a full API, native Zapier and Make connectors, and a Custom Apps framework — meaning you can connect to virtually any tool your firm uses, from CRMs and calendaring apps to accounting software like QuickBooks. The integration ecosystem is one of the most comprehensive in the client portal space.",
          },
          {
            question: "How do I onboard new consulting clients?",
            answer: "Assembly streamlines onboarding with automated workflows. When you create a new client, you can automatically send a welcome message, assign intake forms, deliver contracts for eSignature, and share your first invoice — all triggered without manual effort. Consulting firms on Assembly report cutting onboarding time by 50–75% compared to email-based workflows.",
          },
          {
            question: "Is Assembly secure enough for handling confidential client data?",
            answer: "Yes. Assembly is SOC 2 compliant and supports HIPAA and GDPR compliance, with a signed Business Associate Agreement available on Advanced plans. All data is encrypted in transit and at rest. You can also enforce multi-factor authentication for both your team and clients, and use client access permissions to control which team members can see specific client data.",
          },
          {
            question: "We’re a growing consultancy with 5–15 people. Can Assembly scale with us?",
            answer: "Absolutely. Assembly is designed to scale from solo consultants to 100+ person firms. The Professional plan ($99/month) includes 3 team members and supports up to 500 clients. The Advanced plan ($499/month) includes 5 team members with unlimited clients and automation tasks. As you grow, you can add users and leverage the API and Custom Apps to build workflows tailored to your firm.",
          },
          {
            question: "Can I manage multiple client companies with different stakeholders?",
            answer: "Yes. Assembly supports multi-company clients on Professional plans and above. Each client can belong to multiple companies, and each company can have multiple contacts — all under a single organized CRM. This is ideal for consultancies working with different divisions or portfolio companies.",
          },
          {
            question: "How long does it take to set up?",
            answer: "Most consulting firms are fully operational within a day. You can create your branded portal, add clients, set up billing, and configure intake forms in under an hour. For larger teams, Assembly offers personalized onboarding support with annual plans to help you build automations and train your team.",
          },
          {
            question: "What if my clients aren’t tech-savvy?",
            answer: "Assembly is designed with the end-client experience in mind. Clients get a clean, intuitive portal that’s accessible on desktop and mobile. They can even reply to messages directly from email notifications without needing to log into the portal. Setup requires no app downloads — clients simply visit your custom portal URL.",
          },
          {
            question: "Can I sell productized consulting services through Assembly?",
            answer: "Yes. Assembly includes a storefront feature that lets you package and sell productized services — like strategy sessions, audit packages, or monthly advisory retainers — directly through your client portal. Clients can browse, purchase, and pay without any back-and-forth email negotiations.",
          },
          {
            question: "What is Assembly Assistant, and how does it help consultants?",
            answer: "Assembly Assistant is an AI-powered feature that surfaces relevant client context — notes, files, message history — before meetings and calls. It can also help draft follow-up messages and summarize conversations. For consultants juggling multiple client engagements, it eliminates the prep time of digging through emails and documents before every interaction.",
          },
        ],
      },
    ],
    closing: {
      title: "Your clients deserve better.",
      description: "Try Assembly for free, no credit card required.",
      ctas: [{ label: "Get started", href: SIGNUP_URL }, { label: "Book a demo", href: DEMO_URL }],
    },
  },
  {
    slug: "designer-client-portal",
    seo: {
      title: "Best Client Portal Software For Designers",
      description: "Highest rated white label designer client portal software. Securely share designs, upload files, request feedback, track projects, and more.",
    },
    noIndex: false,
    hero: {
      layout: "left",
      title: "Client portal software for modern designers",
      description: "Design firms should care about the client-facing software they use. Make onboarding and client engagement feel modern, on-brand, and differentiated with Assembly.",
      ctas: [{ label: "Get started", href: SIGNUP_URL }],
    },
    sections: [
      {
        kind: "grid",
        title: "Your customers deserve a modern client experience",
        description: "Whether you're a freelancer or a growing design firm, deliver a polished, branded experience.",
        items: [
          {
            title: "Branding",
            description: "Provide a premium experience by customizing your portal with your brand assets.",
          },
          {
            title: "All-in-one",
            description: "Impress clients with a seamless all-in-one experience on web and mobile.",
          },
          {
            title: "Automations",
            description: "Save time, work more efficiently, and reduce the risk of manual errors.",
          },
          {
            title: "Partner Apps",
            description: "Embed products like Airtable, Calendly, and others to give clients a true all-in-one view.",
          },
          {
            title: "Custom Apps",
            description: "Build your own Custom Apps that seamlessly integrate with the rest of the platform.",
          },
          {
            title: "Integrations",
            description: "Connect your accounting software, sales CRM, or another supported product.",
          },
          {
            title: "Notifications",
            description: "Streamlined and branded notifications for clients in your portal and via email.",
          },
          {
            title: "Security",
            description: "Protect sensitive client information. SOC2 and HIPAA reports are available.",
          },
        ],
      },
      {
        kind: "features",
        title: "Give your clients a one-stop shop for working with you.",
        description: "From messaging to invoicing, task management to file-sharing, and more, give your clients a branded experience from proofs to final delivery.",
        features: [
          {
            label: "Invoicing",
            heading: "Request payments",
            body: "Let clients pay directly from your portal.",
          },
          {
            label: "Tasks",
            heading: "Keep clients updated about projects",
            body: "Use task management apps to share project statuses and streamline the communication between you and your clients.",
          },
          {
            label: "File sharing",
            heading: "Share files securely",
            body: "Share files with your clients in a secure data platform with custom permissions.",
          },
          {
            label: "eSignatures",
            heading: "Request eSignature contracts",
            body: "Send contracts and let clients sign directly in your portal.",
          },
        ],
      },
      {
        kind: "features",
        title: "Why designers need a client portal",
        description: "Watch Design by Laney explain why you need to elevate your client experience with a branded customer portal.",
        video: "https://www.youtube.com/watch?v=3z5Q77I84Bo",
      },
      {
        kind: "story",
        body: "Mallory Durrick’s boutique web development and design agency leverages Assembly’s file sharing and consolidated client management not only for herself, but also for her clients.",
        stats: [
          { value: "50+", label: "Satisfied clients" },
          { value: "100+", label: "Projects completed" },
          { value: "35+", label: "Years experience" },
        ],
        caseStudy: "durrick-designs",
      },
      {
        kind: "faq",
        title: "Frequently asked questions",
        items: [
          {
            question: "What is a client portal for designers?",
            answer: "A client portal is a secure, branded workspace where designers share files, collect feedback, manage contracts, and communicate with clients—all in one place. Instead of juggling email threads, Google Drive links, and scattered documents, everything lives in a single destination your clients can access anytime. It streamlines your workflow and creates a more professional experience for your clients.",
          },
          {
            question: "Can I fully brand the portal to match my design aesthetic?",
            answer: "Yes, and this is where Assembly stands out. You can customize your portal with your logo, brand colors, custom domain, and custom email domain. The portal is clean and modern by default, and the white-label options ensure your clients never see Assembly’s branding. For designers, first impressions matter — and your portal should feel like an extension of your studio.",
          },
          {
            question: "Can I automate onboarding for new design clients?",
            answer: "Yes. When you add a new client, Assembly can automatically send a branded welcome message, an intake questionnaire (to collect brand guidelines, project briefs, access credentials), a design contract for eSignature, and your first invoice — all without manual work. This gives every client a consistent, premium experience from day one.",
          },
          {
            question: "How do I show clients project progress without giving full access?",
            answer: "Assembly's granular permissions let you control exactly what clients see. Share task status and progress updates while keeping internal notes private. Set files to read-only for client review, and restrict editing access to your team. Clients stay informed without accessing sensitive project details.",
          },
          {
            question: "How is Assembly different from HoneyBook, Dubsado, or Bonsai?",
            answer: "HoneyBook, Dubsado, and Bonsai are popular with freelance designers, but they're built around basic workflows — contracts, invoices, and simple project tracking. Assembly is built around the client experience itself, giving you a branded portal that looks and feels like an extension of your studio.\n\nThe bigger difference is flexibility. Assembly lets you embed tools you're already using — Loom, Figma, Calendly, Google Drive — directly inside the portal, so clients aren't jumping between links and email threads. And as your studio grows, Assembly grows with you, with team controls and automations that tools like HoneyBook weren't designed to support.",
          },
          {
            question: "Can I migrate from tools like HoneyBook or Dubsado to Assembly?",
            answer: "Yes, and our team helps with the transition. Import client data via CSV, run both platforms in parallel during migration, and use API access or Zapier connections for custom workflows. There's no long-term contract, so you can switch at your own pace with support along the way.",
          },
          {
            question: "Can my design team and contractors access the portal?",
            answer: "Yes. Add team members and external contractors as internal users with customizable client access. This makes it possible to invite team members who can only access specific clients/projects for a temporary time, while keeping everything else private.",
          },
          {
            question: "I want clients to see project progress and leave comments. Can Assembly do that?",
            answer: "Yes. Assembly includes a Tasks App where you can create projects, assign tasks, and give clients visibility into what’s in progress, under review, or complete. Combined with messaging, clients can ask questions or provide feedback directly within the portal — eliminating scattered email threads and keeping all project communication in context.",
          },
          {
            question: "Can I share large design files and assets through the portal?",
            answer: "Absolutely. Assembly’s file sharing app lets you organize documents and design assets in a folder structure that your clients can access securely. Clients can upload files too — perfect for receiving brand guidelines, content, photography, or other project materials. All file transfers are encrypted.\n\nIf you have files stored in another platform like Google Drive or a design or video-focused platform, you can also add links to those files that show alongside uploaded files.",
          },
          {
            question: "Can I embed tools like Figma, Google Drive, or project trackers into the portal?",
            answer: "Yes. Assembly is an open platform with a full API, native Zapier and Make connectors, and a Custom Apps framework. You can embed Figma prototypes, Google Drive folders, Airtable project boards, Calendly scheduling widgets, or any tool that supports embedding — so clients see everything they need in one place without jumping between apps. Unlike tools like Dubsado with limited integrations, Assembly’s open architecture means you’ll never be boxed in as your tool stack evolves.",
          },
          {
            question: "How does invoicing work? I have both project-based and retainer clients.",
            answer: "Assembly handles both. You can create one-time invoices for project milestones and recurring subscriptions for retainer clients. Clients pay via credit card or ACH directly through the portal. You can also set up a storefront with productized service packages — like a “Brand Identity Package” or “Monthly Design Retainer” — that clients can purchase with a payment link you share on your website.",
          },
          {
            question: "I’m a solo designer. Is $29/month worth it when I’m watching every dollar?",
            answer: "Assembly now offers a free plan to test out the product as you are deciding what is the perfect solution for your business.\n\nConsider what you’re currently spending: a separate invoicing tool, an eSignature tool, file sharing, and messaging add up quickly — often to $60–$100+/month combined. Assembly includes all of these in one platform starting at $29/month, plus you get the professional polish of a branded client portal. It’s also a revenue tool: designers who use client portals report faster payments, better client communication, and a more professional image that helps justify premium pricing for their services.",
          },
        ],
      },
    ],
    closing: {
      title: "Your clients deserve better.",
      description: "Try Assembly for free, no credit card required.",
      ctas: [{ label: "Get started", href: SIGNUP_URL }, { label: "Book a demo", href: DEMO_URL }],
    },
  },
  {
    slug: "freelancer-client-portal",
    seo: {
      title: "Best Client Portal Software For Freelancers",
      description: "Highest rated white label client portal software made for freelancers. Streamlined tool for billing, file sharing, client communication, forms, and more.",
    },
    noIndex: false,
    hero: {
      layout: "left",
      title: "Client portal software for modern freelancers",
      description: "Differentiate your business with a white-label portal to manage customers and projects seamlessly.",
      ctas: [{ label: "Get started", href: SIGNUP_URL }],
    },
    sections: [
      {
        kind: "features",
        title: "An all-in-one place for clients to work with you",
        description: "Offer clients a streamlined way to onboard, pay you for services, complete action items, and contact you in one branded place.",
        features: [
          {
            label: "Invoicing",
            heading: "Request payments",
            body: "Let clients pay directly from your portal.",
          },
          {
            label: "Forms",
            heading: "Request forms and submissions",
            body: "Create custom forms for everything from service requests, onboarding intake, project outlines, and more.",
          },
          {
            label: "Helpdesk",
            heading: "Share resources",
            body: "Let your clients access important information and articles from your Helpdesk.",
          },
          {
            label: "eSignatures",
            heading: "Request eSignature contracts",
            body: "Send contracts and let clients sign directly in your portal.",
          },
          {
            label: "Tasks",
            heading: "Keep clients updated about projects",
            body: "Use task management apps to share project statuses and streamline the communication between you and your clients.",
          },
        ],
      },
      {
        kind: "grid",
        title: "Your customers deserve a modern client experience",
        items: [
          {
            title: "Branding",
            description: "Provide a premium experience by customizing your portal with your brand assets.",
          },
          {
            title: "Automations",
            description: "Save time, work more efficiently, and reduce the risk of manual errors.",
          },
          {
            title: "All-in-one",
            description: "Impress clients with a seamless all-in-one experience on web and mobile.",
          },
          {
            title: "Partner Apps",
            description: "Embed products like Airtable, Calendly, and others to give clients a true all-in-one view.",
          },
          {
            title: "Custom Apps",
            description: "Build your own Custom Apps that seamlessly integrate with the rest of the platform.",
          },
          {
            title: "Integrations",
            description: "Connect your accounting software, sales CRM, or another supported product.",
          },
          {
            title: "Notifications",
            description: "Streamlined and branded notifications for clients in your portal and via email.",
          },
          {
            title: "Security",
            description: "Protect sensitive client information. SOC2 and HIPAA reports are available.",
          },
        ],
      },
      {
        kind: "story",
        body: "Mallory Durrick’s boutique web development and design agency leverages Assembly’s file sharing and consolidated client management not only for herself, but also for her clients.",
        stats: [
          { value: "50+", label: "Satisfied clients" },
          { value: "100+", label: "Projects completed" },
          { value: "35+", label: "Years experience" },
        ],
        caseStudy: "durrick-designs",
      },
      {
        kind: "faq",
        title: "Frequently asked questions",
        items: [
          {
            question: "What is Assembly, and is it worth it for a solo freelancer?",
            answer: "Assembly is a client portal platform that replaces the patchwork of tools most freelancers rely on — separate apps for invoicing, contracts, file sharing, messaging, and forms. Instead, your clients get one branded portal where they can pay you, sign contracts, share files, complete onboarding forms, and communicate — all in one place. Start for free with all features included, it's a fraction of what you'd spend on multiple standalone tools, and it makes you look far more professional to clients.",
          },
          {
            question: "How does Assembly's pricing compare to HoneyBook, Dubsado, or Bonsai?",
            answer: "Assembly's key difference is its transparent, flat pricing with all features included — no feature gating behind expensive tiers. HoneyBook starts cheaper but limits customization and doesn't offer true white-labeling or a developer platform. Dubsado offers workflow automation but users frequently report that the client portal and task features feel underdeveloped and the interface can feel dated. Bonsai is strong for time tracking and proposals but has received criticism for inconsistent customer support and limited customization. Assembly gives you the most complete, client-facing experience with invoicing, contracts, eSignatures, messaging, file sharing, forms, tasks, and a fully branded portal — all for one price.",
          },
          {
            question: "Can I make the portal look like it's my own platform?",
            answer: "Yes. Assembly supports full white-label branding — add your logo, brand colors, and custom domain (e.g., portal.yourname.com) so clients see your brand, not Assembly's. This is a major differentiator for freelancers who want to project a premium, established image. Full white-label removal of \"Powered by Assembly\" is available on Advanced plans.",
          },
          {
            question: "I need to get paid faster. How does billing work?",
            answer: "Assembly includes built-in invoicing with credit card and ACH payments. You can create one-time invoices, set up recurring subscriptions for retainer clients, automate payment reminders, and even add credit card surcharges to protect your margins. Clients pay directly through their portal — no more chasing invoices via email. You can also create a storefront with payment links to productize and sell your services.",
          },
          {
            question: "How does Assembly help me look more professional to clients?",
            answer: "Instead of sending scattered emails with attachments, links to different platforms, and manual payment reminders, Assembly gives your clients a single branded destination. They log in once and can see their contracts, invoices, files, messages, and project updates — all under your brand. It's the kind of client experience that typically requires a full team to deliver, but Assembly makes it accessible to solopreneurs.",
          },
          {
            question: "Can I send contracts and get them signed without DocuSign?",
            answer: "Yes. Assembly has a built-in contracts app with legally binding eSignatures. You can create contract templates, send them through the portal, and track signing status — all without paying for a separate eSignature tool.",
          },
          {
            question: "I communicate with clients across email, text, and WhatsApp. Can Assembly centralize that?",
            answer: "Assembly gives you a centralized messaging system inside the portal. Clients receive email notifications for new messages and can reply directly from their inbox without logging into the portal. This eliminates scattered communication across multiple channels and keeps a complete record of every client conversation in one place.",
          },
          {
            question: "I'm not technical. How hard is it to set up?",
            answer: "Assembly is designed for non-technical users. Most freelancers have their portal branded, their first client added, and their first invoice sent within an hour. There's no coding required — everything is configured through a visual dashboard. Assembly also offers help guides, demo portals, and support to get you started.",
          },
          {
            question: "Will my clients actually use the portal?",
            answer: "This is the number one question freelancers should ask. Assembly is designed to be intuitive for clients — they access a simple, clean portal on desktop or mobile, with no app download required. They can reply to messages from email, pay invoices with one click, and upload files with drag-and-drop. The simpler the portal experience, the more your clients will engage — and Assembly is rated 4.8/5 on G2 largely because of how easy it is for both businesses and their clients.",
          },
          {
            question: "Can I automate my client onboarding?",
            answer: "Yes. When you create a new client in Assembly, you can automatically trigger a welcome message, intake form, contract for signing, and first invoice — all without lifting a finger. This means every new client gets a consistent, professional onboarding experience.",
          },
        ],
      },
    ],
    closing: {
      title: "Get started with Assembly today",
      description: "Join thousands of teams using Assembly to streamline their workflow.",
      ctas: [{ label: "Get started", href: SIGNUP_URL }, { label: "Book a demo", href: DEMO_URL }],
    },
  },
  {
    slug: "law-firm-client-portal-practice-management",
    seo: {
      title: "Best Client Portal Software For Law Firms",
      description: "Top white-label client portal software for law firms. Secure file sharing, automations, and accounting integrations built for modern legal practices.",
    },
    noIndex: false,
    hero: {
      layout: "left",
      title: "Run a modern, tech-enabled law firm",
      description: "Differentiate your law firm with a secure portal that gives your clients a one-stop shop to upload files, sign contracts, send messages, access dashboards, and more.",
      ctas: [{ label: "Get started", href: SIGNUP_URL }],
    },
    sections: [
      {
        kind: "features",
        title: "Give your clients a better experience.",
        description: "Whether you're working with individuals or companies, give them a branded professional experience with a secure client portal.",
        features: [
          {
            label: "File sharing",
            heading: "Share files securely",
            body: "Share files with your clients in a secure data platform with custom permissions.",
          },
          {
            label: "eSignatures",
            heading: "Request eSignature contracts",
            body: "Send contracts and let clients sign directly in your portal.",
          },
          {
            label: "Invoicing",
            heading: "Request payments",
            body: "Let clients pay directly from your portal.",
          },
          {
            label: "Forms",
            heading: "Request forms and submissions",
            body: "Create custom forms for everything from service requests, onboarding intake, project outlines, and more.",
          },
        ],
      },
      {
        kind: "features",
        title: "A fully custom client portal for independent law firms",
        description: "Make client management easier than your existing practice management software.",
        quote: {
          quote: "Our portal saves time and really improves our client satisfaction with our firm. Assembly is a powerful tool to make us and our clients more efficient.",
          name: "Eliana J. Emery",
          role: "Managing Attorney, Heritage Law Partners",
          href: "/customers/heritage-law-partners",
        },
      },
      {
        kind: "grid",
        title: "Assemble everything your clients need",
        description: "Deliver a bespoke client experience with all features included at no extra cost.",
        ctas: [{ label: "Get started", href: SIGNUP_URL }],
        items: [
          {
            title: "Branding",
            description: "Create personalized online invoices and let clients checkout on a custom domain.",
            href: "https://assembly.com/client-portal",
          },
          {
            title: "Client portal",
            description: "Give clients access to messages, contracts, files, and more.",
            href: "https://assembly.com/client-portal",
          },
          {
            title: "Client onboarding",
            description: "Save time with automatic onboarding using custom forms and messages.",
            href: "https://assembly.com/client-onboarding-system",
          },
          {
            title: "Forms",
            description: "Create custom intake forms to collect client information efficiently.",
            href: "https://assembly.com/apps/directory/forms-app",
          },
          {
            title: "File-sharing",
            description: "Share files and documents securely with easy client access and permissions.",
            href: "https://assembly.com/file-sharing",
          },
          {
            title: "Contracts",
            description: "Send professional agreements with built-in eSignatures.",
            href: "https://assembly.com/esignature",
          },
          {
            title: "Messaging",
            description: "Communicate with clients through secure, centralized channels",
            href: "https://assembly.com/apps/directory/messaging-app",
          },
          {
            title: "Reminders",
            description: "Automate payment reminders to keep clients on track and minimize overdue invoices.",
          },
          {
            title: "Security",
            description: "Keep data safe with enterprise-grade SOC 2 and HIPAA compliance.",
            href: TRUST_CENTER_URL,
          },
        ],
      },
      {
        kind: "faq",
        title: "Frequently asked questions",
        items: [
          {
            question: "What is Assembly, and how does it serve law firms?",
            answer: "Assembly is a client portal platform that gives law firms a secure, branded digital workspace for client engagement. Your clients — whether individuals or corporate counsel — get a single portal to access case documents, sign retainer agreements, pay legal invoices, complete intake questionnaires, and communicate with your team. Assembly handles client-facing operations so your attorneys can focus on practicing law rather than chasing emails and documents.",
          },
          {
            question: "How secure is Assembly for handling privileged and confidential legal documents?",
            answer: "Security is foundational to Assembly. The platform is SOC 2 certified, with all data encrypted in transit and at rest. On Advanced plans, Assembly offers HIPAA and GDPR compliance with a signed BAA, multi-factor authentication enforcement for both attorneys and clients, and client access permissions that restrict which team members can view specific matter data. An audit log feature is also coming soon for firms that require detailed activity tracking for compliance purposes.",
          },
          {
            question: "How does Assembly compare to Clio, MyCase, or Moxo for law firms?",
            answer: "Clio and MyCase are legal practice management systems — strong at internal case management, time tracking, and court-specific workflows. But they come with per-seat pricing that adds up fast: Clio charges $39–$138/user/month plus a $399 setup fee, MyCase runs $39–$99/user/month, and alternatives like PracticePanther and Smokeball follow similar per-attorney models. Assembly takes a different approach: it’s a client-portal-first platform with firm-level pricing rather than per-seat. If your priority is delivering a polished, branded client experience — where clients can easily access their documents, sign agreements, pay retainers, and communicate securely — Assembly excels. Unlike Moxo, which is enterprise-priced and less customizable, Assembly offers transparent pricing from $0/month with white-label branding, eSignatures, billing, and a flexible integration platform. Many firms use Assembly alongside their practice management system to handle the client-facing side.",
          },
          {
            question: "Can clients sign retainer agreements and engagement letters in the portal?",
            answer: "Yes. Assembly includes built-in contracts with legally binding eSignatures. You can create retainer agreement templates, send them to clients through the portal, and track execution — all without third-party tools like DocuSign. Clients receive a notification, review the document, and sign directly from their portal or email.",
          },
          {
            question: "Can I set up different portal experiences for different practice areas or client types?",
            answer: "Yes. With App Visibility settings on Professional plans, you can configure which portal sections each client sees based on custom fields. For example, corporate clients might see a different set of documents and forms than individual estate planning clients. You can tailor the experience without creating separate portals.",
          },
          {
            question: "How do clients submit documents and intake information securely?",
            answer: "Assembly provides custom intake forms and a secure file center. You can build client questionnaires for new matter intake, request specific document uploads (like financial records or identification), and organize everything by client or matter in encrypted file folders. Clients upload directly to their portal rather than emailing sensitive documents.",
          },
          {
            question: "Can I collect legal fees and retainer payments through the portal?",
            answer: "Yes. Assembly supports invoicing via credit card and ACH, as well as recurring subscription billing for retainer arrangements. You can automate payment reminders, and clients can view and pay their invoices directly from the portal. This helps firms reduce accounts receivable timelines significantly.",
          },
          {
            question: "Does Assembly integrate with our existing legal tools?",
            answer: "Assembly is an open platform with one of the most comprehensive integration ecosystems in the client portal space. You can embed tools like Google Drive, SharePoint, or Airtable directly into client portals. Zapier and Make integrations (on Professional plans) connect Assembly to hundreds of apps. The REST API and Custom Apps framework support deeper integrations for firms with specific workflow needs — including connections to practice management tools like Clio or MyCase.",
          },
          {
            question: "Our clients range from tech-savvy corporate counsel to individuals who prefer paper. Will they be able to use the portal?",
            answer: "Assembly is designed for simplicity. Clients access their portal via a standard web URL — no app download required. They can reply to messages directly from email notifications without logging in. Login supports standard email/password as well as magic links. The interface is clean and intuitive, and works seamlessly on mobile devices.",
          },
          {
            question: "What is Assembly Assistant, and how can it help attorneys?",
            answer: "Assembly Assistant is an AI-powered feature that surfaces relevant client context — case notes, prior communications, uploaded documents, and engagement history — before meetings and calls. It can also draft follow-up correspondence and summarize client interactions. For attorneys managing heavy caseloads, it reduces preparation time and ensures no critical details are overlooked during client communications.",
          },
          {
            question: "How long does it take to implement for a law firm?",
            answer: "Small firms can be up and running within a day — branding, client setup, intake forms, and billing can all be configured in under an hour. For larger firms, Assembly provides personalized onboarding support (on annual plans) to help configure workflows, train staff, and set up automations. There are no implementation fees.",
          },
          {
            question: "Can I use Assembly for matter management?",
            answer: "Assembly provides client-level task management, forms, file organization, and messaging — which covers the client-facing aspects of matter management. For deep internal matter management (time tracking, court deadlines, conflict checks), most firms pair Assembly with a dedicated practice management tool. Assembly handles the client experience; your PM tool handles internal operations.",
          },
        ],
      },
    ],
    closing: {
      title: "Your clients deserve better.",
      description: "Try Assembly for free, no credit card required.",
      ctas: [{ label: "Get started", href: SIGNUP_URL }, { label: "Book a demo", href: DEMO_URL }],
    },
  },
  {
    slug: "marketing-agency-client-portal",
    seo: {
      title: "Best Client Portal For Marketing Agencies",
      description: "Highest rated white label client portal software for marketing agencies, content agencies, and growth agencies. Supports embeds, automations, and Custom Apps.",
    },
    noIndex: false,
    hero: {
      layout: "center",
      title: "A modern client portal for marketing agencies",
      description: "Differentiate your agency with a white-label portal to manage customers and projects seamlessly.",
      ctas: [{ label: "Get started", href: SIGNUP_URL }, { label: "Book a demo", href: DEMO_URL }],
    },
    sections: [
      {
        kind: "features",
        title: "An all-in-one place for clients to work with you",
        description: "Offer clients a streamlined way to onboard, pay you for services, complete action items, and contact you in one branded place.",
      },
      {
        kind: "features",
        title: "Sell packaged services",
        description: "Connect your marketing website to Assembly storefronts with payment links that let you productize and monetize your services.",
        ctas: [{ label: "Learn about stores", href: "https://assembly.com/store" }],
      },
      {
        kind: "features",
        title: "Showcase your value and share insights",
        description: "Skip the Google Docs and spreadsheets. Integrate any external dashboards, analytics, and tracking tools right into your portal for clients to follow.",
        ctas: [{ label: "View integrations", href: "https://assembly.com/apps/directory" }, { label: "Get started", href: SIGNUP_URL }],
      },
      {
        kind: "features",
        title: "Test drive the client experience",
        description: "See Assembly in action before you commit. Our marketing agency demo portal lets you try the polished client experience firsthand.",
        ctas: [{ label: "Explore demo portal", href: "https://portal.brandmages.com/login?step=signUp&demoportal=true" }, { label: "Get started", href: SIGNUP_URL }],
      },
      {
        kind: "story",
        body: "Carlos Williams, founder of marketing firm DBC, shares how Assembly’s client portal infrastructure is powering his new personalized data-driven marketing service for clients like Spotify and Bank of America—without compromising on security.",
        stats: [
          { value: "12+", label: "Years experience" },
          { value: "118K+", label: "Assets generated" },
          { value: "60+", label: "Satisfied clients" },
        ],
        caseStudy: "ditto-by-dbc",
      },
      {
        kind: "grid",
        title: "Assemble everything your clients need",
        description: "Deliver a bespoke client experience with all features included at no extra cost.",
        ctas: [{ label: "Get started", href: SIGNUP_URL }],
        items: [
          {
            title: "Branding",
            description: "Create personalized online invoices and let clients checkout on a custom domain.",
            href: "https://assembly.com/client-portal",
          },
          {
            title: "Client portal",
            description: "Give clients access to messages, contracts, files, and more.",
            href: "https://assembly.com/client-portal",
          },
          {
            title: "Client onboarding",
            description: "Save time with automatic onboarding using custom forms and messages.",
            href: "https://assembly.com/client-onboarding-system",
          },
          {
            title: "Forms",
            description: "Create custom intake forms to collect client information efficiently.",
            href: "https://assembly.com/apps/directory/forms-app",
          },
          {
            title: "File-sharing",
            description: "Share files and documents securely with easy client access and permissions.",
            href: "https://assembly.com/file-sharing",
          },
          {
            title: "Contracts",
            description: "Send professional agreements with built-in eSignatures.",
            href: "https://assembly.com/esignature",
          },
          {
            title: "Messaging",
            description: "Communicate with clients through secure, centralized channels",
            href: "https://assembly.com/apps/directory/messaging-app",
          },
          {
            title: "Reminders",
            description: "Automate payment reminders to keep clients on track and minimize overdue invoices.",
          },
          {
            title: "Security",
            description: "Keep data safe with enterprise-grade SOC 2 and HIPAA compliance.",
            href: TRUST_CENTER_URL,
          },
        ],
      },
      {
        kind: "faq",
        title: "Frequently asked questions",
        items: [
          {
            question: "What tools does Assembly replace for marketing agencies?",
            answer: "Assembly consolidates the patchwork of tools most agencies use to manage clients — things like Google Drive for file sharing, DocuSign for contracts, Stripe or QuickBooks for billing, and email or Slack for client communication. Instead of sending clients to five different platforms, you give them one branded portal where they can access files, sign contracts, pay invoices, message your team, and complete tasks.",
          },
          {
            question: "Can I embed analytics dashboards so clients can see campaign performance?",
            answer: "Yes. You can embed any web-based reporting tool directly into your client portal — including Looker Studio, Databox, Google Analytics, and social media dashboards like Metricool. Each client only sees their own embedded reports, so you can tailor the portal experience by account. This means clients can check campaign performance anytime without emailing you for updates.",
          },
          {
            question: "Is the portal fully white-labeled? Will my clients know it’s powered by Assembly?",
            answer: "You can fully white-label the client experience with Assembly. You can add your own logo, brand colors, and connect a custom domain (like portal.youragency.com) so clients experience it as your own platform. All client-facing emails and notifications can be set up to come from your brand.",
          },
          {
            question: "Can I sell productized services or retainer packages through Assembly?",
            answer: "Yes! With Stores, you can create recurring and one-time service packages that clients purchase directly — no back-and-forth needed. Make your store public or keep it exclusive to your portal. And since Assembly is a fully integrated platform, every purchase can automatically kick off workflows — form requests, task assignments, messages, and more — so selling a service and delivering it become one seamless experience.",
          },
          {
            question: "My clients aren’t very technical. Will they actually use the portal?",
            answer: "Assembly’s client portal is designed to be as simple as checking email. By default, the client experience is completely passwordless — clients receive magic links that authenticate them instantly when clicked, so there’s no password to remember or reset. Once inside, everything they need — messages, files, invoices, tasks — is in one place. There’s no software to download, and you can customize the portal layout so only the most relevant tools are visible. You can also send automated reminders to keep clients engaged and coming back.",
          },
          {
            question: "How can I streamline task and project management for my marketing agency?",
            answer: "Assembly includes a built-in Tasks app designed for client-facing work. You can assign tasks to internal team members and tie them to specific clients, or assign tasks directly to clients for things like approvals, content reviews, and asset delivery — so nothing falls through the cracks between your team and theirs.\n\nMany agencies also connect their existing project management tools — like ClickUp, Asana, or Monday.com. That way, your team keeps working where they're comfortable while clients get a clean, organized experience in their portal.",
          },
          {
            question: "What integrations does Assembly support?",
            answer: "Assembly is built as an open platform — and it shows. We offer the most comprehensive API in the client portal space, with full Zapier and Make support that includes more triggers and actions than any comparable tool. If you can dream up an automation, you can probably build it.\n\nFor tools your clients need to see — like Looker Studio dashboards, Google Analytics, Databox reports, or really anything that supports embedding — you can embed them directly into the portal. Embeds can be configured per client or applied to groups of clients that meet certain criteria, and you can set query parameters programmatically so each client sees only their own data.\n\nAssembly also includes direct integrations with tools like QuickBooks, Xero, Dropbox, and many others.\n\nAnd if you need something custom, Assembly's Custom App platform lets you build tailored integrations — or you can tap into our Experts Marketplace to have someone build it for you.",
          },
          {
            question: "How does pricing work? Is Assembly affordable for a growing agency?",
            answer: "Assembly’s pricing is simple and designed to scale with you. The Free plan includes all core features — portal, messaging, billing, contracts, tasks, files, forms, and more. As your team and needs grow, you can seamlessly move to Starter ($29/month), Professional ($99/month), or Advanced ($499/month) for extras like advanced permissions and audit logs. Importantly, you’re never charged per client, so you can add as many clients as you need without increasing your cost.",
          },
          {
            question: "How does Assembly compare to tools like Wayfront (SPP), ManyRequests, and AgencyHandy?",
            answer: "$1f",
          },
        ],
      },
    ],
    closing: {
      title: "Where client experiences come together",
      ctas: [{ label: "Get started", href: SIGNUP_URL }, { label: "Book a demo", href: DEMO_URL }],
    },
  },
  {
    slug: "real-estate-property-management-rental-management-client-portal",
    seo: {
      title: "Client Portal Software for Property Management Businesses",
      description: "Top rated white-label client portal software for real estate, property management, and vacation rentals. Manage communication, payments, and files securely.",
    },
    noIndex: false,
    hero: {
      layout: "left",
      title: "Modernize your property management business",
      description: "Give clients a custom portal to communicate with your team, make payments, sign contracts, schedule viewings, submit requests, and more.",
      ctas: [{ label: "Get started", href: SIGNUP_URL }],
    },
    sections: [
      {
        kind: "features",
        title: "Create a custom tenant portal",
        description: "Elevate your tenant experience with a branded portal where they can pay, contact you, and access resources for your properties.",
        features: [
          {
            label: "Invoicing",
            heading: "Request payments",
            body: "Let clients pay directly from your portal.",
          },
          {
            label: "eSignatures",
            heading: "Request eSignature contracts",
            body: "Send and let residents sign contracts directly in your portal.",
          },
          {
            label: "Forms",
            heading: "Request forms and submissions",
            body: "Create custom forms for everything from tenant maintenance requests, new resident applications, developer project intake, and more.",
          },
          {
            label: "Tasks",
            heading: "Keep clients updated about projects",
            body: "Use task management apps to share project statuses and streamline the communication between you and your clients.",
          },
        ],
      },
      {
        kind: "features",
        title: "Go beyond traditional property management",
        description: "Discover a flexible client portal solution that works for real estate businesses in licensing, brokerage, and development.",
        quote: {
          quote: "I don't know what we would do without Assembly. It has all the features my rental license business needs: centralized communication, file storage, e-signing, tasks, and more.",
          name: "Guy Benhanan",
          role: "Founder, Vacation Rental License",
          href: "/customers/vacation-rental-license",
        },
      },
      {
        kind: "grid",
        title: "Your residents deserve a modern property management experience.",
        description: "Give them a truly custom portal that fits their needs and yours.",
        items: [
          {
            title: "Branding",
            description: "Create personalized online invoices and let clients checkout on a custom domain.",
            href: "https://assembly.com/client-portal",
          },
          {
            title: "Client portal",
            description: "Give clients access to messages, contracts, files, and more.",
            href: "https://assembly.com/client-portal",
          },
          {
            title: "All-in-one",
            description: "Impress clients with a seamless all-in-one experience on web and mobile.",
          },
          {
            title: "Forms",
            description: "Create custom intake forms to collect client information efficiently.",
            href: "https://assembly.com/apps/directory/forms-app",
          },
          {
            title: "Contracts",
            description: "Send professional agreements with built-in eSignatures.",
            href: "https://assembly.com/esignature",
          },
          {
            title: "Messaging",
            description: "Communicate with clients through secure, centralized channels",
            href: "https://assembly.com/apps/directory/messaging-app",
          },
          {
            title: "Surcharging",
            description: "Add and configure surcharges to minimize payment processing fees.",
          },
          {
            title: "Reminders",
            description: "Automate payment reminders to keep clients on track and minimize overdue invoices.",
          },
          {
            title: "Custom Apps",
            description: "Build your own Custom Apps that seamlessly integrate with the rest of the platform.",
          },
        ],
      },
      {
        kind: "faq",
        title: "Frequently asked questions",
        items: [
          {
            question: "How does Assembly work for real estate businesses?",
            answer: "Assembly is a white-labeled client portal platform that serves the full spectrum of real estate professionals — from property managers and real estate agents to real estate investment firms, brokerages, and vendor advocacy businesses. It gives each client (whether a property owner, tenant, buyer, or investor) a secure, branded portal to access documents, pay invoices, sign agreements, communicate with your team, and track progress — all in one place.",
          },
          {
            question: "I work in property management / real estate investment / brokerage. Is Assembly built for my specific sub-industry?",
            answer: "Assembly is intentionally flexible, which is why it works across real estate sub-industries. Property managers use it to give owners a portal for statements, documents, and payout data. Brokerages use it to organize client communication across dozens of simultaneous transactions. Real estate investment firms use it to share reports and collect documents from investors. And vendor advocacy firms use it to centralize communication, file sharing, and task management across multiple parties. The platform adapts to your workflow rather than forcing a one-size-fits-all approach.",
          },
          {
            question: "How is Assembly different from AppFolio, Buildium, or Moxo?",
            answer: "AppFolio and Buildium are property management software — they’re great for rent collection and maintenance requests, but they offer limited flexibility if you need a branded client portal experience beyond residential property management. Assembly is a portal-first platform, meaning the client experience is the priority. You get full white-labeling, embedded integrations (like Looker Studio dashboards or Airtable trackers), built-in billing, contracts, and messaging. Compared to Moxo, which targets enterprise and has opaque pricing, it’s free to start using Assembly and a more flexible platform you can customize without developer help.",
          },
          {
            question: "How does Assembly improve client communication and transparency?",
            answer: "Assembly improves client communication and transparency by giving clients a shared portal to view updates, documents, and messages in one place. Conversations happen in the Messages App, and files live in the Files App, so clients don’t have to chase email threads. They can log in to see the current status of their property, billing activity, or requests anytime.",
          },
          {
            question: "Can I organize clients by property instead of just by person?",
            answer: "Yes. Assembly’s CRM supports custom fields and company-level organization, so you can structure your client database by property, building, portfolio, or any grouping that fits your business. You can assign multiple contacts to a single entity, which is perfect for properties with multiple owners, tenants, or stakeholders.",
          },
          {
            question: "Can property owners see their own statements and documents in the portal?",
            answer: "Absolutely. You can upload financial statements, payout reports, inspection documents, and more to each client’s secure file center. You can also embed tools like Google Looker Studio for real-time reporting dashboards, so owners see their data without you manually creating reports. Each owner only sees their own information.",
          },
          {
            question: "How does billing work for real estate transactions?",
            answer: "Assembly includes built-in invoicing for one-time payments and recurring subscriptions via credit card or ACH. This works well for property management fees, monthly retainers, or brokerage service packages. You can also add credit card surcharges to protect your margins, automate payment reminders, and let clients pay directly from their portal.",
          },
          {
            question: "How does Assembly help with maintenance requests and tenant communication?",
            answer: "Assembly’s built-in forms, messaging, and task management features make it easy to set up maintenance request workflows. Tenants can submit requests through the portal, your team gets notified and can assign tasks, and everyone stays updated through secure messaging — replacing the chaos of phone calls, texts, and email threads.",
          },
          {
            question: "I manage 30+ transactions at a time and get hundreds of emails. Can Assembly help?",
            answer: "This is one of the top reasons real estate professionals switch to Assembly. Instead of managing communication across email, WhatsApp, and text, Assembly centralizes all client messaging in one portal. Clients can send documents, ask questions, and receive updates in their portal — and respond directly from email notifications when it’s more convenient. This dramatically reduces email volume and keeps every conversation organized by client or property.",
          },
          {
            question: "Is it secure enough for sensitive real estate and financial documents?",
            answer: "Yes. Assembly is SOC 2 compliant and supports HIPAA and GDPR compliance for businesses that need it. All file transfers are encrypted, and you control access permissions at both the team and client level. For regulated industries like mortgage lending, this level of security is essential.",
          },
          {
            question: "Can I bring in the tools I already use?",
            answer: "Yes. Assembly lets you embed external tools directly into client portals — such as Looker Studio for reporting, Airtable for project tracking, Calendly for scheduling, and Google Drive for document access. You can also connect to Zapier and Make for automated workflows, or build deeper integrations with the Assembly API.",
          },
          {
            question: "Can multiple parties (buyers, sellers, agents, lenders) access the same portal?",
            answer: "Assembly supports granular access controls. You can create separate client accounts for each party and control exactly what each person sees. Using App Visibility settings on Professional plans, you can show different portal sections to different client types based on custom fields — so a buyer sees different content than a lender.",
          },
          {
            question: "How quickly can I get started?",
            answer: "Most real estate businesses set up their portal in a single day. You can customize your branding, create client accounts, upload documents, and configure billing within an hour. Start for free with Assembly and no credit card is required, so you can test the full platform before committing.",
          },
        ],
      },
    ],
    closing: {
      title: "Professional client portal software for modern businesses",
      description: "Try for free, no credit card required.",
      ctas: [{ label: "Get started", href: SIGNUP_URL }, { label: "See pricing", href: "/pricing" }],
    },
  },
  {
    slug: "startups-client-portal",
    seo: {
      title: "Best Client Portal Software For Startups",
      description: "The best white-label client portal software and no-code platform for startups with a powerful API, SDK, and support for building custom apps.",
    },
    noIndex: false,
    hero: {
      layout: "left",
      title: "Flexible customer portal software for tech firms",
      description: "Integrate a fully custom client-facing customer portal, with out-of-the box billing, notifications, messaging, and eSignatures, and integrate with custom applications via API.",
      ctas: [{ label: "Get started", href: SIGNUP_URL }],
    },
    sections: [
      {
        kind: "grid",
        title: "Your clients deserve a better experience",
        description: "Give them a truly custom portal that fits their needs and yours.",
        items: [
          {
            title: "Branding",
            description: "Create personalized online invoices and let clients checkout on a custom domain.",
            href: "https://assembly.com/client-portal",
          },
          {
            title: "Client portal",
            description: "Give clients access to messages, contracts, files, and more.",
            href: "https://assembly.com/client-portal",
          },
          {
            title: "Client onboarding",
            description: "Save time with automatic onboarding using custom forms and messages.",
            href: "https://assembly.com/client-onboarding-system",
          },
          {
            title: "Forms",
            description: "Create custom intake forms to collect client information efficiently.",
            href: "https://assembly.com/apps/directory/forms-app",
          },
          {
            title: "Contracts",
            description: "Send professional agreements with built-in eSignatures.",
            href: "https://assembly.com/esignature",
          },
          {
            title: "Messaging",
            description: "Communicate with clients through secure, centralized channels",
            href: "https://assembly.com/apps/directory/messaging-app",
          },
          {
            title: "Reminders",
            description: "Automate payment reminders to keep clients on track and minimize overdue invoices.",
          },
          {
            title: "Security",
            description: "Keep data safe with enterprise-grade SOC 2 and HIPAA compliance.",
            href: TRUST_CENTER_URL,
          },
          {
            title: "Custom Apps",
            description: "Build your own Custom Apps that seamlessly integrate with the rest of the platform.",
          },
        ],
      },
      {
        kind: "features",
        title: "Explore the client experience",
        description: "If you’d like to see what the user experience can be like for your clients, you can create a client account in a demo portal we have set up. We’ve customized this demo portal to highlight some of the features that are most relevant.",
        ctas: [{ label: "Create client account in a demo portal", href: "https://portal.brandmages.com/login?step=signUp" }],
        features: [
          {
            label: "Tasks",
            heading: "Keep clients updated about projects",
            body: "Use task management apps to share project statuses and streamline the communication between you and your clients.",
          },
          {
            label: "Helpdesk",
            heading: "Share resources",
            body: "Let your clients access important information and articles from your Helpdesk.",
          },
          {
            label: "Invoicing",
            heading: "Request payments",
            body: "Let clients pay directly from your portal.",
          },
          {
            label: "Forms",
            heading: "Request forms and submissions",
            body: "Create custom forms for everything from service requests, onboarding intake, project outlines, and more.",
          },
          {
            label: "eSignatures",
            heading: "Request eSignature contracts",
            body: "Send contracts and let clients sign directly in your portal.",
          },
        ],
      },
      {
        kind: "features",
        title: "Integrate with no-code workflow tools",
        description: "Extend your capabilities easily by building custom applications on our API, or use no-code solutions like Make & Zapier to connect to thousands of 3rd party applications.",
        ctas: [{ label: "View the API docs", href: GUIDE_URL }],
        quote: {
          quote: "Assembly saves us from coding a whole portal solution. We implemented a HIPAA-compliant customer portal quickly.",
          name: "Robert Prochnow",
          role: "Founder, Zen Aegis",
          href: "/customers/zen-aegis",
        },
      },
      {
        kind: "faq",
        title: "Frequently asked questions",
        items: [
          {
            question: "What is Assembly, and why is it the fastest way for startups to launch a modern client experience?",
            answer: "Startups move fast — Assembly keeps up. It's a platform that gives you everything you need out of the box: user management, permissions, messaging, notifications, billing, contracts, file sharing, and more. No stitching together tools. No building infrastructure from scratch.\n\nWhen you're ready to extend, Assembly's developer ecosystem and Custom Apps support lets you integrate exactly what your business needs. Launch in under an hour, and spend your time on what actually matters.",
          },
          {
            question: "How does a client portal help a startup look professional without adding overhead?",
            answer: "A client portal helps a startup look professional by giving clients a branded, organized space instead of ad-hoc emails and shared folders. You centralize communication, files, and updates without hiring ops staff or managing complex systems, keeping overhead low.",
          },
          {
            question: "We're an early-stage startup. Is Assembly affordable for us?",
            answer: "Yes. Assembly is free with one team member and up to 5 clients — no per-client fees, no hidden costs. All core features (portal, billing, contracts, messaging, files, forms, tasks) are included on every plan. There's no credit card required, and a 20% discount for eligible organizations, if you want to upgrade your plan to a higher level. Many startups start on Free and upgrade as they scale.",
          },
          {
            question: "We're technical. Does Assembly have an API and developer platform?",
            answer: "Absolutely — and this is where Assembly really shines for startups. On Professional plans and above, you get full access to a REST API, webhooks, Zapier and Make integrations, and a Custom Apps framework (SDK, App Bridge, design system). You can embed custom applications into the client portal, build integrations with your internal systems, and extend Assembly's functionality to match your exact workflow. Think of Assembly as the foundation — you handle the core client experience out of the box, and supplement with custom development where needed.",
          },
          {
            question: "How is Assembly different from building our own portal or using Softr?",
            answer: "Building a custom portal from scratch typically costs tens of thousands of dollars in engineering time, takes months to ship, and requires ongoing maintenance — auth, permissions, file storage, billing integration, notifications, security audits, and more. Assembly gives you all of that out of the box, so your engineers can focus on your core product. Compared to Softr, which is a general-purpose app builder requiring Airtable as a backend, Assembly is purpose-built for client portals with native billing, contracts, messaging, and CRM built in. You don’t have to cobble together multiple tools — Assembly is the all-in-one foundation. It’s the “build vs. buy” sweet spot: you get to market faster without sacrificing flexibility.",
          },
          {
            question: "Can I embed our own tools and dashboards into the client portal?",
            answer: "Yes. Assembly supports embedding any web-based tool directly into the portal — reporting dashboards, project trackers, internal tools, scheduling widgets, and more. Clients see these embedded tools as a native part of your branded portal experience.",
          },
          {
            question: "Is Assembly secure? We handle sensitive client data.",
            answer: "Yes. Assembly is SOC 2 certified with encryption in transit and at rest. On Advanced plans, you get HIPAA and GDPR compliance with a signed BAA, MFA enforcement, and client access permissions. For startups in healthcare, fintech, or other regulated industries, this is critical infrastructure you don’t have to build yourself.",
          },
          {
            question: "How quickly can we migrate from our current setup?",
            answer: "Most startups are operational on Assembly within a day. If you're migrating from spreadsheets, email, or cobbled-together tools, you can import clients, set up your portal branding, and configure billing immediately. If you're coming from another platform, Assembly's API makes data migration straightforward. The support team also offers personalized onboarding on annual plans.",
          },
          {
            question: "Can Assembly grow with us as we scale from 10 clients to 1,000?",
            answer: "Absolutely. Assembly is designed to scale from solo founders to 100+ person teams. The Starter plan supports 50 clients, Professional supports 500, and Advanced and Enterprise offer unlimited clients. Automation tasks scale similarly, so your workflows keep running as you grow. The API and Custom Apps platform ensure you won't outgrow the platform.",
          },
          {
            question: "Does Assembly include AI features?",
            answer: "Yes. Assembly Assistant is an AI-powered tool that surfaces client context before meetings, drafts follow-up messages, and summarizes conversations. For startups with small teams wearing many hats, it reduces the time spent on meeting prep and client communications so you can focus on delivering your core service.",
          },
          {
            question: "What kind of support does Assembly provide for startups?",
            answer: "All plans include standard support. Professional plans and above get priority email support. Advanced plans add priority call support. Enterprise plans include a dedicated success manager and technical advisor. Assembly also has a growing ecosystem of certified experts and implementation partners if you need hands-on help.",
          },
        ],
      },
    ],
    closing: {
      title: "Develop on a flexible platform for customer experience.",
      description: "Try Assembly for free, no credit card required.",
      ctas: [{ label: "Get started", href: SIGNUP_URL }, { label: "Book a demo", href: DEMO_URL }],
    },
  },
];
