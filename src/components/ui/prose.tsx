import { Fragment } from "react";
import Link from "next/link";

/**
 * A paragraph or a list. Used only by the legal pages — the blog renders Ghost's
 * own HTML and never imported this, despite what the note here used to claim.
 * So the type and spacing below are tuned for dense legal prose and moving them
 * affects nothing else.
 */

/**
 * The reading step for legal copy: one size up from type-body, with more leading.
 *
 * These documents are read start-to-finish rather than scanned, and 15px on a
 * 1.6 leading is the site's UI body step, not a step meant for thousands of words
 * of it. 16px at 1.7 is the ratio the long-form policy pages we compared against
 * use, and on the 40.5rem column it lands near 63 characters a line.
 */
const READING = "text-[0.9375rem] leading-[1.7] md:text-base md:leading-[1.7]";
export type ProseBlock =
  | { type: "p"; text: string }
  /** `ordered` lists are numbered in the source and cross-referenced by number. */
  | { type: "list"; ordered?: boolean; items: string[] };

// Inline markup the copy carries: **emphasis**, [label](href) links, and bare
// email addresses. Splitting on a capturing group leaves the captures at the
// odd indices, which is what each map below keys off.
const EMPHASIS = /\*\*(.+?)\*\*/g;
const LINK = /\[([^\]]+)\]\(([^)]+)\)/g;
/**
 * A bare URL or email address sitting in the copy, linked automatically. The
 * privacy policy carries nineteen bare URLs — every third-party processor's
 * policy is cited as a raw address — and they were rendering as plain text.
 *
 * One alternation rather than two passes so a match can't be split across both.
 * The URL half stops before trailing sentence punctuation, because the copy
 * writes them mid-sentence ("…segment.com/legal/privacy/." and
 * "…aboutads.info/choices/,"), while keeping a trailing slash, which is part of
 * the address. Brackets are excluded so a parenthesised URL doesn't swallow its
 * closing paren.
 *
 * The email half has to end on an alphanumeric for the same reason, and did not
 * before: "contact us at support@assembly.com." produced a mailto ending in a
 * full stop, on three of the four addresses in these documents.
 */
const AUTOLINK =
  /(https?:\/\/[^\s<>()]+[^\s<>().,;:!?]|[\w.+-]+@[\w-]+\.[\w.-]*[a-zA-Z0-9])/g;

// Same colour as the copy around it — the underline is the whole signal, which is
// how the reference pages set inline links too.
// skip-ink is off: the browser's default breaks the underline around every
// descender, and these labels are full of them ("Assembly's AI Policy & Data
// Handling page" breaks at the y, y, g and p), which reads as a dashed rule
// rather than an underline. The 2px offset already keeps it clear of the letters.
const LINK_CLASS =
  "break-words text-foreground underline decoration-foreground/40 underline-offset-2 [text-decoration-skip-ink:none] transition-colors hover:decoration-foreground";

/**
 * Emphasis is weight, not colour.
 *
 * It used to be the reverse: body copy sat at muted grey and emphasised runs went
 * to full foreground. That kept one type weight on the page, but it meant the
 * colour changed mid-sentence — "**Service** means the…" started near-black and
 * dropped to grey — and a document this long switched back and forth constantly.
 * The long-form policy pages we compared against set every word of body copy,
 * every list item, every heading and every link in ONE colour and lean on weight
 * and underline for hierarchy.
 *
 * 500 rather than the 700 those pages use, because this site's type scale stops
 * at medium and never goes bold.
 */
/**
 * One run of copy, with the inline markup the documents carry: [label](href)
 * links, **emphasis**, and bare URLs and email addresses.
 *
 * Links are matched FIRST, and the order is load-bearing. The copy writes its
 * links as "[**Assembly's AI Policy & Data Handling page**](/legal/ai-policy)" —
 * emphasis markers INSIDE the label — so splitting on emphasis first tore the
 * link apart, leaving one run holding "[", another holding the label, and a third
 * holding "](/legal/ai-policy)". Neither half matched the link pattern any more,
 * so the page printed the raw markdown.
 */
