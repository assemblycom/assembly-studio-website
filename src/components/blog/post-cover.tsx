import Image from "next/image";
import { cn } from "@/lib/utils";
import { isOptimizedHost } from "@/lib/image-hosts";

/**
 * A post's cover: its Ghost feature image where it has one, and a set tile in
 * the site's own type where it doesn't, so a post without artwork still reads
 * as a card rather than a gap.
 */
// The three grounds the site already uses: the accent pair that swaps between
// themes, the near-black panel, and the plain surface. They rotate down the
// grid rather than mapping to a category, which would leave a run of identical
// tiles whenever one category was posting.
const GROUNDS = [
  "bg-[#D9ED92] text-[#111111] [[data-theme=dark]_&]:bg-[#7DA4FF]",
  // On the dark page the near-black tile would otherwise dissolve into the
  // background, so it keeps a hairline there and nothing changes in light.
  "bg-[#141414] text-[#FBFBF7] [[data-theme=dark]_&]:ring-1 [[data-theme=dark]_&]:ring-inset [[data-theme=dark]_&]:ring-white/12",
  "bg-muted text-foreground ring-1 ring-inset ring-border",
];

export function PostCover({
  title,
  image,
  tone = 0,
  large = false,
  sizes,
  className,
}: {
  title: string;
  image?: string;
  /** Position in the grid; picks which ground a fallback tile sits on. */
  tone?: number;
  large?: boolean;
  sizes?: string;
  className?: string;
}) {
  if (image) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-lg bg-muted",
          className,
        )}
      >
        {isOptimizedHost(image) ? (
          <Image
            src={image}
            alt=""
            fill
            sizes={sizes ?? "(min-width: 1024px) 380px, 100vw"}
            className="object-cover"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            loading="lazy"
            className="absolute inset-0 size-full object-cover"
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex overflow-hidden rounded-lg",
        large ? "p-8 md:p-10" : "p-6",
        GROUNDS[tone % GROUNDS.length],
        className,
      )}
    >
      <p
        className={cn(
          "max-w-[20ch] text-balance leading-[1.1] tracking-[-0.02em]",
          large ? "text-3xl md:text-4xl" : "text-xl",
        )}
      >
        {title}
      </p>
    </div>
  );
}
