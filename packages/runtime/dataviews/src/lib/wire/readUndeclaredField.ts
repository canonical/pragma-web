import type { Schema, SchemaFieldDefinition } from "../schema/index.js";
import { SUFFIXED_OPERATORS } from "./constants.js";
import readWireKey from "./readWireKey.js";

/**
 * The field a filter's key addresses when the collection does not declare
 * it, or null for any other key. Only a delimited key whose operator is one
 * of the grammar's is a filter — with an ordinal after it or none:
 * `gone__isAny` and `gone__isAny__1` address a field that may have been
 * removed, while a bare `gone` cannot be told apart from a parameter of the
 * host's own.
 */
export default function readUndeclaredField(
  key: string,
  schema: Schema<readonly SchemaFieldDefinition[]>,
): string | null {
  const { field, operator } = readWireKey(key);
  if (field === "" || operator === null) {
    return null;
  }
  const isOperator = SUFFIXED_OPERATORS.some(
    (candidate) => candidate === operator,
  );
  return isOperator && schema.findField(field) === undefined ? field : null;
}
