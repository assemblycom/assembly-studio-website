<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Deploying

**Never run `vercel --prod`.** It publishes the working directory straight to
https://studio.assembly.com, skipping GitHub and any review. Pushing to `main` is
how changes go live: Vercel builds every push to it.

**Ask before deploying, including before pushing `main`** — the push is the
deploy. For a real URL without going live, run plain `vercel` for a preview, or
push a branch and let Vercel preview it.

Everything else worth knowing about this repo — design rules, theming, SEO, the
branch flow — is in `CLAUDE.md`. Read it before making changes; it applies
whatever tool you are.
