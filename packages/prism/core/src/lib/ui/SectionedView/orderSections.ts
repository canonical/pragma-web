import type { LensFieldOrder } from "./types.js";

/** Where a field the lens does not order sorts among the placed ones. */
const UNORDERED = Number.POSITIVE_INFINITY;

/**
 * Order a page's sections as the lens orders their anchor fields: by the
 * field's group order, then by the field's own order, keeping the input
 * order between equals. A section whose field the lens does not place (no
 * such field, or one with neither an order nor a group order) keeps its
 * input position after the placed ones. Every page laid on the
 * `SectionedView` that follows a class's lens orders its sections here,
 * so two pages of one class read in the same order.
 *
 * `import { orderSections } from "@canonical/prism-core";`
 *
 * @param sections - The sections, each naming the field it anchors on.
 * @param fields - The class's fields as the lens describes them.
 * @returns A new array of the same sections, in the lens's order.
 */
export default function orderSections<T extends { readonly field: string }>(
  sections: readonly T[],
  fields: readonly LensFieldOrder[],
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
    .flatMap((section) => {
      const rank = ranks.get(section.field);
      return rank === undefined ? [] : [{ section, rank }];
    })
    .toSorted(({ rank: [groupA, orderA] }, { rank: [groupB, orderB] }) =>
      groupA === groupB
        ? compareRanks(orderA, orderB)
        : compareRanks(groupA, groupB),
    )
    .map(({ section }) => section);
  return [...placed, ...sections.filter(({ field }) => !ranks.has(field))];
}

/** Compare two ranks ascending, an unordered one equal to another. */
function compareRanks(a: number, b: number): number {
  return a === b ? 0 : a < b ? -1 : 1;
}
