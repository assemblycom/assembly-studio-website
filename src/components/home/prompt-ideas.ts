// Prompt Ideas: the menu shows the label, picking inserts the full prompt.
// Every prompt is deliberately spec-rich — the visitor's first lesson in
// how to talk to the app builder. Shared by the hero and the bottom CTA so
// the two boxes read identically. The empty box shows the animated
// "Build …" typewriter placeholder (see hero-v66) instead of seeded text.
export const PROMPT_IDEAS = [
  {
    label: "Onboarding wizard",
    prompt:
      "Build an onboarding wizard for new clients — welcome, identity, goals, timelines, and an area for file upload. Each step saves progress so they can return later.",
  },
  {
    label: "Document collection",
    prompt:
      "Build a document collection app. Internal users request a set of documents from a specific contact; the contact sees a checklist, uploads each item, and watches its status. Internal users review each upload and are notified as files come in.",
  },
  {
    label: "Project tracker",
    prompt:
      "Build a project tracker where internal users set up each contact's project with milestones and update progress as work moves. Each contact sees their own tracker in the portal: what's done, what's in progress, what's next.",
  },
  {
    label: "Time tracker",
    prompt:
      "Build an internal-only time tracker. Internal users log billable hours against a contact, with notes and categories. Admin internal users additionally see a roll-up of hours per contact over any period and export them for invoicing.",
  },
  {
    label: "Approval workflow",
    prompt:
      "Build a content approval app. Internal users submit work for contact review; each contact approves, rejects with comments, or requests changes, and every item keeps a full status history. Internal users see what's awaiting review and what's been actioned across all contacts.",
  },
  {
    label: "Service request intake",
    prompt:
      "Build a service request app. Internal users define services the firm offers; each contact picks one, fills out a scoping form, and submits. Internal users review requests and confirm the scope or reply with questions, and each contact can see where their request stands.",
  },
  {
    label: "Client performance dashboard",
    prompt:
      "Build a dashboard app where each contact sees their key metrics. Internal users configure which metrics to track and keep the values current per contact and see an overview across all contacts.",
  },
];

