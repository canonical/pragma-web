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
import { SUFFIXED_OPERATORS } from "./constants.js";
import readWireField from "./readWireField.js";
import readWireKey from "./readWireKey.js";
import type { KeyReading } from "./types.js";

const isOperator = (
  suffix: string,
): suffix is (typeof SUFFIXED_OPERATORS)[number] =>
  SUFFIXED_OPERATORS.some((operator) => operator === suffix);

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
  const filled = [...values.entries()]
    .filter(([, value]) => value !== "")
    .map(([at]) => at);
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
  if (
    !kind.operators.includes(operator) ||
    OPERATOR_ARITY[operator] === "none" ||
    kind.input.kind === "none"
  ) {
    // An operator the kind does not accept is refused for the operator,
    // before any value is read. The zero-value operator carries no operands
    // — its presence is the predicate, never a truthiness test on its value
    // — and a kind that filters without a text input has none to parse: the
    // schema answers for the operator alone.
    return settle(schema.predicateFor(field, operator, []), filled);
  }
  const operands: PredicateOperand[] = [];
  const read: number[] = [];
  for (const [at, value] of values.entries()) {
    const parsed = schema.validateInput(field, value);
    if (parsed.status === "valid") {
      operands.push(...parsed.operands);
      read.push(at);
      continue;
    }
    // A blank is a control left empty: no value, and nothing to report.
    if (parsed.status === "incomplete") {
      continue;
    }
    issues.push({
      parameter: key,
      field,
      code: "invalid",
      reason: parsed.reason,
    });
  }
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
