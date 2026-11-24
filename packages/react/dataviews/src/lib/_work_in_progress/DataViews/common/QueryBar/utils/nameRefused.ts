import type { DataViewsMessages, QueryIssue } from "@canonical/dataviews-core";
import { QUERY_KEYS } from "@canonical/dataviews-core/bindings";
import type { QueryBarLabelsStandIn } from "../types.js";

/**
 * What a refused parameter is called: its field's label, the search's
 * name, or else the parameter as the link spelled it. Pure.
 *
 * @param issue - The refused parameter.
 * @param labels - The words the data is named by.
 * @param messages - The root's messages.
 * @returns Its name.
 */
export default function nameRefused(
  issue: QueryIssue,
  labels: QueryBarLabelsStandIn,
  messages: Pick<DataViewsMessages, "search">,
): string {
  if (issue.field !== null) return labels.readFieldLabel(issue.field);
  return issue.parameter === QUERY_KEYS.search
    ? messages.search
    : issue.parameter;
}
