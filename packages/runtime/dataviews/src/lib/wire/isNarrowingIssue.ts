import type { QueryIssue } from "../result/index.js";
import { QUERY_KEYS } from "./constants.js";

/**
 * Whether a refused parameter would have narrowed the result: a filter on a
 * field, declared or not, or the search `q`. Leaving one out runs a wider
 * query than the link asked for, so the query is withheld while it stands.
 * Every other parameter — the ordering, the window, the grouping, the view
 * — falls back to its default and narrows nothing.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export default function isNarrowingIssue(issue: QueryIssue): boolean {
  return issue.field !== null || issue.parameter === QUERY_KEYS.search;
}
