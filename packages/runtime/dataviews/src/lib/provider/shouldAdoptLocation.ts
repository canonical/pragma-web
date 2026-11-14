import { type DataViewsState, readWithheld } from "../coordinator/index.js";
import type { QueryIssue } from "../result/index.js";
import { areQueryIssuesEqual, type DecodedQuery } from "../wire/index.js";
import isSameQuery from "./isSameQuery.js";

/** Where the host stands, and what the location reads. */
type AdoptionConfig = {
  readonly state: DataViewsState<object>;
  readonly standingView: string | null;
  readonly decoded: DecodedQuery;
  readonly view: string | null;
  readonly narrowing: readonly QueryIssue[];
};

/**
 * Whether the host stands elsewhere than the location reads: a different
 * query, another open view, or other refused clauses narrowing it. The
 * three are the location's together, so a move of any one is adopted.
 */
export default function shouldAdoptLocation(config: AdoptionConfig): boolean {
  const { state, standingView, decoded, view, narrowing } = config;
  return (
    !isSameQuery(state, decoded) ||
    view !== standingView ||
    !areQueryIssuesEqual(readWithheld(state), narrowing)
  );
}
