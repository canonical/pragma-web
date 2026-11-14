import type { LensFilterState } from "./types.js";

/**
 * How many filters a reader applied, as the fold below two groups counts
 * them: each namespace chip pressed, the instances toggle when on, and the
 * search text when there is any.
 *
 * @param filter - The reader's filter.
 * @returns The number of applied filters.
 */
export default function countAppliedFilters(filter: LensFilterState): number {
  return (
    (filter.namespaces?.length ?? 0) +
    (filter.withInstances ? 1 : 0) +
    (filter.text === "" ? 0 : 1)
  );
}
