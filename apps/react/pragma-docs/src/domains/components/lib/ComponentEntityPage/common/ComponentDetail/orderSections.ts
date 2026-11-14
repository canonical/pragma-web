import type { LensField } from "./types.js";

/** Where a field the lens does not order sorts among the placed ones. */
const UNORDERED = Number.POSITIVE_INFINITY;

/**
 * Order a page's sections as the lens orders their anchor fields: by the
 * field's group order, then by the field's own order, keeping the input
 * order between equals. A section whose field the lens does not place (no
 * such field, or one with neither an order nor a group order) keeps its
 * input position after the placed ones.
 *
 * @param sections - The sections, each naming the field it anchors on.
 * @param fields - The class's fields as the lens describes them.
 * @returns A new array of the same sections, in the lens's order.
 */
export default function orderSections<T extends { readonly field: string }>(
  sections: readonly T[],
  fields: readonly LensField[],
): readonly T[] {
  const ranks = new Map(
    fields
      .filter(({ order, group }) => order != null || group?.order != null)
      .map(({ name, order, group }) => [
        name,
        [group?.order ?? UNORDERED, order ?? UNORDERED] as const,
      ]),
  );
  const placed = sections
    .filter(({ field }) => ranks.has(field))
    .toSorted((a, b) => {
      const [groupA, orderA] = ranks.get(a.field) ?? [UNORDERED, UNORDERED];
      const [groupB, orderB] = ranks.get(b.field) ?? [UNORDERED, UNORDERED];
      return groupA === groupB
        ? compareRanks(orderA, orderB)
        : compareRanks(groupA, groupB);
    });
  return [...placed, ...sections.filter(({ field }) => !ranks.has(field))];
}

/** Compare two ranks ascending, an unordered one equal to another. */
function compareRanks(a: number, b: number): number {
  return a === b ? 0 : a < b ? -1 : 1;
}
