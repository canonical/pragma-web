/**
 * Fixture data for tests: `COUNTED_EXACTLY`, the counts block complete
 * local input declares; the location a server render is drawn at; the
 * Filters stories the story harnesses play and check; the operator and
 * facet case tables every executor runs; and the mark and the samples every
 * worded message is called with, which the English sweep reads a message's
 * own words from. Each helper that builds a fixture — a count, a page, a
 * delivery, a display status, a stored view — is a file of its own beside
 * this one.
 */

import type {
  CountCapabilities,
  DataViewsMessages,
} from "@canonical/dataviews-core";
import { createCollection } from "@canonical/dataviews-core";
import elementAt from "./elementAt.js";
import type {
  FacetCase,
  FacetRecord,
  Machine,
  OperatorCase,
  OperatorRecord,
  QuickHost,
  Workload,
} from "./types.js";

/** Both counts answered exactly, as complete local input answers them. */
export const COUNTED_EXACTLY: CountCapabilities = Object.freeze({
  pageable: "exact",
  matched: "exact",
});

/** Racks: a collection no machine provider is built over. */
export const RACK_COLLECTION = createCollection({
  identify: (rack: { readonly id: string }) => rack.id,
  fields: [{ field: "zone", kind: "choices", options: ["a", "b"] }],
});

/**
 * Another collection of the machine records: the record types agree, the
 * collections do not.
 */
export const RACKED_MACHINE_COLLECTION = createCollection({
  identify: (machine: Machine) => machine.id,
  fields: [{ field: "name", kind: "text" }],
});

/**
 * The URL a server render and the hydration over it answer: running
 * machines ordered by cores, the second page of fifty.
 */
export const SERVER_RENDER_HREF =
  "/machines?status=running&sort=cores__desc&page=2&size=50";

/** The Filters stories drawing facets, primary fields and the none-of set. */
export const FACETED_FILTER_STORIES: ReadonlySet<string> = new Set([
  "CountsBesideOptions",
  "NoneOfApplied",
  "PrimaryFilters",
]);

/**
 * What each filter operator means, as fixtures every executor runs: the
 * local array source, and each mock endpoint the stories stand in for. One
 * table, so a source cannot claim an operator and mean something else by it.
 *
 * The rules the cases pin:
 *
 * - `contains` and `startsWith` look at a string value once it and the
 *   operand are folded — normalised to NFC, lowercased without a locale,
 *   final sigma read as sigma, and normalised to NFC again — for the operand
 *   anywhere in the value, or at its start. The operand is literal — `%`,
 *   `_`, `\` and `.` are characters to look for, never a pattern, which a
 *   backend matching with `LIKE` must escape — and nothing is trimmed. A
 *   letter is never expanded into another spelling of it, so `ß` holds no
 *   `ss`, and an accented letter is not its base letter.
 * - `isAny` holds a choice value — a string or a number — that is one of
 *   the operands; `isNone` one that is none of them, a value the options do
 *   not list included.
 * - No operator matches a value that is absent, null or of another type;
 *   an empty string is a value, none of the options.
 *
 * Evidence over this corpus only: passing it does not prove an executor
 * right for every value.
 */

/** The records every case looks through. */
export const OPERATOR_RECORDS: readonly OperatorRecord[] = [
  { id: "web-lower", name: "web-01.example.com", status: "running" },
  { id: "web-upper", name: "WEB-02.EXAMPLE.COM", status: "failed" },
  { id: "api", name: "api.example.com", status: "pending" },
  { id: "percent", name: "50% full", status: "decommissioned" },
  { id: "digits", name: "5050 full", status: 42 },
  { id: "underscore", name: "disk_a", status: null },
  { id: "any-character", name: "diskXa", status: true },
  { id: "backslash", name: "back\\slash", status: "failed" },
  { id: "composed", name: "École" },
  { id: "decomposed", name: "e\u0301cole normale" },
  { id: "sharp-s", name: "Straße" },
  { id: "cjk", name: "日本語テキスト" },
  { id: "greek", name: "ΟΔΟΣΤΡΩΜΑ" },
  { id: "t-diaeresis", name: "T̈" },
  { id: "deseret", name: "\u{10400}" },
  { id: "padded", name: "  padded  " },
  { id: "empty", name: "", status: "" },
  { id: "number", name: 42 },
  { id: "null", name: null },
  { id: "absent" },
];

