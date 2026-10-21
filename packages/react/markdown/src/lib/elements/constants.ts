import type { MarkdownComponents } from "../types.js";
import { MarkdownBlockquote } from "./MarkdownBlockquote/index.js";
import { MarkdownCode } from "./MarkdownCode/index.js";
import { MarkdownCodeBlock } from "./MarkdownCodeBlock/index.js";
import { MarkdownTable } from "./MarkdownTable/index.js";

/**
 * The design-system elements a Markdown or MDX document renders through:
 * admonitions as announcements, inline code as `InlineCode`, fenced code as a
 * scrollable code block, and tables with the design system's spacing.
 *
 * Headings need no entry: their ids come from `rehypePreset`, which every
 * renderer in this package runs, so an `h1`–`h6` override receives the `id`
 * among its props.
 *
 * A `components` map replaces this one rather than merging with it. To keep
 * these elements and change one, spread them: `{ ...defaultComponents, a: Link }`.
 */
export const defaultComponents: MarkdownComponents = {
  blockquote: MarkdownBlockquote,
  code: MarkdownCode,
  pre: MarkdownCodeBlock,
  table: MarkdownTable,
};
