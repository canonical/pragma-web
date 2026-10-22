import type { HEADING_DEPTHS } from "./constants.js";

/** A heading's level, from 1 (`#`, `<h1>`) to 6 (`######`, `<h6>`). */
export type HeadingDepth = (typeof HEADING_DEPTHS)[keyof typeof HEADING_DEPTHS];

/** A heading of a Markdown document, as `extractHeadings` lists it. */
export type Heading = {
  /** The heading's level. */
  readonly depth: HeadingDepth;
  /**
   * The `id` the rendered heading carries, so `#${id}` links to it. The same
   * id `Markdown` and compiled MDX give the heading.
   */
  readonly id: string;
  /** The heading's text, with its inline markup flattened away. */
  readonly text: string;
};
