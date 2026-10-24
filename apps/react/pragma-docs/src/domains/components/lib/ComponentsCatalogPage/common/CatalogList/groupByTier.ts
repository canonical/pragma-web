import compareTiers from "./compareTiers.js";

/** A node that names its tier, as the catalog's connection holds it. */
interface TieredNode {
  readonly tier?: { readonly name?: string | null } | null;
}

/**
 * Group the catalog's components by tier, in the catalog's tier order and,
 * within a tier, in the graph's own order. A component with no tier joins
 * the untiered group.
 *
 * @param edges - The connection's edges, each holding its node.
 * @param untiered - The name the catalog gives the untiered components.
 * @returns Each tier's name with its nodes.
 */
export default function groupByTier<TNode extends TieredNode>(
  edges: readonly { readonly node: TNode }[],
  untiered: string,
): { readonly tier: string; readonly nodes: readonly TNode[] }[] {
  const groups = new Map<string, TNode[]>();
  for (const { node } of edges) {
    const tier = node.tier?.name ?? untiered;
    groups.set(tier, [...(groups.get(tier) ?? []), node]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => compareTiers(a, b, untiered))
    .map(([tier, nodes]) => ({ tier, nodes }));
}
