import { Fragment } from "react";
import Link from "next/link";

/**
 * Shape of a legal page copied over from assembly.com. The documents are
 * authored by Legal and mirrored here as data, so the page file stays a layout
 * and the copy stays reviewable as one object.
 */
export interface LegalDocument {
  title: string;
  /** The document's own title line, where it carries one under the page name. */
  subtitle?: string;
  /** Original effective date, for documents that state one. */
  effective?: string;
  /** As written on the source page, e.g. "08/07/2026". */
  lastUpdated: string;
  /** Copy that runs before the first numbered section. */
  intro?: LegalBlock[];
  parts: LegalPart[];
}

export interface LegalPart {
  id: string;
  /** Null for an opening group that runs straight into its first section. */
  title: string | null;
  sections: LegalSection[];
}

export interface LegalSection {
  id: string;
  /** Null when a part opens with copy before its first subheading. */
  heading: string | null;
  blocks: LegalBlock[];
}

export type LegalBlock =
  | { type: "p"; text: string }
  /** `ordered` lists are numbered in the source and cross-referenced by number. */
  | { type: "list"; ordered?: boolean; items: string[] };

// Inline markup carried over from the source pages: **emphasis**, [label](href)
// links, and bare email addresses. Splitting on a capturing group leaves the
// captures at the odd indices, which is what each map below keys off.
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
function Inline({ text }: { text: string }) {
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
          const internal = href.startsWith("/");
          return internal ? (
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

function Blocks({ blocks }: { blocks: LegalBlock[] }) {
  return (
    <>
      {blocks.map((block, i) =>
        block.type === "p" ? (
          <p key={i} className="type-body mt-4 text-muted-foreground first:mt-0">
            <Inline text={block.text} />
          </p>
        ) : block.ordered ? (
          // The Terms number their clauses and cite them by number ("section
          // 2.1(2)"), so the marker is content here, not decoration.
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
              // A short rule instead of a bullet — the site uses hairlines as
              // its list marker elsewhere, and a dot reads heavier at this size.
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

export function LegalDocumentBody({ document: doc }: { document: LegalDocument }) {
  return (
    <div className="max-w-[68ch]">
      {doc.intro && doc.intro.length > 0 && (
        <div className="border-b border-border pb-10 [[data-theme=dark]_&]:border-[#383838]">
          <Blocks blocks={doc.intro} />
        </div>
      )}

      {doc.parts.map((part) => (
        <section key={part.id} id={part.id} className="scroll-mt-28 pt-12 first:pt-0">
          {part.title && (
            <h2 className="type-h3 mb-5 text-foreground">{part.title}</h2>
          )}

          {part.sections.map((section) => (
            <div
              key={section.id}
              id={section.id}
              className="scroll-mt-28 pt-8 first:pt-0"
            >
              {section.heading && (
                <h3 className="type-h4 mb-3 text-foreground">
                  {section.heading}
                </h3>
              )}
              <Blocks blocks={section.blocks} />
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
