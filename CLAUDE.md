# Assembly Studio Website

Marketing website for Assembly Studio (the AI workflow platform).

## Before you deploy anything, read this

**Never run `vercel --prod`.** It publishes the working directory straight to
https://studio.assembly.com, skipping GitHub and any review.

**`main` is staging, not production.** Merging a PR into `main` deploys to
https://studio.assembly-staging.com. Production is the `production` branch, and
publishing a GitHub Release is what promotes `main` onto it and changes
https://studio.assembly.com.

**Ask before promoting.** Merging into `main` is safe and expected; publishing a
release is the deploy.

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

Vercel builds every push. Which URL the build lands on depends on the branch:

| Branch      | Environment | URL                                  |
| ----------- | ----------- | ------------------------------------ |
| any branch  | Preview     | a `.vercel.app` URL, one per PR       |
| `main`      | Staging     | https://studio.assembly-staging.com   |
| `production`| Production  | https://studio.assembly.com           |

Work only ever flows one way: a feature branch opens a PR into `main`, and
`main` is fast-forwarded into `production` once staging looks right. Nothing is
merged back down.

Staging sits *in front of* main rather than behind it, and that is the whole
point. The staging branch this replaced sat behind main, drifted from it, and
was deleted for carrying nothing main lacked. In front, it cannot drift: the
promote is always a fast-forward of main, so staging is by definition what main
already is.

- **Everyone opens a PR into `main`.** The branch rule requires one approving
  review *from the code owner*, so a teammate's approval alone will not land it.
  Approvals are dismissed on new pushes, and the newest push must be approved.
- **Ana pushes to `main` directly.** She owns the site and is its code owner.
- **Feature branches** branch off `main` and open PRs back into `main`.
- **Promoting is publishing a GitHub Release.** See "Releasing" below. Nobody
  pushes `production` by hand — the branch rule won't let them, and the release
  is what leaves a record of what shipped.

### Releasing

Production is deployed by publishing a release, not by pushing a branch.
`.github/workflows/release.yml` runs on `release: published`, checks that the
tagged commit is an ancestor of `main`, and pushes it to `production`. Vercel
builds that push, and the site is live a couple of minutes later.

So the whole promote is: **GitHub → Releases → Draft a new release**, tag a
commit on `main`, write what changed, publish.

- **The ancestry check is the point.** A tag can sit on any commit, including
  one that never opened a PR and never rendered on staging. The workflow refuses
  those, so production only ever moves to something `main` already holds. If it
  fails, merge to `main` first and re-tag — don't work around it.
- **It needs `RELEASE_TOKEN`**, a repository secret holding a token that can
  push to `production`. The built-in `GITHUB_TOKEN` cannot: a code-owner branch
  rule is not bypassable by permissions, only by identity, so the token has to
  belong to someone on that rule's bypass list. A missing secret fails the first
  step with an explanation rather than a 403 at the end. The token also needs
  permission to write workflow files (classic PAT: `workflow` scope;
  fine-grained: Workflows) — `production` carries `.github/workflows/` like any
  other branch, and a token without it is refused on that ground alone, with an
  error that says nothing about branch rules.
- **The push is deliberately not forced.** Production only fast-forwards, so a
  rejected push means production holds a commit `main` doesn't — investigate it,
  don't force past it.
- **To undo a bad release, use Vercel's instant rollback**, not a revert commit
  and not a force push. It re-aliases the previous production build without
  rebuilding, so it's live in seconds. Fix forward on `main` afterwards.

### Promotion rebuilds — it does not move the artifact

Vercel's Promote button and `vercel promote` re-point the production alias at a
build that already exists; they do not rebuild it. **Don't use them here.**
`next.config.ts` reads `VERCEL_ENV` at build time and bakes
`X-Robots-Tag: noindex, nofollow` into every non-production build, so promoting
the staging artifact would deindex the live marketing site. `SITE_URL` is
resolved at build time too. Promote by publishing a release and letting
production build itself — a couple of minutes, and the env-gated pieces come out
right.

### Double-check before promoting

The release workflow gates the GitHub path: production only takes commits that
reached `main`, and only a bypass-list token can move the branch. **It does not
reach the Vercel CLI.** `vercel --prod` still uploads a working directory
straight to the live site, past the branch rule, the release, and the ancestry
check alike. That one stays a shared habit rather than a gate, so it's worth a
beat of care: know that what you're about to do is going live.

If you're not sure it should go out yet, leave it on `main`. Staging is a real
URL on a real browser, which is a better review than a description — and there
is no cost to letting it sit there.

### Never run `vercel --prod`

That command uploads whatever is in the working directory straight to production.
It skips GitHub entirely: no branch rule, no review, no code owner. Production has
been overwritten from an unpushed feature branch this way, so the live site ran
code that existed on one laptop and nowhere else.

To see a change on a real URL, do one of:

- `vercel` with no flags, which builds a preview deployment,
- push the branch, which gets Vercel to build a preview automatically, or
- merge it into `main`, which puts it on staging.

Preview and staging URLs sit behind Vercel SSO, so teammates can open them and
the public cannot. Staging also serves `X-Robots-Tag: noindex, nofollow`, so it
can't compete with production in search even if the SSO gate is ever lifted.

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

## Page copy: frozen, not fetched

Every marketing family except the templates gallery used to be read live from
Contentful. It no longer is. The copy and the imagery were taken out of the CMS
and committed:

| Pages | Frozen in |
| --- | --- |
| Feature pages (`/client-portal`, `/invoicing`, …) | `src/lib/features.frozen.ts` |
| `/solutions/*` | `src/lib/solutions.frozen.ts` |
| `/comparison` and `/comparison/*` | `src/lib/comparison-index.frozen.ts`, `src/lib/comparisons.frozen.ts` |
| `/definitions/*` | `src/lib/definitions.frozen.ts` |
| `/jobs` copy and role descriptions | `src/lib/careers-page.frozen.ts`, `src/lib/job-listings.frozen.ts` |
| `/about` team | `src/lib/team.frozen.ts` |

**So a copy change is an edit to a `.frozen.ts` file and a deploy.** Editing the
Contentful entry does nothing — nothing reads it.

- **Imagery lives in `public/images/cms`**, pulled down through Contentful's
  image API at 2400px webp. The CDN is out of the loop too, so an asset being
  replaced or unpublished in the CMS can't change or break a page.
- **`scripts/freeze-cms.mts` (`npm run freeze-cms`) generated these files.** It
  is a one-time tool kept for reference. Re-running it overwrites hand edits with
  whatever the CMS still holds, which by now is the older copy — so don't, unless
  you are deliberately re-taking a family.
- **Two live sources remain, both on purpose.** `src/lib/contentful.ts` serves
  the templates gallery, because marketing publishing a template should not need
  a deploy; and `src/lib/careers.ts` reads the Ashby job board, because a closed
  role has to stop listing. `src/lib/ghost.ts` (the blog) was never Contentful.

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
