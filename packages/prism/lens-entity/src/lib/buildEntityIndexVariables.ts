import type { FacetFilter } from "@canonical/prism-contract";
import type { EntityBinding } from "@canonical/prism-core";
import type { EntityIndexQuery$variables } from "../__generated__/EntityIndexQuery.graphql.js";
import { ENTITY_PAGE_SIZE } from "./constants.js";

/**
 * Build the index's variables: the binding's class, the facet filters the
 * address applies and the first page of the matching instances.
 *
 * The route's `warmEntityIndex`, the index's own read and the strip's share
 * this one builder, so the variables are byte-identical everywhere and the
 * warm store fulfils every read. No filter is `null`, never an empty list,
 * so an unfiltered index reads one set of variables.
 *
 * @param binding - The binding whose class the index lists.
 * @param filters - The facet filters the address applies, values as IRIs.
 * @returns The operation's variables.
 */
export default function buildEntityIndexVariables(
  binding: EntityBinding,
  filters: readonly FacetFilter[] = [],
): EntityIndexQuery$variables {
  return {
    classUri: binding.classUri,
    classId: binding.classUri,
    filters:
      filters.length === 0
        ? null
        : filters.map(({ field, values }) => ({ field, values: [...values] })),
    count: ENTITY_PAGE_SIZE,
    cursor: null,
  };
}
