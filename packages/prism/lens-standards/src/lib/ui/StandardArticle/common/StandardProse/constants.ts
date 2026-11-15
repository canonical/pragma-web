import { markdownComponents } from "@canonical/prism-projections";
import { defaultComponents } from "@canonical/react-markdown";

/**
 * The element map a standard's prose renders through: the design system's
 * elements, the projections' prose link, which renders a link to one of the
 * page's references as that entity's chip, and every heading demoted two
 * levels, under the section that holds the prose: the article's title is
 * the page's only `h1` and its sections' headings its only `h2`s.
 */
export const PROSE_COMPONENTS = {
  ...defaultComponents,
  ...markdownComponents,
  h1: "h3",
  h2: "h4",
  h3: "h5",
  h4: "h6",
  h5: "h6",
} as const;
