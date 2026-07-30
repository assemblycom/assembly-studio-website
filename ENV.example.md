# Environment variables

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
(Production scope), then redeploy.

The key is only ever read server-side in the API route — it is never sent to the
browser.
