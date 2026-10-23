import { COLLATION_LOCALE } from "../../constants.js";
import type { GroupableNode, StandardsGroup } from "./types.js";

/**
 * Group the index's nodes by their own class (`_meta.type`), the one
 * grouping axis the contract exposes. Every node has a class, so there is no
 * ungrouped bucket. Each group keeps its nodes in the order they came, and
 * the groups are ordered by title under `COLLATION_LOCALE`, ties keeping the
 * order their first node came in.
 *
 * @param nodes - The connection's nodes, in connection order.
 * @returns One group per class, ordered by title.
 */
export default function groupByClass<TNode extends GroupableNode>(
  nodes: readonly TNode[],
): readonly StandardsGroup<TNode>[] {
  const groups = new Map<string, { title: string; nodes: TNode[] }>();
  for (const node of nodes) {
    const { uri, _meta } = node._meta.type;
    const group = groups.get(uri);
    if (group === undefined) {
      groups.set(uri, { title: _meta.title, nodes: [node] });
    } else {
      group.nodes.push(node);
    }
  }
  return [...groups.entries()]
    .map(([classUri, group]) => ({ classUri, ...group }))
    .sort((a, b) => a.title.localeCompare(b.title, COLLATION_LOCALE));
}
