import { TocMobile } from "@/components/ui/toc-mobile";
import {
  entriesFor,
  LegalDocumentBody,
  LEGAL_MEASURE,
  type LegalDocument,
} from "./legal-document";
import { LegalToc } from "./legal-toc";

/**
 * The site's tag pill, as the blog sets it above a post title — mono, uppercase,
 * tracked out on a muted fill, with its own dark-mode surface because `bg-muted`
 * alone is too close to the near-black ground there.
 *
 * Copied from the blog's category tag rather than restyled: "Legal" is the same
 * kind of label in the same position. (The pill is hand-written in three places
 * on the site with slight drift in size and tracking — worth pulling into one
 * component, but not while changing a different page.)
 */
const TAG_PILL =
  "rounded-sm bg-muted px-2.5 py-1 text-xs uppercase leading-none tracking-[0.06em] text-muted-foreground [font-family:var(--font-diatype-mono),ui-monospace,monospace] [[data-theme=dark]_&]:bg-white/[0.06]";

/** Shared frame for every legal page: title block, contents rail, document. */
export function LegalPage({ document: doc }: { document: LegalDocument }) {
  const entries = entriesFor(doc);

  return (
    <div className="mx-auto max-w-[1600px] px-6 pb-24 md:px-10 md:pb-32">
      {/* Centred title block over a centred document, with the contents list out
          in the left margin — the shape the long-form policy pages we compared
          against use. A two-column grid cannot do this: it puts the copy right of
          the page centre, so a centred title would sit off-axis from the text
          under it. So the document is centred on its own and the rail is taken out
          of the flow beside it. */}
      <header className={`mx-auto ${LEGAL_MEASURE} pt-16 text-center md:pt-24`}>
        {/* An inline pill inside a block paragraph, so the header's text-center
            centres it without the pill stretching the width of the column. */}
        <p>
          <span className={TAG_PILL}>Legal</span>
        </p>
        <h1 className="type-display mt-5 text-balance text-foreground">
          {doc.title}
        </h1>
        {doc.subtitle && (
          <p className="type-lead mx-auto mt-5 max-w-xl text-pretty text-muted-foreground">
            {doc.subtitle}
          </p>
        )}
        {/* The effective date alone. "Last updated" is still tracked in the
            document data — Legal maintains it — but it is not shown: two dates
            side by side asked the reader to work out which one mattered.
            
            The AI Policy is the exception, because it carries no effective date
            at all, and a legal page with no date on it is worse than one showing
            the wrong kind. Tabular figures so the digits line up. */}
        <p className="type-caption mt-6 tabular-nums text-muted-foreground">
          {doc.effective
            ? `Effective ${doc.effective}`
            : `Last updated ${doc.lastUpdated}`}
        </p>
      </header>

      {/* No rule between the title block and the document — space alone, which is
          how the rest of this page separates its parts now. */}
      <div className="relative mt-20">
        {/* Spans the document's full height so the sticky list inside it has that
            whole distance to travel. Hidden below lg: stacked above the copy, a
            twenty-one entry contents list was ~790px of links to scroll past
            before the document started. The phone gets the collapsing bar at the
            foot of this component instead — the pattern the blog posts already
            use. */}
        <div className="hidden lg:absolute lg:inset-y-0 lg:left-0 lg:block lg:w-56">
          <LegalToc document={doc} />
        </div>

        <div className={`legal-body mx-auto ${LEGAL_MEASURE}`}>
          <LegalDocumentBody document={doc} />
        </div>
      </div>

      {/* Phone only. A position indicator, not a menu: expandable={false}, so it
          names the part you are reading and cannot be opened. These documents run
          to twenty-one parts, and a dropdown holding all of them was a scrolling
          list inside a scrolling document. The blog keeps its expanding version,
          where the lists are short. */}
      {entries.length > 1 && (
        <TocMobile
          headings={entries.map((entry) => ({ id: entry.id, text: entry.label }))}
          bodySelector=".legal-body"
          id="legal-toc-mobile"
          expandable={false}
        />
      )}
    </div>
  );
}