/** Every operand the table asks for, with what holds it. */
export const OPERATOR_CASES: readonly OperatorCase[] = [
  {
    operator: "contains",
    operands: ["web"],
    matches: ["web-lower", "web-upper"],
    pins: "ASCII case folds",
  },
  {
    operator: "contains",
    operands: ["WEB-0"],
    matches: ["web-lower", "web-upper"],
    pins: "an uppercase operand folds too",
  },
  {
    operator: "contains",
    operands: ["example.com"],
    matches: ["web-lower", "web-upper", "api"],
    pins: "a substring anywhere in the value",
  },
  {
    operator: "contains",
    operands: ["."],
    matches: ["web-lower", "web-upper", "api"],
    pins: "a dot is a dot, never any character",
  },
  {
    operator: "contains",
    operands: ["50%"],
    matches: ["percent"],
    pins: "a percent sign is literal, never a run of characters",
  },
  {
    operator: "contains",
    operands: ["%"],
    matches: ["percent"],
    pins: "a lone percent sign matches only itself",
  },
  {
    operator: "contains",
    operands: ["k_a"],
    matches: ["underscore"],
    pins: "an underscore is literal, never one character",
  },
  {
    operator: "contains",
    operands: ["\\"],
    matches: ["backslash"],
    pins: "the escape character is literal",
  },
  {
    operator: "contains",
    operands: ["école"],
    matches: ["composed", "decomposed"],
    pins: "non-ASCII case folds, composed or not",
  },
  {
    operator: "contains",
    operands: ["E\u0301COLE"],
    matches: ["composed", "decomposed"],
    pins: "a decomposed uppercase operand finds composed text",
  },
  {
    operator: "contains",
    operands: ["straße"],
    matches: ["sharp-s"],
    pins: "a sharp s holds itself",
  },
  {
    operator: "contains",
    operands: ["strasse"],
    matches: [],
    pins: "a letter is never expanded into another spelling",
  },
  {
    operator: "contains",
    operands: ["本語"],
    matches: ["cjk"],
    pins: "text without case is matched exactly",
  },
  {
    operator: "contains",
    operands: ["ΟΔΟΣ"],
    matches: ["greek"],
    pins: "a word ending in capital sigma is found inside a longer word",
  },
  {
    operator: "contains",
    operands: ["σ"],
    matches: ["greek"],
    pins: "a capital sigma holds a lowercase sigma wherever it falls",
  },
  {
    operator: "contains",
    operands: ["ẗ"],
    matches: ["t-diaeresis"],
    pins: "a lowercase letter composes where its uppercase could not",
  },
  {
    operator: "contains",
    operands: ["\u{10428}"],
    matches: ["deseret"],
    pins: "case folds beyond the basic plane",
  },
  {
    operator: "contains",
    operands: ["  "],
    matches: ["padded"],
    pins: "spaces are looked for, never trimmed",
  },
  {
    operator: "contains",
    operands: ["42"],
    matches: [],
    pins: "a number is not text, so holds none",
  },
  {
    operator: "contains",
    operands: ["null"],
    matches: [],
    pins: "a null value holds nothing, not even its own spelling",
  },
  {
    operator: "contains",
    operands: ["undefined"],
    matches: [],
    pins: "an absent value holds nothing, not even its own spelling",
  },
  {
    operator: "startsWith",
    operands: ["web"],
    matches: ["web-lower", "web-upper"],
    pins: "a value starts with the operand, ASCII case folded",
  },
  {
    operator: "startsWith",
    operands: ["WEB-0"],
    matches: ["web-lower", "web-upper"],
    pins: "an uppercase operand folds at the start too",
  },
  {
    operator: "startsWith",
    operands: ["example"],
    matches: [],
    pins: "text inside the value is not at its start",
  },
  {
    operator: "startsWith",
    operands: ["%"],
    matches: [],
    pins: "a leading percent sign is literal, never a run of characters",
  },
  {
    operator: "startsWith",
    operands: ["50%"],
    matches: ["percent"],
    pins: "a percent sign after the start is literal too",
  },
  {
    operator: "startsWith",
    operands: ["disk_"],
    matches: ["underscore"],
    pins: "an underscore is literal, never one character",
  },
  {
    operator: "startsWith",
    operands: ["back\\"],
    matches: ["backslash"],
    pins: "the escape character is literal",
  },
  {
    operator: "startsWith",
    operands: ["E\u0301COLE"],
    matches: ["composed", "decomposed"],
    pins: "non-ASCII case folds at the start, composed or not",
  },
  {
    operator: "startsWith",
    operands: ["e"],
    matches: [],
    pins: "an accented letter is not its base letter",
  },
  {
    operator: "startsWith",
    operands: ["ΟΔΟΣ"],
    matches: ["greek"],
    pins: "a word ending in capital sigma starts a longer word",
  },
  {
    operator: "startsWith",
    operands: ["日本"],
    matches: ["cjk"],
    pins: "text without case is matched exactly at the start",
  },
  {
    operator: "startsWith",
    operands: ["  "],
    matches: ["padded"],
    pins: "leading spaces are looked for, never trimmed",
  },
  {
    operator: "startsWith",
    operands: ["4"],
    matches: [],
    pins: "a number is not text, so starts with none",
  },
  {
    operator: "isAny",
    operands: ["failed"],
    matches: ["web-upper", "backslash"],
    pins: "a value equal to the one operand",
  },
  {
    operator: "isAny",
    operands: ["running", "pending"],
    matches: ["web-lower", "api"],
    pins: "a value equal to any of the operands",
  },
  {
    operator: "isAny",
    operands: ["running", "failed", "pending"],
    matches: ["web-lower", "web-upper", "api", "backslash"],
    pins: "no value the options do not list, and no empty value",
  },
  {
    operator: "isNone",
    operands: ["failed"],
    matches: ["web-lower", "api", "percent", "digits", "empty"],
    pins: "a present value that is not the operand, unlisted ones included",
  },
  {
    operator: "isNone",
    operands: ["running", "failed", "pending"],
    matches: ["percent", "digits", "empty"],
    pins: "a value the options do not list is none of them",
  },
  {
    operator: "is",
    operands: ["WEB-01.EXAMPLE.COM"],
    matches: ["web-lower"],
    pins: "equality folds case",
  },
  {
    operator: "is",
    operands: ["web-01"],
    matches: [],
    pins: "equality is the whole value, never a part",
  },
  {
    operator: "is",
    operands: ["50% full"],
    matches: ["percent"],
    pins: "a percent sign is literal in equality",
  },
  {
    operator: "is",
    operands: ["disk_a"],
    matches: ["underscore"],
    pins: "an underscore is literal in equality",
  },
  {
    operator: "is",
    operands: ["école"],
    matches: ["composed"],
    pins: "non-ASCII case folds in equality",
  },
  {
    operator: "is",
    operands: ["42"],
    matches: [],
    pins: "a number is not the text of its digits",
  },
  {
    operator: "is",
    operands: ["  padded  "],
    matches: ["padded"],
    pins: "nothing is trimmed",
  },
  {
    operator: "isNot",
    operands: ["api.example.com"],
    matches: [
      "web-lower",
      "web-upper",
      "percent",
      "digits",
      "underscore",
      "any-character",
      "backslash",
      "composed",
      "decomposed",
      "sharp-s",
      "cjk",
      "greek",
      "t-diaeresis",
      "deseret",
      "padded",
      "empty",
      "number",
      "null",
      "absent",
    ],
    pins: "a record without text differs from any",
  },
  {
    operator: "isNot",
    operands: ["API.EXAMPLE.COM"],
    matches: [
      "web-lower",
      "web-upper",
      "percent",
      "digits",
      "underscore",
      "any-character",
      "backslash",
      "composed",
      "decomposed",
      "sharp-s",
      "cjk",
      "greek",
      "t-diaeresis",
      "deseret",
      "padded",
      "empty",
      "number",
      "null",
      "absent",
    ],
    pins: "inequality folds case",
  },
  {
    operator: "notContains",
    operands: ["example"],
    matches: [
      "percent",
      "digits",
      "underscore",
      "any-character",
      "backslash",
      "composed",
      "decomposed",
      "sharp-s",
      "cjk",
      "greek",
      "t-diaeresis",
      "deseret",
      "padded",
      "empty",
      "number",
      "null",
      "absent",
    ],
    pins: "a record without text lacks any",
  },
  {
    operator: "notContains",
    operands: ["%"],
    matches: [
      "web-lower",
      "web-upper",
      "api",
      "digits",
      "underscore",
      "any-character",
      "backslash",
      "composed",
      "decomposed",
      "sharp-s",
      "cjk",
      "greek",
      "t-diaeresis",
      "deseret",
      "padded",
      "empty",
      "number",
      "null",
      "absent",
    ],
    pins: "a percent sign is literal in a negation",
  },
  {
    operator: "notContains",
    operands: ["k_a"],
    matches: [
      "web-lower",
      "web-upper",
      "api",
      "percent",
      "digits",
      "any-character",
      "backslash",
      "composed",
      "decomposed",
      "sharp-s",
      "cjk",
      "greek",
      "t-diaeresis",
      "deseret",
      "padded",
      "empty",
      "number",
      "null",
      "absent",
    ],
    pins: "an underscore is literal in a negation",
  },
  {
    operator: "endsWith",
    operands: ["FULL"],
    matches: ["percent", "digits"],
    pins: "a suffix folds case",
  },
  {
    operator: "endsWith",
    operands: ["_a"],
    matches: ["underscore"],
    pins: "an underscore is literal at the end",
  },
  {
    operator: "endsWith",
    operands: ["NORMALE"],
    matches: ["decomposed"],
    pins: "a suffix of decomposed text",
  },
  {
    operator: "endsWith",
    operands: ["%"],
    matches: [],
    pins: "a lone percent sign matches only itself",
  },
];

