import {
  canonicalizeSlice,
  OPERATOR_ARITY,
  type PredicateOperand,
  type Slice,
} from "../query/index.js";
import {
  OPERATOR_DELIMITER,
  QUERY_KEYS,
  SUFFIXED_OPERATORS,
} from "./constants.js";
import isOwnedKey from "./isOwnedKey.js";
import readWireField from "./readWireField.js";
import spellWireKey from "./spellWireKey.js";
import type { CarryingEncodeConfig } from "./types.js";

/** The presence marker of the zero-value operator. */
const IS_SET_VALUE = "1";

/**
 * A number in the plain decimal the input grammar reads. A number's own
 * string form switches to exponent notation beyond 1e21 and below 1e-6;
 * moving the point respells the same shortest round-trip digits, so the
 * value read back is exactly the value written.
 */
const plainDecimal = (value: number): string => {
  const spelled = String(value);
  const at = spelled.indexOf("e");
  if (at === -1) {
    return spelled;
  }
  const exponent = Number(spelled.slice(at + 1));
  const mantissa = spelled.slice(0, at);
  const negative = mantissa.startsWith("-");
  const unsigned = negative ? mantissa.slice(1) : mantissa;
  const dot = unsigned.indexOf(".");
  const whole = dot === -1 ? unsigned : unsigned.slice(0, dot);
  const fraction = dot === -1 ? "" : unsigned.slice(dot + 1);
  const digits = `${whole}${fraction}`;
  const point = whole.length + exponent;
  const body =
    exponent < 0
      ? `0.${"0".repeat(-point)}${digits}`
      : digits.padEnd(point, "0");
  return negative ? `-${body}` : body;
};

/** One operand as the input grammar spells it. */
const operandText = (operand: PredicateOperand): string =>
  typeof operand === "number" ? plainDecimal(operand) : String(operand);

/** One slice's filters and search, written as the grammar spells them. */
const spellClauses = (slice: Slice): URLSearchParams => {
  const spelled = new URLSearchParams();
  const canonical = canonicalizeSlice(slice);
  for (const predicate of canonical.filter) {
    const key = spellWireKey(predicate.field, predicate.operator);
    if (predicate.operator === "isSet") {
      spelled.append(key, IS_SET_VALUE);
      continue;
    }
    for (const operand of predicate.operands) {
      // A set operator's option is matched by its own string form; a bound
      // is read by the number grammar.
      spelled.append(
        key,
        OPERATOR_ARITY[predicate.operator] === "many"
          ? String(operand)
          : operandText(operand),
      );
    }
  }
  if (canonical.search !== null) {
    spelled.set(QUERY_KEYS.search, canonical.search);
  }
  return spelled;
};

/**
 * Write one query and its window as URL parameters, as `encodeQuery` does,
 * carrying a followed link's refused clauses through: every key named in
 * `carry` stays in `preserve` where it stood, with the values of it the
 * applied slice did not supply, and a carried key the encode writes too
 * keeps those values after what is written. What the applied slice
 * supplied is the encode's to write again, or not, so a destination that
 * moves a clause never brings back a value it left out.
 */
export default function encodeCarryingQuery(
  config: CarryingEncodeConfig,
): URLSearchParams {
  const { schema, slice, window } = config;
  const carried = new Set(config.carry);
  const supplied = spellClauses(config.applied);
  /**
   * Whether the applied slice supplied one value of a carried key: read as
   * the grammar reads it, under the key's canonical form, so
   * `status__isAny` reads what `status` was applied with, and `5.0` the `5`
   * a bound holds.
   */
  const isSupplied = (key: string, value: string): boolean => {
    const field = readWireField(key);
    const suffix = key.slice(field.length + OPERATOR_DELIMITER.length);
    const declared = schema.findField(field) !== undefined;
    const operator =
      SUFFIXED_OPERATORS.find((known) => known === suffix) ??
      (declared && key === field ? "isAny" : undefined);
    if (operator === undefined) {
      return supplied.getAll(key).includes(value);
    }
    // Read as the grammar reads it, so `5.0` is the `5` the slice holds.
    const parsed = declared ? schema.validateInput(field, value) : null;
    const [operand] = parsed?.status === "valid" ? parsed.operands : [];
    const spelled =
      operand === undefined
        ? value
        : OPERATOR_ARITY[operator] === "many"
          ? String(operand)
          : operandText(operand);
    return supplied.getAll(spellWireKey(field, operator)).includes(spelled);
  };
  const params = new URLSearchParams();
  for (const [key, value] of new URLSearchParams(config.preserve)) {
    // A host parameter survives as it is; a carried key keeps, where it
    // stood, the values the applied slice did not supply.
    if (
      !isOwnedKey(key, schema) ||
      (carried.has(key) && !isSupplied(key, value))
    ) {
      params.append(key, value);
    }
  }
  // Built apart, so a carried key the encode writes too keeps what it
  // carried beside what is written.
  const written = new URLSearchParams();

  for (const [key, value] of spellClauses(slice)) {
    written.append(key, value);
  }
  const canonical = canonicalizeSlice(slice);
  for (const term of canonical.sort) {
    written.append(
      QUERY_KEYS.sort,
      `${term.field}${OPERATOR_DELIMITER}${term.direction}`,
    );
  }
  for (const term of canonical.group) {
    written.append(QUERY_KEYS.group, term.field);
  }
  // Written whenever given: a window read back is the window that was
  // displayed, never a default the reader has to know. Collapse is left
  // out, so a reload expands every group.
  if (window !== null) {
    written.set(QUERY_KEYS.page, String(window.page));
    written.set(QUERY_KEYS.size, String(window.size));
    if (window.cursor !== null) {
      written.set(QUERY_KEYS.cursor, window.cursor);
    }
  }
  for (const key of new Set(written.keys())) {
    const values = written.getAll(key);
    // A carried key keeps the values the encode does not write: a clause
    // refused for some of its values stands, beside the ones applied.
    const kept = carried.has(key)
      ? params.getAll(key).filter((value) => !values.includes(value))
      : [];
    params.delete(key);
    for (const value of [...values, ...kept]) {
      params.append(key, value);
    }
  }
  return params;
}
