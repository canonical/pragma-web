import { VALUE_SEPARATOR } from "./constants.js";
import type { ListField, NodeValue, ReadValue } from "./types.js";

/**
 * A node's values for list fields, in the fields' order: each field's
 * label, its values' texts joined, and the value's IRI where the field holds
 * exactly one entity. Both providers serve `Node.values` through it, so a
 * table reads the same cells whichever provider answers.
 *
 * @param fields - The fields to read, in the order a table shows them.
 * @param read - The node's values for one field, empty when it has none.
 * @returns One value per field.
 */
export function readNodeValues(
  fields: readonly ListField[],
  read: (field: ListField) => readonly ReadValue[],
): readonly NodeValue[] {
  return fields.map((field) => {
    const values = read(field);
    return {
      field: field.id,
      label: field.label,
      text:
        values.length === 0
          ? null
          : values.map((value) => value.text).join(VALUE_SEPARATOR),
      uri: values.length === 1 ? (values.at(0)?.uri ?? null) : null,
    };
  });
}
