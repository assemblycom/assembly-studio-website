import { SIGNUP_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { PostCta as PostCtaContent } from "@/lib/ghost";

/**
 * The call to action a post's writer authored in Ghost, drawn as a card rather
 * than as a run of body text. It sits in the rail beside the article on a wide
 * screen and at the end of the post where there is no rail.
 */
export function PostCta({
  cta,
  className,
}: {
  cta: PostCtaContent;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "rounded-2xl bg-muted p-5",
        // The description is the writer's, so its length varies; the card holds
        // its shape by letting the text set the height and keeping the action
        // pinned to the full width beneath it.
        "flex flex-col",
        className,
      )}
    >
      {cta.title && (
        <p className="text-[1.0625rem] leading-[1.35] tracking-[-0.006em] text-foreground">
          {cta.title}
        </p>
      )}
      {cta.description && (
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {cta.description}
        </p>
      )}

      <a
        href={SIGNUP_URL}
        // The site's primary button, as the pricing and customers pages draw it.
        className="mt-5 block rounded-lg bg-foreground px-5 py-2 text-center text-sm text-background transition-opacity hover:opacity-90"
      >
        Try for free
      </a>
    </aside>
  );
}