/**
 * What a facet means, as fixtures every executor runs: the local array
 * source, and each mock endpoint the stories stand in for. One table, so a
 * source cannot claim facets and compute them over something else.
 *
 * The rules the cases pin:
 *
 * - A facet is computed over every record the query matches, never a page.
 * - A field's own predicates are lifted when its facet is computed: the
 *   status facet ignores the statuses the query is any or none of, and the
 *   cores facet ignores its bounds, while every other predicate and the
 *   search still apply. So the other options keep their counts and a bound
 *   can widen past itself.
 * - A status facet lists each status a matching record holds — a string or
 *   a number, never null, absent or another type — with how many hold it, in
 *   the collection's option order, then any other status by code unit; a
 *   status no record holds is not listed.
 * - A cores facet is the least and greatest finite number of cores, null
 *   while no matching record holds one.
 *
 * Evidence over this corpus only: passing it does not prove an executor
 * right for every record set.
 */

/** The records every case computes over. */
export const FACET_RECORDS: readonly FacetRecord[] = [
  { id: "alder", name: "alder", status: "running", cores: 4 },
  { id: "birch", name: "birch", status: "failed", cores: 16 },
  { id: "cedar", name: "cedar", status: "failed", cores: 8 },
  { id: "dogwood", name: "dogwood", status: "pending", cores: 2 },
  { id: "elm", name: "elm", status: "decommissioned", cores: 32 },
  { id: "fir", name: "fir", status: 42, cores: "12" },
  { id: "gum", name: "gum", status: null, cores: null },
  { id: "hazel", name: "hazel", status: true },
  { id: "ironwood", name: "ironwood", cores: 64 },
];

