import { markdownComponents } from "@canonical/prism-projections";
import { defaultComponents } from "@canonical/react-markdown";

/**
 * The element map a standard's prose renders through: the design system's
 * elements, the projections' prose link, which renders a link to one of the
 * page's references as that entity's chip, and every heading demoted one
 * level, so the article's own title stays the page's only `h1`.
 */
export const PROSE_COMPONENTS = {
  ...defaultComponents,
  ...markdownComponents,
  h1: "h2",
  h2: "h3",
  h3: "h4",
  h4: "h5",
  h5: "h6",
} as const;
