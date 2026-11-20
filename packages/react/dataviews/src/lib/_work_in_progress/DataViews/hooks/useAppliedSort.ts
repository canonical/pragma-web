import type { DataViewsState, SortTerm } from "@canonical/dataviews-core";
import { useDataViewsValue } from "../../../hooks/index.js";
import { areSortListsEqual } from "../../../utils/index.js";
import type { UseAppliedSortProps, UseAppliedSortResult } from "./types.js";

/** Read the applied sort terms of a state: one selector for every reader. */
const selectSort = (state: DataViewsState): readonly SortTerm[] =>
  state.slice.sort;

/**
 * The applied sort terms, and nothing else of the state: the subscription
 * is the provider's state channel, but the value is the ordering alone,
 * held at one identity while it reads the same, so a result arriving or a
 * page turning re-renders nothing that lists the terms.
 */
export default function useAppliedSort({
  provider,
}: UseAppliedSortProps): UseAppliedSortResult {
  return useDataViewsValue(provider.state, selectSort, areSortListsEqual);
}
