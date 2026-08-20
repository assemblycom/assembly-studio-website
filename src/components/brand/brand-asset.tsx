import Image from "next/image";

export interface BrandAssetFile {
  /** Ground the artwork is drawn on, which is also what the download is for. */
  ground: "light" | "dark";
  src: string;
  width: number;
  height: number;
  /** Rendered width in the preview tile; the tile is a fixed height. */
  displayWidth: number;
}

export interface BrandAssetProps {
  title: string;
  description: string;
  files: BrandAssetFile[];
}

export function BrandAsset({ title, description, files }: BrandAssetProps) {
  return (
    <div className="grid gap-10 md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] md:gap-16">
      <div>
        <h2 className="type-h3">{title}</h2>
        <p className="type-body mt-4 text-muted-foreground">{description}</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {files.map((file) => (
          <div key={file.src}>
            <div
              className={`flex h-44 items-center justify-center rounded-xl px-6 ${
                file.ground === "light"
                  ? "border border-border bg-[#f5f5f0]"
                  // In dark mode the dark tile is all but the page ground, so it
                  // gets a hairline of its own. A ring, not a border, so it
                  // doesn't add the 1px the light tile's border does and throw
                  // the two tiles out of alignment. Light mode is untouched:
                  // there the dark tile is already its own shape on white.
                  : "bg-[#101010] [[data-theme=dark]_&]:ring-1 [[data-theme=dark]_&]:ring-inset [[data-theme=dark]_&]:ring-white/15"
              }`}
            >
              <Image
                src={file.src}
                alt={`${title}, ${file.ground} background`}
                width={file.width}
                height={file.height}
                style={{ width: file.displayWidth, height: "auto" }}
              />
            </div>
            <a
              href={file.src}
              download
              className="type-caption mt-3 inline-block text-muted-foreground underline decoration-foreground/25 underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground"
            >
              Download
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
