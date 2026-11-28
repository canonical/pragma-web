import type { DataViewsState } from "@canonical/dataviews-core";
import { useMemo } from "react";
import { useDataViewsValue } from "../../../../../../../../hooks/index.js";
import { isSameFacet } from "../../../../../../../../utils/index.js";
import type { UseFieldFacetsProps, UseFieldFacetsResult } from "./types.js";

/** Two readings of a field's facets that claim the same. */
const isSameFieldFacets = (
  a: UseFieldFacetsResult,
  b: UseFieldFacetsResult,
): boolean =>
  a.pending === b.pending &&
  isSameFacet(a.answered, b.answered) &&
  isSameFacet(a.latest, b.latest);

/**
 * One field's facets, and nothing else of the state: the one answering the
 * applied query, for counts, the latest, for the server's options, and
 * whether any are still on their way. A result that leaves the field's
 * facet as it was renders nothing.
 *
 * @returns The field's facets.
 */
export default function useFieldFacets(
  ...[provider, field]: UseFieldFacetsProps
): UseFieldFacetsResult {
  const read = useMemo(
    () =>
      (state: DataViewsState<object>): UseFieldFacetsResult => {
        const { facets, status, provenance } = state.result;
        const latest = facets?.[field] ?? null;
        return {
          answered: provenance?.slice === state.slice ? latest : null,
          latest,
          pending:
            facets === null &&
            (status === "pending" || status === "refreshing"),
        };
      },
    [field],
  );
  return useDataViewsValue(provider.state, {
    select: read,
    isEqual: isSameFieldFacets,
  });
}
