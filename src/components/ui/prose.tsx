import { Fragment } from "react";
import Link from "next/link";

/** A paragraph or a list. Shared by the legal pages and the blog. */
export type ProseBlock =
  | { type: "p"; text: string }
  /** `ordered` lists are numbered in the source and cross-referenced by number. */
  | { type: "list"; ordered?: boolean; items: string[] };

// Inline markup the copy carries: **emphasis**, [label](href) links, and bare
// email addresses. Splitting on a capturing group leaves the captures at the
// odd indices, which is what each map below keys off.
const EMPHASIS = /\*\*(.+?)\*\*/g;
const LINK = /\[([^\]]+)\]\(([^)]+)\)/g;
const EMAIL = /([\w.+-]+@[\w-]+\.[\w.-]+)/g;

const LINK_CLASS =
  "text-foreground underline decoration-foreground/30 underline-offset-2 transition-colors hover:decoration-foreground";

/**
 * Emphasis is rendered as contrast, not weight: the body sits muted and the
 * emphasized runs sit at full foreground, so the page keeps a single type
 * weight throughout.
 */
export function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split(EMPHASIS).map((run, i) =>
        i % 2 === 1 ? (
          <em key={i} className="not-italic text-foreground">
            <Links text={run} />
          </em>
        ) : (
          <Fragment key={i}>
            <Links text={run} />
          </Fragment>
        ),
      )}
    </>
  );
}

function Links({ text }: { text: string }) {
  // split() with two capture groups yields [before, label, href, after, …].
  const parts = text.split(LINK);
  return (
    <>
      {parts.map((part, i) => {
        if (i % 3 === 1) {
          const href = parts[i + 1];
          return href.startsWith("/") ? (
            <Link key={i} href={href} className={LINK_CLASS}>
              <Inline text={part} />
            </Link>
          ) : (
            <a
              key={i}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={LINK_CLASS}
            >
              <Inline text={part} />
            </a>
          );
        }
        // The href that followed a label is consumed by the branch above.
        if (i % 3 === 2) return null;
        return <Emails key={i} text={part} />;
      })}
    </>
  );
}

function Emails({ text }: { text: string }) {
  return (
    <>
      {text.split(EMAIL).map((run, i) =>
        i % 2 === 1 ? (
          <a key={i} href={`mailto:${run}`} className={LINK_CLASS}>
            {run}
          </a>
        ) : (
          <Fragment key={i}>{run}</Fragment>
        ),
      )}
    </>
  );
}

export function Prose({ blocks }: { blocks: ProseBlock[] }) {
  return (
    <>
      {blocks.map((block, i) =>
        block.type === "p" ? (
          <p key={i} className="type-body mt-4 text-muted-foreground first:mt-0">
            <Inline text={block.text} />
          </p>
        ) : block.ordered ? (
          // The Terms number their clauses and cite them by number ("section
          // 2.1(2)"), so the marker is content there, not decoration.
          <ol key={i} className="mt-4 space-y-3 first:mt-0">
            {block.items.map((item, j) => (
              <li key={j} className="type-body relative pl-8 text-muted-foreground">
                <span className="absolute left-0 top-0 tabular-nums text-foreground/40">
                  {j + 1}.
                </span>
                <Inline text={item} />
              </li>
            ))}
          </ol>
        ) : (
          <ul key={i} className="mt-4 space-y-3 first:mt-0">
            {block.items.map((item, j) => (
              // A short rule instead of a bullet: the site uses hairlines as its
              // list marker elsewhere, and a dot reads heavier at this size.
              <li
                key={j}
                className="type-body relative pl-5 text-muted-foreground before:absolute before:left-0 before:top-[0.7em] before:h-px before:w-2.5 before:bg-foreground/25"
              >
                <Inline text={item} />
              </li>
            ))}
          </ul>
        ),
      )}
    </>
  );
}
