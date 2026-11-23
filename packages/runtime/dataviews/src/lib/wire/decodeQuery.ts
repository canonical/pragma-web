import { assertInvariant } from "../assertion/index.js";
import {
  collapseSortTerms,
  DEFAULT_WINDOW,
  EMPTY_SLICE,
  type GroupTerm,
  type ResultWindow,
  type Slice,
  type SortTerm,
} from "../query/index.js";
import type { QueryIssue } from "../result/index.js";
import { listQueryRefusals, type SourceCapabilities } from "../source/index.js";
import {
  OPERATOR_DELIMITER,
  QUERY_KEYS,
  RESERVED_QUERY_KEYS,
} from "./constants.js";
import readKeyPredicate from "./readKeyPredicate.js";
import readUndeclaredField from "./readUndeclaredField.js";
import readWireField from "./readWireField.js";
import recordConjunct from "./recordConjunct.js";
import type {
  DecodedQuery,
  DecodeQueryConfig,
  ReadPredicate,
} from "./types.js";

const DIGITS = /^\d+$/;

/** A value read off the parameters, with what reading it reported. */
type Reading<T> = {
  readonly value: T;
  readonly issues: readonly QueryIssue[];
};

/** Read a parameter the grammar spells once, reporting any extra values. */
const readSingleton = (
  key: string,
  values: readonly string[],
): Reading<string> => ({
  value: assertInvariant(
    values.at(0),
    "a key read off the parameters has the value it was read from",
  ),
  issues:
    values.length > 1
      ? [
          {
            parameter: key,
            field: null,
            code: "malformed",
            reason: `"${key}" takes one value; the extra values were ignored`,
          },
        ]
      : [],
});

/** Read one window value, falling back rather than paging somewhere absurd. */
const readWindowValue = (
  key: string,
  values: readonly string[],
  fallback: number,
): Reading<number> => {
  const { value, issues } = readSingleton(key, values);
  const parsed = Number(value);
  // Digits alone are not enough: past the safe range a page or size reads
  // as Infinity or as a neighbouring number.
  const reason =
    !DIGITS.test(value) || parsed < 1
      ? `"${value}" is not a positive integer`
      : Number.isSafeInteger(parsed)
        ? null
        : `"${value}" is too large`;
  return reason === null
    ? { value: parsed, issues }
    : {
        value: fallback,
        issues: [
          ...issues,
          { parameter: key, field: null, code: "malformed", reason },
        ],
      };
};

/** Read one ordered sort term, or null when the value is not one. */
const readSortTerm = (value: string): SortTerm | null => {
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
 * Leave out every clause the source cannot execute, reporting each. Each
 * clause is checked alone, over the default window, so one refusal names the
 * one parameter that caused it — a window the source cannot address is the
 * window's own refusal, not every clause's. An ordering is kept or refused
 * whole, never truncated.
 */
const keepExecutableSlice = (
  slice: Slice,
  filter: readonly ReadPredicate[],
  capabilities: SourceCapabilities,
): Reading<Slice> => {
  const issues: QueryIssue[] = [];
  const keeps = (
    parameters: readonly string[],
    field: string | null,
    clause: Slice,
  ): boolean => {
    const refusals = listQueryRefusals(capabilities, {
      slice: clause,
      window: DEFAULT_WINDOW,
    });
    // Reported under every key the clause was read from, as the link spells
    // it, so carrying or clearing it finds what the URL holds.
    issues.push(
      ...parameters.flatMap((parameter) =>
        refusals.map(({ code, reason }) => ({
          parameter,
          field,
          code,
          reason,
        })),
      ),
    );
    return refusals.length === 0;
  };
  const value: Slice = {
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
  return { value, issues };
};

/**
 * The window a source can address, reporting what it cannot. Only the token
 * is refusable here: a decoded window collapses nothing, and a page number
 * out of a cursor source's reach is that source's own refusal at execution,
 * which needs the trail this layer does not have.
 */
const keepAddressableWindow = (
  window: ResultWindow,
  capabilities: SourceCapabilities,
): Reading<ResultWindow> => {
  const refusals = listQueryRefusals(capabilities, {
    slice: EMPTY_SLICE,
    window,
  });
  return {
    value: refusals.length === 0 ? window : { ...window, cursor: null },
    issues: refusals.map(({ code, reason }) => ({
      parameter: QUERY_KEYS.cursor,
      field: null,
      code,
      reason,
    })),
  };
};

/**
 * Read one parameter set as a query and its window.
 *
 * The schema enforces every owned clause: values are parsed to their field's
 * type, operators are checked against the field's kind, and a clause that
 * fails is left out and reported. A third segment is the conjunct's
 * ordinal, `tags__isAny__1`. With the source's capabilities, a clause it
 * cannot execute is refused the same way. A key spelled `name__operator`
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
  let filter: readonly ReadPredicate[] = [];
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
      const reading = readSingleton(key, values);
      search = reading.value;
      issues.push(...reading.issues);
      continue;
    }
    if (key === QUERY_KEYS.sort) {
      const terms: SortTerm[] = [];
      for (const value of values) {
        const term = readSortTerm(value);
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
      const reading = readSingleton(key, values);
      cursor = reading.value;
      issues.push(...reading.issues);
      continue;
    }
    if (key === QUERY_KEYS.page) {
      const reading = readWindowValue(key, values, page);
      page = reading.value;
      issues.push(...reading.issues);
      continue;
    }
    if (key === QUERY_KEYS.size) {
      const reading = readWindowValue(key, values, size);
      size = reading.value;
      issues.push(...reading.issues);
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
    const reading = readKeyPredicate(
      key,
      params.getAll(key),
      schema,
      definition,
    );
    issues.push(...reading.issues);
    if (reading.conjunct !== null) {
      const recorded = recordConjunct(filter, key, reading.conjunct);
      filter = recorded.filter;
      if (recorded.issue !== null) {
        issues.push(recorded.issue);
      }
    }
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
  const executable = keepExecutableSlice(read, filter, capabilities);
  const addressable = keepAddressableWindow(readWindow, capabilities);
  return {
    slice: executable.value,
    window: addressable.value,
    issues: [...issues, ...executable.issues, ...addressable.issues],
  };
}
