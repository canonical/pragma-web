import type {
  DataViewsMessages,
  PredicateOperator,
} from "@canonical/dataviews-core";

/**
 * The phrase a Filters control reads by, from the field's label and the
 * operator it applies: a bound by its own words, from or to; presence by
 * the label alone; every other operator in the words the query bar speaks
 * it by, with no values, so a set's operator reads as any of or none of.
 * Pure.
 *
 * @param messages - The root's messages.
 * @param operator - The operator the control applies.
 * @param label - The field's label.
 * @returns The control's phrase.
 */
export default function phraseOperator(
  messages: Pick<
    DataViewsMessages,
    "filterFrom" | "filterTo" | "operatorPhrase"
  >,
  operator: PredicateOperator,
  label: string,
): string {
  switch (operator) {
    case "gte":
      return messages.filterFrom(label);
    case "lte":
      return messages.filterTo(label);
    case "isSet":
      return label;
    default:
      return messages.operatorPhrase({ operator, operands: [], label });
  }
}
