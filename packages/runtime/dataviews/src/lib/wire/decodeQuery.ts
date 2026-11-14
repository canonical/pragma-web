import {
  collapseSortTerms,
  DEFAULT_WINDOW,
  EMPTY_SLICE,
  type GroupTerm,
  OPERATOR_ARITY,
  type Predicate,
  type PredicateOperand,
  type PredicateOperator,
  type ResultWindow,
  type Slice,
  type SortTerm,
} from "../query/index.js";
import type { QueryIssue } from "../result/index.js";
import {
  resolveFieldKind,
  type Schema,
  type SchemaFieldDefinition,
  type SchemaPredicateResult,
} from "../schema/index.js";
import { refusalsOf, type SourceCapabilities } from "../source/index.js";
import {
  OPERATOR_DELIMITER,
  QUERY_KEYS,
  RESERVED_QUERY_KEYS,
  SUFFIXED_OPERATORS,
} from "./constants.js";
import readUndeclaredField from "./readUndeclaredField.js";
import readWireField from "./readWireField.js";
import type { DecodedQuery, DecodeQueryConfig } from "./types.js";

const DIGITS = /^\d+$/;

const isOperator = (
  suffix: string,
): suffix is (typeof SUFFIXED_OPERATORS)[number] =>
  SUFFIXED_OPERATORS.some((operator) => operator === suffix);

/** Read a parameter the grammar spells once, reporting any extra values. */
const singletonOf = (
  key: string,
  values: readonly string[],
  issues: QueryIssue[],
): string => {
  if (values.length > 1) {
    issues.push({
      parameter: key,
      field: null,
      code: "malformed",
      reason: `"${key}" takes one value; the extra values were ignored`,
    });
  }
  // A key read off the parameters has at least the value it was read from.
  return values[0] as string;
};

/** Read one window value, falling back rather than paging somewhere absurd. */
const windowValueOf = (
  key: string,
  values: readonly string[],
  issues: QueryIssue[],
  fallback: number,
): number => {
  const value = singletonOf(key, values, issues);
  const parsed = Number(value);
  if (!DIGITS.test(value) || parsed < 1) {
    issues.push({
      parameter: key,
      field: null,
      code: "malformed",
      reason: `"${value}" is not a positive integer`,
    });
    return fallback;
  }
  // Digits alone are not enough: past the safe range a page or size reads
  // as Infinity or as a neighbouring number.
  if (!Number.isSafeInteger(parsed)) {
    issues.push({
      parameter: key,
      field: null,
      code: "malformed",
      reason: `"${value}" is too large`,
    });
    return fallback;
  }
  return parsed;
};

/** Read one ordered sort term, or null when the value is not one. */
const sortTermOf = (value: string): SortTerm | null => {
  const at = value.indexOf(OPERATOR_DELIMITER);
  if (at < 1) {
    return null;
  }
  const direction = value.slice(at + OPERATOR_DELIMITER.length);
  if (direction !== "asc" && direction !== "desc") {
    return null;
  }
  return { field: value.slice(0, at), direction };
};

/**
 * One predicate as the parameters spelled it: the keys it was read from, so
 * a refusal of the predicate is reported under each key the link holds.
 */
type ReadPredicate = {
  readonly predicate: Predicate;
  readonly keys: readonly string[];
};

/**
 * Keep an enforced predicate, or report why the parameter was refused. A set
 * operator read under a second spelling of its address — `status` and
 * `status__isAny` — is one predicate, holding the operands of both and
 * read from both keys.
 */
const record = (
  result: SchemaPredicateResult,
  key: string,
  filter: ReadPredicate[],
  issues: QueryIssue[],
): void => {
  if (result.status === "valid") {
    const { predicate } = result;
    const kept = filter.find(
      ({ predicate: candidate }) =>
        candidate.field === predicate.field &&
        candidate.operator === predicate.operator,
    );
    if (kept === undefined) {
      filter.push({ predicate, keys: [key] });
      return;
    }
    filter.splice(filter.indexOf(kept), 1, {
      predicate: {
        ...predicate,
        operands: [...kept.predicate.operands, ...predicate.operands],
      },
      keys: [...kept.keys, key],
    });
    return;
  }
  issues.push({
    parameter: key,
    field: readWireField(key),
    code: "invalid",
    reason: result.reason,
  });
};

