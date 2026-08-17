# Environment variables

Vercel scopes these per environment. The site runs in three: **Production**
(`production` branch), **Staging** (`main`), and **Preview** (everything else).
A variable set only on Production is *missing* on staging, and the site quietly
falls back — Contentful to the committed templates, the hero box to its curated
completions. Set them on all three unless a value is genuinely production-only.

## `NEXT_PUBLIC_SITE_URL` (staging only)

The canonical host, read by `SITE_URL` in `src/lib/constants.ts`. Unset — on
production, previews, and locally — it falls back to
`https://studio.assembly.com`.

Set it on the **Staging** scope only:

```
NEXT_PUBLIC_SITE_URL=https://studio.assembly-staging.com
```

Without it, staging still renders, but every canonical, `og:url`, docs link, and
proposal URL it produces names production — and `/api/shorten`, which only
accepts URLs whose origin matches `SITE_URL`, rejects every proposal the staging
creator builds. `NEXT_PUBLIC_` because `SITE_URL` is read in client components;
a bare env var is undefined in the browser bundle.

## `ANTHROPIC_API_KEY` (optional)

Powers the AI autocomplete in the hero prompt box (`src/app/api/complete/route.ts`).

- **Not set** → the box falls back to its built-in curated completions. Everything
  still works; it just isn't AI-powered.
- **Set** → as the user pauses typing, Claude suggests a best-practice continuation
  as grey ghost text (accept with Tab).

### Local development

Create a file named `.env.local` in the project root (it's gitignored):

```
ANTHROPIC_API_KEY=sk-ant-...
```

Then restart `npm run dev`.

### Production (Vercel)

Add `ANTHROPIC_API_KEY` under **Project → Settings → Environment Variables**
(Production, Staging, and Preview scopes), then redeploy.

The key is only ever read server-side in the API route — it is never sent to the
browser.

## Contentful (optional) — the `/templates` gallery

Lets the templates be edited without a pull request. **Not set** → the site uses
the templates committed in `src/lib/templates.ts` and nothing changes. **Set** →
`npm run build` pulls the published templates from Contentful instead.

| Variable | Needed for | Notes |
| --- | --- | --- |
| `CONTENTFUL_SPACE_ID` | everything | From **Settings → General settings** |
| `CONTENTFUL_DELIVERY_TOKEN` | the site | Read-only. **Settings → API keys** |
| `CONTENTFUL_MANAGEMENT_TOKEN` | setup + migration only | Write access. Delete it once the migration is done |
| `CONTENTFUL_ENVIRONMENT` | optional | Defaults to `master` |

### Sharing a space with another site

This space is shared, so the tooling is built not to touch anything that isn't
ours:

- The content type is `studioTemplate`, not a bare `template` that could collide
  with the other site's model.
- `npm run contentful:setup` **refuses** to modify an existing `studioTemplate`
  whose name isn't this site's, and stops with an explanation.
- Every read and write is filtered to that one content type. Nothing else in the
  space is listed, read, or changed.

For stronger separation, put this site in its own Contentful **environment**
(**Settings → Environments**) and set `CONTENTFUL_ENVIRONMENT` to it — the other
site keeps using `master` and the two never see each other's content. A separate
**space** is stronger still, if the plan has room for one.

### First-time setup

```
npm run contentful:setup        # create the content type
npm run contentful:push -- --dry # preview the migration, change nothing
npm run contentful:push         # copy the 27 committed templates up
npm run contentful:pull         # write src/lib/templates.generated.ts
```

Then add `CONTENTFUL_SPACE_ID` and `CONTENTFUL_DELIVERY_TOKEN` to Vercel
(Production, Staging, and Preview scopes — both tokens are read-only, and
staging reviewing a different set of templates than production ships is worse
than sharing them). `prebuild` runs the pull on every deploy.

### Publishing rebuilds the site

1. Vercel → **Settings → Git → Deploy Hooks**, create one, copy the URL.
2. Contentful → **Settings → Webhooks → Add webhook**, paste it, and trigger on
   **Publish** and **Unpublish** for Entry.

Publishing then rebuilds the site on its own — a couple of minutes, no PR.

### What stays in code

Each gallery card is a React mock keyed by slug, so a template created only in
Contentful gets a real page and a real card, just a generic-looking one until
someone adds a mock in `hero-v71.tsx` or uploads a **Preview image** to the
entry.
