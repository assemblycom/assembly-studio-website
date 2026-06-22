export interface Template {
  slug: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  longDescription: string;
  features: string[];
}

export const TEMPLATES: Template[] = [
  {
    slug: "customer-support",
    title: "Customer Support Agent",
    description:
      "AI-powered support agent that handles common customer inquiries and escalates complex issues.",
    icon: "\u{1F4AC}",
    category: "Support",
    longDescription:
      "Deploy an intelligent support agent that resolves tier-1 tickets automatically. Connects to your knowledge base, understands context, and escalates to humans when needed.",
    features: [
      "Auto-resolve common tickets",
      "Knowledge base integration",
      "Smart escalation rules",
      "Multi-channel support",
    ],
  },
  {
    slug: "employee-onboarding",
    title: "Employee Onboarding",
    description:
      "Automated onboarding workflows that guide new hires through their first weeks.",
    icon: "\u{1F44B}",
    category: "HR",
    longDescription:
      "Create a personalized onboarding experience for every new hire. Automate paperwork, schedule meetings, assign training, and check in on progress.",
    features: [
      "Personalized onboarding plans",
      "Automated task assignment",
      "Progress tracking",
      "Slack/Teams integration",
    ],
  },
  {
    slug: "lead-qualification",
    title: "Lead Qualification",
    description:
      "Score and route inbound leads based on custom criteria and engagement signals.",
    icon: "\u{1F3AF}",
    category: "Sales",
    longDescription:
      "Qualify inbound leads instantly with AI-powered scoring. Analyze engagement signals, firmographic data, and conversation context to route leads to the right rep.",
    features: [
      "Custom scoring models",
      "CRM integration",
      "Auto-routing to reps",
      "Engagement tracking",
    ],
  },
  {
    slug: "knowledge-base",
    title: "Internal Knowledge Agent",
    description:
      "Connect your docs, wikis, and tools into a single AI-powered knowledge assistant.",
    icon: "\u{1F4DA}",
    category: "Knowledge",
    longDescription:
      "Give your team instant answers from across your organization. Connects to Confluence, Notion, Google Drive, and more to provide accurate, sourced responses.",
    features: [
      "Multi-source indexing",
      "Source attribution",
      "Permission-aware",
      "Continuous learning",
    ],
  },
  {
    slug: "feedback-analysis",
    title: "Feedback Analyzer",
    description:
      "Aggregate and analyze customer feedback from multiple channels to surface insights.",
    icon: "\u{1F4CA}",
    category: "Analytics",
    longDescription:
      "Turn customer feedback into actionable insights. Collect from surveys, reviews, support tickets, and social media, then surface trends and sentiment automatically.",
    features: [
      "Multi-channel collection",
      "Sentiment analysis",
      "Trend detection",
      "Automated reports",
    ],
  },
  {
    slug: "document-processing",
    title: "Document Processor",
    description:
      "Extract, classify, and route information from documents automatically.",
    icon: "\u{1F4C4}",
    category: "Operations",
    longDescription:
      "Automate document workflows end-to-end. Extract data from invoices, contracts, forms, and more with high accuracy, then route to the right systems and people.",
    features: [
      "OCR and extraction",
      "Classification",
      "Validation rules",
      "System integration",
    ],
  },
];

export function getTemplateBySlug(slug: string): Template | undefined {
  return TEMPLATES.find((t) => t.slug === slug);
}
