import type { GroupableNode, GroupedResult, ResultGroup } from "./types.js";

/**
 * Group ranked results by their type, keeping the ranking: a type's group
 * sits where its best result ranks, its title is that result's type title,
 * and it keeps its results in rank order. Each result carries its index in
 * the grouped order, counted over every group, the index the palette's
 * highlight moves through.
 *
 * @param nodes - The results, best first.
 * @returns The groups, the group of the best result first.
 */
export default function groupResultsByType<T extends GroupableNode>(
  nodes: readonly T[],
): readonly ResultGroup<T>[] {
  const byType = new Map<string, { title: string; members: T[] }>();
  for (const node of nodes) {
    const group = byType.get(node.__typename);
    if (group === undefined) {
      byType.set(node.__typename, {
        title: node._meta.type._meta.title,
        members: [node],
      });
    } else {
      group.members.push(node);
    }
  }
  const groups = [...byType];
  return groups.map(([typename, { title, members }], position) => {
    const offset = groups
      .slice(0, position)
      .reduce((count, [, group]) => count + group.members.length, 0);
    return {
      typename,
      title,
      results: members.map(
        (node, rank): GroupedResult<T> => ({ node, index: offset + rank }),
      ),
    };
  });
}
