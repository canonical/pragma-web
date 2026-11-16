import type { DataViewsState } from "@canonical/dataviews-core";
import { useDataViewsValue } from "../../../hooks/index.js";
import type {
  UseRestrictedFieldsProps,
  UseRestrictedFieldsResult,
} from "./types.js";

/** Whether two tallies hold the same fields with the same counts. */
const areTalliesEqual = (
  a: UseRestrictedFieldsResult,
  b: UseRestrictedFieldsResult,
): boolean =>
  a.size === b.size && [...a].every(([field, count]) => b.get(field) === count);

/** Count how many predicates the applied query of a state holds on each field it restricts. */
const countRestrictedFields = (
  state: DataViewsState,
): UseRestrictedFieldsResult => {
  const counted = new Map<string, number>();
  for (const { field } of state.slice.filter) {
    counted.set(field, (counted.get(field) ?? 0) + 1);
  }
  return counted;
};

/**
 * The fields the applied query restricts, each with how many predicates it
 * holds, and nothing else of the state: held at one identity while it reads
 * the same, so a result arriving, a page turning or an edit to a bound that
 * stands re-renders nothing that places controls by it.
 */
export default function useRestrictedFields({
  provider,
}: UseRestrictedFieldsProps): UseRestrictedFieldsResult {
  return useDataViewsValue(
    provider.state,
    countRestrictedFields,
    areTalliesEqual,
  );
}
