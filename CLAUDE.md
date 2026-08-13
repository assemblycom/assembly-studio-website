# Assembly Studio Website

Marketing website for Assembly Studio (the AI workflow platform).

## Before you deploy anything, read this

**Never run `vercel --prod`.** It publishes the working directory straight to
https://studio.assembly.com, skipping GitHub and any review. Pushing to `main` is
how changes go live, because Vercel builds every push to it.

**Ask before deploying, including before pushing `main`** — the push is the
deploy. To see a change on a real URL without going live, run plain `vercel` for
a preview, or push a branch and let Vercel preview it.

Full detail in "Branching and deploying" below.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **Deployment**: Vercel

## Project Structure
```
src/
  app/                    # Pages (file-based routing)
    page.tsx              # Homepage
    customers/page.tsx    # Customer case studies
    templates/page.tsx    # Template gallery
    templates/[slug]/     # Template detail pages
    security/page.tsx     # Security page
    pricing/page.tsx      # Pricing page
  components/
    layout/               # Header, Footer (shared across all pages)
    home/                 # Homepage section components
    ui/                   # Reusable UI primitives
  lib/
    constants.ts          # Nav links, URLs, site name
    templates.ts          # Template data and types
```

## Design Guidelines
- Use only font-weight 400 (regular) and 500 (medium). Never use bold (600/700).
- Keep heading sizes restrained — prefer text-3xl/text-4xl, max text-5xl for page titles.
- Use CSS variables from globals.css for colors (--accent, --muted, --border, etc).
- Keep components responsive — mobile-first, max-w-7xl container.

### Never mix light-mode and dark-mode colors
Light and dark are **separate value sets** — editing one must never change the
other. Most regressions on this site come from tuning dark mode and having it
bleed into light (or vice versa), because a shared color got hardcoded in a spot
that both themes render.

Rules:
- **Only ever touch color values inside a theme-scoped block.** Light values live
  in `:root` / the light branch; dark values live under `[data-theme="dark"]`,
  `.v72-mock-dark`, or the dark branch of an inline `theme === "dark" ? {…} : {…}`
  object (e.g. the `--v69-*` overrides in `hero-v76.tsx`). If you change a number,
  confirm which theme's block you're in and leave the other alone.
- **Components must read tokens, never hardcode a themed color.** Use
  `bg-[var(--v69-inner)]`, `text-[var(--v69-ink)]`, `text-muted-foreground`, etc.
  A raw hex or a Tailwind gray (`bg-neutral-200`, `text-neutral-800`) inside a
  themed surface is a regression waiting to happen — it can't flip with the theme.
- **The `--v69-*` mock tokens** (`--card`, `--inner`, `--well`, `--well-2`,
  `--chip`, `--ink`) are the shared palette for the template-card mocks. Card
  inner panels/bubbles/pills use `--v69-inner` (the light-gray "lift" tone); keep
  every card in the family on the same token so they stay consistent.
- After changing any color, **verify both themes** before considering it done.

## Reuse patterns — do not reinvent
**If an element already has an established pattern on this site, reuse that exact
pattern. Do not invent a new variation unless explicitly asked to.** Consistency
across the site is a hard requirement — a new one-off style for something we
already solved (filters, tags, cards, buttons, toggles, etc.) is a bug, not a
feature.

Before building any UI element, check whether it already exists elsewhere and
match it. Known shared patterns:
- **Filter chips** — mono, uppercase, `rounded-md`, `bg-muted` (inactive) /
  `bg-foreground/10` (active). See `templates-browser.tsx` and
  `customers-hub.tsx`.
- **Tags / stat chips** — mono, uppercase, `rounded-md bg-muted px-3 py-1.5`,
  value in `text-foreground` + label in `text-muted-foreground`. See the
  case-study detail page and the customers review strip.
- **Segmented toggle** — sliding thumb, matches the pricing billing toggle. See
  `pricing-plans.tsx` and `production-gap.tsx`.
- **Primary/secondary buttons, cards, section spacing** — reuse the existing
  component/classes rather than restyling per page.

When a genuinely new element is needed, prefer extracting a shared component so
the next page reuses it too.

## Branching and deploying

`main` is production. Vercel builds it on every push, and the result becomes
https://studio.assembly.com. There is no staging branch: that branch existed,
carried nothing main lacked, and was deleted. Preview deploys come from branches
instead (see below).

- **Ana pushes to `main` directly.** She owns the site and is its code owner.
- **Everyone else opens a PR into `main`.** The branch rule requires one approving
  review *from the code owner*, so a teammate's approval alone will not land it.
  Approvals are dismissed on new pushes, and the newest push must be approved.
