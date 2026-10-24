import { GLOBAL_TIER } from "#domains/components";

/** An instance as the lobby's operation reads it: its title and its tier. */
interface ExemplarNode {
  readonly _meta: { readonly title?: string | null };
  readonly tier?: { readonly name?: string | null } | null;
}

/**
 * Choose the lobby's exemplars: at most `count` blocks, one per title, in
 * the graph's order of each title's first appearance. Where a title spans
 * tiers, the global tier's block stands for it, so no two chips read the
 * same and lead to different pages; a title with no global block among
 * `nodes` keeps its first block. A block without a title is skipped.
 *
 * @param nodes - The instances, in the graph's order.
 * @param count - How many exemplars to choose.
 * @returns The chosen instances.
 */
export default function selectExemplars<TNode extends ExemplarNode>(
  nodes: readonly TNode[],
  count: number,
): TNode[] {
  const byTitle = new Map<string, TNode>();
  for (const node of nodes) {
    const title = node._meta.title;
    if (title == null) continue;
    const chosen = byTitle.get(title);
    const isGlobal = node.tier?.name === GLOBAL_TIER;
    if (
      chosen === undefined ||
      (isGlobal && chosen.tier?.name !== GLOBAL_TIER)
    ) {
      // Replacing a key's value keeps its place, the title's first one.
      byTitle.set(title, node);
    }
  }
  return [...byTitle.values()].slice(0, count);
}
