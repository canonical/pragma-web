import type {
  DataViewsMessages,
  Predicate,
  Schema,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import spellOperand from "./spellOperand.js";
import type { QueryBarLabelsStandIn } from "./types.js";

/**
 * A field's two bounds as one clause is spoken: the lower bound with the
 * field's label, then the upper without it, each in its operator's words
 * and its value as the chip shows it. Pure.
 *
 * @param lower - The `gte` conjunct.
 * @param upper - The `lte` conjunct.
 * @param schema - The collection's schema, which spells the values.
 * @param labels - The words the data is named by.
 * @param messages - The root's messages.
 * @returns The range in words.
 */
export default function speakRange(
  lower: Predicate,
  upper: Predicate,
  schema: Schema<readonly SchemaFieldDefinition[]>,
  labels: QueryBarLabelsStandIn,
  messages: DataViewsMessages,
): string {
  const definition = schema.findField(lower.field);
  const speakBound = (bound: Predicate, label?: string): string =>
    messages.queryClause({
      phrase: messages.operatorPhrase({
        operator: bound.operator,
        operands: bound.operands,
        ...(label === undefined ? {} : { label }),
      }),
      values: bound.operands.map((operand) =>
        spellOperand(definition, operand, messages.decimalSeparator),
      ),
    });
  return messages.rangeClause({
    lower: speakBound(lower, labels.readFieldLabel(lower.field)),
    upper: speakBound(upper),
  });
}
