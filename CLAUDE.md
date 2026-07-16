# Assembly Studio Website

Marketing website for Assembly Studio (the AI workflow platform).

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

## Branching Strategy
- **`main`** — production. Deployed to the live site. Never push directly.
- **`staging`** — default branch. PRs merge here first for review and preview deploys.
- **Feature branches** — branch off `staging`, open PRs back into `staging`.
- When staging is ready, merge `staging` → `main` to deploy to production.

## Commands
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — run ESLint

## Adding a New Page
1. Create `src/app/<page-name>/page.tsx`
2. Add the route to `NAV_LINKS` in `src/lib/constants.ts` if it belongs in the nav
3. Use the `Section` component from `src/components/ui/section.tsx` for consistent spacing

## Adding a Template
Add an entry to the `TEMPLATES` array in `src/lib/templates.ts`. The detail page is auto-generated via the `[slug]` dynamic route.
