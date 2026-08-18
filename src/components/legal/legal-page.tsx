import { LegalDocumentBody, type LegalDocument } from "./legal-document";
import { LegalToc } from "./legal-toc";

/** Shared frame for every legal page: title block, contents rail, document. */
export function LegalPage({ document: doc }: { document: LegalDocument }) {
  return (
    <div className="mx-auto max-w-[1200px] px-6 pb-24 pt-16 md:px-10 md:pb-32 md:pt-24">
      <header className="max-w-[68ch]">
        <p className="type-caption text-muted-foreground">Legal</p>
        <h1 className="type-display mt-4 text-foreground">{doc.title}</h1>
        {doc.subtitle && (
          <p className="type-h4 mt-4 text-muted-foreground">{doc.subtitle}</p>
        )}
        <p className="type-caption mt-6 text-muted-foreground">
          {doc.effective && <>Effective {doc.effective} · </>}
          Last updated {doc.lastUpdated}
        </p>
      </header>

      {/* Contents rail sits left of the copy on desktop and above it on mobile,
          where a sticky column would eat the screen. */}
      <div className="mt-14 grid gap-12 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16">
        <LegalToc document={doc} />
        <LegalDocumentBody document={doc} />
      </div>
    </div>
  );
}
