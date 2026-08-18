import type { Metadata } from "next";
import { GridDivider, GridRails } from "@/components/ui/grid-lines";
import {
  BrandAsset,
  type BrandAssetProps,
} from "@/components/brand/brand-asset";
import {
  BrandColorCard,
  type BrandColor,
} from "@/components/brand/brand-color";
import { PAGE_SEO, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(PAGE_SEO.brand);

const ASSETS_ZIP = "/images/brand/Assembly_Brand_Assets.zip";

const ASSETS: BrandAssetProps[] = [
  {
    title: "Logo wordmark",
    description:
      "The logo serves as the primary brand signifier. It is the cornerstone of our brand identity and anchors our visual identity in all communications.",
    files: [
      {
        ground: "light",
        src: "/images/brand/assembly-logo-light.png",
        width: 624,
        height: 128,
        displayWidth: 200,
      },
      {
        ground: "dark",
        src: "/images/brand/assembly-logo-dark.png",
        width: 624,
        height: 128,
        displayWidth: 200,
      },
    ],
  },
  {
    title: "Logo",
    description:
      "When referring to Assembly as a company, such as on social media, or where a chip design is required, it is acceptable to use this stylized icon with an appropriate corner radius.",
    files: [
      {
        ground: "light",
        src: "/images/brand/assembly-logo-small-light.png",
        width: 128,
        height: 128,
        displayWidth: 64,
      },
      {
        ground: "dark",
        src: "/images/brand/assembly-logo-small-dark.png",
        width: 128,
        height: 128,
        displayWidth: 64,
      },
    ],
  },
];

// The palette the site actually renders: the lime and the periwinkle carry every
// accent moment (hero composer ring, aurora, data marks), so they are the pair
// documented here rather than the blue the main site was built on.
const COLORS: BrandColor[] = [
  { name: "Off-black", rgb: "RGB 16, 16, 16", hex: "#101010", ink: "#ffffff" },
  {
    name: "Assembly lime",
    rgb: "RGB 217, 237, 146",
    hex: "#D9ED92",
    ink: "#262626",
    outlined: true,
  },
  {
    name: "Assembly periwinkle",
    rgb: "RGB 125, 164, 255",
    hex: "#7DA4FF",
    ink: "#101010",
  },
];

export default function BrandPage() {
  return (
    <>
      {/* Hero — the centered lede the Templates and Security pages use. */}
      <section className="px-6 pb-16 pt-24 text-center md:pb-24 md:pt-32">
        <div className="mx-auto max-w-3xl">
          <h1 className="type-display text-balance">Brand guidelines</h1>
          <p className="type-lead mx-auto mt-6 max-w-2xl text-pretty text-muted-foreground">
            Resources for presenting the Assembly brand consistently and
            professionally.
          </p>
          <div className="mt-8">
            <a
              href={ASSETS_ZIP}
              download
              className="inline-block rounded-lg bg-foreground px-5 py-2.5 text-sm text-background transition-opacity hover:opacity-90"
            >
              Download brand assets
            </a>
          </div>
        </div>
      </section>

      <div className="relative">
        <GridRails />
        <div className="border-t border-border [[data-theme=dark]_&]:border-[#383838]" />

        {/* Introduction and naming share a section: both are prose, and a rule
            between two short paragraphs read as more structure than they carry. */}
        <section className="mx-auto max-w-[1200px] px-6 pb-20 pt-16 md:px-10 md:pb-28 md:pt-24">
          <div className="grid gap-10 md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] md:gap-16">
            <h2 className="type-h3 md:self-start">Introduction</h2>
            <div className="max-w-2xl">
              <p className="type-body text-muted-foreground">
                Our brand strategy guides everything we do. It clarifies our
                purpose, who we serve, and how we stand apart, while reflecting
                the essence of our brand.
              </p>
            </div>
          </div>

          <div className="mt-16 grid gap-10 md:mt-24 md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] md:gap-16">
            <h2 className="type-h3 md:self-start">Naming</h2>
            <div className="max-w-2xl">
              <p className="type-body text-muted-foreground">
                &ldquo;Assembly&rdquo; is a single word that is always spelled
                with a capital &ldquo;A&rdquo;, lowercase &ldquo;s&rdquo;, and
                without a dash. It is the brand name of our company and product.
                The company legal name is Assembly Platforms Inc. On social
                media, you can refer to us with #Assembly.
              </p>
              <p className="type-body mt-4 text-muted-foreground">
                We aim to maintain clear space around the logo to ensure
                visibility and impact. This space prevents any elements from
                crowding the logo, allowing it to stand out and be easily
                recognisable. The clear space enhances legibility and preserves
                the integrity of the design across different applications.
              </p>
            </div>
          </div>
        </section>

        <GridDivider />

        {/* Logo assets — one row per mark, each with its light and dark file. */}
        <section className="mx-auto max-w-[1200px] px-6 pb-20 pt-16 md:px-10 md:pb-28 md:pt-24">
          <div className="space-y-16 md:space-y-24">
            {ASSETS.map((asset) => (
              <BrandAsset key={asset.title} {...asset} />
            ))}
          </div>
        </section>

        <GridDivider />

        <section className="mx-auto max-w-[1200px] px-6 pb-20 pt-16 md:px-10 md:pb-28 md:pt-24">
          <div className="grid gap-10 md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] md:gap-16">
            <div className="md:self-start">
              <h2 className="type-h3">Colors</h2>
              <p className="type-body mt-4 text-muted-foreground">
                Off-black carries the type and the interface. The lime and the
                periwinkle are accents, used sparingly for emphasis and never as
                a page ground.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {COLORS.map((color) => (
                <BrandColorCard key={color.hex} color={color} />
              ))}
            </div>
          </div>
        </section>

        <GridDivider />
      </div>
    </>
  );
}
