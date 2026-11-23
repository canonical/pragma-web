import type { DataViewsState } from "../coordinator/index.js";
import { areSlicesEqual, type Slice } from "../query/index.js";
import type { Facet } from "../result/index.js";

/** No ordering and no grouping: what a slice's restriction is compared over. */
const UNORDERED = { sort: [], group: [] } as const satisfies Pick<
  Slice,
  "sort" | "group"
>;

/**
 * The facets of the result answering the applied filter and search, or null
 * while none answers them: before the first page, while another restriction
 * is pending, and after that restriction failed. Compared by value, so a
 * sort or a grouping pending over the same restriction keeps the facets it
 * asks for again.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export default function readAnsweredFacets<TRow extends object>(
  state: DataViewsState<TRow>,
): Readonly<Record<string, Facet>> | null {
  const answered = state.result.provenance?.slice;
  if (answered === undefined) {
    return null;
  }
  return answered === state.slice ||
    areSlicesEqual(
      { ...answered, ...UNORDERED },
      { ...state.slice, ...UNORDERED },
    )
    ? state.result.facets
    : null;
}
