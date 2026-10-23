import type { RelayParameters } from "@canonical/storybook-addon-relay";
import {
  CODE_STANDARD_CLASS_URI,
  LINK_COMPONENT_CURIE,
} from "../../testing/fixtures.js";

/** The prose a story's standard reads, with a mention of a sibling standard. */
const PROSE_MARKDOWN = `A complex component renders a set of navigable items and injects an inner link renderer for them.

## Why

Every router integrates through the same [props standard](cs:react.component.props), so one adapter serves every component.`;

/**
 * Build the mock resolvers a story of the lens answers its operations with:
 * every class is the bound class, every entity a code standard of it with
 * the exemplar's title, compact address and description, and its prose a
 * short Markdown document that mentions a sibling standard. The index's
 * page info says the graph has no further page.
 *
 * @returns The resolvers for `parameters.relay.mockResolvers`.
 *
 * @example
 * ```ts
 * parameters: { relay: { mockResolvers: resolveStandards() } }
 * ```
 */
export default function resolveStandards(): NonNullable<
  RelayParameters["mockResolvers"]
> {
  return {
    OntologyClass: () => ({
      uri: CODE_STANDARD_CLASS_URI,
      subclasses: [],
      _meta: { title: "CodeStandard" },
    }),
    // A class's description and a standard's are both `EntityMeta`; the
    // class's is the one under a `type` field.
    EntityMeta: (context) =>
      context?.path?.includes("type")
        ? { title: "CodeStandard" }
        : {
            curie: LINK_COMPONENT_CURIE,
            title: "react.component.link_component",
            definition:
              "A complex component injects one inner link renderer.\n\nIt renders a plain element for an item with no link.",
          },
    Prose: () => ({
      markdown: PROSE_MARKDOWN,
      lang: "en",
      references: { edges: [] },
    }),
    PageInfo: () => ({ hasNextPage: false }),
  };
}
