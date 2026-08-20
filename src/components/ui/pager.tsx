import Link from "next/link";

// Pages either side of the current one before the run collapses to an ellipsis.
const PAGE_WINDOW = 1;

/**
 * The page numbers to render, with `null` standing in for a gap. First and last
 * are always present so the ends of the archive stay one click away.
 */
export function pageItems(
  current: number,
  total: number,
): (number | null)[] {
  const items: (number | null)[] = [];
  for (let page = 1; page <= total; page++) {
    const near = Math.abs(page - current) <= PAGE_WINDOW;
    if (page === 1 || page === total || near) {
      items.push(page);
    } else if (items[items.length - 1] !== null) {
      items.push(null);
    }
  }
  return items;
}

const STEP_CLS =
  "flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors";
const STEP_ENABLED =
  "hover:border-foreground/30 hover:text-foreground";
const STEP_DISABLED = "pointer-events-none opacity-30";

// inline-flex rather than a button's own text centring: the same class runs on
// an <a> in link mode, where h-9 alone would drop the figure to the top.
const NUM_CLS =
  "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2.5 text-sm transition-colors";
const NUM_CURRENT = "border-foreground bg-foreground text-background";
const NUM_REST =
  "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground";

function StepIcon({ direction }: { direction: "prev" | "next" }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={direction === "prev" ? "m14.5 5-7 7 7 7" : "m9.5 5 7 7-7 7"} />
    </svg>
  );
}

/**
 * One paginator, two archives. The blog's grid pages in the browser, so it
 * hands in `onSelect` and the controls are buttons; the changelog is rendered on
 * the server a page at a time, so it hands in `hrefFor` and the same controls
 * become links a reader can open in a tab or share. Numbering, the ellipsis, and
 * every class live here either way, so the two can't drift apart.
 */
export function Pager({
  current,
  total,
  label,
  hrefFor,
  onSelect,
}: {
  current: number;
  total: number;
  /** Names the archive being paged, for screen readers. */
  label: string;
  hrefFor?: (page: number) => string;
  onSelect?: (page: number) => void;
}) {
  if (total <= 1) return null;

  function step(direction: "prev" | "next") {
    const target = direction === "prev" ? current - 1 : current + 1;
    const disabled = direction === "prev" ? current === 1 : current === total;
    const aria = direction === "prev" ? "Previous page" : "Next page";
    // A dead end is not a control: at either end the step renders as a plain
    // span rather than a link to nowhere or a button that does nothing.
    if (disabled) {
      return (
        <span aria-hidden className={`${STEP_CLS} ${STEP_DISABLED}`}>
          <StepIcon direction={direction} />
        </span>
      );
    }
    return hrefFor ? (
      <Link
        href={hrefFor(target)}
        aria-label={aria}
        className={`${STEP_CLS} ${STEP_ENABLED}`}
      >
        <StepIcon direction={direction} />
      </Link>
    ) : (
      <button
        type="button"
        onClick={() => onSelect?.(target)}
        aria-label={aria}
        className={`${STEP_CLS} ${STEP_ENABLED}`}
      >
        <StepIcon direction={direction} />
      </button>
    );
  }

  return (
    <nav
      aria-label={label}
      className="mt-14 flex items-center justify-center gap-2"
    >
      {step("prev")}

      {pageItems(current, total).map((page, i) => {
        if (page === null) {
          return (
            <span
              key={`gap-${i}`}
              aria-hidden
              className="px-1 text-sm text-muted-foreground"
            >
              &hellip;
            </span>
          );
        }
        const cls = `${NUM_CLS} ${page === current ? NUM_CURRENT : NUM_REST}`;
        const aria = {
          "aria-label": `Page ${page}`,
          "aria-current": page === current ? ("page" as const) : undefined,
        };
        return hrefFor ? (
          <Link key={page} href={hrefFor(page)} className={cls} {...aria}>
            {page}
          </Link>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onSelect?.(page)}
            className={cls}
            {...aria}
          >
            {page}
          </button>
        );
      })}

      {step("next")}
    </nav>
  );
}

// The quiet outline button the site already uses for a secondary action (see the
// templates rail's "See all" and the gallery's reset), carrying the same chevron
// the numbered paginator's steps do.
// A square holding just the chevron on a phone, the label alone from sm. At 375px
// two labelled buttons either broke "Previous page" onto two lines inside its own
// pill or, held on one line, filled the row end to end; the chevron alone says
// the same thing in a control the thumb can still hit.
const STEP_BUTTON =
  "inline-flex size-9 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground sm:h-auto sm:w-auto sm:px-4 sm:py-1.5";
// The label the square drops. Hidden rather than absent so the markup carries it
// once; the link's own aria-label is what a screen reader reads either way.
const STEP_LABEL = "hidden sm:inline";
// The chevron is the phone-only stand-in for that label, so it leaves once the
// label arrives: a labelled button reads cleaner without a redundant arrow.
const STEP_ICON = "inline-flex sm:hidden";

/**
 * Previous/next only, no numbering — the changelog's paginator.
 *
 * A numbered run tells you WHERE you are in an archive, which is the useful
 * thing for the blog: you are hunting a post and the page number is a place to
 * come back to. A changelog is read as a single stream backwards through time,
 * and "page 11 of 17" is not a fact anyone needs; two steps say the only thing
 * that matters, that there is more behind this. Notion's releases page settles
 * on the same pair.
 *
 * The empty span holds the row's justification, so on the first page "Next page"
 * still sits at the right edge instead of sliding over to the left.
 */
export function PrevNextPager({
  current,
  total,
  label,
  hrefFor,
}: {
  current: number;
  total: number;
  label: string;
  hrefFor: (page: number) => string;
}) {
  if (total <= 1) return null;
  return (
    <nav
      aria-label={label}
      className="mt-16 flex items-center justify-between gap-3 md:mt-20"
    >
      {current > 1 ? (
        <Link
          href={hrefFor(current - 1)}
          aria-label="Previous page"
          className={STEP_BUTTON}
        >
          <span className={STEP_ICON}>
            <StepIcon direction="prev" />
          </span>
          <span className={STEP_LABEL}>Previous page</span>
        </Link>
      ) : (
        <span />
      )}
      {current < total ? (
        <Link
          href={hrefFor(current + 1)}
          aria-label="Next page"
          className={STEP_BUTTON}
        >
          <span className={STEP_LABEL}>Next page</span>
          <span className={STEP_ICON}>
            <StepIcon direction="next" />
          </span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