/** Every query the table asks, with the facets it answers. */
export const FACET_CASES: readonly FacetCase[] = [
  {
    query: {},
    status: [
      ["running", 1],
      ["failed", 2],
      ["pending", 1],
      [42, 1],
      ["decommissioned", 1],
    ],
    cores: [2, 64],
    pins: "every status held, options first then others by code unit, and every finite core count",
  },
  {
    query: { isAny: ["failed"] },
    status: [
      ["running", 1],
      ["failed", 2],
      ["pending", 1],
      [42, 1],
      ["decommissioned", 1],
    ],
    cores: [8, 16],
    pins: "a status restriction is lifted from its own facet, and narrows the cores",
  },
  {
    query: { gte: 8 },
    status: [
      ["failed", 2],
      ["decommissioned", 1],
    ],
    cores: [2, 64],
    pins: "a bound narrows the statuses, and is lifted from its own range",
  },
  {
    query: { isNone: ["failed"], lte: 16 },
    status: [
      ["running", 1],
      ["failed", 2],
      ["pending", 1],
    ],
    cores: [2, 32],
    pins: "none-of is lifted from its own facet, and narrows the cores to present statuses",
  },
  {
    query: { search: "ED" },
    status: [["failed", 1]],
    cores: [8, 8],
    pins: "the search applies to every facet",
  },
  {
    query: { search: "ED", isAny: ["running"] },
    status: [["failed", 1]],
    cores: [null, null],
    pins: "the search applies where a status restriction is lifted, and with it narrows the cores",
  },
  {
    query: { search: "ED", gte: 10 },
    status: [],
    cores: [8, 8],
    pins: "the search applies where a bound is lifted, and with it narrows the statuses",
  },
  {
    query: { search: "no such machine" },
    status: [],
    cores: [null, null],
    pins: "nothing matching lists no status and bounds nothing",
  },
];

/**
 * What stands for a name or a reason in the sample arguments below: a
 * character no message's own words contain, so what a message says around
 * it can be told from what it was handed.
 */
export const MESSAGE_MARK = "\u0001";