- **Feature branches** branch off `main` and open PRs back into `main`.

### Double-check before deploying

Nothing technically stops a deploy right now. Anyone on the Vercel team can push
and ship to the live site, and the branch rules on GitHub don't reach the Vercel
CLI. That makes this a shared habit rather than a gate, so it's worth a beat of
care: know that what you're about to do is going live.

If you're not sure it should go out yet, open a PR instead of pushing. It gets a
preview URL, so the change can be reviewed on a real page rather than described.
Once it looks right, merging it into `main` is what puts it live.

### Never run `vercel --prod`

That command uploads whatever is in the working directory straight to production.
It skips GitHub entirely: no branch rule, no review, no code owner. Production has
been overwritten from an unpushed feature branch this way, so the live site ran
code that existed on one laptop and nowhere else.

To see a change on a real URL, do one of:

- `vercel` with no flags, which builds a preview deployment, or
- push the branch, which gets Vercel to build a preview automatically.

Preview URLs are `.vercel.app` and sit behind Vercel SSO, so teammates can open
them and the public cannot.

### Verifying in a browser

`npm run dev` plus a preview pane covers most work, with one trap worth knowing:
the pane runs with `document.visibilityState === "hidden"`, so
IntersectionObserver never fires, `requestAnimationFrame` is paused, and video
never starts. Anything gated on scrolling into view or on autoplay cannot be
tested there and will look broken when it is fine. Use a preview URL in a real
browser, or drive headless Chrome over CDP, where the page is genuinely visible.

## Commands
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — run ESLint

## SEO, metadata, and social cards
All of it runs off `src/lib/seo.ts` and `src/lib/og.tsx`.

- **Never write a bare `export const metadata = { title, description }`.** Next
  inherits the parent's `openGraph` object wholesale, so a page that sets only
  those two still ships the *homepage's* social card. Always go through
  `pageMetadata()`, which writes title, description, canonical, Open Graph, and
  Twitter together.
- **Static page copy lives in `PAGE_SEO`** in `src/lib/seo.ts` — one record per
  page, read by the page metadata, the social card, and the sitemap.
- **One social card for the whole site** — `public/og.jpg`, exported as
  `OG_IMAGE` from `src/lib/seo.ts`. Per-page generated cards were tried and
  rejected; don't reintroduce `opengraph-image.tsx` route files. 1200×630 is the
  only size worth shipping, since every platform crops its own thumbnail from it.
- Because `pageMetadata()` writes a whole `openGraph` object, it has to include
  `images` — a page that omits it ends up with no card image at all.
- **The sitemap walks `src/app` at build time**, so a new page appears without
  anyone remembering. To keep a route *out*, add it to `EXCLUDED` in
  `src/app/sitemap.ts` with a reason, and give the page `robots: { index: false }`
  so the two can't disagree.

## Adding a New Page
1. Create `src/app/<page-name>/page.tsx`
2. Add an entry to `PAGE_SEO` in `src/lib/seo.ts` and export
   `metadata = pageMetadata(PAGE_SEO.<key>)` from the page
3. Add the route to `NAV_LINKS` in `src/lib/constants.ts` if it belongs in the nav
4. Use the `Section` component from `src/components/ui/section.tsx` for consistent spacing

The sitemap picks the page up on its own — no edit needed.

## Adding a Template
Add an entry to the `BASE_TEMPLATES` array in `src/lib/templates.ts`. The detail
page and its sitemap entry are both generated from that one entry.

Once Contentful is wired up (see ENV.example.md) it becomes the source instead:
`prebuild` runs `scripts/contentful/pull.mjs`, which writes
`src/lib/templates.generated.ts`, and `TEMPLATES` prefers it over the committed
array. Notes for anyone touching that path:

- **Codegen, not a runtime fetch.** `TEMPLATES` is read at module scope by client
  components (the hero strip, the proposal tools), where an `await` can't reach.
  Making it async would mean refactoring all of them, so the data is baked in at
  build time instead. It also keeps the site static and immune to a CMS outage.
- **The pull never fails the build.** No credentials, or an unreachable
  Contentful, writes `null` and the committed templates are used.
- `templates.generated.ts` is machine-written — don't hand-edit it.
- The space is shared with another site, so everything is namespaced to the
  `studioTemplate` content type and `contentful:setup` refuses to modify a type
  it doesn't recognise as ours.

## Adding a Customer Story
Add an entry to `CASE_STUDIES` in `src/lib/case-studies.ts`. `seoDescription` is
required — it's the search snippet, and it's a different job from `summary`,
which is written for the index card.