/** Read one field's parameter into a schema-enforced predicate. */
const readPredicate = (
  key: string,
  values: readonly string[],
  schema: Schema<readonly SchemaFieldDefinition[]>,
  definition: SchemaFieldDefinition,
  filter: ReadPredicate[],
  issues: QueryIssue[],
): void => {
  const { field } = definition;
  const kind = resolveFieldKind(definition.kind);
  let operator: PredicateOperator = "isAny";
  if (key.includes(OPERATOR_DELIMITER)) {
    const suffix = key.slice(field.length + OPERATOR_DELIMITER.length);
    if (!isOperator(suffix)) {
      issues.push({
        parameter: key,
        field,
        code: "malformed",
        reason: `unknown operator "${suffix}"`,
      });
      return;
    }
    operator = suffix;
  }
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
    record(schema.predicateFor(field, operator, []), key, filter, issues);
    return;
  }
  const operands: PredicateOperand[] = [];
  for (const value of values) {
    const parsed = schema.validateInput(field, value);
    if (parsed.status === "valid") {
      operands.push(...parsed.operands);
      continue;
    }
    // The schema reads a blank input as incomplete, and no blank reaches
    // it: the decoder dropped them before parsing.
    /* v8 ignore next 3 -- unreachable: blanks are dropped above */
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
    return;
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
  record(
    schema.predicateFor(
      field,
      operator,
      isSet ? operands : operands.slice(0, 1),
    ),
    key,
    filter,
    issues,
  );
};

/**
 * Leave out every clause the source cannot execute, reporting each. Each
 * clause is checked alone, over the default window, so one refusal names the
 * one parameter that caused it — a window the source cannot address is the
 * window's own refusal, not every clause's. An ordering is kept or refused
 * whole, never truncated.
 */
const executableOf = (
  slice: Slice,
  filter: readonly ReadPredicate[],
  capabilities: SourceCapabilities,
  issues: QueryIssue[],
): Slice => {
  const keeps = (
    parameters: readonly string[],
    field: string | null,
    clause: Slice,
  ): boolean => {
    const refusals = refusalsOf(capabilities, {
      slice: clause,
      window: DEFAULT_WINDOW,
    });
    if (refusals.length === 0) {
      return true;
    }
    // Reported under every key the clause was read from, as the link spells
    // it, so carrying or clearing it finds what the URL holds.
    for (const parameter of parameters) {
      for (const refusal of refusals) {
        issues.push({
          parameter,
          field,
          code: refusal.code,
          reason: refusal.reason,
        });
      }
    }
    return false;
  };
  return {
    filter: filter
      .filter(({ predicate, keys }) =>
        keeps(keys, predicate.field, { ...EMPTY_SLICE, filter: [predicate] }),
      )
      .map(({ predicate }) => predicate),
    search: keeps([QUERY_KEYS.search], null, {
      ...EMPTY_SLICE,
      search: slice.search,
    })
      ? slice.search
      : null,
    sort: keeps([QUERY_KEYS.sort], null, { ...EMPTY_SLICE, sort: slice.sort })
      ? slice.sort
      : [],
    group: keeps([QUERY_KEYS.group], null, {
      ...EMPTY_SLICE,
      group: slice.group,
    })
      ? slice.group
      : [],
  };
};

/**
 * The window a source can address, reporting what it cannot. Only the token
 * is refusable here: a decoded window collapses nothing, and a page number
 * out of a cursor source's reach is that source's own refusal at execution,
 * which needs the trail this layer does not have.
 */
const addressableWindow = (
  window: ResultWindow,
  capabilities: SourceCapabilities,
  issues: QueryIssue[],
): ResultWindow => {
  const refusals = refusalsOf(capabilities, {
    slice: EMPTY_SLICE,
    window,
  });
  if (refusals.length === 0) {
    return window;
  }
  for (const refusal of refusals) {
    issues.push({
      parameter: QUERY_KEYS.cursor,
      field: null,
      code: refusal.code,
      reason: refusal.reason,
    });
  }
  return { ...window, cursor: null };
};

