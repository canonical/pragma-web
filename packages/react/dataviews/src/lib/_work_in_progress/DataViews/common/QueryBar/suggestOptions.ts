import type {
  Count,
  DataViewsMessages,
  Facet,
  PredicateOperand,
  Schema,
  SchemaFieldDefinition,
  SourceCapabilities,
} from "@canonical/dataviews-core";
import { listOfferedOperators } from "@canonical/dataviews-core/bindings";
import type { UseFacetsResult } from "../../../../hooks/index.js";
import { listFacetOptions } from "../Filters/common/utils/index.js";
import { OPERATOR_SYMBOLS } from "./constants.js";
import spellOperator from "./spellOperator.js";
import type {
  QueryBarDraft,
  QueryBarLabelsStandIn,
  QueryBarOption,
  QueryBarPart,
} from "./types.js";

/** What the suggestions are read from. */
type SuggestOptionsConfig = {
  /** The part being typed: the free-text entry's is the field. */
  readonly part: QueryBarPart;
  /** The clause in the chip's Entry, or null in the free-text entry. */
  readonly draft: QueryBarDraft | null;
  /** What is typed in the entry that has the part. */
  readonly typed: string;
  readonly schema: Schema<readonly SchemaFieldDefinition[]>;
  readonly capabilities: SourceCapabilities;
  readonly messages: DataViewsMessages;
  readonly labels: QueryBarLabelsStandIn;
  readonly facets: UseFacetsResult;
};

/** Whether a label holds what is typed, case aside. */
const isTyped = (label: string, typed: string): boolean =>
  label.toLocaleLowerCase().includes(typed.trim().toLocaleLowerCase());

/** The fields any operator is offered on, each named by its label. */
const suggestFields = ({
  draft,
  typed,
  schema,
  capabilities,
  labels,
}: SuggestOptionsConfig): QueryBarOption[] =>
  schema.fields
    .filter(
      (definition) => listOfferedOperators(definition, capabilities).length > 0,
    )
    .map(
      ({ field }): QueryBarOption => ({
        id: field,
        label: labels.readFieldLabel(field),
        current: draft?.kind === "predicate" && draft.field === field,
        choice: { kind: "field", field },
      }),
    )
    .filter(({ label }) => isTyped(label, typed));

/**
 * The operators offered on the draft's field, worded as spoken with the
 * shown symbol as a hint where it differs, narrowed by their words or the
 * symbols typed for them; presence offers a value and no value as two.
 */
const suggestOperators = (
  definition: SchemaFieldDefinition,
  draft: Extract<QueryBarDraft, { readonly kind: "predicate" }>,
  { typed, capabilities, messages }: SuggestOptionsConfig,
): QueryBarOption[] =>
  listOfferedOperators(definition, capabilities)
    .flatMap((operator) => {
      const brought: readonly (readonly PredicateOperand[] | null)[] =
        operator === "isSet" ? [[true], [false]] : [null];
      return brought.map((operands): QueryBarOption => {
        const { shown, spoken } = spellOperator(
          operator,
          operands ?? [],
          messages,
        );
        const isHeld =
          draft.operator === operator &&
          (operands === null || draft.operands.at(0) === operands.at(0));
        return {
          id: operands === null ? operator : `${operator}:${operands.at(0)}`,
          label: spoken,
          hint: shown === spoken ? undefined : shown,
          current: draft.origin !== null && isHeld,
          choice: { kind: "operator", operator, operands },
        };
      });
    })
    .filter(
      ({ label, choice }) =>
        isTyped(label, typed) ||
        (choice.kind === "operator" &&
          typed.trim() !== "" &&
          OPERATOR_SYMBOLS[choice.operator].some(({ symbol }) =>
            symbol.startsWith(typed.trim()),
          )),
    );

/** How many matching records hold each option, by its text, where counted. */
const readCounts = (
  facet: Facet | undefined,
): ReadonlyMap<string, Count> | null =>
  facet?.kind === "values"
    ? new Map(facet.values.map(({ value, count }) => [String(value), count]))
    : null;

/**
 * A choice's options, declared or as the facets list them, each with its
 * count as a hint where the answered facets count it. An option the draft
 * holds is current.
 */
const suggestValues = (
  definition: Extract<SchemaFieldDefinition, { readonly kind: "choices" }>,
  draft: Extract<QueryBarDraft, { readonly kind: "predicate" }>,
  { typed, messages, labels, facets }: SuggestOptionsConfig,
): QueryBarOption[] => {
  const { field } = definition;
  const options: readonly PredicateOperand[] =
    definition.options ?? listFacetOptions(facets.latest?.[field]);
  const counts = readCounts(facets.answered?.[field]);
  const held = new Set(draft.operands.map(String));
  return options
    .map((operand): QueryBarOption => {
      const text = String(operand);
      const count = counts?.get(text);
      return {
        id: text,
        label: text,
        hint:
          count === undefined || count.kind === "unknown"
            ? undefined
            : messages.recordCount(count, labels.recordNoun),
        current: held.has(text),
        choice: { kind: "value", operand },
      };
    })
    .filter(({ label }) => isTyped(label, typed));
};

/**
 * The suggestions for the part being typed, as QueryInput's options: the
 * fields that offer an operator, the operators the source declares on the
 * draft's field, or the options of a choice. A typed value — a number, a
 * date, text — and the search take none. Each narrows to what is typed and
 * carries what choosing it writes. Pure.
 *
 * @param config - The part, the draft, what is typed, and what the root knows.
 * @returns The options, in order.
 */
export default function suggestOptions(
  config: SuggestOptionsConfig,
): readonly QueryBarOption[] {
  const { part, draft, schema } = config;
  if (part === "field") return suggestFields(config);
  if (draft?.kind !== "predicate") return [];
  const definition = schema.findField(draft.field);
  if (definition === undefined) return [];
  if (part === "operator") return suggestOperators(definition, draft, config);
  return part === "value" && definition.kind === "choices"
    ? suggestValues(definition, draft, config)
    : [];
}
