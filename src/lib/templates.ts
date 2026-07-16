export interface Template {
  slug: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  longDescription: string;
  features: string[];
  /** Industry tags — drives the secondary "Industry" filter. */
  industries?: string[];
  /** Surfaced in the curated set on the homepage. */
  featured?: boolean;
  /** Optional preview image shown on the card in place of the grey placeholder. */
  image?: string;
  /** Detail-gallery media: up to 5 preview images. */
  images?: string[];
  /** Optional walkthrough video; when set it leads the detail gallery. */
  videoUrl?: string;
  /**
   * TEMP — until real screenshots/videos exist. Lets a template demonstrate its
   * gallery shape with designed placeholder frames: how many preview frames
   * (1–5) and whether a video tile leads. Ignored once `images`/`videoUrl` are
   * set.
   */
  previewCount?: number;
  hasVideo?: boolean;
}

// Category order is intentional — it drives the order of the filter tabs.
export const TEMPLATE_CATEGORIES = [
  "Onboarding",
  "Dashboards",
  "Trackers",
  "Approvals",
  "Requests",
  "Proposals",
  "AI assistants",
  "Community",
  "Knowledge base",
  "Education",
] as const;

// Industry tags for the secondary filter, alphabetical.
export const TEMPLATE_INDUSTRIES = [
  "Accounting",
  "Consulting",
  "Education",
  "Financial services",
  "Healthcare",
  "Legal",
  "Marketing",
  "Real estate",
  "Technology",
] as const;

// Industry tags kept out of the template objects to keep that list readable.
// Each template carries 2–4 industries it most naturally serves.
const INDUSTRY_BY_SLUG: Record<string, string[]> = {
  "onboarding-wizard": ["Accounting", "Legal", "Consulting", "Marketing"],
  "new-client-intake": ["Accounting", "Legal", "Consulting", "Marketing"],
  "document-collection": ["Accounting", "Legal", "Real estate", "Financial services"],
  "pdf-to-digital-intake": ["Legal", "Healthcare", "Accounting", "Real estate"],
  "client-engagement-dashboard": ["Marketing", "Consulting", "Technology"],
  "data-visualization": ["Financial services", "Consulting", "Technology", "Accounting"],
  "client-project-tracker": ["Marketing", "Consulting", "Technology", "Real estate"],
  "time-tracker": ["Legal", "Accounting", "Consulting"],
  "goal-tracker": ["Consulting", "Healthcare", "Education"],
  "content-approval-flow": ["Marketing", "Consulting"],
  "client-support-requests": ["Technology", "Marketing", "Consulting"],
  "proposal-builder": ["Marketing", "Consulting", "Accounting", "Legal"],
  "client-ai-assistant": ["Technology", "Healthcare", "Financial services", "Education"],
  "client-discussion-forum": ["Education", "Technology", "Marketing"],
  "community-qa": ["Education", "Technology"],
  "internal-communications-app": ["Technology", "Consulting", "Healthcare"],
  "client-resource-library": ["Education", "Consulting", "Healthcare", "Financial services"],
  "internal-resource-library": ["Consulting", "Technology", "Healthcare"],
  "data-room": ["Financial services", "Legal", "Real estate", "Accounting"],
  "certification-flow": ["Education", "Healthcare", "Financial services"],
};

