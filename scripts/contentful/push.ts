// One-time migration: copies the templates committed in templates.ts up to
// Contentful so nobody retypes 27 entries.
//
//   npm run contentful:push          # create/update entries, then publish
//   npm run contentful:push -- --dry # print what it would do, change nothing
//
// Idempotent — entries are matched on slug within this site's own content type,
// so re-running updates in place and nothing belonging to the other site in the
// space is ever read or written.
import { createClient } from "contentful-management";
import { CONTENT_TYPE_ID } from "./model.mjs";
import { requireWriteConfig } from "./client.mjs";
import { LOCAL_TEMPLATES } from "../../src/lib/templates";

const dryRun = process.argv.includes("--dry");
const { spaceId, managementToken, environmentId } = requireWriteConfig();

// requireWriteConfig() exits when either is missing, which TypeScript can't see
// through the untyped .mjs helper.
const client = createClient(
  { accessToken: managementToken as string },
  { type: "plain", defaults: { spaceId: spaceId as string, environmentId } },
);

// Contentful stores every field per-locale.
const LOCALE = "en-US";
const localized = (value: unknown) => ({ [LOCALE]: value });

// `image`/`images` are deliberately not migrated: the committed ones are local
// paths under /public, and Contentful needs uploaded assets. Add those in the
// web app, on the entries that have real screenshots.
const toFields = (template: (typeof LOCAL_TEMPLATES)[number], order: number) => ({
  title: localized(template.title),
  slug: localized(template.slug),
  description: localized(template.description),
  longDescription: localized(template.longDescription),
  category: localized(template.category),
  features: localized(template.features),
  industries: localized(template.industries ?? []),
  featured: localized(Boolean(template.featured)),
  usesAI: localized(Boolean(template.usesAI)),
  // Seeded in tens from the current committed order, so the gallery looks
  // unchanged on the first pull and there's room to slot things between.
  order: localized(order),
  icon: localized(template.icon),
  ...(template.videoUrl ? { videoUrl: localized(template.videoUrl) } : {}),
});

async function main() {
  const existing = await client.entry.getMany({
    query: { content_type: CONTENT_TYPE_ID, limit: 1000 },
  });
  const bySlug = new Map(
    existing.items.map((entry) => [
      entry.fields.slug?.[LOCALE] as string,
      entry,
    ]),
  );

  console.log(
    `Space ${spaceId}, environment "${environmentId}" — ` +
      `${existing.items.length} existing ${CONTENT_TYPE_ID} entries.\n`,
  );

  let created = 0;
  let updated = 0;

  for (const [index, template] of LOCAL_TEMPLATES.entries()) {
    const fields = toFields(template, (index + 1) * 10);
    const found = bySlug.get(template.slug);

    if (dryRun) {
      console.log(`${found ? "update" : "create"}  ${template.slug}`);
      continue;
    }

    const saved = found
      ? await client.entry.update(
          { entryId: found.sys.id },
          { ...found, fields: { ...found.fields, ...fields } },
        )
      : await client.entry.create({ contentTypeId: CONTENT_TYPE_ID }, { fields });

    await client.entry.publish({ entryId: saved.sys.id }, saved);
    if (found) updated += 1;
    else created += 1;
    console.log(`${found ? "updated" : "created"}  ${template.slug}`);
  }

  console.log(
    dryRun
      ? `\nDry run — ${LOCAL_TEMPLATES.length} templates would be written.`
      : `\nDone: ${created} created, ${updated} updated. Next: npm run contentful:pull`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