/**
 * Arguments to call every worded message with, each set reaching another of
 * its wordings — a singular and a plural, each direction, each command — and
 * null for a message that is text. Keyed by every message, so a message the
 * record gains is a compile error here until it has samples, and the English
 * it adds is looked for.
 */
export const MESSAGE_SAMPLES: {
  readonly [TKey in keyof DataViewsMessages]: DataViewsMessages[TKey] extends (
    ...args: infer TArgs
  ) => string
    ? readonly TArgs[]
    : null;
} = {
  statusPending: null,
  statusFailed: [[MESSAGE_MARK]],
  statusRefused: [[MESSAGE_MARK]],
  statusRefreshFailed: [[MESSAGE_MARK]],
  statusStale: [[MESSAGE_MARK]],
  statusNoAccess: null,
  statusNoResults: null,
  statusNoData: null,
  selectAllRows: null,
  selectRow: [[MESSAGE_MARK]],
  columnWidth: [[1], [7]],
  columnEndPlacement: [[MESSAGE_MARK]],
  cellNotApplicable: null,
  columnAppliesTo: [
    [{ types: [MESSAGE_MARK] }],
    [{ types: [MESSAGE_MARK, MESSAGE_MARK] }],
  ],
  sortPrecedence: [
    [{ direction: "asc", position: 1, total: 1 }],
    [{ direction: "desc", position: 2, total: 3 }],
  ],
  sortRefused: [[[MESSAGE_MARK]]],
  sortApplied: [[[MESSAGE_MARK, MESSAGE_MARK]]],
  sortDefaulted: [[[MESSAGE_MARK, MESSAGE_MARK]]],
  sortAbsent: null,
  columnOptions: [[MESSAGE_MARK]],
  sortAscending: null,
  sortDescending: null,
  removeFromSort: null,
  hideColumn: null,
  moveColumnLeft: null,
  moveColumnRight: null,
  tableSettings: null,
  hideNamedColumn: [[MESSAGE_MARK]],
  showNamedColumn: [[MESSAGE_MARK]],
  moveNamedColumnLeft: [[MESSAGE_MARK]],
  moveNamedColumnRight: [[MESSAGE_MARK]],
  columnAlwaysShown: [[MESSAGE_MARK]],
  resetTableSettings: null,
  columnsPending: null,
  columnHidden: [[MESSAGE_MARK]],
  columnShown: [[{ name: MESSAGE_MARK, position: 2, total: 3 }]],
  columnMoved: [[{ name: MESSAGE_MARK, position: 2, total: 3 }]],
  tableSettingsReset: null,
  sortPanel: null,
  sortTerm: [
    [{ name: MESSAGE_MARK, direction: "asc" }],
    [{ name: MESSAGE_MARK, direction: "desc" }],
  ],
  moveSortTermUp: null,
  moveSortTermDown: null,
  removeSortTerm: null,
  filters: null,
  moreFilters: null,
  submitFilters: null,
  filterFrom: [[MESSAGE_MARK]],
  filterTo: [[MESSAGE_MARK]],
  filterInUnit: [[{ name: MESSAGE_MARK, symbol: MESSAGE_MARK }]],
  filterLowest: [[MESSAGE_MARK]],
  filterHighest: [[MESSAGE_MARK]],
  clearFilter: [[MESSAGE_MARK]],
  filterAlso: [
    [{ phrase: MESSAGE_MARK, values: [MESSAGE_MARK, MESSAGE_MARK] }],
  ],
  linkRefusals: null,
  clauseRefused: [[{ name: MESSAGE_MARK, reason: MESSAGE_MARK }]],
  grouping: null,
  matchAnyInstead: null,
  matchNoneInstead: null,
  facetCount: [[{ kind: "exact", value: 7 }], [{ kind: "at-least", value: 7 }]],
  filterMatch: [[MESSAGE_MARK]],
  presenceAny: null,
  presenceSet: null,
  presenceUnset: null,
  filterIncomplete: [[false], [true]],
  filterRefused: [
    [{ reasons: [MESSAGE_MARK], retained: false }],
    [{ reasons: [MESSAGE_MARK, MESSAGE_MARK], retained: true }],
  ],
  search: null,
  submitSearch: null,
  operatorShown: [
    [{ operator: "contains", operands: [MESSAGE_MARK] }],
    [{ operator: "notContains", operands: [MESSAGE_MARK] }],
    [{ operator: "startsWith", operands: [MESSAGE_MARK] }],
    [{ operator: "endsWith", operands: [MESSAGE_MARK] }],
    [{ operator: "isSet", operands: [true] }],
    [{ operator: "isSet", operands: [false] }],
  ],
  operatorPhrase: [
    [{ operator: "isAny", operands: [MESSAGE_MARK] }],
    [{ operator: "isAny", operands: [MESSAGE_MARK, MESSAGE_MARK] }],
    [{ operator: "isAny", operands: [], label: MESSAGE_MARK }],
    [{ operator: "isNone", operands: [MESSAGE_MARK] }],
    [{ operator: "isNone", operands: [], label: MESSAGE_MARK }],
    [{ operator: "is", operands: [], label: MESSAGE_MARK }],
    [{ operator: "isNot", operands: [MESSAGE_MARK] }],
    [{ operator: "contains", operands: [MESSAGE_MARK] }],
    [{ operator: "notContains", operands: [MESSAGE_MARK] }],
    [{ operator: "startsWith", operands: [MESSAGE_MARK] }],
    [{ operator: "endsWith", operands: [MESSAGE_MARK] }],
    [{ operator: "gte", operands: [1] }],
    [{ operator: "lte", operands: [1] }],
    [{ operator: "isSet", operands: [true], label: MESSAGE_MARK }],
    [{ operator: "isSet", operands: [false], label: MESSAGE_MARK }],
  ],
  queryBar: [[{ singular: MESSAGE_MARK, plural: MESSAGE_MARK }]],
  queryBarDescription: null,
  queryBarPlaceholder: null,
  appliedFilters: null,
  clearFiltersAndSearch: null,
  queryCleared: [
    [
      {
        count: { kind: "exact", value: 7 },
        noun: { singular: MESSAGE_MARK, plural: MESSAGE_MARK },
      },
    ],
    [
      {
        count: { kind: "unknown" },
        noun: { singular: MESSAGE_MARK, plural: MESSAGE_MARK },
      },
    ],
  ],
  queryClause: [
    [{ phrase: MESSAGE_MARK, values: [] }],
    [{ phrase: MESSAGE_MARK, values: [MESSAGE_MARK, MESSAGE_MARK] }],
  ],
  clauseBound: [
    [{ label: MESSAGE_MARK, bound: "lower" }],
    [{ label: MESSAGE_MARK, bound: "upper" }],
  ],
  rangeClause: [[{ lower: MESSAGE_MARK, upper: MESSAGE_MARK }]],
  searchClause: [[MESSAGE_MARK]],
  removeClause: [[MESSAGE_MARK]],
  hiddenChips: [[3]],
  loadingSuggestions: null,
  noSuggestions: null,
  clauseField: null,
  clauseOperator: [[MESSAGE_MARK]],
  clauseValue: [[MESSAGE_MARK]],
  recordCount: [
    [
      {
        count: { kind: "exact", value: 7 },
        noun: { singular: MESSAGE_MARK, plural: MESSAGE_MARK },
      },
    ],
    [
      {
        count: { kind: "at-least", value: 7 },
        noun: { singular: MESSAGE_MARK, plural: MESSAGE_MARK },
      },
    ],
  ],
  clauseAdded: [
    [
      {
        clause: MESSAGE_MARK,
        count: { kind: "exact", value: 7 },
        noun: { singular: MESSAGE_MARK, plural: MESSAGE_MARK },
      },
    ],
    [
      {
        clause: MESSAGE_MARK,
        count: { kind: "at-least", value: 7 },
        noun: { singular: MESSAGE_MARK, plural: MESSAGE_MARK },
      },
    ],
    [
      {
        clause: MESSAGE_MARK,
        count: { kind: "unknown" },
        noun: { singular: MESSAGE_MARK, plural: MESSAGE_MARK },
      },
    ],
  ],
  clauseChanged: [
    [
      {
        clause: MESSAGE_MARK,
        count: { kind: "unknown" },
        noun: { singular: MESSAGE_MARK, plural: MESSAGE_MARK },
      },
    ],
  ],
  filtersDisclosure: [[{ applied: 0 }], [{ applied: 3 }]],
  queryContradiction: [[{ label: MESSAGE_MARK }]],
  mergeClauses: [[{ label: MESSAGE_MARK }]],
  clausesMerged: [
    [
      {
        label: MESSAGE_MARK,
        count: { kind: "exact", value: 7 },
        noun: { singular: MESSAGE_MARK, plural: MESSAGE_MARK },
      },
    ],
    [
      {
        label: MESSAGE_MARK,
        count: { kind: "unknown" },
        noun: { singular: MESSAGE_MARK, plural: MESSAGE_MARK },
      },
    ],
  ],
  clauseRemoved: [
    [
      {
        clause: MESSAGE_MARK,
        count: { kind: "unknown" },
        noun: { singular: MESSAGE_MARK, plural: MESSAGE_MARK },
      },
    ],
  ],
  readAsAtLeast: null,
  readAsAtMost: null,
  valuePicked: [[MESSAGE_MARK]],
  multipleValuesHint: null,
  dateFormat: null,
  numberFormat: [[[]], [[MESSAGE_MARK, MESSAGE_MARK]]],
  clauseInvalid: [[MESSAGE_MARK]],
  decimalSeparator: null,
  filtersApplied: [[{ applied: 1 }], [{ applied: 3 }]],
  searchEntry: [[{ noun: { singular: MESSAGE_MARK, plural: MESSAGE_MARK } }]],
  searchEntryPlaceholder: null,
  filterSheet: [[{ noun: { singular: MESSAGE_MARK, plural: MESSAGE_MARK } }]],
  closeFilters: null,
  addFilter: null,
  chooseField: null,
  chooseOperator: [[{ label: MESSAGE_MARK }]],
  chooseValue: [[{ label: MESSAGE_MARK }]],
  addClause: null,
  goBack: null,
  clearAllFilters: null,
  filtersCleared: [
    [
      {
        count: { kind: "exact", value: 7 },
        noun: { singular: MESSAGE_MARK, plural: MESSAGE_MARK },
      },
    ],
    [
      {
        count: { kind: "unknown" },
        noun: { singular: MESSAGE_MARK, plural: MESSAGE_MARK },
      },
    ],
  ],
  resultsUpdated: [
    [
      {
        count: { kind: "exact", value: 7 },
        noun: { singular: MESSAGE_MARK, plural: MESSAGE_MARK },
      },
    ],
  ],
  showResults: [
    [{ count: { kind: "exact", value: 1 } }],
    [{ count: { kind: "exact", value: 7 } }],
    [{ count: { kind: "at-least", value: 7 } }],
    [{ count: { kind: "unknown" } }],
  ],
  filterStepChosen: [[{ chosen: MESSAGE_MARK, step: MESSAGE_MARK }]],
  appliedCount: [[{ count: 1 }], [{ count: 2, condition: "exclusion" }]],
  allOptions: null,
  searchOptions: [[{ label: MESSAGE_MARK }]],
  optionsNone: null,
  optionsPending: null,
  optionExcluded: [[{ value: MESSAGE_MARK }]],
  optionsShown: [[{ count: 1 }], [{ count: 3 }]],
  submitQuickFilter: null,
  pagination: null,
  rowsPerPage: null,
  submitPageSize: null,
  rowsShown: [
    [{ first: 1, shown: 1, total: { kind: "exact", value: 7 } }],
    [{ first: 1, shown: 7, total: { kind: "at-least", value: 7 } }],
    [{ first: 1, shown: 0, total: { kind: "unknown" } }],
    [{ first: 1, shown: 1, total: { kind: "unknown" } }],
  ],
  page: null,
  pageCount: [[1], [7]],
  submitPage: null,
  goToFirstPage: null,
  goToPreviousPage: null,
  goToNextPage: null,
  goToLastPage: null,
  savedViews: null,
  viewsUnscripted: null,
  view: null,
  viewNone: null,
  viewModified: null,
  saveView: null,
  overwriteView: null,
  revertView: null,
  discardViewChanges: null,
  saveViewAs: null,
  renameView: null,
  deleteView: null,
  refreshViews: null,
  saveAsForm: null,
  submitSaveAs: null,
  renameForm: [[MESSAGE_MARK]],
  submitRename: null,
  viewName: null,
  cancel: null,
  deleteForm: [[MESSAGE_MARK]],
  submitDelete: null,
  viewsPending: null,
  viewsUnavailable: [[MESSAGE_MARK]],
  viewsUnreadable: [[1], [7]],
  presentationUnsaved: [[MESSAGE_MARK]],
  viewNameRefused: [[MESSAGE_MARK]],
  viewPending: [["open"], ["save"], ["save-as"], ["rename"], ["remove"]],
  viewOpened: [[MESSAGE_MARK]],
  viewSaved: [[MESSAGE_MARK]],
  viewRenamed: [[MESSAGE_MARK]],
  viewDeleted: null,
  viewRefused: [[{ name: MESSAGE_MARK, reasons: [MESSAGE_MARK] }]],
  viewConflicted: [
    [{ command: "open", name: MESSAGE_MARK }],
    [{ command: "save", name: MESSAGE_MARK }],
    [{ command: "save-as", name: MESSAGE_MARK }],
    [{ command: "rename", name: MESSAGE_MARK }],
    [{ command: "remove", name: MESSAGE_MARK }],
  ],
  viewMissing: [["open"], ["save"], ["save-as"], ["rename"], ["remove"]],
  viewUnreadable: [
    [{ command: "open", reason: MESSAGE_MARK }],
    [{ command: "save", reason: MESSAGE_MARK }],
    [{ command: "rename", reason: MESSAGE_MARK }],
    [{ command: "remove", reason: MESSAGE_MARK }],
  ],
  viewFailed: [
    [{ command: "open", reason: MESSAGE_MARK }],
    [{ command: "save", reason: MESSAGE_MARK }],
    [{ command: "rename", reason: MESSAGE_MARK }],
    [{ command: "remove", reason: MESSAGE_MARK }],
  ],
  actionBar: null,
  rowsSelected: [[7]],
  clearSelection: [[1], [7]],
  renderer: null,
  chartRenderer: null,
  tableRenderer: null,
  chartPending: null,
  chartFailed: [[{ reason: MESSAGE_MARK }]],
  chartRefreshFailed: [[{ reason: MESSAGE_MARK }]],
  facetCountsAbsent: null,
  facetRangeAbsent: null,
  facetValuesNone: null,
  barChartSummary: [[MESSAGE_MARK]],
  rangeChartSummary: [[{ label: MESSAGE_MARK, min: 3, max: 12 }]],
  chartTable: [[MESSAGE_MARK]],
  chartValue: null,
  chartCount: null,
  countUnknown: null,
  chartLowest: null,
  chartHighest: null,
};

