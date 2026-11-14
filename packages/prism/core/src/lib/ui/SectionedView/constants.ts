/**
 * The id of the section index's label, which names the index's `<nav>`.
 * Fixed rather than generated: a page holds one view, and an id the server
 * and the browser derive alike keeps hydration silent wherever the server
 * renders more of the document than the browser hydrates.
 */
export const CONTENTS_LABEL_ID = "sectioned-view-contents";

/**
 * The fewest sections that give a page the "On this page" bar below three
 * groups: with fewer, the reader sees every section's heading without one.
 */
export const BAR_MIN_SECTIONS = 3;

/**
 * How far past the bar's lower edge a heading may sit and still count as
 * having reached it, in pixels: a heading a link scrolled to rests on the
 * edge, give or take a rounded pixel.
 */
export const SECTION_LINE_TOLERANCE_PX = 1;

/** The `overflow-y` values with which an element scrolls its content. */
export const SCROLLING_OVERFLOWS: readonly string[] = [
  "auto",
  "overlay",
  "scroll",
];
