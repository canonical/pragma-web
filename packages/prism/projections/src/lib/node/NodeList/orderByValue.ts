import { GROUPED_WHOLE_NUMBER, NUMBER_FIELD_TYPE } from "./constants.js";
import type { ListSort, ValuedNode } from "./types.js";

/**
 * The text a node's value is compared by: a whole number shown grouped
 * ("1,600") by its digits alone, any other text as shown.
 */
const readComparedText = (node: ValuedNode, field: string): string | null => {
  const value = (node.values ?? []).find((item) => item.field === field);
  const text = value?.text ?? null;
  return text !== null &&
    value?.type === NUMBER_FIELD_TYPE &&
    GROUPED_WHOLE_NUMBER.test(text)
    ? text.replace(/[^\d-]/g, "")
    : text;
};

/**
 * The nodes in the order a sort names, by the text each shows for the
 * sort's field, numbers by their digits whatever their grouping, the
 * nodes without one last, ties kept in their order; the
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
    const textA = readComparedText(a, sort.field);
    const textB = readComparedText(b, sort.field);
    if (textA === textB) return 0;
    if (textA === null) return 1;
    if (textB === null) return -1;
    return direction * textA.localeCompare(textB, undefined, { numeric: true });
  });
}
