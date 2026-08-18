import { Prose, type ProseBlock } from "@/components/ui/prose";

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

export type LegalBlock = ProseBlock;

export function LegalDocumentBody({ document: doc }: { document: LegalDocument }) {
  return (
    <div className="max-w-[68ch]">
      {doc.intro && doc.intro.length > 0 && (
        <div className="border-b border-border pb-10 [[data-theme=dark]_&]:border-[#383838]">
          <Prose blocks={doc.intro} />
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
              <Prose blocks={section.blocks} />
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
