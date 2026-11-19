import {
  OPERATOR_ARITY,
  type PredicateOperand,
  type PredicateOperator,
} from "../query/index.js";
import type { QueryIssue } from "../result/index.js";
import {
  resolveFieldKind,
  type Schema,
  type SchemaFieldDefinition,
  type SchemaPredicateResult,
} from "../schema/index.js";
import { PRESENCE_VALUES, SUFFIXED_OPERATORS } from "./constants.js";
import readWireField from "./readWireField.js";
import readWireKey from "./readWireKey.js";
import type { KeyReading } from "./types.js";

const isOperator = (
  suffix: string,
): suffix is (typeof SUFFIXED_OPERATORS)[number] =>
  SUFFIXED_OPERATORS.some((operator) => operator === suffix);

/** Whether a value is one presence is read from; own keys only. */
const isPresenceValue = (
  value: string,
): value is keyof typeof PRESENCE_VALUES =>
  Object.hasOwn(PRESENCE_VALUES, value);

/** The operands a key's values read as, and the positions each was read at. */
type ReadOperands = {
  readonly operands: readonly PredicateOperand[];
  readonly read: readonly number[];
};

/**
 * Read presence values: `true` or `false`, and `1` as `true`, as links
 * written before presence took a boolean spell it. A blank is no value; any
 * other value is reported and read as nothing.
 */
const readPresence = (
  key: string,
  field: string,
  values: readonly string[],
  issues: QueryIssue[],
): ReadOperands => {
  const operands: PredicateOperand[] = [];
  const read: number[] = [];
  for (const [at, value] of values.entries()) {
    if (isPresenceValue(value)) {
      operands.push(PRESENCE_VALUES[value]);
      read.push(at);
      continue;
    }
    if (value === "") {
      continue;
    }
    issues.push({
      parameter: key,
      field,
      code: "malformed",
      reason: `"${value}" is neither true nor false`,
    });
  }
  return { operands, read };
};

/** Read text inputs through the field's kind, reporting each it cannot read. */
const readInputs = (
  key: string,
  field: string,
  values: readonly string[],
  schema: Schema<readonly SchemaFieldDefinition[]>,
  issues: QueryIssue[],
): ReadOperands => {
  const operands: PredicateOperand[] = [];
  const read: number[] = [];
  for (const [at, value] of values.entries()) {
    // A blank is a control left empty: no value, and nothing to report.
    if (value === "") {
      continue;
    }
    const typed = schema.validateInput(field, value);
    // A value read as still being typed is whole once its trailing spaces
    // are dropped, `16 `: nothing more is coming on the wire.
    const parsed =
      typed.status === "incomplete"
        ? schema.validateInput(field, value.trimEnd())
        : typed;
    if (parsed.status === "valid") {
      operands.push(...parsed.operands);
      read.push(at);
      continue;
    }
    // What reads as incomplete here is text a reader was still typing,
    // `16 G`: on the wire it restricts nothing it could be read as, and is
    // refused rather than dropped.
    issues.push({
      parameter: key,
      field,
      code: "invalid",
      reason:
        parsed.status === "incomplete"
          ? `"${value}" is not a whole value`
          : parsed.reason,
    });
  }
  return { operands, read };
};

/**
 * What one filter key's values read as, a blank read as no value: the
 * issues they raise, and the conjunct they spell with the values it takes,
 * or null. The one reading the decoder and the carry share. Pure.
 */
export default function readKeyPredicate(
  key: string,
  values: readonly string[],
  schema: Schema<readonly SchemaFieldDefinition[]>,
  definition: SchemaFieldDefinition,
): KeyReading {
  const { field } = definition;
  const filled = [...values.keys()].filter((at) => values[at] !== "");
  if (filled.length === 0) {
    return { issues: [], conjunct: null };
  }
  const kind = resolveFieldKind(definition.kind);
  const wire = readWireKey(key);
  const issues: QueryIssue[] = [];
  const operator: PredicateOperator | null =
    wire.operator === null
      ? "isAny"
      : isOperator(wire.operator)
        ? wire.operator
        : null;
  if (operator === null) {
    issues.push({
      parameter: key,
      field,
      code: "malformed",
      reason: `unknown operator "${wire.operator}"`,
    });
    return { issues, conjunct: null };
  }
  const { ordinal } = wire;
  if (ordinal === null) {
    issues.push({
      parameter: key,
      field,
      code: "malformed",
      reason: `"${key}" does not end in a conjunct's ordinal`,
    });
    return { issues, conjunct: null };
  }
  /** The conjunct a schema result spells, or the issue refusing it. */
  const settle = (
    result: SchemaPredicateResult,
    taken: readonly number[],
  ): KeyReading =>
    result.status === "valid"
      ? { issues, conjunct: { predicate: result.predicate, ordinal, taken } }
      : {
          issues: [
            ...issues,
            {
              parameter: key,
              field: readWireField(key),
              code: "invalid",
              reason: result.reason,
            },
          ],
          conjunct: null,
        };
  if (!kind.operators.includes(operator)) {
    // An operator the kind does not accept is refused for the operator,
    // before any value is read.
    return settle(schema.predicateFor(field, operator, []), filled);
  }
  const { operands, read } =
    operator === "isSet"
      ? readPresence(key, field, values, issues)
      : readInputs(key, field, values, schema, issues);
  if (operands.length === 0) {
    return { issues, conjunct: null };
  }
  const isSet = OPERATOR_ARITY[operator] === "many";
  if (!isSet && operands.length > 1) {
    issues.push({
      parameter: key,
      field,
      code: "malformed",
      reason: `"${key}" takes one value; the extra values were ignored`,
    });
  }
  return settle(
    schema.predicateFor(
      field,
      operator,
      isSet ? operands : operands.slice(0, 1),
    ),
    isSet ? read : read.slice(0, 1),
  );
}
