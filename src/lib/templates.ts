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
  /** Template relies on AI — drives the "AI" capability tag. */
  usesAI?: boolean;
  /** Optional preview image shown on the card in place of the grey placeholder. */
  image?: string;
  /** Detail-gallery media: up to 4 preview images. */
  images?: string[];
  /** Optional walkthrough video; when set it leads the detail gallery. */
  videoUrl?: string;
  /**
   * TEMP — until real screenshots/videos exist. Lets a template demonstrate its
   * gallery shape with designed placeholder frames: how many preview frames
   * (1–4) and whether a video tile leads. Ignored once `images`/`videoUrl` are
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
  "content-approval-flow": ["Marketing", "Consulting"],
  "client-support-requests": ["Technology", "Marketing", "Consulting"],
  "proposal-builder": ["Marketing", "Consulting", "Accounting", "Legal"],
  "client-ai-assistant": ["Technology", "Healthcare", "Financial services", "Education"],
  "voice-ai-integration": ["Technology", "Healthcare", "Financial services"],
  "client-discussion-forum": ["Education", "Technology", "Marketing"],
  "community-qa": ["Education", "Technology"],
  "internal-communications-app": ["Technology", "Consulting", "Healthcare"],
  "client-resource-library": ["Education", "Consulting", "Healthcare", "Financial services"],
  "data-room": ["Financial services", "Legal", "Real estate", "Accounting"],
  // From the tracker.
  "progress-tracker": ["Consulting", "Marketing", "Technology", "Real estate"],
  "client-todo-list": ["Consulting", "Accounting", "Legal", "Marketing"],
  "deliverable-progress": ["Marketing", "Consulting", "Technology"],
  "case-status-page": ["Legal", "Healthcare", "Financial services"],
  "retainer-usage-overview": ["Marketing", "Consulting", "Legal"],
  "conditional-forms": ["Legal", "Healthcare", "Accounting", "Financial services"],
  "service-request-intake": ["Technology", "Consulting", "Real estate"],
  "internal-ticketing": ["Technology", "Consulting", "Marketing"],
  "booking-meeting-request": ["Consulting", "Healthcare", "Real estate", "Legal"],
  "client-calendar": ["Consulting", "Legal", "Real estate", "Healthcare"],
  "markup-comments": ["Marketing", "Consulting", "Legal"],
  "internal-ai-assistant": ["Technology", "Consulting", "Financial services"],
  "course-player": ["Education", "Healthcare", "Consulting"],
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
    description: "Scope, goals, budget, timeline",
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
    description: "AI flags clients who go quiet",
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
    description: "Categorized requests in a triage queue",
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
  {
    slug: "voice-ai-integration",
    title: "Voice AI integration",
    description: "AI voice calls with status and transcripts",
    icon: "📞",
    category: "AI assistants",
    image: "/images/templates/voice-ai-integration.png",
    images: ["/images/templates/voice-ai-integration.png"],
    longDescription:
      "Place and track AI voice calls to your clients — every call logged with live status (completed, voicemail), timestamps, and a transcript you can review.",
    features: ["AI voice calls", "Call status", "Transcripts", "Searchable call log"],
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
    description: "Announcements and team channels",
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
    slug: "data-room",
    title: "Data room",
    description: "Securely share sensitive documents",
    icon: "🔒",
    category: "Knowledge base",
    longDescription:
      "Share sensitive documents securely with permissioned access, audit trails, watermarking, and activity tracking.",
    features: ["Permissioned access", "Audit trail", "Watermarking", "Activity tracking"],
  },

  // ── From the Studio template tracker (copy generated from each name) ──────
  {
    slug: "progress-tracker",
    title: "Progress tracker",
    description: "Track records through stages",
    icon: "📊",
    category: "Trackers",
    image: "/images/templates/progress-tracker.png",
    images: ["/images/templates/progress-tracker.png"],
    longDescription:
      "Track any set of records through your stages — from onboarding to complete — with live status, progress, and last-updated at a glance.",
    features: ["Custom stages", "Live status", "Progress %", "Per-record updates"],
  },
  {
    slug: "client-todo-list",
    title: "Client to-do list",
    description: "A clear checklist of next steps per client",
    icon: "☑️",
    category: "Trackers",
    longDescription:
      "Give each client a clear checklist of what to do next, with due dates and reminders, so nothing stalls on their side.",
    features: ["Per-client checklist", "Due dates", "Reminders", "Completion tracking"],
  },
  {
    slug: "deliverable-progress",
    title: "Deliverable progress",
    description: "Where every deliverable stands",
    icon: "📦",
    category: "Trackers",
    longDescription:
      "Give clients a live view of every deliverable — what's in progress, in review, and shipped — so status questions answer themselves.",
    features: ["Deliverable stages", "Live status", "Owner & due date", "Client-visible"],
  },
  {
    slug: "case-status-page",
    title: "Case status page",
    description: "A live status page for each client case",
    icon: "📋",
    category: "Trackers",
    longDescription:
      "A branded, always-current status page for each case or matter, so clients can see where things stand without emailing you.",
    features: ["Live case status", "Timeline", "Next steps", "Client-visible"],
  },
  {
    slug: "retainer-usage-overview",
    title: "Retainer usage overview",
    description: "Hours used against each client's retainer",
    icon: "⏳",
    category: "Dashboards",
    longDescription:
      "Show clients exactly how much of their retainer they've used and what's left, with a clear breakdown by work and period.",
    features: ["Used vs. remaining", "Breakdown by work", "Per-period", "Client-visible"],
  },
  {
    slug: "conditional-forms",
    title: "Conditional forms",
    description: "Smart forms that adapt to each answer",
    icon: "📜",
    category: "Onboarding",
    longDescription:
      "Build smart intake forms that show and hide questions based on earlier answers, so clients only see what's relevant to them.",
    features: ["Conditional logic", "Branching questions", "Saved progress", "Auto data capture"],
  },
  {
    slug: "service-request-intake",
    title: "Service request intake",
    description: "Capture and route service requests",
    icon: "🛎️",
    category: "Requests",
    longDescription:
      "Give clients one place to submit service requests, then route each to the right person with status they can follow.",
    features: ["Structured intake", "Auto-routing", "Status tracking", "Reminders"],
  },
  {
    slug: "internal-ticketing",
    title: "Internal ticketing",
    description: "Track internal requests in a shared queue",
    icon: "🎫",
    category: "Requests",
    longDescription:
      "Turn scattered internal asks into a shared, prioritized ticket queue with owners, status, and a clear audit trail.",
    features: ["Shared queue", "Priorities", "Owners & status", "Audit trail"],
  },
  {
    slug: "booking-meeting-request",
    title: "Booking & meeting requests",
    description: "Let clients request and schedule meetings",
    icon: "📅",
    category: "Requests",
    longDescription:
      "Let clients request time and book meetings straight from their portal, with the details you need captured up front.",
    features: ["Meeting requests", "Scheduling", "Pre-meeting intake", "Reminders"],
  },
  {
    slug: "client-calendar",
    title: "Client calendar",
    description: "A shared calendar of key dates",
    icon: "🗓️",
    category: "Trackers",
    longDescription:
      "Give clients a shared calendar of meetings, milestones, and deadlines so everyone sees what's coming up — kept in sync with the work in their portal.",
    features: ["Shared calendar", "Event details", "Milestones & deadlines", "Reminders"],
  },
  {
    slug: "markup-comments",
    title: "Markup & comments",
    description: "Annotate files and collect feedback",
    icon: "✍️",
    category: "Approvals",
    longDescription:
      "Collect precise feedback by letting clients comment and mark up files right where the change is needed, with threads and sign-off.",
    features: ["In-context comments", "File markup", "Threads", "Sign-off"],
  },
  {
    slug: "internal-ai-assistant",
    title: "Internal AI assistant",
    description: "AI trained on your internal docs",
    icon: "🤖",
    category: "AI assistants",
    longDescription:
      "An AI assistant trained on your internal playbooks, SOPs, and docs so your team gets instant, accurate answers in one place.",
    features: ["Trained on your docs", "Instant answers", "Team-only", "Cited sources"],
  },
  {
    slug: "course-player",
    title: "Course player",
    description: "Deliver lessons and track completion",
    icon: "📖",
    category: "Education",
    longDescription:
      "Deliver structured lessons to clients or your team, track progress through each module, and pick up where they left off.",
    features: ["Lessons & modules", "Progress tracking", "Resume playback", "Completion"],
  },
];

// Gallery media shape per template (TEMP placeholder frames until real
// screenshots/videos land). Every template shows multiple media — a mix of
// image-only sets and video-led sets. `previewCount` is the TOTAL tile count
// (the video, when present, is the first tile); capped at MAX_FRAMES (4).
// Video leads templates whose value is best shown in motion (flows, AI, live
// dashboards, scheduling, markup).
const PREVIEW_BY_SLUG: Record<string, { previewCount?: number; hasVideo?: boolean }> = {
  "onboarding-wizard": { previewCount: 4, hasVideo: true },
  "new-client-intake": { previewCount: 3 },
  "document-collection": { previewCount: 2 },
  "pdf-to-digital-intake": { previewCount: 3, hasVideo: true },
  "client-engagement-dashboard": { previewCount: 4 },
  "data-visualization": { previewCount: 4 },
  "client-project-tracker": { previewCount: 3 },
  "time-tracker": { previewCount: 3 },
  "content-approval-flow": { previewCount: 3, hasVideo: true },
  "client-support-requests": { previewCount: 2 },
  "proposal-builder": { previewCount: 4, hasVideo: true },
  "client-ai-assistant": { previewCount: 3, hasVideo: true },
  "client-discussion-forum": { previewCount: 2 },
  "community-qa": { previewCount: 2 },
  "internal-communications-app": { previewCount: 3 },
  "client-resource-library": { previewCount: 2 },
  "data-room": { previewCount: 3 },
  "progress-tracker": { previewCount: 2 },
  "client-todo-list": { previewCount: 2 },
  "deliverable-progress": { previewCount: 3 },
  "case-status-page": { previewCount: 3 },
  "retainer-usage-overview": { previewCount: 3 },
  "conditional-forms": { previewCount: 3, hasVideo: true },
  "service-request-intake": { previewCount: 2 },
  "internal-ticketing": { previewCount: 3 },
  "booking-meeting-request": { previewCount: 3, hasVideo: true },
  "client-calendar": { previewCount: 2 },
  "markup-comments": { previewCount: 3, hasVideo: true },
  "internal-ai-assistant": { previewCount: 3, hasVideo: true },
  "course-player": { previewCount: 4, hasVideo: true },
};

// Templates that are lower priority in the tracker (Medium/backlog) — these
// sort AFTER the featured (High-priority) set on the index. Everything else is
// High priority, so it counts as featured/popular and leads alphabetically.
const LOWER_PRIORITY = new Set(["course-player"]);

// Templates whose core value depends on AI — surfaced with an "AI" tag.
const AI_SLUGS = new Set([
  "client-ai-assistant",
  "voice-ai-integration",
  "internal-ai-assistant",
  "client-engagement-dashboard",
]);

// Merge industry tags + preview shape onto each template from the maps above.
// `featured` is derived from the tracker's priority column (High = featured).
export const TEMPLATES: Template[] = BASE_TEMPLATES.map((t) => ({
  ...t,
  featured: !LOWER_PRIORITY.has(t.slug),
  usesAI: AI_SLUGS.has(t.slug),
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
