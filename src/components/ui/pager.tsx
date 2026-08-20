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
