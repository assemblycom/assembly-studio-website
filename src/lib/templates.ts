export interface Template {
  slug: string;
  /**
   * The app id the product resolves this template by, e.g. "app-e070af55" — NOT
   * the slug, which is only this site's URL handle. Signup receives this as
   * `templateId`, so a wrong value silently starts the visitor on the wrong app.
   * Optional because a handful of templates still have no app behind them: where
   * it's missing, the param is omitted rather than guessed. Contentful's
   * "Template Id" field wins over anything set here.
   */
  templateId?: string;
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
  /** Lower sorts first within the featured / non-featured groups. */
  order?: number;
  /** Template relies on AI — drives the "AI" capability tag. */
  usesAI?: boolean;
  /** Optional preview image shown on the card in place of the grey placeholder. */
  image?: string;
  /** Detail-gallery media: up to 4 preview images. */
  images?: string[];
  /** Optional walkthrough video; when set it leads the detail gallery. */
  videoUrl?: string;
  /**
   * Has a visible entry in Contentful, which is the catalogue: a template the
   * site lists. Everything stays committed rather than being deleted — an entry
   * here carries work the CMS has no copy of (the cover mock, industry tags,
   * feature list), and listing is a reversible editorial state. Lookups by slug
   * still find an unlisted one (see getTemplateBySlug), so a proposal already
   * sent against it keeps rendering.
   */
  listed?: boolean;
  /**
   * TEMP — until real screenshots/videos exist. Lets a template demonstrate its
   * gallery shape with designed placeholder frames: how many preview frames
   * (1–4) and whether a video tile leads. Ignored once `images`/`videoUrl` are
   * set.
   */
  previewCount?: number;
  hasVideo?: boolean;
}

// Category order is intentional — it drives the order of the filter tabs. A
// category the CMS uses but this list omits still gets a tab, appended after
// these; listing one here is how it gets a deliberate position instead.
// "Classic", "Support" and "Internal" come from the product's core apps, which
// the gallery lists alongside the templates.
export const TEMPLATE_CATEGORIES = [
  "Onboarding",
  "Classic",
  "Dashboards",
  "Trackers",
  "Approvals",
  "Requests",
  "Support",
  "Proposals",
  "AI assistants",
  "Community",
  "Internal",
  "Knowledge base",
  "Education",
] as const;

/**
 * Card copy for the product's core apps, which come from the CMS rather than
 * from the array below. Their CMS descriptions are written for the product's own
 * app picker and run to three or four lines under a gallery card; the committed
 * templates all carry a single line, and these match them. The fuller CMS copy
 * still leads each app's detail page.
 *
 * The card column is 246px, which is about 34 characters — keep them under it.
 */
