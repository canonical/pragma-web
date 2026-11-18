import type { DataViewsState } from "@canonical/dataviews-core";
import { useMemo } from "react";
import { useDataViewsValue } from "../../../../../hooks/index.js";
import type {
  UseSuggestedFacetsProps,
  UseSuggestedFacetsResult,
} from "./types.js";

/** No facets: what is read while no value is suggested. */
const NO_FACETS: UseSuggestedFacetsResult = Object.freeze({
  answered: null,
  latest: null,
});

/** The same two facet records. */
const isSameFacets = (
  a: UseSuggestedFacetsResult,
  b: UseSuggestedFacetsResult,
): boolean => a.answered === b.answered && a.latest === b.latest;

/**
 * The facets a field's values are suggested from — those answering the
 * applied query, for counts, and the latest, for the server's options —
 * read only while a field's values are suggested, so a result landing
 * re-renders the bar only then.
 *
 * @param props - The provider, and the field whose values are suggested.
 * @returns The facets, or none.
 */
export default function useSuggestedFacets({
  provider,
  field,
}: UseSuggestedFacetsProps): UseSuggestedFacetsResult {
  const read = useMemo(
    () =>
      field === null
        ? () => NO_FACETS
        : (state: DataViewsState<object>): UseSuggestedFacetsResult => ({
            answered:
              state.result.provenance?.slice === state.slice
                ? state.result.facets
                : null,
            latest: state.result.facets,
          }),
    [field],
  );
  return useDataViewsValue(provider.state, read, isSameFacets);
}
