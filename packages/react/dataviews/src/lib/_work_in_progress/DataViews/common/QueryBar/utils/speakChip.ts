import type {
  DataViewsMessages,
  Schema,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { QueryBarLabelsStandIn, QueryClause } from "../types.js";
import nameRefused from "./nameRefused.js";
import speakClause from "./speakClause.js";
import speakRange from "./speakRange.js";

/**
 * One chip's clause as it is spoken: a conjunct as `speakClause` speaks
 * it, a range as `speakRange` does, the search by its text, and a refused
 * parameter by its name. What names a read-only chip and its remove
 * control, and what its removal says. Pure.
 *
 * @param clause - The chip's clause.
 * @param schema - The collection's schema, which spells its values.
 * @param labels - The words the data is named by.
 * @param messages - The root's messages.
 * @returns The clause in words.
 */
export default function speakChip(
  clause: QueryClause,
  schema: Schema<readonly SchemaFieldDefinition[]>,
  labels: QueryBarLabelsStandIn,
  messages: DataViewsMessages,
): string {
  switch (clause.kind) {
    case "predicate":
      return speakClause(
        { kind: "predicate", origin: null, ...clause.predicate },
        schema,
        labels,
        messages,
      );
    case "range":
      return speakRange(clause.lower, clause.upper, schema, labels, messages);
    case "search":
      return messages.searchClause(clause.search);
    case "refused":
      return nameRefused(clause.issue, labels, messages);
  }
}
