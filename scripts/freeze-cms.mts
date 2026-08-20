/**
 * Freezes a family of Contentful-backed pages into a committed TypeScript
 * module, and brings its imagery into public/images/cms on the way.
 *
 * Run once per family, by hand, when the copy in the CMS is the copy we want to
 * keep. Nothing on the site calls this — the frozen module is the source from
 * then on, and the CMS is out of the loop for everything but /templates.
 *
 *   npx tsx --env-file=.env.local scripts/freeze-cms.mts features
 *   npx tsx --env-file=.env.local scripts/freeze-cms.mts            # every family
 *
 * The one thing it does beyond serialising: a URL that equals one of the site's
 * link constants is emitted as that identifier rather than as its value, so a
 * frozen page still follows a change to the signup or demo URL.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  APP_URL,
  DEMO_URL,
  GUIDE_URL,
  LOGIN_URL,
  SIGNUP_URL,
  TRUST_CENTER_URL,
} from "../src/lib/constants.ts";

const ROOT = process.cwd();
const ASSET_DIR = join(ROOT, "public", "images", "cms");
const ASSET_ROUTE = "/images/cms";
const CONTENTFUL_IMAGE_HOST = "images.ctfassets.net";
/**
 * Assets come down through Contentful's image API rather than as originals. The
 * CMS holds print-scale PNGs — the widest page banner is 2478px and 2.8 MB —
 * and the site never renders one above ~1120 CSS px, so the originals would put
 * tens of megabytes of pixels nobody sees into the repo. At this width and
 * format they are a seventeenth of the size and identical on screen, which is
 * roughly what next/image was already serving from them.
 *
 * SVGs are passed through untouched: the image API does not transform them, and
 * they are already the smallest thing on the page.
 */
const MAX_ASSET_WIDTH = 2400;
const ASSET_TRANSFORM = `fm=webp&w=${MAX_ASSET_WIDTH}&q=82`;

/** Emitted as identifiers, so the frozen copy follows the real link. */
const LINK_CONSTANTS: Record<string, string> = {
  SIGNUP_URL,
  DEMO_URL,
  GUIDE_URL,
  TRUST_CENTER_URL,
  APP_URL,
  LOGIN_URL,
};

type Family = {
  /** Reads the family from Contentful, mapped to the site's own types. */
  read: () => Promise<unknown>;
  /** Written to src/lib. */
  file: string;
  /** The exported binding the site imports. */
  binding: string;
  /** Its type, and the import line that names it. */
  type: string;
  typeImport: string;
  /** What the header calls this set. */
  label: string;
  /**
   * Set for a family whose bodies are Contentful rich text. Those documents are
   * typed with enums (BLOCKS.PARAGRAPH), and a JSON literal's "paragraph"
   * widens to string, so the annotation alone will not compile. The shape is
   * the CMS's own and is not hand-written, so it is asserted rather than
   * restated node by node.
   */
  richText?: boolean;
};

const FAMILIES: Record<string, Family> = {
  features: {
    read: async () => (await import("../src/lib/features.ts")).getFeaturePages(),
    file: "features.frozen.ts",
    binding: "FROZEN_FEATURES",
    type: "CmsPage[]",
    typeImport: 'import type { CmsPage } from "./cms-page";',
    label: "the top-level feature pages",
  },
  solutions: {
    read: async () => (await import("../src/lib/solutions.ts")).getSolutions(),
    file: "solutions.frozen.ts",
    binding: "FROZEN_SOLUTIONS",
    type: "CmsPage[]",
    typeImport: 'import type { CmsPage } from "./cms-page";',
    label: "the /solutions pages",
  },
  comparisons: {
    read: async () =>
      (await import("../src/lib/comparisons.ts")).getComparisons(),
    file: "comparisons.frozen.ts",
    binding: "FROZEN_COMPARISONS",
    type: "ComparisonPage[]",
    typeImport: 'import type { ComparisonPage } from "./comparisons";',
    label: "the /comparison detail pages",
  },
  comparisonIndex: {
    read: async () =>
      (await import("../src/lib/comparisons.ts")).getComparisonIndex(),
    file: "comparison-index.frozen.ts",
    binding: "FROZEN_COMPARISON_INDEX",
    type: "ComparisonIndex",
    typeImport: 'import type { ComparisonIndex } from "./comparisons";',
    label: "the /comparison index",
  },
  definitions: {
    read: async () =>
      (await import("../src/lib/definitions.ts")).getDefinitions(),
    file: "definitions.frozen.ts",
    binding: "FROZEN_DEFINITIONS",
    type: "Definition[]",
    typeImport: 'import type { Definition } from "./definitions";',
    label: "the glossary definitions",
    richText: true,
  },
  jobListings: {
    read: async () => (await import("../src/lib/careers.ts")).getJobListings(),
    file: "job-listings.frozen.ts",
    binding: "FROZEN_JOB_LISTINGS",
    type: "JobListing[]",
    typeImport: 'import type { JobListing } from "./careers";',
    label: "the job listings",
    richText: true,
  },
  careersPage: {
    read: async () => (await import("../src/lib/careers.ts")).getCareersPage(),
    file: "careers-page.frozen.ts",
    binding: "FROZEN_CAREERS_PAGE",
    type: "CareersPage",
    typeImport: 'import type { CareersPage } from "./careers";',
    label: "the /jobs page",
  },
  team: {
    read: async () => (await import("../src/lib/team-profiles.ts")).getTeam(),
    file: "team.frozen.ts",
    binding: "FROZEN_TEAM",
    type: "TeamProfile[]",
    typeImport: 'import type { TeamProfile } from "./team-profiles";',
    label: "the team profiles",
  },
};

