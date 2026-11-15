import { defaultComponents } from "@canonical/react-markdown";

/**
 * The element map a component's text renders through: the design
 * system's elements, with every heading two levels down, under the section
 * that holds the text: the page's title is its only `h1` and its sections'
 * headings its only `h2`s, so the text's own start at level 3 and stop at 6.
 */
export const PROSE_COMPONENTS = {
  ...defaultComponents,
  h1: "h3",
  h2: "h4",
  h3: "h5",
  h4: "h6",
  h5: "h6",
} as const;
