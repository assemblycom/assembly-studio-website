import { SIGNUP_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { PostCta as PostCtaContent } from "@/lib/ghost";

// Our G2 rating, shown as the blog's call to action does on www.assembly.com.
// Update both together — the stars are drawn from the score.
const G2_RATING = 4.9;
const STARS = 5;

/**
 * The card is a compact aside, and these descriptions run to a paragraph. The
 * opening sentence carries the offer; the rest is usually a "get early access"
 * line the button already says.
 */
function opening(description: string): string {
  return description.match(/^[\s\S]*?[.!?](?=\s|$)/)?.[0] ?? description;
}

function Star({ half = false }: { half?: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 19"
      fill="none"
      aria-hidden
      className="text-foreground"
    >
      <path
        fill="currentColor"
        d={
          half
            ? "M9 13.518c.327 0 .651.075.95.23l2.433 1.24-.425-2.7a2.099 2.099 0 0 1 .585-1.806l1.93-1.934-2.698-.428a2.097 2.097 0 0 1-1.538-1.116L8.994 4.57v8.951L9 13.518Zm5.54 4.43a.786.786 0 0 1-.819.065l-4.72-2.401-4.722 2.401a.786.786 0 0 1-1.132-.824l.825-5.232L.229 8.211a.783.783 0 0 1-.19-.798.782.782 0 0 1 .625-.533l5.231-.831L8.303 1.33a.79.79 0 0 1 .7-.429.79.79 0 0 1 .7.429l2.402 4.718 5.232.83a.787.787 0 0 1 .435 1.332l-3.746 3.746.827 5.232a.788.788 0 0 1-.314.759Z"
            : "M9.703 1.33a.79.79 0 0 0-.7-.428.79.79 0 0 0-.7.428L5.895 6.048.663 6.88a.787.787 0 0 0-.435 1.332l3.743 3.746-.824 5.231a.788.788 0 0 0 1.132.825l4.724-2.402 4.721 2.402a.786.786 0 0 0 1.132-.825l-.828-5.231 3.743-3.746a.783.783 0 0 0 .19-.798.782.782 0 0 0-.625-.534l-5.228-.83L9.703 1.33Z"
        }
      />
    </svg>
  );
}

function G2Mark() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 21 21"
      fill="none"
      aria-hidden
      className="shrink-0 text-foreground"
    >
      <g fill="currentColor">
        <path d="M17.661 6.795h-2.988c.08-.47.37-.731.957-1.03l.551-.28c.984-.505 1.508-1.074 1.508-2.004 0-.587-.226-1.047-.678-1.383-.442-.333-.983-.495-1.607-.495-.498 0-.948.126-1.363.388-.407.253-.713.579-.903.984l.867.867c.334-.677.822-1.011 1.463-1.011.542 0 .875.28.875.667 0 .326-.162.597-.785.913l-.352.172c-.768.389-1.3.83-1.608 1.337-.306.495-.46 1.137-.46 1.905v.208h4.525V6.795h-.002ZM17.263 9.464h-4.95L9.84 13.75h4.95l2.474 4.286 2.474-4.286-2.474-4.286Z" />
        <path d="M10.266 16.606A5.721 5.721 0 0 1 4.55 10.89a5.721 5.721 0 0 1 5.716-5.715l1.956-4.095a10.094 10.094 0 0 0-1.956-.191c-5.523 0-10 4.477-10 10 0 5.522 4.477 10 10 10a9.96 9.96 0 0 0 5.89-1.919l-2.166-3.753a5.678 5.678 0 0 1-3.724 1.389Z" />
      </g>
    </svg>
  );
}

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
  const filled = Math.floor(G2_RATING);

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
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
          {opening(cta.description)}
        </p>
      )}

      <div className="mt-5 flex items-center gap-3">
        <G2Mark />
        <div className="flex items-center gap-0.5">
          {Array.from({ length: STARS }, (_, index) => (
            <Star key={index} half={index >= filled} />
          ))}
        </div>
        <span className="text-sm text-muted-foreground">
          {G2_RATING} rating
        </span>
      </div>

      <a
        href={SIGNUP_URL}
        // The site's primary button, as the pricing and customers pages draw it.
        className="mt-5 block rounded-lg bg-foreground px-5 py-2.5 text-center text-sm text-background transition-opacity hover:opacity-90"
      >
        Try for free
      </a>
    </aside>
  );
}
