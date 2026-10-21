import type { ComponentProps, JSX, ReactNode } from "react";

/**
 * The props an element override receives for the tag it replaces: the tag's
 * own native props, plus `node`.
 *
 * `Markdown` passes `node`, the HTML syntax-tree element being rendered;
 * compiled MDX passes nothing in its place. It is not a DOM attribute, so an
 * override must take it out of the props it spreads onto an element, or React
 * writes `node="[object Object]"` into the markup.
 */
export type MarkdownElementProps<Tag extends keyof JSX.IntrinsicElements> =
  ComponentProps<Tag> & {
    /** The HTML syntax-tree element being rendered, when the renderer has one. */
    readonly node?: unknown;
  };

/**
 * Which component renders each HTML element of a Markdown or MDX document,
 * keyed by tag name.
 *
 * A value is either a function component that receives
 * `MarkdownElementProps` for its tag, or another tag name to render in its
 * place (`{ h1: "h3" }` demotes top-level headings). A tag with no entry
 * renders as itself.
 */
export type MarkdownComponents = {
  readonly [Tag in keyof JSX.IntrinsicElements]?:
    | ((props: MarkdownElementProps<Tag>) => ReactNode)
    | keyof JSX.IntrinsicElements;
};
