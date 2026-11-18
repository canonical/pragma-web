import type {
  PredicateOperand,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import spellNumberWithUnit from "./spellNumberWithUnit.js";

/**
 * Digits as the bar reads them back: ungrouped, the point as `.`, which
 * the reader's separator then replaces. Data, never words.
 */
const EDITABLE_NUMBERS = new Intl.NumberFormat("en", {
  useGrouping: false,
  maximumFractionDigits: 20,
});

/**
 * A value as a chip shows it and an Entry opens with it: a number in its
 * largest display unit, ungrouped, with the reader's decimal separator, so
 * it reads back as it is shown; anything else as its text. Pure.
 *
 * @param definition - The value's field, or undefined when the schema lacks it.
 * @param operand - The value.
 * @param decimalSeparator - The reader's decimal separator.
 * @returns The value's text.
 */
export default function spellOperand(
  definition: SchemaFieldDefinition | undefined,
  operand: PredicateOperand,
  decimalSeparator: string,
): string {
  if (definition?.kind !== "number" || typeof operand !== "number") {
    return String(operand);
  }
  // Only the number's point: a unit symbol may hold a dot of its own.
  return spellNumberWithUnit(
    operand,
    definition.units,
    EDITABLE_NUMBERS,
  ).replace(/^(-?\d+)\.(?=\d)/, `$1${decimalSeparator}`);
}
