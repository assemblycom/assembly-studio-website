// The Template content type, in one place so `setup` creates it and `push`
// knows what to send. Field ids match the `Template` interface in
// src/lib/templates.ts exactly — that's what keeps the mapping in `pull` honest.
//
// The id is namespaced because the Contentful space is shared with another
// site: a bare "template" could collide with a type that site already owns, and
// this tooling would then be editing their content model. `pull` also queries
// by this id, so it can only ever read entries belonging to this site.
export const CONTENT_TYPE_ID = "studioTemplate";

// Ownership marker. `setup` refuses to modify a content type whose name doesn't
// match, so it can't overwrite someone else's model even if the ids collide.
export const CONTENT_TYPE_NAME = "Assembly Studio — app template";

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
  "Support",
];

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
];

export const CONTENT_TYPE = {
  name: CONTENT_TYPE_NAME,
  description:
    "One card in the /templates gallery and its detail page. Publishing rebuilds the site.",
  displayField: "title",
  fields: [
    {
      id: "title",
      name: "Title",
      type: "Symbol",
      required: true,
      validations: [{ size: { max: 60 } }],
    },
    {
      id: "slug",
      name: "Slug",
      type: "Symbol",
      required: true,
      validations: [
        { unique: true },
        {
          regexp: { pattern: "^[a-z0-9]+(-[a-z0-9]+)*$" },
          message: "Lowercase words separated by hyphens, e.g. progress-tracker.",
        },
      ],
    },
    {
      id: "description",
      name: "Short description",
      type: "Symbol",
      required: true,
      // The gallery card line. A fragment, not a sentence — "Track records
      // through stages", not "This template tracks records through stages."
      validations: [{ size: { max: 70 } }],
    },
    {
      id: "longDescription",
      name: "About this template",
      type: "Text",
      required: true,
      validations: [{ size: { max: 400 } }],
    },
    {
      id: "category",
      name: "Category",
      type: "Symbol",
      required: true,
      validations: [{ in: TEMPLATE_CATEGORIES }],
    },
    {
      id: "features",
      name: "Features",
      type: "Array",
      items: { type: "Symbol", validations: [{ size: { max: 40 } }] },
      validations: [{ size: { min: 1, max: 6 } }],
    },
    {
      id: "industries",
      name: "Industries",
      type: "Array",
      items: { type: "Symbol", validations: [{ in: TEMPLATE_INDUSTRIES }] },
    },
    {
      id: "featured",
      name: "Featured",
      type: "Boolean",
      // Featured templates lead the gallery, ahead of everything else.
    },
    {
      id: "usesAI",
      name: "Uses AI",
      type: "Boolean",
      // Adds the "AI" badge on the card.
    },
    {
      id: "order",
      name: "Sort order",
      type: "Integer",
      // Lower sorts first, within featured and non-featured alike. Leave it
      // empty and the template falls back to alphabetical.
    },
    {
      id: "icon",
      name: "Icon",
      type: "Symbol",
      // Carried for parity with the code. Not rendered anywhere today.
    },
    {
      id: "image",
      name: "Preview image",
      type: "Link",
      linkType: "Asset",
      validations: [{ linkMimetypeGroup: ["image"] }],
    },
    {
      id: "images",
      name: "Gallery images",
      type: "Array",
      items: {
        type: "Link",
        linkType: "Asset",
        validations: [{ linkMimetypeGroup: ["image"] }],
      },
      validations: [{ size: { max: 4 } }],
    },
    {
      id: "videoUrl",
      name: "Walkthrough video URL",
      type: "Symbol",
    },
  ],
};
