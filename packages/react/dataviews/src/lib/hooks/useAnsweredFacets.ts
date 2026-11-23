import type {
  RowRecord,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import { readAnsweredFacets } from "@canonical/dataviews-core/bindings";
import type {
  UseAnsweredFacetsProps,
  UseAnsweredFacetsResult,
} from "./types.js";
import useDataViewsValue from "./useDataViewsValue.js";

/**
 * The facets answering the applied filter and search, as the core reads
 * them, and nothing else of the state: a chart or a control never shows
 * counts or ranges computed for another restriction, and a re-sort keeps
 * them.
 */
export default function useAnsweredFacets<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object = RowRecord,
>({
  provider,
}: UseAnsweredFacetsProps<TFields, TRow>): UseAnsweredFacetsResult {
  return useDataViewsValue(provider.state, readAnsweredFacets);
}
