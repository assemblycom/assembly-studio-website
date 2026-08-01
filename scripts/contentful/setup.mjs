// Creates the "Assembly Studio — app template" content type in Contentful.
//
//   npm run contentful:setup
//
// Safe to re-run: it patches the type it created rather than making a second
// one. The space is shared with another site, so it will NOT touch a content
// type it doesn't recognise as its own — it stops and tells you instead.
//
// Needs CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN.
import { createClient } from "contentful-management";
import { CONTENT_TYPE, CONTENT_TYPE_ID, CONTENT_TYPE_NAME } from "./model.mjs";
import { requireWriteConfig } from "./client.mjs";

const { spaceId, managementToken, environmentId } = requireWriteConfig();

const client = createClient(
  { accessToken: managementToken },
  { type: "plain", defaults: { spaceId, environmentId } },
);

console.log(`Space ${spaceId}, environment "${environmentId}".`);

let existing = null;
try {
  existing = await client.contentType.get({ contentTypeId: CONTENT_TYPE_ID });
} catch {
  // Not there yet — the create path below handles it.
}

if (existing && existing.name !== CONTENT_TYPE_NAME) {
  console.error(
    `\nA content type "${CONTENT_TYPE_ID}" already exists in this space and is\n` +
      `named "${existing.name}", which isn't this site's.\n\n` +
      `Refusing to modify it — that model probably belongs to the other site\n` +
      `sharing this space. Point CONTENTFUL_ENVIRONMENT at an environment of\n` +
      `your own, or use a separate space.`,
  );
  process.exit(1);
}

const saved = existing
  ? await client.contentType.update(
      { contentTypeId: CONTENT_TYPE_ID },
      { ...existing, ...CONTENT_TYPE },
    )
  : await client.contentType.createWithId(
      { contentTypeId: CONTENT_TYPE_ID },
      CONTENT_TYPE,
    );

await client.contentType.publish({ contentTypeId: CONTENT_TYPE_ID }, saved);

console.log(
  `${existing ? "Updated" : "Created"} and published "${CONTENT_TYPE_ID}".\n` +
    "Next: npm run contentful:push",
);
