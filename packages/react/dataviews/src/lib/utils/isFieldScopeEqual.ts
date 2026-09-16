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
 * Whether two columns or fields say the same thing about record types: the
 * same identity over the same field, narrowed to the same types. What one
 * scope is read from, compared without building a list around it.
 */
export default function isFieldScopeEqual(
  column: DisplayField,
  other: DisplayField,
): boolean {
  return (
    column.id === other.id &&
    readFieldName(column) === readFieldName(other) &&
    areTypesEqual(column.appliesTo, other.appliesTo)
  );
}
