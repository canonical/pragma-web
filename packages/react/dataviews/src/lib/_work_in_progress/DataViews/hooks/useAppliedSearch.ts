import type { DataViewsState } from "@canonical/dataviews-core";
import { useDataViewsValue } from "../../../hooks/index.js";
import type { UseAppliedSearchProps, UseAppliedSearchResult } from "./types.js";

/** Read the applied search of a state, empty for none. */
const selectSearch = (state: DataViewsState): string =>
  state.slice.search ?? "";

/**
 * The applied search text, and nothing else of the state: the subscription
 * is the provider's state channel, but the value is the search alone, so
 * a result arriving or a page turning re-renders no search box.
 */
export default function useAppliedSearch({
  provider,
}: UseAppliedSearchProps): UseAppliedSearchResult {
  return useDataViewsValue(provider.state, selectSearch);
}
