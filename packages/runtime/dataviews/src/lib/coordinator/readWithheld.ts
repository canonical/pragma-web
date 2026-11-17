import type { QueryIssue } from "../result/index.js";
import type { DataViewsState } from "./types.js";

const NOTHING_WITHHELD: readonly QueryIssue[] = Object.freeze([]);

/**
 * The refused clauses of a followed link that a state's query is withheld
 * for: the issues its `refused` problem carries, or none while the query
 * runs. Nothing is asked of the source while any stands.
 */
export default function readWithheld(
  state: DataViewsState<object>,
): readonly QueryIssue[] {
  const { problem } = state.result;
  return problem?.status === "refused" && "issues" in problem
    ? problem.issues
    : NOTHING_WITHHELD;
}
