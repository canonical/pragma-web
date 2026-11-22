import type { TypeCount } from "./types.js";

/**
 * Count search matches by type: one entry per type with a match, the most
 * matches first, then the type's IRI in code-point order.
 *
 * @param types - Each match's type IRI, one per match.
 * @returns The counts, each type once.
 */
export const countTypeFacets = (
  types: readonly string[],
): readonly TypeCount[] => {
  const counts = new Map<string, number>();
  for (const type of types) {
    counts.set(type, (counts.get(type) ?? 0) + 1);
  }
  return (
    [...counts]
      .map(([type, count]) => ({ type, count }))
      // Each type is counted once, so two entries never hold the same IRI.
      .sort((a, b) => b.count - a.count || (a.type < b.type ? -1 : 1))
  );
};
