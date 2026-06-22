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