export const CORE_APP_SUBTITLE: Record<string, string> = {
  "helpdesk-app": "A searchable client knowledge base",
  "message-autoresponder": "Auto-reply outside working hours",
  "contracts-app": "Get contracts signed online",
  "files-app": "Share files and folders securely",
  "forms-app": "Forms that collect client info",
  "billing-app": "Branded invoices clients can pay",
  "messaging-app": "Secure client messaging",
  "tasks": "Assign tasks to clients and team",
  "client-home": "A personalized client homepage",
  "profile-manager": "Clients update their own details",
  "exporter": "Export your message history",
  "quickbooks": "Sync invoices to QuickBooks",
  "xero": "Sync invoices to Xero",
};

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
  "client-onboarding-wizard": ["Accounting", "Legal", "Consulting", "Marketing"],
  "new-client-intake": ["Accounting", "Legal", "Consulting", "Marketing"],
  "document-collection": ["Accounting", "Legal", "Real estate", "Financial services"],
  "client-project-tracker": ["Marketing", "Consulting", "Technology", "Real estate"],
  "time-tracker": ["Legal", "Accounting", "Consulting"],
  "content-approval-flow": ["Marketing", "Consulting"],
  "client-support-requests": ["Technology", "Marketing", "Consulting"],
  "proposal-builder": ["Marketing", "Consulting", "Accounting", "Legal"],
  "client-ai-assistant": ["Technology", "Healthcare", "Financial services", "Education"],
  "voice-ai-integration": ["Technology", "Healthcare", "Financial services"],
  "client-discussion-forum": ["Education", "Technology", "Marketing"],
  "internal-communications-app": ["Technology", "Consulting", "Healthcare"],
  "client-resource-library": ["Education", "Consulting", "Healthcare", "Financial services"],
  "data-room": ["Financial services", "Legal", "Real estate", "Accounting"],
  // From the tracker.
  "progress-tracker": ["Consulting", "Marketing", "Technology", "Real estate"],
  "client-todo-list": ["Consulting", "Accounting", "Legal", "Marketing"],
  "deals-pipeline": ["Real estate", "Consulting", "Financial services", "Technology"],
  "case-status-page": ["Legal", "Healthcare", "Financial services"],
  "retainer-usage-overview": ["Marketing", "Consulting", "Legal"],
  "conditional-forms": ["Legal", "Healthcare", "Accounting", "Financial services"],
  "client-calendar": ["Consulting", "Legal", "Real estate", "Healthcare"],
  "mass-messenger": ["Marketing", "Consulting", "Accounting", "Real estate"],
  "events-rsvps": ["Marketing", "Consulting", "Education", "Real estate"],
  "design-approvals": ["Marketing", "Consulting", "Technology"],
  "goal-tracker": ["Consulting", "Accounting", "Marketing", "Financial services"],
  "internal-resource-library": ["Consulting", "Accounting", "Legal", "Technology"],
  "jargon-quest": ["Legal", "Accounting", "Financial services", "Healthcare"],
  "block-builder-game": ["Education", "Marketing", "Technology"],
  // From the template DB list.
  "booking-app": ["Consulting", "Healthcare", "Legal", "Real estate"],
  "pdf-to-digital-intake": ["Legal", "Healthcare", "Accounting", "Financial services"],
  "markup-comments": ["Marketing", "Consulting", "Technology"],
  "internal-ai-assistant": ["Consulting", "Technology", "Accounting", "Legal"],
  "service-request-intake": ["Technology", "Consulting", "Marketing"],
  "internal-ticketing": ["Technology", "Consulting", "Healthcare"],
};

