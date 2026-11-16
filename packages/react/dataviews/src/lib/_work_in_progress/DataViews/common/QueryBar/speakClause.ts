import type {
  DataViewsMessages,
  Schema,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import spellOperand from "./spellOperand.js";
import type { QueryBarDraft, QueryBarLabelsStandIn } from "./types.js";

/**
 * A clause as it is spoken, from the messages record: its field's label,
 * its operator's spoken words and its values, as far as they are chosen,
 * or the search by its text. What names its chip and its remove control,
 * and what an announcement says of it. Pure.
 *
 * @param draft - The clause, built, edited or applied.
 * @param schema - The collection's schema, which spells its values.
 * @param labels - The words the data is named by.
 * @param messages - The root's messages.
 * @returns The clause in words.
 */
export default function speakClause(
  draft: QueryBarDraft,
  schema: Schema<readonly SchemaFieldDefinition[]>,
  labels: QueryBarLabelsStandIn,
  messages: DataViewsMessages,
): string {
  if (draft.kind === "search") return messages.searchClause(draft.text);
  const label = labels.readFieldLabel(draft.field);
  if (draft.operator === null) return label;
  const definition = schema.findField(draft.field);
  return messages.queryClause(
    label,
    messages.operatorSpoken(draft.operator, draft.operands),
    // Presence speaks its value in its operator.
    draft.operator === "isSet"
      ? []
      : draft.operands.map((operand) =>
          spellOperand(definition, operand, messages.decimalSeparator),
        ),
  );
}
