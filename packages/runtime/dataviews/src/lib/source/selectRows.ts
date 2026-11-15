import type { RecordTypes } from "../collection/index.js";
import {
  canonicalizeSlice,
  type Predicate,
  type PredicateOperator,
  rankOperand,
  type Slice,
} from "../query/index.js";
import { readField } from "../rows/index.js";
import {
  resolveFieldKind,
  type SchemaFieldDefinition,
} from "../schema/index.js";
import foldText from "./foldText.js";
import type { ExecuteSliceConfig } from "./types.js";

/** Absent values never satisfy a predicate, but `isSet` with `false`. */
const isAbsent = (value: unknown): boolean =>
  value === null || value === undefined;

/** How each text operator tests a folded value against its folded operand. */
const TEXT_MATCHES: Readonly<
  Record<
    Extract<PredicateOperator, "is" | "contains" | "startsWith" | "endsWith">,
    (folded: string, needle: string) => boolean
  >
> = {
  is: (folded, needle) => folded === needle,
  contains: (folded, needle) => folded.includes(needle),
  startsWith: (folded, needle) => folded.startsWith(needle),
  endsWith: (folded, needle) => folded.endsWith(needle),
};

/** The operator each negation holds exactly where it does not. */
const NEGATED: Readonly<
  Record<
    Extract<PredicateOperator, "isNot" | "notContains">,
    Extract<PredicateOperator, "is" | "contains">
  >
> = {
  isNot: "is",
  notContains: "contains",
};

/** One predicate compiled to a per-row test, with its operands resolved
 * once instead of once per row. */
type CompiledPredicate = {
  readonly field: string;
  readonly test: (value: unknown) => boolean;
};

/**
 * Whether a field applies to a row, read from the row's type, or null when
 * it applies to every row: the field names no types, or the collection has
 * one.
 */
const compileApplicability = (
  definition: SchemaFieldDefinition | undefined,
  types: RecordTypes | null,
): ((row: object) => boolean) | null => {
  if (definition?.appliesTo === undefined || types === null) {
    return null;
  }
  const scope = new Set<unknown>(definition.appliesTo);
  return (row) => scope.has(readField(row, types.field));
};

/**
 * One predicate compiled against the field's kind: a range test compares
 * through the kind, so a field the schema does not define — and a kind with
 * no range — matches nothing.
 */
const compilePredicate = (
  predicate: Predicate,
  definition: SchemaFieldDefinition | undefined,
): CompiledPredicate => {
  const kind =
    definition === undefined ? null : resolveFieldKind(definition.kind);
  const { field } = predicate;
  switch (predicate.operator) {
    case "isSet": {
      // Without its operand, presence asks for a value.
      const wanted = predicate.operands.at(0) !== false;
      return { field, test: (value) => !isAbsent(value) === wanted };
    }
    case "isAny":
    case "isNone": {
      // The server's options are text: a value is compared by its text, so
      // the option read back off the wire finds the value it was written for.
      const identify =
        definition?.kind === "choices" && definition.options === undefined
          ? (value: string | number | boolean | null) => String(value)
          : rankOperand;
      const ranks = new Set(predicate.operands.map(identify));
      const holds = predicate.operator === "isAny";
      return {
        field,
        // Only a choice value — a string or a number — is any or none of
        // the options: an absent value, null or a value of another type is
        // neither, as no predicate matches an empty value.
        test: (value) =>
          (typeof value === "string" || typeof value === "number") &&
          ranks.has(identify(value)) === holds,
      };
    }
    case "gte":
    case "lte": {
      const [bound] = predicate.operands;
      // A range without its operand is not a range, and a range over a
      // field the schema does not describe compares nothing: neither matches.
      if (bound === undefined || kind === null) {
        return { field, test: () => false };
      }
      const atLeast = predicate.operator === "gte";
      return {
        field,
        test: (value) => {
          if (isAbsent(value)) {
            return false;
          }
          const order = kind.compareToBound(value, bound);
          if (order === null) {
            return false;
          }
          return atLeast ? order >= 0 : order <= 0;
        },
      };
    }
    case "isNot":
    case "notContains": {
      // A negation holds exactly where its operator does not, so a record
      // without a value matches it.
      const held = compilePredicate(
        { ...predicate, operator: NEGATED[predicate.operator] },
        definition,
      );
      return { field, test: (value) => !held.test(value) };
    }
    case "is":
    case "contains":
    case "startsWith":
    case "endsWith": {
      const [operand] = predicate.operands;
      // Text looks for text: an operand that is not a string is held by no
      // value, and neither is text in a value that is not a string.
      if (typeof operand !== "string") {
        return { field, test: () => false };
      }
      const needle = foldText(operand);
      const holds = TEXT_MATCHES[predicate.operator];
      return {
        field,
        test: (value) =>
          typeof value === "string" && holds(foldText(value), needle),
      };
    }
  }
};

/**
 * Case-insensitive substring search over the declared fields, folded as
 * `contains` folds. Text and numeric values are searched; every other
 * value, absent fields included, never matches.
 */
const matchesSearch = (
  row: object,
  needle: string,
  fields: readonly string[],
): boolean => {
  for (const field of fields) {
    const value = readField(row, field);
    if (typeof value !== "string" && typeof value !== "number") {
      continue;
    }
    const text = typeof value === "string" ? value : String(value);
    if (foldText(text).includes(needle)) {
      return true;
    }
  }
  return false;
};

/**
 * The rows a query's filter and search select, in the order given. The
 * predicates over `lifted` are left out, as a facet over that field is
 * computed — null lifts none. A row of a type a field does not apply to
 * satisfies none of that field's predicates, `isSet` with `false` included,
 * though it holds no value there.
 */
export default function selectRows<TRow extends object>(
  rows: readonly TRow[],
  slice: Slice,
  config: Pick<ExecuteSliceConfig, "schema" | "searchFields"> &
    Partial<Pick<ExecuteSliceConfig, "types">>,
  lifted: string | null,
): readonly TRow[] {
  const searchFields = config.searchFields ?? [];
  const types = config.types ?? null;
  const query = canonicalizeSlice(slice);
  const needle = query.search === null ? null : foldText(query.search);
  const predicates = query.filter
    .filter((predicate) => predicate.field !== lifted)
    .map((predicate) => {
      const definition = config.schema.findField(predicate.field);
      return {
        compiled: compilePredicate(predicate, definition),
        applies: compileApplicability(definition, types),
      };
    });
  return rows.filter((row) => {
    for (const { compiled, applies } of predicates) {
      if (applies !== null && !applies(row)) {
        return false;
      }
      if (!compiled.test(readField(row, compiled.field))) {
        return false;
      }
    }
    return needle === null || matchesSearch(row, needle, searchFields);
  });
}
