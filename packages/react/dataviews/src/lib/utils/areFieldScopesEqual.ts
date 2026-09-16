import { areListsEqual } from "@canonical/dataviews-core/bindings";
import type { DisplayField } from "../common/index.js";
import readFieldName from "./readFieldName.js";

/** Whether two columns name the same record types, or both name none. */
const areTypesEqual = (
  a: readonly string[] | undefined,
  b: readonly string[] | undefined,
): boolean =>
  a === undefined || b === undefined
    ? a === b
    : areListsEqual(a, b, (name, other) => name === other);

/**
 * Whether two column or field arrays say the same thing about record types:
 * the same columns over the same fields, each narrowed to the same types.
 * What a column's scope is read from, and nothing else, so a heading or a
 * cell rebuilt inline re-reads no scope.
 */
export default function areFieldScopesEqual(
  a: readonly DisplayField[],
  b: readonly DisplayField[],
): boolean {
  return areListsEqual(
    a,
    b,
    (column, other) =>
      column.id === other.id &&
      readFieldName(column) === readFieldName(other) &&
      areTypesEqual(column.appliesTo, other.appliesTo),
  );
}
