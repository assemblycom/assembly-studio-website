import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import {
  BLOCKS,
  INLINES,
  type Block,
  type Document,
  type Inline,
} from "@contentful/rich-text-types";
import type { ReactNode } from "react";

/**
 * Long-form Contentful rich text — job descriptions and the like.
 *
 * NOTE: two older call sites still carry their own copy of these options
 * (app/definitions/[slug] and components/templates/template-overview). They are
 * left alone here rather than refactored alongside a feature change; this is the
 * shared home for the next one, and those two should adopt it.
 */
const OPTIONS = {
  renderNode: {
    [BLOCKS.HEADING_2]: (_node: Block | Inline, children: ReactNode) => (
      <h2 className="type-h4 mt-12 text-foreground first:mt-0">{children}</h2>
    ),
    [BLOCKS.HEADING_3]: (_node: Block | Inline, children: ReactNode) => (
      <h3 className="type-h4 mt-10 text-foreground first:mt-0">{children}</h3>
    ),
    [BLOCKS.PARAGRAPH]: (_node: Block | Inline, children: ReactNode) => {
      // Entries separate paragraphs with empty ones; rendering those as real
      // paragraphs doubles every gap.
      const empty =
        Array.isArray(children) &&
        children.every((child) => typeof child === "string" && !child.trim());
      if (empty) return null;
      return (
        <p className="type-body mt-5 text-muted-foreground first:mt-0">
          {children}
        </p>
      );
    },
    [BLOCKS.UL_LIST]: (_node: Block | Inline, children: ReactNode) => (
      <ul className="mt-5 space-y-3">{children}</ul>
    ),
    [BLOCKS.OL_LIST]: (_node: Block | Inline, children: ReactNode) => (
      <ol className="mt-5 space-y-3">{children}</ol>
    ),
    // The site's list marker is a hairline, not a bullet — matching the glossary.
    // Rich text wraps each item's text in a paragraph, so that paragraph's top
    // margin is cleared or it pushes the text off its marker.
    [BLOCKS.LIST_ITEM]: (_node: Block | Inline, children: ReactNode) => (
      <li className="type-body relative pl-5 text-muted-foreground [&>p]:mt-0 before:absolute before:left-0 before:top-[0.7em] before:h-px before:w-2.5 before:bg-foreground/25">
        {children}
      </li>
    ),
    [BLOCKS.QUOTE]: (_node: Block | Inline, children: ReactNode) => (
      <blockquote className="my-8 border-l border-border pl-6 text-foreground [[data-theme=dark]_&]:border-[#383838]">
        {children}
      </blockquote>
    ),
    [BLOCKS.HR]: () => (
      <hr className="my-10 border-border [[data-theme=dark]_&]:border-[#383838]" />
    ),
    [INLINES.HYPERLINK]: (node: Block | Inline, children: ReactNode) => {
      const uri = (node.data as { uri?: string }).uri ?? "";
      const external = /^https?:\/\//.test(uri);
      return (
        <a
          href={uri}
          {...(external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          className="text-foreground underline underline-offset-2 transition-colors hover:decoration-foreground"
        >
          {children}
        </a>
      );
    },
  },
};

export function RichText({ document }: { document: Document }) {
  return <>{documentToReactComponents(document, OPTIONS)}</>;
}
