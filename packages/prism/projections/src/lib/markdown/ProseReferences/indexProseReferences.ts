import type { ProseReferenceNode } from "./types.js";

/**
 * Index the nodes of a references connection by both addresses an author
 * may write for each: its absolute IRI and its compact form. A later edge
 * whose address repeats an earlier one's replaces it.
 *
 * @param edges - The connection's edges.
 * @returns Each node, keyed by its IRI and by its compact address.
 */
export default function indexProseReferences<TNode extends ProseReferenceNode>(
  edges: readonly { readonly node: TNode }[],
): ReadonlyMap<string, TNode> {
  return new Map(
    edges.flatMap(({ node }) => [
      [node.uri, node],
      [node._meta.curie, node],
    ]),
  );
}