/**
 * Read one parameter set as a query and its window.
 *
 * The schema enforces every owned clause: values are parsed to their field's
 * type, operators are checked against the field's kind, and a clause that
 * fails is left out and reported. With the source's capabilities, a clause
 * it cannot execute is refused the same way. A key spelled `name__operator`
 * with one of the grammar's operators is a filter even when the collection
 * declares no such field, and is refused as `undeclared-field`; any other
 * parameter naming no field of this collection belongs to the host and is
 * left alone: unknown, not invalid. A blank value is a form control left empty
 * and reads as no clause, so a GET form submits cleanly.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export default function decodeQuery(config: DecodeQueryConfig): DecodedQuery {
  const { schema, params, capabilities } = config;

  const issues: QueryIssue[] = [];
  const filter: ReadPredicate[] = [];
  let sort: readonly SortTerm[] = [];
  let search: string | null = null;
  let group: GroupTerm[] = [];
  let page = DEFAULT_WINDOW.page;
  let size = DEFAULT_WINDOW.size;
  let cursor = DEFAULT_WINDOW.cursor;

  for (const key of new Set(params.keys())) {
    // A blank value is a control left empty — a bound nobody typed in, a
    // select on its empty option — submitted as a native form submits it:
    // no clause, and nothing to report.
    const values = params.getAll(key).filter((value) => value !== "");
    if (values.length === 0) {
      continue;
    }
    if (key === QUERY_KEYS.search) {
      search = singletonOf(key, values, issues);
      continue;
    }
    if (key === QUERY_KEYS.sort) {
      const terms: SortTerm[] = [];
      for (const value of values) {
        const term = sortTermOf(value);
        if (term === null) {
          issues.push({
            parameter: key,
            field: null,
            code: "malformed",
            reason: `"${value}" is not an ordered sort term`,
          });
        } else if (schema.findField(term.field) === undefined) {
          // A field with no kind cannot be compared, so a term naming one
          // refuses the ordering as a term with no direction does.
          issues.push({
            parameter: key,
            field: null,
            code: "unknown-field",
            reason: `"${term.field}" is not a field of this collection`,
          });
        } else {
          terms.push(term);
        }
      }
      // An ordering is kept whole or not at all: dropping one term would
      // promote the next into a precedence nobody asked for. A field spelled
      // twice is not a refusal, only a respelling — the first occurrence is
      // the ordering, and the canonical link is written back.
      sort = terms.length === values.length ? collapseSortTerms(terms) : [];
      continue;
    }
    if (key === QUERY_KEYS.group) {
      group = values.map((value) => ({ field: value }));
      continue;
    }
    if (key === QUERY_KEYS.cursor) {
      cursor = singletonOf(key, values, issues);
      continue;
    }
    if (key === QUERY_KEYS.page) {
      page = windowValueOf(key, values, issues, page);
      continue;
    }
    if (key === QUERY_KEYS.size) {
      size = windowValueOf(key, values, issues, size);
      continue;
    }
    if (RESERVED_QUERY_KEYS.includes(key)) {
      // A reserved name the grammar does not read here — the annotation
      // names — is the host's to interpret.
      continue;
    }
    const definition = schema.findField(readWireField(key));
    if (definition === undefined) {
      // A filter on a field the collection does not declare — one since
      // removed — is refused, so the query does not quietly widen. A bare
      // name is the host's: it cannot be told from a field.
      const undeclared = readUndeclaredField(key, schema);
      if (undeclared !== null) {
        issues.push({
          parameter: key,
          field: undeclared,
          code: "undeclared-field",
          reason: `"${undeclared}" is not a field of this collection`,
        });
      }
      continue;
    }
    readPredicate(key, values, schema, definition, filter, issues);
  }

  const read: Slice = {
    filter: filter.map(({ predicate }) => predicate),
    search,
    sort,
    group,
  };
  // Collapse has no spelling, so a decoded window never collapses anything.
  const readWindow: ResultWindow = { page, size, cursor, collapsed: [] };
  if (capabilities === undefined || capabilities === null) {
    return { slice: read, window: readWindow, issues };
  }
  return {
    slice: executableOf(read, filter, capabilities, issues),
    window: addressableWindow(readWindow, capabilities, issues),
    issues,
  };
}
