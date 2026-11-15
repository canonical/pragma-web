import {
  defaultComponents,
  extractHeadings,
  type MarkdownComponents,
} from "@canonical/react-markdown";
import { type ComponentProps, createElement, type ReactElement } from "react";
import {
  HEADING_TAGS,
  PROSE_BOTTOM_LEVEL,
  PROSE_TOP_LEVEL,
} from "./constants.js";
import type { ProseHeadingTag } from "./types.js";

/**
 * A heading override that renders `tag` with the id the Markdown gave the
 * heading, prefixed by `scope` and a hyphen.
 */
const scopeHeading =
  (tag: ProseHeadingTag, scope: string) =>
  ({
    node: _node,
    id,
    ...props
  }: ComponentProps<"h1"> & { readonly node?: unknown }): ReactElement =>
    createElement(tag, {
      ...props,
      id: id === undefined ? undefined : `${scope}-${id}`,
    });

/**
 * The element map a component's text renders through: the design
 * system's elements, with every heading moved by one offset so that the
 * text's shallowest heading is a level 3, the one below a section's
 * heading, and the levels below it keep their steps, stopping at 6. A text
 * authored from `#` moves two levels down, one authored from `###` stays.
 *
 * Each heading's id is prefixed by `scope`, the id of the section that
 * holds the text: two texts on one page may share a heading's words, and
 * their ids must not repeat.
 */
export default function buildProseComponents(
  source: string,
  scope: string,
): MarkdownComponents {
  const depths = extractHeadings(source).map(({ depth }) => depth);
  const offset =
    depths.length === 0 ? 0 : PROSE_TOP_LEVEL - Math.min(...depths);
  return {
    ...defaultComponents,
    ...Object.fromEntries(
      HEADING_TAGS.map((tag, index) => [
        tag,
        scopeHeading(
          `h${Math.min(Math.max(index + 1 + offset, PROSE_TOP_LEVEL), PROSE_BOTTOM_LEVEL)}` as ProseHeadingTag,
          scope,
        ),
      ]),
    ),
  };
}
