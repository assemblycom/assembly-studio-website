import { Prose, type ProseBlock } from "@/components/ui/prose";

/**
 * Reading measure for the legal pages, shared with the title block so the two
 * align on the same right edge.
 *
 * The blog's tuned value, not a `ch` count. `68ch` was the intent here before,
 * but `ch` is the width of a "0" — wider than the average character — so it
 * rendered 72 characters per line, past the point dense legal prose stays
 * comfortable. 40.5rem lands at ~67.
 */
export const LEGAL_MEASURE = "max-w-[40.5rem]";

/**
 * Section heading step for long-form documents, matching the blog's body
 * headings. The type scale jumps straight from type-h3 (30px) to type-h4 (18px),
 * and 30px is too loud set twenty times over a 15px body — it made the document
 * read as a stack of headlines. 26px with the leading and tracking tightened is
 * the step the blog already settled on for exactly this problem.
 *
 * Tracking is -0.02em, matching type-display and type-h2 rather than type-h3's
 * looser -0.015em: at 26px over a long document the tighter setting is what makes
 * the numbered titles read as titles instead of as large body text.
 *
 * Responsive, because the problem only exists at desktop: type-h3 is 22px on a
 * phone, which is right for a 40-character column, and jumps to 30px at md. So
 * the mobile step is kept and only the desktop one is brought down.
 *
 * Worth promoting to a real `type-*` class and adopting in the blog too, which
 * hand-writes these same values; kept local here rather than reworking the token
 * layer and another page in passing.
 */
const LONGFORM_HEADING =
  "text-[1.375rem] leading-[1.28] tracking-[-0.02em] md:text-[1.625rem] md:leading-[1.3]";

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
  /**
   * Short label for the contents list, where the full legal heading is too long
   * — "9. Your Data Protection Rights Under General Data Protection Regulation
   * (GDPR)" ran to three lines in a 14rem column. The document always renders
   * `title`; this only ever changes the nav. Same idea as FAQEntry.shortQuestion
   * and Differentiator.shortTitle elsewhere on the site.
   *
   * Optional: only the headings that actually need one carry it, and a short form
   * has to still mean the same thing.
   */
  shortTitle?: string;
  sections: LegalSection[];
}

export interface LegalSection {
  id: string;
  /** Null when a part opens with copy before its first subheading. */
  heading: string | null;
  /** Short contents-list label, for the titleless parts whose sections stand in
   *  for a part title in the nav. See LegalPart.shortTitle. */
  shortHeading?: string;
  blocks: LegalBlock[];
}

export type LegalBlock = ProseBlock;

// Lives here, not in legal-toc.tsx: that module is "use client", and a server
// component cannot call a function exported from a client module — the page
// needs this list too, to feed the phone's contents bar.
export interface TocEntry {
  id: string;
  label: string;
}

/**
 * Top-level entries only — one per numbered part, no sub-headings. Listing both
 * levels ran the privacy policy's contents to 34 lines for 21 parts, which is a
 * document in its own right rather than a way around one.
 *
 * A part with no title of its own is still represented, by its section headings:
 * one part of the AI policy is authored that way, and those headings are the only
 * label it has, so dropping every section would drop it from the list entirely.
 */
export function entriesFor(doc: LegalDocument): TocEntry[] {
  return doc.parts.flatMap((part) =>
    part.title
      ? [{ id: part.id, label: part.shortTitle ?? part.title }]
      : part.sections
          .filter((section) => section.heading)
          .map((section) => ({
            id: section.id,
            label: section.shortHeading ?? (section.heading as string),
          })),
  );
}

export function LegalDocumentBody({ document: doc }: { document: LegalDocument }) {
  return (
    <div className={LEGAL_MEASURE}>
      {doc.intro && doc.intro.length > 0 && (
        <div>
          <Prose blocks={doc.intro} />
        </div>
      )}

      {/* Space alone separates the parts — no rules anywhere in the document.
          That puts the whole burden of hierarchy on the gap, so it has to be
          unambiguous: 96px above a numbered part against 40px above a subsection
          inside one. A smaller gap without a rule read as though every heading
          sat at the same level.
          
          Both step down on a phone — 56px and 32px. 96px is a fine pause on a
          desktop column but a twelfth of a phone screen, which read as the
          document having ended. The ratio between the two is what carries the
          hierarchy, and it holds at either size. */}
      {doc.parts.map((part, i) => (
        // Keyed off the index, NOT Tailwind's `first:`. Two of these documents
        // open with an intro block, so the first <section> is not :first-child —
        // the intro div is — and a `first:` utility silently never reached it.
        // Only the very first part of a document with no intro skips the gap.
        <section
          key={part.id}
          id={part.id}
          className={`scroll-mt-28 ${
            i === 0 && !doc.intro?.length ? "" : "mt-14 md:mt-24"
          }`}
        >
          {part.title && (
            <h2 className={`${LONGFORM_HEADING} mb-6 text-foreground`}>
              {part.title}
            </h2>
          )}

          {part.sections.map((section, j) => (
            // Space binds a heading to the copy under it: the gap ABOVE a
            // subsection is clearly larger than the gap below its heading, where
            // before 32px above and 12px below left the heading floating between
            // two blocks.
            //
            // Indexed rather than `first:` for the same reason as the parts: the
            // part's <h2> is the real first child, so `first:pt-0` never reached
            // the opening subsection and it carried a full gap on top of the
            // heading's own margin.
            <div
              key={section.id}
              id={section.id}
              className={`scroll-mt-28 ${j === 0 ? "" : "pt-8 md:pt-10"}`}
            >
              {section.heading && (
                <h3 className="type-h4 mb-3 text-foreground">
                  {section.heading}
                </h3>
              )}
              <Prose blocks={section.blocks} />
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
