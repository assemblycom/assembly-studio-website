import Image from "next/image";
import { isOptimizedHost } from "@/lib/image-hosts";

const AVATAR = 24;

/** The author's own picture from Ghost. The feed carries none, so it is optional
 * everywhere it appears and the name simply stands on its own. */
export function AuthorAvatar({ image }: { image: string }) {
  return isOptimizedHost(image) ? (
    <Image
      src={image}
      alt=""
      width={AVATAR}
      height={AVATAR}
      className="size-6 shrink-0 rounded-full object-cover"
    />
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image}
      alt=""
      className="size-6 shrink-0 rounded-full object-cover"
    />
  );
}

/**
 * Who wrote a post and when, as the index's cards close on. The picture is the
 * author's own from Ghost; the feed carries no picture, so the name stands on
 * its own there rather than beside an empty circle.
 */
export function PostByline({
  author,
  image,
  date,
}: {
  author: string;
  image?: string;
  date: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="flex items-center gap-2.5">
        {image && <AuthorAvatar image={image} />}
        <span className="type-caption text-foreground">{author}</span>
      </span>
      <span className="type-caption shrink-0 text-muted-foreground">
        {date}
      </span>
    </div>
  );
}
