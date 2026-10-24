import {
  defaultComponents,
  type MarkdownComponents,
} from "@canonical/react-markdown";

/** A line that holds nothing but spaces and tabs. */
export const BLANK_LINE = /^[ \t]*$/;

/**
 * A line that opens a block other than a paragraph, or that ends the line
 * before it as one, at any indent: an ATX heading, a quote, a code fence,
 * a bullet or ordered list item, a setext underline or thematic break, or
 * a table's delimiter row.
 */
export const BLOCK_OPENER =
  /^[ \t]*(?:#{1,6}(?:[ \t]|$)|>|```|~~~|[-*+](?:[ \t]|$)|\d{1,9}[.)](?:[ \t]|$)|-+[ \t]*$|=+[ \t]*$|(?:\*[ \t]*){3,}$|(?:_[ \t]*){3,}$|\|?(?:[ \t]*:?-+:?[ \t]*\|)+(?:[ \t]*:?-+:?[ \t]*)?$)/;

/** A line break in any of the three spellings Markdown reads. */
export const LINE_BREAK = /\r\n?|\n/;

/**
 * The elements a summary renders through: the default ones, with a
 * paragraph as a span, since the slot a summary fills is a paragraph
 * already.
 */
export const SUMMARY_COMPONENTS: MarkdownComponents = {
  ...defaultComponents,
  p: "span",
};
