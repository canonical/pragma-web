import type { Schema, SchemaFieldDefinition } from "../schema/index.js";
import { OPERATOR_DELIMITER, SUFFIXED_OPERATORS } from "./constants.js";

/**
 * The field a filter's key addresses when the collection does not declare
 * it, or null for any other key. Only a delimited key whose suffix is one of
 * the grammar's operators is a filter: `gone__isAny` addresses a field that
 * may have been removed, while a bare `gone` cannot be told apart from a
 * parameter of the host's own.
 */
export default function readUndeclaredField(
  key: string,
  schema: Schema<readonly SchemaFieldDefinition[]>,
): string | null {
  const at = key.indexOf(OPERATOR_DELIMITER);
  if (at < 1) {
    return null;
  }
  const field = key.slice(0, at);
  const suffix = key.slice(at + OPERATOR_DELIMITER.length);
  const isOperator = SUFFIXED_OPERATORS.some((operator) => operator === suffix);
  return isOperator && schema.findField(field) === undefined ? field : null;
}
