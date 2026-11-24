import type {
  DataViewsState,
  PredicateOperator,
} from "@canonical/dataviews-core";
import { useDataViewsValue } from "../../../hooks/index.js";
import type {
  UseStandingOperatorsProps,
  UseStandingOperatorsResult,
} from "./types.js";

/** Whether two readings hold the same operators on the same fields. */
const areReadingsEqual = (
  a: UseStandingOperatorsResult,
  b: UseStandingOperatorsResult,
): boolean =>
  a.size === b.size &&
  [...a].every(([field, operators]) => {
    const other = b.get(field);
    return (
      other !== undefined &&
      other.length === operators.length &&
      operators.every((operator, place) => other.at(place) === operator)
    );
  });

/** Read the operators the applied query of a state holds on each field. */
const readStandingOperators = (
  state: DataViewsState,
): UseStandingOperatorsResult => {
  const read = new Map<string, PredicateOperator[]>();
  for (const { field, operator } of state.slice.filter) {
    const operators = read.get(field) ?? [];
    if (!operators.includes(operator)) {
      operators.push(operator);
    }
    read.set(field, operators);
  }
  return read;
};

/**
 * The operators the applied query holds a conjunct under on each field, and
 * nothing else of the state: held at one identity while it reads the same,
 * so typing into a text that stands, or a result arriving, re-renders
 * nothing placed by it.
 */
export default function useStandingOperators({
  provider,
}: UseStandingOperatorsProps): UseStandingOperatorsResult {
  return useDataViewsValue(
    provider.state,
    readStandingOperators,
    areReadingsEqual,
  );
}