const BASE_TEMPLATES: Template[] = [
  // Onboarding
  {
    slug: "client-onboarding-wizard",
    templateId: "app-b789d151",
    title: "Client onboarding wizard",
    description: "Multi-step onboarding flow with saved progress",
    icon: "🪄",
    category: "Onboarding",
    longDescription:
      "Walk new clients through a multi-step onboarding flow — welcome, identity, goals, timelines, and file upload — with progress saved so they can return later.",
    features: ["Multi-step flow", "Saved progress", "File upload", "Guided steps"],
    featured: true,
  },
  {
    slug: "new-client-intake",
    templateId: "app-2db3315f",
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
    templateId: "app-03b42204",
    title: "Document collector",
    description: "Requested docs with upload checklist",
    icon: "📂",
    category: "Onboarding",
    longDescription:
      "Send clients a clear checklist of documents to provide, with reminders and secure storage until everything's collected.",
    features: ["Upload checklist", "Reminders", "Secure storage", "Completion tracking"],
  },

  // Trackers
  {
    slug: "client-project-tracker",
    templateId: "app-2ccc13ce",
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
    templateId: "app-e7b9fd47",
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
    templateId: "app-31720927",
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
    templateId: "app-76f90bd2",
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
    templateId: "app-0eedb184",
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
    templateId: "app-990e42c6",
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
    templateId: "app-b84608d5",
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
    templateId: "app-daffe7dd",
    title: "Client discussion forum",
    description: "Threaded topics clients can search",
    icon: "💬",
    category: "Community",
    longDescription:
      "Give clients a branded forum to ask questions and share feedback, with threaded topics that stay searchable over time.",
    features: ["Threaded topics", "Mentions", "Searchable", "Moderation"],
  },
  {
    slug: "internal-communications-app",
    templateId: "app-1dda4757",
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
    templateId: "app-96af46a6",
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
    templateId: "app-402dffba",
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
    templateId: "app-8d92d4c8",
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
    templateId: "app-309153ef",
    title: "Client to-do list",
    description: "A clear checklist of next steps per client",
    icon: "☑️",
    category: "Trackers",
    longDescription:
      "Give each client a clear checklist of what to do next, with due dates and reminders, so nothing stalls on their side.",
    features: ["Per-client checklist", "Due dates", "Reminders", "Completion tracking"],
  },
  {
    slug: "deals-pipeline",
    title: "Deals pipeline",
    description: "Open deals by stage, with value and owner",
    icon: "📈",
    category: "Trackers",
    longDescription:
      "See every open deal by stage, with its value, owner, and next step, so the pipeline is one shared view instead of a spreadsheet someone remembers to update on Fridays.",
    features: ["Stages you define", "Value per deal", "Owner and next step", "Weighted total"],
  },
  {
    slug: "case-status-page",
    templateId: "app-0ccf0862",
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
    templateId: "app-1ee5fd2e",
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
    templateId: "app-67adf3fa",
    title: "Conditional forms",
    description: "Smart forms that adapt to each answer",
    icon: "📜",
    category: "Onboarding",
    longDescription:
      "Build smart intake forms that show and hide questions based on earlier answers, so clients only see what's relevant to them.",
    features: ["Conditional logic", "Branching questions", "Saved progress", "Auto data capture"],
  },
  {
    slug: "client-calendar",
    templateId: "app-b6fb2741",
    title: "Client calendar",
    description: "A shared calendar of key dates",
    icon: "🗓️",
    category: "Trackers",
    longDescription:
      "Give clients a shared calendar of meetings, milestones, and deadlines so everyone sees what's coming up — kept in sync with the work in their portal.",
    features: ["Shared calendar", "Event details", "Milestones & deadlines", "Reminders"],
  },
  // ── Added from the app's own template picker ─────────────────────────────
  {
    slug: "mass-messenger",
    templateId: "app-8b5af9a1",
    title: "Mass messenger",
    description: "One message, every client",
    icon: "📣",
    category: "Community",
    longDescription:
      "Write one message and send it to every client, or to a filtered segment. Delivery status and replies stay in one place instead of scattered across inboxes.",
    features: ["Audience filters", "Scheduled sends", "Delivery status", "Replies in one place"],
  },
  {
    slug: "events-rsvps",
    templateId: "app-5d08051f",
    title: "Events & RSVPs",
    description: "Invites, RSVPs, attendee lists",
    icon: "📅",
    category: "Community",
    longDescription:
      "Publish events to your clients, collect RSVPs, and keep the attendee list, reminders, and follow-ups in the portal rather than a separate ticketing tool.",
    features: ["Event listings", "RSVP tracking", "Reminders", "Attendee list"],
  },
  {
    slug: "design-approvals",
    templateId: "app-ca411339",
    title: "Design approvals",
    description: "Creative sign-off, round by round",
    icon: "🎨",
    category: "Approvals",
    longDescription:
      "Share designs for review, collect approvals or change requests one round at a time, and keep a record of who signed off on which version.",
    features: ["Round-by-round review", "Approve or request changes", "Version history", "Sign-off record"],
  },
  {
    slug: "goal-tracker",
    templateId: "app-e070af55",
    title: "Goal tracking app",
    description: "Client goals with progress to target",
    icon: "🎯",
    category: "Trackers",
    longDescription:
      "Set goals with each client, track progress against the target, and show how far along they are without anyone booking a status call.",
    features: ["Goals per client", "Progress to target", "Milestones", "Trend over time"],
  },
  {
    slug: "internal-resource-library",
    templateId: "app-9fcdabcb",
    title: "Internal resource library",
    description: "Playbooks and guides for your team",
    icon: "🗂️",
    category: "Knowledge base",
    longDescription:
      "The same library your clients get, pointed inward: playbooks, policies, and guides your team can search instead of digging through shared drives.",
    features: ["Search", "Categories", "Access by team", "Version history"],
  },
  {
    slug: "jargon-quest",
    templateId: "app-f33cf655",
    title: "Jargon quest",
    description: "Gamified glossary of your terms",
    icon: "🧩",
    category: "Education",
    longDescription:
      "Turn your industry's vocabulary into a short quiz clients can play, so they arrive at meetings already knowing what the terms mean.",
    features: ["Term library", "Quiz rounds", "Scores & streaks", "Progress per client"],
  },
  {
    slug: "block-builder-game",
    templateId: "app-64a0b2a5",
    title: "Block builder game",
    description: "Drag-and-drop building game",
    icon: "🧱",
    category: "Education",
    longDescription:
      "A playful drag-and-drop builder that runs in the portal, for onboarding warm-ups, workshops, or simply showing clients what an interactive app can be.",
    features: ["Drag-and-drop board", "Saved layouts", "Shareable results", "Works on mobile"],
  },
  // ── Added from the template DB list ──────────────────────────────────────
  // Copy here is a first draft, written from each name; review before launch.
  {
    slug: "booking-app",
    title: "Meeting Request",
    description: "Clients book time from your availability",
    icon: "📆",
    category: "Requests",
    longDescription:
      "Let clients request a meeting and book it against the times you actually have open, with the confirmation and anything they submitted kept in their portal.",
    features: ["Availability windows", "Meeting requests", "Confirmations & reminders", "Booking history"],
  },
  {
    slug: "pdf-to-digital-intake",
    title: "PDF to digital intake",
    description: "Turn a static PDF into a real form",
    icon: "📄",
    category: "Onboarding",
    longDescription:
      "Replace the PDF you email clients with a proper digital form. Answers come back structured and searchable instead of as a scan someone has to retype.",
    features: ["Import from PDF", "Structured fields", "Saved progress", "Export back to PDF"],
  },
  {
    slug: "markup-comments",
    templateId: "app-84e48d32",
    title: "Markup & comments",
    description: "Comment directly on files",
    icon: "✍️",
    category: "Approvals",
    longDescription:
      "Let clients mark up a document or design and pin comments to the exact spot, so feedback arrives in context rather than as a long email thread.",
    features: ["Pinned comments", "Markup tools", "Threaded replies", "Resolve & track"],
  },
  {
    slug: "internal-ai-assistant",
    templateId: "app-9e76d28d",
    title: "Internal AI assistant",
    description: "An assistant trained on your playbooks",
    icon: "🧠",
    category: "AI assistants",
    longDescription:
      "The same assistant your clients get, pointed inward: it answers from your own policies, playbooks, and past work so the team stops asking the same questions twice.",
    features: ["Answers from your docs", "Cited sources", "Team-only access", "Chat history"],
  },
  {
    slug: "service-request-intake",
    templateId: "app-a687c85e",
    title: "Service request intake",
    description: "One front door for new work",
    icon: "🛠️",
    category: "Requests",
    longDescription:
      "Give clients one place to ask for new work, with the questions you need answered up front so a request arrives ready to scope instead of needing three follow-ups.",
    features: ["Request types", "Required details", "Status per request", "Assign an owner"],
  },
  {
    slug: "internal-ticketing",
    title: "Internal ticketing",
    description: "Track team requests through to done",
    icon: "🎫",
    category: "Requests",
    longDescription:
      "A queue for the requests your own team raises, each with an owner, a priority, and a status, so nothing sits unclaimed in someone's inbox.",
    features: ["Ticket queue", "Owners & priority", "Status workflow", "Activity log"],
  },

];

