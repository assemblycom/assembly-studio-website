import {
  documentToReactComponents,
  type Options,
} from "@contentful/rich-text-react-renderer";
import { BLOCKS, INLINES, MARKS, type Document } from "@contentful/rich-text-types";

/**
 * Renders the "App Overview" rich-text field from Contentful.
 *
 * The field is one flexible document covering both "About this template" and
 * "What you can customize", so nothing here assumes a fixed structure — each
 * node type maps to the same classes the hand-written detail page used, and an
 * editor can add or reorder sections without a code change.
 */
const OPTIONS: Options = {
  renderMark: {
    [MARKS.BOLD]: (text) => <span className="font-medium">{text}</span>,
    [MARKS.ITALIC]: (text) => <em className="italic">{text}</em>,
    [MARKS.CODE]: (text) => (
      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em]">{text}</code>
    ),
  },
  renderNode: {
    // first:mt-0 so the opening "About this template" sits tight to the gallery.
    [BLOCKS.HEADING_2]: (_node, children) => (
      <h2 className="type-h3 mt-14 first:mt-0">{children}</h2>
    ),
    [BLOCKS.HEADING_3]: (_node, children) => (
      <h3 className="mt-12 text-lg font-medium md:mt-14">{children}</h3>
    ),
    [BLOCKS.HEADING_4]: (_node, children) => (
      <h4 className="mt-10 text-base font-medium">{children}</h4>
    ),
    [BLOCKS.PARAGRAPH]: (_node, children) => (
      <p className="mt-5 text-base leading-[1.75] text-foreground/80 first:mt-0 md:mt-6 md:text-[1.0625rem] md:leading-[1.85]">
        {children}
      </p>
    ),
    [BLOCKS.UL_LIST]: (_node, children) => (
      <ul className="mt-5 space-y-3">{children}</ul>
    ),
    [BLOCKS.OL_LIST]: (_node, children) => (
      <ol className="mt-5 list-decimal space-y-3 pl-5 marker:text-foreground/40">{children}</ol>
    ),
    // Rich text wraps every list item's text in a paragraph; [&_p]:!mt-0 stops
    // that inherited top margin from pushing the text off its bullet.
    [BLOCKS.LIST_ITEM]: (_node, children) => (
      <li className="flex items-start gap-3 [&_p]:!mt-0">
        <span className="mt-[0.7rem] size-1.5 shrink-0 rounded-full bg-foreground/40" />
        <span className="text-base leading-[1.7] text-foreground/80 md:text-[1.0625rem]">
          {children}
        </span>
      </li>
    ),
    [BLOCKS.QUOTE]: (_node, children) => (
      <blockquote className="my-8 border-l-2 border-border pl-6 text-foreground/80">
        {children}
      </blockquote>
    ),
    [BLOCKS.HR]: () => <hr className="my-10 border-border" />,
    [INLINES.HYPERLINK]: (node, children) => (
      <a
        href={(node.data as { uri: string }).uri}
        className="underline underline-offset-4 transition-colors hover:text-foreground"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
  },
};

export function TemplateOverview({ document }: { document: Document }) {
  return <>{documentToReactComponents(document, OPTIONS)}</>;
}