const BASE_TEMPLATES: Template[] = [
  // Onboarding
  {
    slug: "onboarding-wizard",
    title: "Onboarding wizard",
    description: "Multi-step flow with saved progress",
    icon: "🪄",
    category: "Onboarding",
    longDescription:
      "Walk new clients through a multi-step onboarding flow — welcome, identity, goals, timelines, and file upload — with progress saved so they can return later.",
    features: ["Multi-step flow", "Saved progress", "File upload", "Guided steps"],
    featured: true,
  },
  {
    slug: "new-client-intake",
    title: "New client intake",
    description: "Scope, goals, stakeholders, budget, timeline",
    icon: "👤",
    category: "Onboarding",
    longDescription:
      "Collect everything you need from a new client in one guided flow — scope, goals, stakeholders, budget, and timeline — then auto-create their folders.",
    features: ["Scope & goals", "Stakeholders", "Budget & timeline", "E-signature"],
    featured: true,
  },
  {
    slug: "document-collection",
    title: "Document collector",
    description: "Requested docs with upload checklist",
    icon: "📂",
    category: "Onboarding",
    longDescription:
      "Send clients a clear checklist of documents to provide, with reminders and secure storage until everything's collected.",
    features: ["Upload checklist", "Reminders", "Secure storage", "Completion tracking"],
  },
  {
    slug: "pdf-to-digital-intake",
    title: "PDF to digital intake",
    description: "Turn a PDF form into a guided web form",
    icon: "📄",
    category: "Onboarding",
    longDescription:
      "Import an existing PDF form and turn it into a guided, fillable web form with e-signatures and automatic data capture.",
    features: ["PDF import", "Fillable fields", "Guided web form", "Auto data capture"],
  },

  // Dashboards
  {
    slug: "client-engagement-dashboard",
    title: "Client engagement dashboard",
    description: "AI engagement analysis, flag clients who go quiet",
    icon: "📊",
    category: "Dashboards",
    longDescription:
      "Track engagement across your client base with AI scoring and at-risk flags, so you know exactly who's gone quiet.",
    features: ["AI engagement scoring", "At-risk flags", "Trends", "Per-client drilldown"],
    featured: true,
  },
  {
    slug: "data-visualization",
    title: "Data visualization",
    description: "Live charts from your client data",
    icon: "📉",
    category: "Dashboards",
    longDescription:
      "Turn client data into clear, branded charts and dashboards that refresh automatically inside the portal.",
    features: ["Live charts", "Custom dashboards", "Embeddable", "Auto-refresh"],
  },

  // Trackers
  {
    slug: "client-project-tracker",
    title: "Project tracker",
    description: "Milestones and progress per engagement",
    icon: "✅",
    category: "Trackers",
    longDescription:
      "Keep clients in the loop with milestones and live progress for every engagement, updating as work moves through stages.",
    features: ["Milestones", "Progress per engagement", "Status stages", "Notifications"],
    featured: true,
  },
  {
    slug: "time-tracker",
    title: "Time tracker",
    description: "Log billable hours, roll-ups, exportable",
    icon: "⏱️",
    category: "Trackers",
    longDescription:
      "Log billable hours against clients and projects, roll them up, and export clean timesheets ready for invoicing.",
    features: ["Billable hours", "Roll-ups", "Exportable", "Per-project"],
  },
  {
    slug: "goal-tracker",
    title: "Goal tracker",
    description: "Set goals and track progress together",
    icon: "🥅",
    category: "Trackers",
    longDescription:
      "Define shared goals with clients and visualize progress toward each one, with check-in reminders to keep momentum.",
    features: ["Goal milestones", "Progress meters", "Check-ins", "Shared visibility"],
  },

  // Approvals
  {
    slug: "content-approval-flow",
    title: "Content approval flow",
    description: "Posts and campaigns with status history",
    icon: "✅",
    category: "Approvals",
    longDescription:
      "Route posts and campaigns to clients for review and capture sign-off, with full status history of every change.",
    features: ["Posts & campaigns", "Status history", "Comments", "Audit trail"],
    featured: true,
  },

  // Support
  {
    slug: "client-support-requests",
    title: "Client help desk",
    description: "Categorized requests with a shared triage queue",
    icon: "📥",
    category: "Support",
    longDescription:
      "Centralize incoming client requests into a categorized, shared triage queue so nothing gets lost.",
    features: ["Categorized requests", "Shared triage queue", "Priority", "Real-time updates"],
  },

  // Proposals
  {
    slug: "proposal-builder",
    title: "Proposal builder",
    description: "Branded proposals clients can e-sign",
    icon: "🧾",
    category: "Proposals",
    longDescription:
      "Build polished, templated proposals, send them for e-signature, see when clients open them, and collect payment on acceptance.",
    features: ["Templated proposals", "E-signature", "View tracking", "Accept & pay"],
    featured: true,
  },

  // AI assistants
  {
    slug: "client-ai-assistant",
    title: "Client AI assistant",
    description: "Answers client questions from your docs",
    icon: "🤖",
    category: "AI assistants",
    longDescription:
      "An AI assistant trained on your documents that resolves common client questions instantly and escalates to your team when needed.",
    features: ["Trained on your docs", "Instant answers", "Smart escalation", "Multi-channel"],
    featured: true,
  },

  // Community
  {
    slug: "client-discussion-forum",
    title: "Client discussion forum",
    description: "Threaded topics clients can search",
    icon: "💬",
    category: "Community",
    longDescription:
      "Give clients a branded forum to ask questions and share feedback, with threaded topics that stay searchable over time.",
    features: ["Threaded topics", "Mentions", "Searchable", "Moderation"],
  },
  {
    slug: "community-qa",
    title: "Community Q&A",
    description: "Upvoted answers, self-service",
    icon: "❓",
    category: "Community",
    longDescription:
      "Reduce repetitive questions with a self-service Q&A space where clients find upvoted answers fast.",
    features: ["Upvoted answers", "Searchable", "Topic tags", "Self-service"],
  },
  {
    slug: "internal-communications-app",
    title: "Internal communications app",
    description: "Announcements and team channels in one hub",
    icon: "📨",
    category: "Community",
    longDescription:
      "Keep your team aligned with announcements and channels, with read receipts and pinned posts so nothing's missed.",
    features: ["Announcements", "Team channels", "Read receipts", "Pinned posts"],
  },

  // Knowledge base
  {
    slug: "client-resource-library",
    title: "Client resource library",
    description: "Branded guides and resources for clients",
    icon: "📚",
    category: "Knowledge base",
    longDescription:
      "Curate a branded library of guides and resources clients can search on their own, with controls over who sees what.",
    features: ["Branded guides", "Search", "Access controls", "Usage insights"],
  },
  {
    slug: "internal-resource-library",
    title: "Internal resource library",
    description: "Playbooks and assets for your team",
    icon: "🗂️",
    category: "Knowledge base",
    longDescription:
      "A team-only home for playbooks, brand assets, and SOPs — categorized, searchable, and version-controlled.",
    features: ["Team-only access", "Playbooks & assets", "Search", "Version control"],
  },
  {
    slug: "data-room",
    title: "Data room",
    description: "Securely share sensitive documents",
    icon: "🔒",
    category: "Knowledge base",
    longDescription:
      "Share sensitive documents securely with permissioned access, audit trails, watermarking, and activity tracking.",
    features: ["Permissioned access", "Audit trail", "Watermarking", "Activity tracking"],
  },

  // Education
  {
    slug: "certification-flow",
    title: "Certification flow",
    description: "Lessons, final quiz, downloadable certificate",
    icon: "🏅",
    category: "Education",
    longDescription:
      "Guide learners through lessons and a final quiz, then issue a downloadable certificate on completion.",
    features: ["Lessons", "Final quiz", "Downloadable certificate", "Progress tracking"],
  },
];