// Gallery media shape per template (TEMP placeholder frames until real
// screenshots/videos land). Every template shows multiple media — a mix of
// image-only sets and video-led sets. `previewCount` is the TOTAL tile count
// (the video, when present, is the first tile); capped at MAX_FRAMES (4).
// Video leads templates whose value is best shown in motion (flows, AI, live
// dashboards, scheduling, markup).
const PREVIEW_BY_SLUG: Record<string, { previewCount?: number; hasVideo?: boolean }> = {
  "client-onboarding-wizard": { previewCount: 4, hasVideo: true },
  "new-client-intake": { previewCount: 3 },
  "document-collection": { previewCount: 2 },
  "client-project-tracker": { previewCount: 3 },
  "time-tracker": { previewCount: 3 },
  "content-approval-flow": { previewCount: 3, hasVideo: true },
  "client-support-requests": { previewCount: 2 },
  "proposal-builder": { previewCount: 4, hasVideo: true },
  "client-ai-assistant": { previewCount: 3, hasVideo: true },
  "client-discussion-forum": { previewCount: 2 },
  "internal-communications-app": { previewCount: 3 },
  "client-resource-library": { previewCount: 2 },
  "data-room": { previewCount: 3 },
  "progress-tracker": { previewCount: 2 },
  "client-todo-list": { previewCount: 2 },
  "case-status-page": { previewCount: 3 },
  "retainer-usage-overview": { previewCount: 3 },
  "conditional-forms": { previewCount: 3, hasVideo: true },
  "client-calendar": { previewCount: 2 },
  "mass-messenger": { previewCount: 2 },
  "events-rsvps": { previewCount: 3 },
  "design-approvals": { previewCount: 3, hasVideo: true },
  "goal-tracker": { previewCount: 2 },
  "internal-resource-library": { previewCount: 2 },
  "jargon-quest": { previewCount: 3 },
  "block-builder-game": { previewCount: 2 },
  // Video leads the ones best shown in motion (scheduling, markup, AI).
  "booking-app": { previewCount: 3, hasVideo: true },
  "pdf-to-digital-intake": { previewCount: 3 },
  "markup-comments": { previewCount: 3, hasVideo: true },
  "internal-ai-assistant": { previewCount: 3, hasVideo: true },
  "service-request-intake": { previewCount: 2 },
  "internal-ticketing": { previewCount: 2 },
};

