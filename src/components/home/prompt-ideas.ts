// Prompt Ideas: the menu shows the label, picking inserts the full prompt.
// These mirror the starter prompts the product ships, which were tightened for
// build speed — each one names a fixed, small scope ("simple", a set number of
// steps, three statuses) rather than an open-ended feature list. Keep them in
// step with the in-product set rather than editing them for the site alone.
// Shared by the hero and the bottom CTA so the two boxes read identically. The
// empty box shows the animated "Build …" typewriter placeholder (see hero-v66)
// instead of seeded text.
export const PROMPT_IDEAS = [
  {
    label: "Onboarding wizard",
    prompt:
      "Build a simple contact onboarding wizard with five fixed steps — welcome, identity, goals, timelines, and file upload — with progress saved so contacts can return later. Internal users see how far each contact has gotten and review their responses.",
  },
  {
    label: "Document collection",
    prompt:
      "Build a simple document collection app. Internal users request a list of documents from a specific contact; the contact sees a checklist and uploads each item. Internal users mark each upload as accepted or needing a new version, and are notified as files come in.",
  },
  {
    label: "Project tracker",
    prompt:
      "Build a simple project tracker where internal users set up each contact's project as a list of milestones, each marked upcoming, in progress, or done. Each contact sees their own tracker in the portal: what's done, what's in progress, what's next.",
  },
  {
    label: "Time tracker",
    prompt:
      "Build a simple internal-only time tracker. Internal users log billable hours against a contact with a note and category, and see monthly totals per contact, exportable as CSV for invoicing.",
  },
  {
    label: "Content approval flow",
    prompt:
      "Build a simple content approval app. Internal users submit work for contact review; each contact approves or requests changes with a comment. Internal users see what's awaiting review and what's been actioned across all contacts.",
  },
  {
    label: "Service request intake",
    prompt:
      "Build a simple service request app. Internal users define the services the firm offers; each contact picks one, fills out a short standard scoping form, and submits. Internal users move each request through simple statuses — new, in review, confirmed — and each contact sees where theirs stands.",
  },
];