/** Twelve pools: more than a filter's panel lists without a search. */
const POOLS = Array.from(
  { length: 12 },
  (_, index) => `pool-${String(index + 1).padStart(2, "0")}`,
);

/**
 * The quick filters' collection: a choice of one among four, one among
 * twelve, a list of three tags, a choice whose options are the server's,
 * memory in MiB typed in MiB or GiB, a date, a text and a presence.
 */
export const quickHostCollection = createCollection({
  identify: (host: QuickHost) => host.id,
  fields: [
    {
      field: "status",
      kind: "choices",
      options: ["deployed", "ready", "commissioning", "broken"],
    },
    { field: "pool", kind: "choices", options: POOLS },
    {
      field: "tags",
      kind: "choices",
      options: ["ex-gpu", "ex-nvme", "ex-ssd"],
      multiple: true,
    },
    { field: "zone", kind: "choices" },
    {
      field: "memory",
      kind: "number",
      min: 0,
      units: {
        base: "MiB",
        display: [
          { symbol: "MiB", factor: 1 },
          { symbol: "GiB", factor: 1024 },
        ],
      },
    },
    { field: "seen", kind: "date" },
    { field: "name", kind: "text" },
    { field: "owner", kind: "presence" },
  ],
});

const STATUSES = ["deployed", "ready", "commissioning", "broken"] as const;
const TAGS = [["ex-gpu"], ["ex-nvme", "ex-ssd"], []] as const;