// Templates that sort AFTER the featured set on the index. Empty since the
// gallery was cut back to the templates the product actually ships — they all
// count as featured now.
const LOWER_PRIORITY = new Set<string>();

// The committed floor for what the site lists — NOT the mechanism. Contentful is
// the catalogue: getVisibleTemplates() reads the published, unhidden App Template
// entries at build time and every listing resolves through it. Unhide an entry
// there, or add one, and the next build lists it.
//
// This set is what a build falls back to when Contentful is unreachable, so an
// outage shows the last known catalogue rather than an empty gallery or the whole
// committed set. It fails closed: a template unhidden in the CMS during an outage
// stays off the site until the next good build, which is the harmless direction.
const LISTED_SLUGS = new Set([
  "new-client-intake",
  "document-collection",
  "client-project-tracker",
  "time-tracker",
  "client-support-requests",
  "internal-communications-app",
]);

// Templates whose core value depends on AI — surfaced with an "AI" tag.
const AI_SLUGS = new Set([
  "client-ai-assistant",
  "voice-ai-integration",
  "internal-ai-assistant",
]);

// Merge industry tags + preview shape onto each template from the maps above.
// Each entry's own value wins where it has one, so the maps only fill gaps.
export const LOCAL_TEMPLATES: Template[] = BASE_TEMPLATES.map((t) => ({
  ...t,
  listed: t.listed ?? LISTED_SLUGS.has(t.slug),
  featured: t.featured ?? !LOWER_PRIORITY.has(t.slug),
  usesAI: t.usesAI ?? AI_SLUGS.has(t.slug),
  industries: t.industries?.length ? t.industries : (INDUSTRY_BY_SLUG[t.slug] ?? []),
  previewCount: t.previewCount ?? PREVIEW_BY_SLUG[t.slug]?.previewCount ?? 1,
  hasVideo: t.hasVideo ?? PREVIEW_BY_SLUG[t.slug]?.hasVideo ?? false,
}));

