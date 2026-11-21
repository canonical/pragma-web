import {
  LIST_SHOWN_VALUES,
  NUMBER_FORMAT,
  VALUE_SEPARATOR,
} from "./constants.js";
import type { ListField, NodeValue, ReadValue } from "./types.js";

/**
 * A value's text as its field's type reads it: a whole number grouped in
 * the fixed locale `en`, whatever the runtime's default, any other value as
 * read.
 */
const formatValue = (field: ListField, text: string): string =>
  field.type === "number" && /^-?\d+$/.test(text)
    ? NUMBER_FORMAT.format(Number(text))
    : text;

/** A field's values as one text: the first ones, then how many more ("+2"). */
const joinValues = (field: ListField, values: readonly ReadValue[]): string => {
  const shown = values
    .slice(0, LIST_SHOWN_VALUES)
    .map((value) => formatValue(field, value.text))
    .join(VALUE_SEPARATOR);
  const more = values.length - LIST_SHOWN_VALUES;
  return more > 0 ? `${shown} +${more}` : shown;
};

/**
 * A node's values for list fields, in the fields' order: each field's
 * label and type, its values' texts formatted by the field's type (a list
 * shows its first value and how many more), and the value's IRI where the
 * field holds exactly one entity. Both providers serve `Node.values`
 * through it, so a table reads the same cells whichever provider answers.
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
      type: field.type,
      text: values.length === 0 ? null : joinValues(field, values),
      uri: values.length === 1 ? (values.at(0)?.uri ?? null) : null,
    };
  });
}
