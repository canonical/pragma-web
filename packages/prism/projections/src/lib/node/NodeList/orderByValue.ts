import type { ListSort, ValuedNode } from "./types.js";

/** The text a node shows for a field, when it has one. */
const readFieldText = (node: ValuedNode, field: string): string | null =>
  (node.values ?? []).find((value) => value.field === field)?.text ?? null;

/**
 * The nodes in the order a sort names, by the text each shows for the
 * sort's field, the nodes without one last, ties kept in their order; the
 * nodes as given when there is no sort.
 *
 * @param nodes - The nodes, each with its values.
 * @param sort - The order to put them in, or null.
 * @returns A new array of the same nodes.
 */
export default function orderByValue<TNode extends ValuedNode>(
  nodes: readonly TNode[],
  sort: ListSort | null,
): readonly TNode[] {
  if (sort === null) return nodes;
  const direction = sort.descending ? -1 : 1;
  return [...nodes].sort((a, b) => {
    const textA = readFieldText(a, sort.field);
    const textB = readFieldText(b, sort.field);
    if (textA === textB) return 0;
    if (textA === null) return 1;
    if (textB === null) return -1;
    return direction * textA.localeCompare(textB, undefined, { numeric: true });
  });
}