/**
 * The committed set. Contentful overlays onto this per-slug in the server
 * components that render the gallery and detail pages — it stays a plain
 * synchronous array because the hero strip and the proposal tools read it at
 * module scope from client components, where an await can't reach.
 */
export const TEMPLATES: Template[] = LOCAL_TEMPLATES;

/**
 * The committed catalogue. Server surfaces should use getVisibleTemplates() from
 * ./visible-templates instead, which resolves this against Contentful; this is
 * for the client modules that read a list at module scope, where an await can't
 * reach and only the committed floor is available.
 */
export const VISIBLE_TEMPLATES: Template[] = TEMPLATES.filter((t) => t.listed);

/**
 * Searches the whole set, unlisted included. A proposal sent before a template
 * left the catalogue still names it, and that document should keep rendering
 * rather than losing its build panel to an editorial change made afterwards.
 */
export function getTemplateBySlug(slug: string): Template | undefined {
  return TEMPLATES.find((t) => t.slug === slug);
}

/**
 * Customization points common to every Assembly template. Shared so the detail
 * page, the browser modal, and the proposal panel can't drift apart.
 */
export const TEMPLATE_CUSTOMIZATION = [
  "Branding, colors, and your own domain",
  "Fields, sections, and the steps clients see",
  "Automations, reminders, and notifications",
  "Access and permissions per client or team",
];

/**
 * What each feature actually means, for the rails that let a feature row open.
 * Keyed by the label rather than held per template: the labels are all but unique
 * across the set, and the handful that repeat (Reminders, Search, Milestones)
 * mean the same thing wherever they appear. A row with no entry here still reads
 * as a row, it just doesn't open, so this can be filled in as copy is reviewed.
 */