function isContentfulImage(value: unknown): value is string {
  return typeof value === "string" && value.includes(CONTENTFUL_IMAGE_HOST);
}

function isSvg(url: string): boolean {
  return new URL(url).pathname.toLowerCase().endsWith(".svg");
}

/**
 * A stable local name for a Contentful asset. Their URLs are
 * /<space>/<assetId>/<revision>/<filename>: the id is what identifies the
 * asset, and the filename is what makes the directory readable, so the local
 * name carries both. Two assets sharing a filename can't collide.
 */
function localName(url: string): string {
  const { pathname } = new URL(url);
  const parts = pathname.split("/").filter(Boolean);
  const id = parts.at(-3) ?? "asset";
  const file = decodeURIComponent(parts.at(-1) ?? "asset");
  const safe = file.replace(/[^a-zA-Z0-9._-]+/g, "-").toLowerCase();
  return isSvg(url) ? `${id}-${safe}` : `${id}-${safe.replace(/\.[^.]+$/, "")}.webp`;
}

const downloaded = new Map<string, string>();

async function localise(url: string): Promise<{ path: string; bytes: number }> {
  const name = localName(url);
  const path = `${ASSET_ROUTE}/${name}`;
  if (downloaded.has(url)) return { path, bytes: 0 };

  const source = isSvg(url)
    ? url
    : `${url}${url.includes("?") ? "&" : "?"}${ASSET_TRANSFORM}`;
  const res = await fetch(source);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${source}`);
  const body = Buffer.from(await res.arrayBuffer());
  await writeFile(join(ASSET_DIR, name), body);
  downloaded.set(url, path);
  return { path, bytes: body.byteLength };
}

/**
 * Walks the tree, pulling every asset local. An image node carries its own
 * intrinsic size for next/image, so where the download was narrowed the stored
 * dimensions are narrowed with it — the ratio is what the frame is built from,
 * and a width the file does not have is a lie the layout would inherit.
 */
async function localiseAssets(value: unknown): Promise<number> {
  if (Array.isArray(value)) {
    let bytes = 0;
    for (const item of value) bytes += await localiseAssets(item);
    return bytes;
  }
  if (!value || typeof value !== "object") return 0;

  const node = value as Record<string, unknown>;
  let bytes = 0;
  for (const [key, child] of Object.entries(node)) {
    if (isContentfulImage(child)) {
      const { path, bytes: written } = await localise(child);
      node[key] = path;
      bytes += written;
      const width = node.width;
      const height = node.height;
      if (
        !isSvg(child) &&
        typeof width === "number" &&
        typeof height === "number" &&
        width > MAX_ASSET_WIDTH
      ) {
        node.width = MAX_ASSET_WIDTH;
        node.height = Math.round((height * MAX_ASSET_WIDTH) / width);
      }
    } else {
      bytes += await localiseAssets(child);
    }
  }
  return bytes;
}

/** JSON, then the two edits that make it read as source rather than as data. */
function serialise(value: unknown): string {
  let out = JSON.stringify(value, null, 2);
  for (const [name, href] of Object.entries(LINK_CONSTANTS)) {
    out = out.split(JSON.stringify(href)).join(name);
  }
  return out;
}

function header(family: Family, count: number, usedConstants: string[]): string {
  const constants = usedConstants.length
    ? `import {\n${usedConstants.map((c) => `  ${c},`).join("\n")}\n} from "./constants";\n`
    : "";
  return `// ${count} frozen pages: ${family.label}, as Contentful held them the day
// they were taken out of it. This file IS the source — there is no CMS read
// behind it any more, so a copy change is an edit here and a deploy.
//
// Generated by scripts/freeze-cms.mts. Regenerating overwrites hand edits, so
// once you start editing the copy here, stop regenerating: the CMS entries are
// no longer maintained. Imagery lives in public${ASSET_ROUTE}, downloaded with it.
${family.typeImport}
${constants}`;
}

async function freeze(key: string, family: Family) {
  const data = await family.read();
  const pages = Array.isArray(data) ? data : [data];
  if (!pages.length) throw new Error(`${key}: the CMS returned nothing`);

  await mkdir(ASSET_DIR, { recursive: true });
  const before = downloaded.size;
  const bytes = await localiseAssets(data);

  const body = serialise(data);
  const used = Object.keys(LINK_CONSTANTS).filter((name) =>
    new RegExp(`\\b${name}\\b`).test(body),
  );
  const source = family.richText
    ? `${header(family, pages.length, used)}
export const ${family.binding} = ${body} as unknown as ${family.type};
`
    : `${header(family, pages.length, used)}
export const ${family.binding}: ${family.type} = ${body};
`;
  await writeFile(join(ROOT, "src", "lib", family.file), source);

  const mb = (bytes / 1024 / 1024).toFixed(1);
  console.log(
    `${key}: ${pages.length} pages, ${downloaded.size - before} assets (${mb} MB) -> src/lib/${family.file}`,
  );
}

const requested = process.argv.slice(2);
const keys = requested.length ? requested : Object.keys(FAMILIES);
for (const key of keys) {
  const family = FAMILIES[key];
  if (!family) throw new Error(`unknown family "${key}"`);
  await freeze(key, family);
}
