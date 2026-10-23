import type { NodeConnectionValue, NodeEdge, PageFlags } from "./types.js";

/**
 * Build a `NodeConnection` value from a page's edges and its flags.
 *
 * @param edges - The page's edges, in order.
 * @param flags - Whether edges follow and precede the page.
 * @returns The connection, its cursors those of the first and last edge, or
 * null when the page is empty.
 */
export const toNodeConnection = (
  edges: readonly NodeEdge[],
  flags: PageFlags,
): NodeConnectionValue => ({
  edges,
  pageInfo: {
    hasNextPage: flags.hasNextPage,
    hasPreviousPage: flags.hasPreviousPage,
    startCursor: edges.at(0)?.cursor ?? null,
    endCursor: edges.at(-1)?.cursor ?? null,
  },
});
