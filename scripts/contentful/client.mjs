// Shared env handling for the Contentful scripts.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const DEFAULT_ENVIRONMENT = "master";

// Node 20 errors on --env-file when the file is absent and only gained
// --env-file-if-exists later, so .env.local is read here instead. Existing
// process env always wins, which is what Vercel needs.
export function loadEnvLocal() {
  const file = join(process.cwd(), ".env.local");
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    const value = match[2].trim().replace(/^(['"])(.*)\1$/, "$2");
    if (process.env[match[1]] === undefined) process.env[match[1]] = value;
  }
}

export function readConfig() {
  loadEnvLocal();
  return {
    spaceId: process.env.CONTENTFUL_SPACE_ID,
    managementToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
    deliveryToken: process.env.CONTENTFUL_DELIVERY_TOKEN,
    environmentId: process.env.CONTENTFUL_ENVIRONMENT || DEFAULT_ENVIRONMENT,
  };
}

/** Exits with a usable message when a write script is missing its credentials. */
export function requireWriteConfig() {
  const config = readConfig();
  const missing = ["CONTENTFUL_SPACE_ID", "CONTENTFUL_MANAGEMENT_TOKEN"].filter(
    (name) => !process.env[name],
  );
  if (missing.length) {
    console.error(
      `Missing ${missing.join(", ")}.\n` +
        "Add them to .env.local (see ENV.example.md), then re-run.",
    );
    process.exit(1);
  }
  return config;
}
