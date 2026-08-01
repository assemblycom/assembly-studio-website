// Fetches published templates from Contentful and writes
// src/lib/templates.generated.ts. Runs automatically before every build.
//
//   npm run contentful:pull
//
// Never fails the build: with no credentials, or if Contentful is unreachable,
// it writes `null` and the site falls back to the templates committed in
// templates.ts. A marketing outage should not be a site outage.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { readConfig } from "./client.mjs";
import { CONTENT_TYPE_ID } from "./model.mjs";

const OUT = join(process.cwd(), "src", "lib", "templates.generated.ts");

const HEADER = `// GENERATED FILE — do not edit by hand.
//
// \`npm run contentful:pull\` overwrites this with the published templates from
// Contentful, and \`prebuild\` runs it on every deploy. \`null\` means no Contentful
// credentials were present, in which case the site falls back to the templates
// committed in templates.ts.
import type { Template } from "./templates";

export const GENERATED_TEMPLATES: Template[] | null = `;

function write(value) {
  writeFileSync(OUT, `${HEADER}${JSON.stringify(value, null, 2)};\n`);
}

const {
  spaceId: space,
  deliveryToken: token,
  environmentId: environment,
} = readConfig();

if (!space || !token) {
  write(null);
  console.log("Contentful not configured — using the templates in templates.ts.");
  process.exit(0);
}

// Contentful returns asset links as protocol-relative URLs.
const assetUrl = (id, assets) => {
  const file = assets.get(id)?.fields?.file?.url;
  return file ? (file.startsWith("//") ? `https:${file}` : file) : undefined;
};

try {
  const url =
    `https://cdn.contentful.com/spaces/${space}/environments/${environment}/entries` +
    `?content_type=${CONTENT_TYPE_ID}&limit=1000&include=1`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

  const body = await res.json();
  const assets = new Map(
    (body.includes?.Asset ?? []).map((a) => [a.sys.id, a]),
  );

  const templates = (body.items ?? [])
    .map(({ fields: f }) => ({
      slug: f.slug,
      title: f.title,
      description: f.description,
      icon: f.icon ?? "",
      category: f.category,
      longDescription: f.longDescription,
      features: f.features ?? [],
      industries: f.industries ?? [],
      featured: f.featured ?? false,
      usesAI: f.usesAI ?? false,
      ...(typeof f.order === "number" ? { order: f.order } : {}),
      ...(f.image ? { image: assetUrl(f.image.sys.id, assets) } : {}),
      ...(f.images?.length
        ? {
            images: f.images
              .map((i) => assetUrl(i.sys.id, assets))
              .filter(Boolean),
          }
        : {}),
      ...(f.videoUrl ? { videoUrl: f.videoUrl } : {}),
    }))
    // A half-filled draft shouldn't take a slot in the gallery.
    .filter((t) => t.slug && t.title && t.description && t.category);

  if (!templates.length) {
    write(null);
    console.log("Contentful returned no published templates — keeping the local set.");
    process.exit(0);
  }

  write(templates);
  console.log(`Pulled ${templates.length} templates from Contentful.`);
} catch (error) {
  write(null);
  console.warn(
    `Contentful pull failed (${error.message}) — building with the local templates.`,
  );
}