/** Twelve hosts, each taking the next status, pool, tag set and zone. */
export const quickHosts: readonly QuickHost[] = Array.from(
  { length: 12 },
  (_, index): QuickHost => {
    const host = {
      id: `h${index + 1}`,
      name: `ex-host-${index + 1}`,
      status: STATUSES.at(index % STATUSES.length) as string,
      pool: POOLS.at(index) as string,
      tags: TAGS.at(index % TAGS.length) as readonly string[],
      zone: index % 2 === 0 ? "east" : "west",
      memory: 4096 * (index + 1),
      seen: `2026-${String(index + 1).padStart(2, "0")}-01`,
    };
    return index % 3 === 0 ? { ...host, owner: "ex:ana" } : host;
  },
);

/** One container and one virtual machine. */
export const WORKLOAD_RECORDS: readonly Workload[] = [
  {
    id: "w-1",
    name: "web",
    type: "container",
    image: "ubuntu/24.04",
    host: { region: "eu-west" },
  },
  { id: "w-2", name: "db", type: "vm", cores: 4, host: { region: "eu-west" } },
];

/** The container `w-1` returning under its id as the virtual machine. */
export const WORKLOAD_RETYPED: Workload = {
  ...elementAt(WORKLOAD_RECORDS, 1),
  id: "w-1",
};
