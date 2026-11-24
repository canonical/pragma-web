import type {
  DataViewsState,
  RowRecord,
  SchemaFieldDefinition,
  Slice,
} from "@canonical/dataviews-core";
import type {
  UseAnsweredFacetsProps,
  UseAnsweredFacetsResult,
} from "./types.js";
import useDataViewsValue from "./useDataViewsValue.js";

/** A slice's filter and search, spelled to compare by value. */
const spellRestriction = ({ filter, search }: Slice): string =>
  JSON.stringify([filter, search]);

/**
 * The facets of the result answering the applied filter and search, or
 * null while none does, so a pending sort or grouping keeps them.
 */
const readAnswered = <TRow extends object>(
  state: DataViewsState<TRow>,
): UseAnsweredFacetsResult => {
  const answered = state.result.provenance?.slice;
  return answered !== undefined &&
    (answered === state.slice ||
      spellRestriction(answered) === spellRestriction(state.slice))
    ? state.result.facets
    : null;
};

/**
 * The facets answering the applied filter and search, and nothing else of
 * the state: a chart or a control never shows counts or ranges computed
 * for another restriction, and a re-sort keeps them.
 */
export default function useAnsweredFacets<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object = RowRecord,
>({
  provider,
}: UseAnsweredFacetsProps<TFields, TRow>): UseAnsweredFacetsResult {
  return useDataViewsValue(provider.state, { select: readAnswered });
}
