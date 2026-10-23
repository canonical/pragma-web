import type { ComponentProps } from "react";

/** The heading tags the editor's preview renders. */
export type PreviewHeadingTag = "h3" | "h4" | "h5" | "h6";

/** Props accepted by `PreviewHeading`. */
export type PreviewHeadingProps = ComponentProps<"h3"> & {
  /** The heading tag to render. */
  readonly as: PreviewHeadingTag;
  /** The syntax-tree element `Markdown` passes to an override; not rendered. */
  readonly node?: unknown;
};
