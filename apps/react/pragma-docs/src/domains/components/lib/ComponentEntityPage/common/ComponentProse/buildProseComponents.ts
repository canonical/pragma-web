import {
  defaultComponents,
  extractHeadings,
  type MarkdownComponents,
} from "@canonical/react-markdown";
import {
  HEADING_TAGS,
  PROSE_BOTTOM_LEVEL,
  PROSE_TOP_LEVEL,
} from "./constants.js";

/**
 * The element map a component's text renders through: the design
 * system's elements, with every heading moved by one offset so that the
 * text's shallowest heading is a level 3, the one below a section's
 * heading, and the levels below it keep their steps, stopping at 6. A text
 * authored from `#` moves two levels down, one authored from `###` stays.
 */
export default function buildProseComponents(
  source: string,
): MarkdownComponents {
  const depths = extractHeadings(source).map(({ depth }) => depth);
  const offset =
    depths.length === 0 ? 0 : PROSE_TOP_LEVEL - Math.min(...depths);
  return {
    ...defaultComponents,
    ...Object.fromEntries(
      HEADING_TAGS.map((tag, index) => [
        tag,
        `h${Math.min(Math.max(index + 1 + offset, PROSE_TOP_LEVEL), PROSE_BOTTOM_LEVEL)}`,
      ]),
    ),
  };
}
