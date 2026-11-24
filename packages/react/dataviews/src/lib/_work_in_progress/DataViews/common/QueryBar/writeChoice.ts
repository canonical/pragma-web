import type {
  Schema,
  SchemaFieldDefinition,
  SourceCapabilities,
} from "@canonical/dataviews-core";
import { EMPTY_SLICE } from "@canonical/dataviews-core";
import {
  canonicalizeSlice,
  listOfferedOperators,
} from "@canonical/dataviews-core/bindings";
import type { QueryBarChoice, QueryBarDraft } from "./types.js";

/** A clause on one field: the draft kind a choice writes into. */
type PredicateDraft = Extract<QueryBarDraft, { readonly kind: "predicate" }>;

/**
 * A clause with one suggestion chosen into it. Another field drops the
 * values, which were the old field's, and the operator unless the new
 * field is offered it. An operator brings its own operands where it has
 * them, as presence does, and keeps the clause's values otherwise, unless
 * it leaves presence. A value joins those chosen, once, in the order the
 * query holds them. Pure.
 *
 * @param draft - The clause.
 * @param choice - What the suggestion writes.
 * @param schema - The collection's schema.
 * @param capabilities - What the source declares, which offers operators.
 * @returns The clause with the choice written.
 */
export default function writeChoice(
  draft: PredicateDraft,
  choice: QueryBarChoice,
  schema: Schema<readonly SchemaFieldDefinition[]>,
  capabilities: SourceCapabilities,
): PredicateDraft {
  switch (choice.kind) {
    case "field": {
      if (choice.field === draft.field) return draft;
      const definition = schema.findField(choice.field);
      const offered =
        definition === undefined
          ? []
          : listOfferedOperators(definition, capabilities);
      return {
        ...draft,
        field: choice.field,
        operator:
          draft.operator !== null &&
          (offered as readonly string[]).includes(draft.operator)
            ? draft.operator
            : null,
        operands: [],
      };
    }
    case "operator":
      return {
        ...draft,
        operator: choice.operator,
        operands:
          choice.operands ?? (draft.operator === "isSet" ? [] : draft.operands),
      };
    case "value": {
      if (draft.operands.some((held) => Object.is(held, choice.operand))) {
        return draft;
      }
      const operands = [...draft.operands, choice.operand];
      if (draft.operator === null) return { ...draft, operands };
      // In the order the query holds them, as the chip will show them.
      const [canonical] = canonicalizeSlice({
        ...EMPTY_SLICE,
        filter: [{ field: draft.field, operator: draft.operator, operands }],
      }).filter;
      /* v8 ignore next -- unreachable: one conjunct canonicalizes to one */
      return { ...draft, operands: canonical?.operands ?? operands };
    }
  }
}
