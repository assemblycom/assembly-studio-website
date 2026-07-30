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
