import type { SortDirection, SortTerm } from "@canonical/dataviews-core";

/**
 * The ordering a timeline's order control leads to: `field` first, in
 * `direction`, then every other term in force, as many as the source's term
 * limit allows — `terms` is the source's maximum, null for none.
 */
export default function leadSortTerm(
  sort: readonly SortTerm[],
  field: string,
  direction: SortDirection,
  terms: number | null,
): readonly SortTerm[] {
  const led = [
    { field, direction },
    ...sort.filter((term) => term.field !== field),
  ];
  return terms === null ? led : led.slice(0, terms);
}