// TEMP demo of gallery media shapes until real screenshots/videos land, so
// each state is reviewable: single preview (thumbnails hidden), a few images,
// the full five, and video-led. Unlisted templates default to a single frame.
const PREVIEW_BY_SLUG: Record<string, { previewCount?: number; hasVideo?: boolean }> = {
  "onboarding-wizard": { previewCount: 4, hasVideo: true },
  "client-engagement-dashboard": { previewCount: 5 },
  "new-client-intake": { previewCount: 3 },
  "proposal-builder": { previewCount: 3, hasVideo: true },
  "data-visualization": { previewCount: 5 },
  "client-project-tracker": { previewCount: 2 },
  // Everything else falls back to a single preview (no thumbnail strip).
};

// Merge industry tags + preview shape onto each template from the maps above.
export const TEMPLATES: Template[] = BASE_TEMPLATES.map((t) => ({
  ...t,
  industries: INDUSTRY_BY_SLUG[t.slug] ?? [],
  previewCount: t.previewCount ?? PREVIEW_BY_SLUG[t.slug]?.previewCount ?? 1,
  hasVideo: t.hasVideo ?? PREVIEW_BY_SLUG[t.slug]?.hasVideo ?? false,
}));

export function getTemplateBySlug(slug: string): Template | undefined {
  return TEMPLATES.find((t) => t.slug === slug);
}

/** Curated templates shown on the homepage. Falls back to the first few. */
export function getFeaturedTemplates(limit = 6): Template[] {
  const featured = TEMPLATES.filter((t) => t.featured);
  return (featured.length > 0 ? featured : TEMPLATES).slice(0, limit);
}