export function Inline({ text }: { text: string }) {
  // split() with two capture groups yields [before, label, href, after, …].
  const parts = text.split(LINK);
  return (
    <>
      {parts.map((part, i) => {
        if (i % 3 === 1) {
          const href = parts[i + 1];
          const label = <Emphasis text={part} />;
          return href.startsWith("/") ? (
            <Link key={i} href={href} className={LINK_CLASS}>
              {label}
            </Link>
          ) : (
            <a
              key={i}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={LINK_CLASS}
            >
              {label}
            </a>
          );
        }
        // The href that followed a label is consumed by the branch above.
        if (i % 3 === 2) return null;
        return <Emphasis key={i} text={part} />;
      })}
    </>
  );
}

function Emphasis({ text }: { text: string }) {
  return (
    <>
      {text.split(EMPHASIS).map((run, i) =>
        i % 2 === 1 ? (
          <em key={i} className="font-medium not-italic">
            <Autolink text={run} />
          </em>
        ) : (
          <Fragment key={i}>
            <Autolink text={run} />
          </Fragment>
        ),
      )}
    </>
  );
}

/**
 * How a bare URL is DISPLAYED. The href is always the full address — only the
 * label is shortened.
 *
 * These documents cite third-party policies as raw URLs, and the long ones broke
 * across two lines mid-token on a phone ("https://eur-" / "lex.europa.eu/…"),
 * which reads as a hyphenated word rather than an address. The scheme and "www."
 * carry no information, so they go first; anything still too long for a ~40
 * character column is cut back to its host, since a deep path like
 * "/help/164968693837950" is not something anyone reads.
 */
const MAX_URL_LABEL = 32;

function displayUrl(url: string): string {
  const bare = url.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
  if (bare.length <= MAX_URL_LABEL) return bare;
  const host = bare.split("/")[0];
  return `${host}/\u2026`;
}

function Autolink({ text }: { text: string }) {
  return (
    <>
      {text.split(AUTOLINK).map((run, i) => {
        if (i % 2 === 0) return <Fragment key={i}>{run}</Fragment>;
        // Tested on the scheme, not on "@": a URL can contain one.
        const isUrl = /^https?:\/\//.test(run);
        return (
          <a
            key={i}
            href={isUrl ? run : `mailto:${run}`}
            // The full address on hover and to assistive tech, since the visible
            // label may be shortened.
            {...(isUrl
              ? { target: "_blank", rel: "noopener noreferrer", title: run }
              : {})}
            className={LINK_CLASS}
          >
            {isUrl ? displayUrl(run) : run}
          </a>
        );
      })}
    </>
  );
}

export function Prose({ blocks }: { blocks: ProseBlock[] }) {
  return (
    <>
      {blocks.map((block, i) =>
        block.type === "p" ? (
          <p key={i} className={`${READING} mt-5 text-foreground first:mt-0`}>
            <Inline text={block.text} />
          </p>
        ) : block.ordered ? (
          // The Terms number their clauses and cite them by number ("section
          // 2.1(2)"), so the marker is content there, not decoration.
          <ol key={i} className="mt-5 space-y-4 first:mt-0">
            {block.items.map((item, j) => (
              <li key={j} className={`${READING} relative pl-8 text-foreground`}>
                {/* Right-aligned in a fixed column so the periods line up: the
                    Terms run to eleven clauses in a list, and left-aligned "1."
                    and "11." put their periods in different places. Held at the
                    body's own colour rather than a faint tint — these numbers are
                    cited in the text ("section 2.1(2)"), so they are content.
                    pl-8 leaves room for two digits. */}
                <span className="absolute left-0 top-0 w-6 text-right tabular-nums text-foreground">
                  {j + 1}.
                </span>
                <Inline text={item} />
              </li>
            ))}
          </ol>
        ) : (
          // Real disc bullets via list-style, not the hairline rule the rest of
          // the site uses as a list marker. A hairline reads as an em dash at the
          // head of a sentence, which is a problem specific to these documents:
          // their items are full sentences, and several begin with a bold lead-in,
          // so "— What personal information we have about you." looked like
          // punctuation inside the clause rather than a marker beside it.
          // list-outside keeps the marker in the padding so wrapped lines hang.
          <ul
            key={i}
            className="mt-5 list-disc space-y-4 pl-[1.375rem] first:mt-0 marker:text-foreground"
          >
            {block.items.map((item, j) => (
              <li key={j} className={`${READING} pl-1 text-foreground`}>
                <Inline text={item} />
              </li>
            ))}
          </ul>
        ),
      )}
    </>
  );
}