export const TEMPLATE_FEATURE_DETAILS: Record<string, string> = {
  // Onboarding wizard
  "Multi-step flow":
    "The questions are split across short steps instead of one long form, so nobody faces a wall of fields.",
  "Saved progress":
    "Answers are kept as they go. Clients can stop halfway, come back later, and pick up where they left off.",
  "File upload":
    "Documents are attached inside the flow and land in the client's own folder, not in your inbox.",
  "Guided steps":
    "Each step says what it needs and why, so you aren't answering the same setup questions over email.",

  // New client intake
  "Scope & goals":
    "What the engagement covers and what the client wants out of it, captured in their words at the start.",
  Stakeholders:
    "Who to talk to on their side, and who signs off. Collected once rather than pieced together later.",
  "Budget & timeline":
    "Range and dates up front, so the first call starts from something real.",
  "E-signature":
    "Signed in the portal. The executed copy is stored with the client's record, no separate signing tool.",

  // Document collection
  "Upload checklist":
    "Every document you need, listed as a checklist the client works through and can see the end of.",
  Reminders:
    "Automatic nudges before something is due, and after. Nobody on your team has to chase.",
  "Secure storage":
    "Files stay in the client's own folder with your access rules on them, not in an email thread.",
  "Completion tracking":
    "Who has finished, who has started, and what's still outstanding, at a glance.",

  // Client project tracker
  Milestones:
    "The points that matter, dated, so progress reads as a shape rather than a percentage.",
  "Progress per engagement":
    "Each engagement carries its own status, so one client's delay isn't another client's mystery.",
  "Status stages":
    "Your own stages, named the way your team already talks about the work.",
  Notifications:
    "Clients hear when something moves without you writing the update.",

  // Time tracker
  "Billable hours":
    "Time logged against a client and a project as the work happens, not reconstructed at month end.",
  "Roll-ups":
    "Hours totalled by client, project, and period, so the number you invoice is already there.",
  Exportable:
    "Clean timesheets out, ready for whatever you bill from.",
  "Per-project":
    "Every entry belongs to a project, so a client with three jobs running stays three jobs.",

  // Content approval flow
  "Posts & campaigns":
    "The work goes to the client as it will appear, not as an attachment to describe.",
  "Status history":
    "Every change and who made it, kept in order, so nobody argues about what was approved.",
  Comments:
    "Feedback sits on the thing it's about instead of in a separate email.",
  "Audit trail":
    "A dated record of who did what, kept automatically for when it's asked for.",

  // Client support requests
  "Categorized requests":
    "Requests arrive sorted by type, so the right person picks them up first time.",
  "Shared triage queue":
    "One queue your team works from, so nothing sits in an individual's inbox.",
  Priority:
    "What's urgent is marked as urgent, and stays at the top.",
  "Real-time updates":
    "The client sees the status change as it changes, and stops asking whether you got it.",

  // Proposal builder
  "Templated proposals":
    "Start from your own template, change what's specific to this client, send.",
  "View tracking":
    "You can see when it was opened and how far they read, so following up isn't guesswork.",
  "Accept & pay":
    "Accepting and paying happen in the same place, so a yes doesn't wait on an invoice.",

  // Client AI assistant
  "Trained on your docs":
    "It answers from your own guides and policies, not from the open internet.",
  "Instant answers":
    "The common questions are handled the moment they're asked, at any hour.",
  "Smart escalation":
    "When it isn't sure, it hands the question to your team with the context attached.",
  "Multi-channel":
    "Available where clients already are in the portal, rather than as one more tool to learn.",

  // Voice AI integration
  "AI voice calls":
    "Calls are placed and taken for you, with the outcome recorded against the client.",
  "Call status":
    "Completed, voicemail, no answer. Each attempt is logged with its result and time.",
  Transcripts:
    "Every call is written up, so what was said is readable rather than remembered.",
  "Searchable call log":
    "Find the call by client, date, or what was said in it.",

  // Client discussion forum
  "Threaded topics":
    "Conversations keep their shape, so an answer stays attached to its question.",
  Mentions:
    "Pull someone in by name and they hear about it.",
  Searchable:
    "Answers given once stay findable, so the same question isn't asked three times.",
  Moderation:
    "You decide what's posted and what stays, with the controls to act on it.",

  // Internal communications app
  Announcements:
    "One place the team looks for what changed, rather than a message that scrolls away.",
  "Team channels":
    "Channels per team or topic, so a project's noise stays in the project.",
  "Read receipts":
    "You can see who has read the thing that mattered.",
  "Pinned posts":
    "What the team needs constantly stays at the top instead of being reposted.",

  // Client resource library
  "Branded guides":
    "Your guides in your branding, in the portal clients already sign into.",
  Search:
    "Everything is findable by what it's about, not by remembering where it was filed.",
  "Access controls":
    "Who sees what, set per client or group.",
  "Usage insights":
    "What's being read tells you what to write next.",

  // Data room
  "Permissioned access":
    "Access granted per person and revoked the same way, down to the file.",
  Watermarking:
    "Documents carry who opened them, which changes how they get shared on.",
  "Activity tracking":
    "Every open and download is recorded against a name and a time.",

  // Deals pipeline
  "Stages you define":
    "Your own stages, named the way the team already talks about a deal.",
  "Value per deal":
    "What each one is worth, so the pipeline adds up instead of being counted.",
  "Owner and next step":
    "Who has it and what happens next, on the deal itself rather than in someone's head.",
  "Weighted total":
    "The total adjusted for how likely each stage is to close, so the forecast isn't the best case.",

  // Progress tracker
  "Custom stages":
    "Define the stages once, in your own language, and everything moves through them.",
  "Live status":
    "Where each record stands right now, without anyone compiling it.",
  "Progress %":
    "How far along, as a number, for the things that are measured that way.",
  "Per-record updates":
    "Each record carries its own history, so the detail is there when it's questioned.",

  // Client to-do list
  "Per-client checklist":
    "Each client sees their own list of what to do next, not a general one.",
  "Due dates":
    "Dates on the items that have them, so what's late is obvious.",

  // Case status page
  "Live case status":
    "Where the matter stands, current, so the client can look instead of emailing.",
  Timeline:
    "What has happened so far, in order, with dates.",
  "Next steps":
    "What happens next and who it's waiting on.",
  "Client-visible":
    "Written to be read by the client, so nothing has to be translated before sharing.",

  // Retainer usage overview
  "Used vs. remaining":
    "How much of the retainer is spent and how much is left, kept current.",
  "Breakdown by work":
    "Where the time went, grouped the way you'd explain it on a call.",
  "Per-period":
    "Each month or quarter stands on its own, so trends are visible.",

  // Conditional forms
  "Conditional logic":
    "Questions appear based on earlier answers, so clients only see what applies to them.",
  "Branching questions":
    "One form covers several situations without becoming a form for none of them.",
  "Auto data capture":
    "Answers land on the client's record as data, not as a PDF someone has to retype.",

  // Client calendar
  "Shared calendar":
    "Meetings, milestones, and deadlines in one view both sides are looking at.",
  "Event details":
    "What it is, who's coming, and what to bring, on the event itself.",
  "Milestones & deadlines":
    "The dates that matter from the work itself, not re-entered by hand.",

  // Mass messenger
  "Audience filters":
    "Write once and send to everyone, or to the segment the message is actually for.",
  "Scheduled sends":
    "Set when it goes out and it goes out then.",
  "Delivery status":
    "Sent, delivered, opened. You know it landed.",
  "Replies in one place":
    "Answers come back to one queue rather than to whoever pressed send.",

  // Events & RSVPs
  "Event listings":
    "Events published to your clients in the portal, with the detail they need to decide.",
  "RSVP tracking":
    "Who's coming, who declined, and who hasn't answered.",
  "Attendee list":
    "The list stays with the event, so check-in and follow-up work from the same place.",

  // Design approvals
  "Round-by-round review":
    "Feedback comes in rounds, so a design isn't being changed in three directions at once.",
  "Approve or request changes":
    "Two clear answers, recorded, instead of an email you have to interpret.",
  "Version history":
    "Every version is kept, so what changed between two of them is a fact.",
  "Sign-off record":
    "Who approved which version, dated.",

  // Goal tracker
  "Goals per client":
    "Each client's own targets, set with them rather than for them.",
  "Progress to target":
    "How far along against the number, updated as the work lands.",
  "Trend over time":
    "The direction, not just today's figure, so a good month reads as a good month.",

  // Internal resource library
  Categories:
    "Grouped the way your team thinks about the work, so browsing gets somewhere.",
  "Access by team":
    "Each team sees what belongs to it, without a folder maze.",

  // Jargon quest
  "Term library":
    "Your industry's vocabulary, written plainly, in one place clients can return to.",
  "Quiz rounds":
    "Short rounds rather than a test, so it gets finished.",
  "Scores & streaks":
    "A reason to come back tomorrow.",
  "Progress per client":
    "Who has played and how far they got.",

  // Block builder game
  "Drag-and-drop board":
    "A board clients build on directly, in the portal, with no app to install.",
  "Saved layouts":
    "What they made is still there next time.",
  "Shareable results":
    "The result can be sent on, which is half the fun of it.",
  "Works on mobile":
    "Built for a thumb as much as a cursor.",
};

/** Curated templates shown on the homepage. Falls back to the first few. */
export function getFeaturedTemplates(limit = 6): Template[] {
  const featured = VISIBLE_TEMPLATES.filter((t) => t.featured);
  return (featured.length > 0 ? featured : VISIBLE_TEMPLATES).slice(0, limit);
}
