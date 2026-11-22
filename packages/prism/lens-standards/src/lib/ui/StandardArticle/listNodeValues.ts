import type { StandardArticle_incoming$data } from "../../../__generated__/StandardArticle_incoming.graphql.js";
import type { StandardArticle_outgoing$data } from "../../../__generated__/StandardArticle_outgoing.graphql.js";
import type { StandardNodeValues } from "./types.js";

/** A statement group of either direction, as the article selects it. */
type NodeGroup =
  | StandardArticle_outgoing$data["groups"][number]
  | StandardArticle_incoming$data["groups"][number];

/**
 * List the entities a standard's statement groups name, each once, in the
 * groups' order, with how many the graph holds and how many came back.
 *
 * @param groups - The groups to read: one predicate's, or every one.
 * @returns The entities' nodes, first occurrence kept, the sum of the
 *   groups' true totals and the number of values the groups returned.
 */
export default function listNodeValues(
  groups: readonly NodeGroup[],
): StandardNodeValues {
  const seen = new Set<string>();
  const nodes: StandardNodeValues["nodes"][number][] = [];
  for (const value of groups.flatMap((group) => group.values)) {
    if (value.__typename !== "StatementNode" || seen.has(value.node.uri)) {
      continue;
    }
    seen.add(value.node.uri);
    nodes.push(value.node);
  }
  return {
    nodes,
    shown: groups.reduce((sum, group) => sum + group.values.length, 0),
    total: groups.reduce((sum, group) => sum + group.total, 0),
  };
}
