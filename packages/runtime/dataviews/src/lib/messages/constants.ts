/**
 * The messages domain's constants: the English record DataViews ships with,
 * and the words its messages are built from — each direction, each
 * operator as a chip shows and speaks it, what a
 * saved-view command not done or in flight says, and the note an edit that
 * cannot apply ends with.
 */

import type { MessageRecord } from "@canonical/i18n-core";
import type {
  PredicateOperand,
  PredicateOperator,
  SortDirection,
} from "../query/index.js";
import type { Count } from "../result/index.js";
import type { ViewCommand } from "../views/index.js";
import choosePlural from "./choosePlural.js";
import composeClause from "./composeClause.js";
import composeSentence from "./composeSentence.js";
import composeStatus from "./composeStatus.js";
import spellOrdinal from "./spellOrdinal.js";
import type {
  DataViewsMessages,
  FacetCountWords,
  RecordNoun,
} from "./types.js";

/** The word each direction reads as in English. */
export const DIRECTIONS: Readonly<Record<SortDirection, string>> = {
  asc: "ascending",
  desc: "descending",
};

/** How an English message starts when a saved-view command did not happen. */
export const NOT_DONE: Readonly<Record<ViewCommand, string>> = {
  open: "Not opened",
  save: "Not saved",
  "save-as": "Not saved",
  rename: "Not renamed",
  remove: "Not deleted",
};

/** What an English message says of a saved-view command in flight. */
export const PENDING: Readonly<Record<ViewCommand, string>> = {
  open: "Opening the view…",
  save: "Saving…",
  "save-as": "Saving…",
  rename: "Renaming…",
  remove: "Deleting…",
};

/** What the earlier restriction does while an edit cannot apply. */
export const STILL_APPLIES = "The previous restriction still applies.";

/** Each operator's words, as they read from its operands. */
type OperatorWords = Readonly<
  Record<PredicateOperator, (operands: readonly PredicateOperand[]) => string>
>;

/** Whether a presence operand asks for no value. */
const isUnset = (operands: readonly PredicateOperand[]): boolean =>
  operands.at(0) === false;

/**
 * How each operator is worded, from its operands: the one table of
 * English operator words. Keyed by operator, so an operator the grammar
 * gains fails to compile until it is worded.
 */
export const OPERATORS_SPOKEN: OperatorWords = {
  isAny: (operands) => (operands.length === 1 ? "is" : "is any of"),
  is: () => "is",
  isNone: () => "is none of",
  isNot: () => "is not",
  contains: () => "contains",
  notContains: () => "does not contain",
  startsWith: () => "starts with",
  endsWith: () => "ends with",
  gte: () => "at least",
  lte: () => "at most",
  isSet: (operands) => (isUnset(operands) ? "has no value" : "has a value"),
};

/**
 * What a chip shows for each operator: its symbol, or, where it has none,
 * the words it is spoken by, so a control's name holds what it shows.
 */
export const OPERATORS_SHOWN: OperatorWords = {
  isAny: () => ":",
  is: () => ":",
  isNone: () => "≠",
  isNot: () => "≠",
  contains: OPERATORS_SPOKEN.contains,
  notContains: OPERATORS_SPOKEN.notContains,
  startsWith: OPERATORS_SPOKEN.startsWith,
  endsWith: OPERATORS_SPOKEN.endsWith,
  gte: () => "≥",
  lte: () => "≤",
  isSet: OPERATORS_SPOKEN.isSet,
};

/** English's own grouping of numbers, so a large count reads as one. */
const NUMBERS = new Intl.NumberFormat("en");

/** A count as English writes it: grouped, never bare digits past a thousand. */
const formatCount = (value: number): string => NUMBERS.format(value);

/**
 * A count of records as English words it: "12 machines", "at least 1,000
 * machines", or "At least" where it starts a sentence.
 */
const formatRecords = (
  count: FacetCountWords,
  noun: RecordNoun,
  bound = "at least",
): string => {
  const records = `${formatCount(count.value)} ${noun.counted?.(count.value) ?? choosePlural(count.value, noun.singular, noun.plural)}`;
  return count.kind === "exact" ? records : `${bound} ${records}`;
};

/** An outcome's sentence, then the result count where one is known. */
const composeOutcome = (
  sentence: string,
  count: Count,
  noun: RecordNoun,
): string =>
  count.kind === "unknown"
    ? sentence
    : `${sentence} ${formatRecords(count, noun, "At least")}.`;

/** One term as the ordering messages word it: "Name, descending". */
const formatSortTerm = (name: string, direction: SortDirection): string =>
  `${name}, ${DIRECTIONS[direction]}`;

/**
 * The words DataViews ships with: English, a `MessageRecord`.
 */
export const DEFAULT_MESSAGES: DataViewsMessages = Object.freeze({
  statusPending: "Loading…",
  statusFailed: (reason) =>
    composeStatus("These rows could not be loaded", reason),
  statusRefused: (reason) =>
    composeStatus("This link could not be followed", reason),
  statusRefreshFailed: (reason) =>
    composeStatus("These rows could not be refreshed", reason),
  statusStale: (reason) =>
    composeStatus("These rows do not match the current query", reason),
  statusNoAccess: "You do not have permission to see these rows.",
  statusNoResults: "No rows match this query.",
  statusNoData: "There is nothing here yet.",

  selectAllRows: "Select all displayed rows",
  selectRow: (name) => `Select ${name}`,
  columnWidth: (pixels) =>
    `${formatCount(pixels)} ${choosePlural(pixels, "pixel", "pixels")}`,
  columnEndPlacement: (name) =>
    `Click or tap in the header row where the ${name} column should end. Press the edge again or Escape to cancel.`,

  cellNotApplicable: "Not applicable",

  sortPrecedence: ({ direction, position, total }) =>
    total === 1
      ? DIRECTIONS[direction]
      : `${DIRECTIONS[direction]}, ${spellOrdinal(position)} of ${formatCount(total)}`,
  sortRefused: (reasons) => {
    // A reason that says nothing is dropped: better a plain statement than a
    // sentence built around a bare stop.
    const clauses = reasons
      .map(composeClause)
      .filter((clause) => clause !== "");
    return clauses.length === 0
      ? "Sort unchanged."
      : `Sort unchanged: ${clauses.join("; ")}.`;
  },
  sortApplied: (terms) => `Sorted by ${terms.join("; then ")}.`,
  sortDefaulted: (terms) =>
    `Sorted by the source's own order: ${terms.join("; ")}.`,
  sortAbsent: "Not sorted: the source documents no order.",

  columnOptions: (name) => `Column options for ${name}`,
  sortAscending: "Sort ascending",
  sortDescending: "Sort descending",
  removeFromSort: "Remove from sort",
  hideColumn: "Hide column",
  moveColumnLeft: "Move column left",
  moveColumnRight: "Move column right",

  tableSettings: "Table settings",
  hideNamedColumn: (name) => `Hide ${name}`,
  showNamedColumn: (name) => `Show ${name}`,
  moveNamedColumnLeft: (name) => `Move ${name} left`,
  moveNamedColumnRight: (name) => `Move ${name} right`,
  columnAlwaysShown: (name) => `${name} is always shown`,
  resetTableSettings: "Reset table settings",
  columnsPending: "Columns can change once the linked view has loaded.",

  columnHidden: (name) => `${name} hidden`,
  columnShown: ({ name, position, total }) =>
    `${name} shown, position ${formatCount(position)} of ${formatCount(total)}`,
  columnMoved: ({ name, position, total }) =>
    `${name} moved to position ${formatCount(position)} of ${formatCount(total)}`,
  tableSettingsReset: "Table settings reset",

  sortPanel: "Sort",
  sortTerm: ({ name, direction }) => formatSortTerm(name, direction),
  moveSortTermUp: "Move up",
  moveSortTermDown: "Move down",
  removeSortTerm: "Remove",

  filters: "Filters",
  moreFilters: "More filters",
  submitFilters: "Apply filters",
  filterFrom: (label) => `${label} from`,
  filterTo: (label) => `${label} to`,
  filterInUnit: ({ name, symbol }) => `${name} (${symbol})`,
  filterLowest: (value) => `Lowest: ${value}`,
  filterHighest: (value) => `Highest: ${value}`,
  clearFilter: (name) => `Clear ${name}`,
  filterAlso: ({ phrase, values }) => `${phrase} ${values.join(", ")}`,
  linkRefusals: "Not applied from the link",
  clauseRefused: ({ name, reason }) => `${name}: ${composeClause(reason)}.`,
  grouping: "Grouping",
  matchAnyInstead: "Match any of these instead",
  matchNoneInstead: "Match none of these instead",
  facetCount: (count) =>
    count.kind === "exact"
      ? formatCount(count.value)
      : `at least ${formatCount(count.value)}`,
  filterMatch: (label) => `How ${label} matches`,
  presenceAny: "Any",
  presenceSet: "Has a value",
  presenceUnset: "Has no value",
  filterIncomplete: (retained) =>
    retained
      ? `Enter a value to change this restriction. ${STILL_APPLIES}`
      : "Enter a value to apply this restriction.",
  filterRefused: ({ reasons, retained }) => {
    const sentences = reasons
      .filter((reason) => composeClause(reason) !== "")
      .map(composeSentence)
      .join(" ");
    if (sentences === "") {
      return retained ? STILL_APPLIES : "";
    }
    return retained ? `${sentences} ${STILL_APPLIES}` : sentences;
  },

  search: "Search",
  submitSearch: "Search",

  operatorShown: ({ operator, operands }) =>
    OPERATORS_SHOWN[operator](operands),
  operatorPhrase: ({ operator, operands, label }) => {
    const words = OPERATORS_SPOKEN[operator](operands);
    return label === undefined ? words : `${label} ${words}`;
  },

  queryBar: (noun) => `Filter ${noun.plural}`,
  queryBarDescription:
    "Left and Right to move between filters, Enter to edit, Backspace or Delete to remove",
  queryBarPlaceholder: "Search or filter",
  appliedFilters: "Applied filters",
  clearFiltersAndSearch: "Clear filters and search",
  queryCleared: ({ count, noun }) =>
    composeOutcome("Cleared the filters and the search.", count, noun),
  queryClause: ({ phrase, values }) =>
    values.length === 0 ? phrase : `${phrase} ${values.join(", ")}`,
  clauseBound: ({ label, bound }) =>
    `${bound === "lower" ? "Lower" : "Upper"} bound for ${label}`,
  rangeClause: ({ lower, upper }) => `${lower} and ${upper}`,
  searchClause: (text) => `Search for ${text}`,
  removeClause: (clause) => `Remove ${clause}`,
  hiddenChips: (count) => `+${formatCount(count)} more`,
  loadingSuggestions: "Loading suggestions",
  noSuggestions: "No matches",
  clauseField: "Field",
  clauseOperator: (label) => `Operator for ${label}`,
  clauseValue: (label) => `Value for ${label}`,
  recordCount: ({ count, noun }) => formatRecords(count, noun),
  clauseAdded: ({ clause, count, noun }) =>
    composeOutcome(`Added ${clause}.`, count, noun),
  clauseChanged: ({ clause, count, noun }) =>
    composeOutcome(`Changed to ${clause}.`, count, noun),
  filtersDisclosure: ({ applied }) =>
    applied === 0 ? "Filters" : `Filters (${formatCount(applied)})`,
  queryContradiction: ({ label }) =>
    `The ${label} filters cannot all hold, so nothing matches.`,
  mergeClauses: ({ label }) => `Merge the ${label} filters`,
  clausesMerged: ({ label, count, noun }) =>
    composeOutcome(`Merged the ${label} filters.`, count, noun),
  clauseRemoved: ({ clause, count, noun }) =>
    composeOutcome(`Removed ${clause}.`, count, noun),
  readAsAtLeast: "Read as at least",
  readAsAtMost: "Read as at most",
  valuePicked: (clause) => `${clause}. Enter again to apply it.`,
  multipleValuesHint: "Enter adds a value; Enter again applies them",
  dateFormat: "Date, format YYYY-MM-DD",
  numberFormat: (units) =>
    units.length === 0 ? "Number" : `Number, in ${units.join(" or ")}`,
  clauseInvalid: (reason) => `Invalid: ${composeClause(reason)}`,
  decimalSeparator: ".",

  filtersApplied: ({ applied }) => `${formatCount(applied)} applied`,
  searchEntry: ({ noun }) => `Search ${noun.plural}`,
  searchEntryPlaceholder: "Search",
  filterSheet: ({ noun }) => `Filter ${noun.plural}`,
  closeFilters: "Close filters",
  addFilter: "Add filter",
  chooseField: "Choose a field",
  chooseOperator: ({ label }) => `Choose an operator for ${label}`,
  chooseValue: ({ label }) => `Choose a value for ${label}`,
  addClause: "Add",
  goBack: "Back",
  clearAllFilters: "Clear all",
  filtersCleared: ({ count, noun }) =>
    composeOutcome("Cleared the filters.", count, noun),
  resultsUpdated: ({ count, noun }) =>
    composeOutcome("Updated the results.", count, noun),
  showResults: ({ count }) => {
    if (count.kind === "unknown") return "Show results";
    const shown = formatCount(count.value);
    if (count.kind === "at-least") return `Show ${shown}+ results`;
    return `Show ${shown} ${choosePlural(count.value, "result", "results")}`;
  },
  filterStepChosen: ({ chosen, step }) => `${chosen} chosen. ${step}.`,

  appliedCount: ({ count, condition }) =>
    condition === "exclusion"
      ? `none of ${formatCount(count)}`
      : `${formatCount(count)} applied`,
  allOptions: "All",
  searchOptions: ({ label }) => `Search ${label} options`,
  optionsNone: "No options",
  optionsPending: "Loading options",
  optionExcluded: ({ value }) => `${value}, excluded`,
  optionsShown: ({ count }) =>
    `${formatCount(count)} ${choosePlural(count, "option", "options")}`,
  submitQuickFilter: "Apply",

  pagination: "Pagination",
  rowsPerPage: "Rows per page",
  submitPageSize: "Apply page size",
  rowsShown: ({ first, shown, total }) => {
    const range =
      shown === 0
        ? "0"
        : `${formatCount(first)}–${formatCount(first + shown - 1)}`;
    if (total.kind === "unknown") {
      return shown === 1
        ? `Showing row ${formatCount(first)}`
        : `Showing ${range} rows`;
    }
    const counted = `${total.kind === "at-least" ? "at least " : ""}${formatCount(total.value)}`;
    return shown === 1
      ? `Showing row ${formatCount(first)} out of ${counted}`
      : `Showing ${range} out of ${counted} ${choosePlural(total.value, "row", "rows")}`;
  },
  page: "Page",
  pageCount: (pages) =>
    `of ${formatCount(pages)} ${choosePlural(pages, "page", "pages")}`,
  submitPage: "Go to page",
  goToFirstPage: "First page",
  goToPreviousPage: "Previous page",
  goToNextPage: "Next page",
  goToLastPage: "Last page",

  savedViews: "Saved views",
  viewsUnscripted:
    "Saved views need JavaScript. A link to a query still works.",
  view: "View",
  viewNone: "No saved view",
  viewModified: "Modified",
  saveView: "Save",
  overwriteView: "Overwrite",
  revertView: "Revert",
  discardViewChanges: "Discard changes",
  saveViewAs: "Save as…",
  renameView: "Rename…",
  deleteView: "Delete…",
  refreshViews: "Try again",
  saveAsForm: "Save as a new view",
  submitSaveAs: "Save view",
  renameForm: (name) => `Rename "${name}"`,
  submitRename: "Rename",
  viewName: "Name",
  cancel: "Cancel",
  deleteForm: (name) => `Delete "${name}"? This cannot be undone.`,
  submitDelete: "Delete view",
  viewsPending: "Loading saved views…",
  viewsUnavailable: (reason) =>
    `Saved views are unavailable: ${composeClause(reason)}.`,
  viewsUnreadable: (count) =>
    `${formatCount(count)} saved ${choosePlural(count, "view", "views")} cannot be read.`,
  presentationUnsaved: (reason) =>
    `The arrangement is not being saved: ${composeClause(reason)}.`,
  viewNameRefused: composeSentence,
  viewPending: (command) => PENDING[command],
  viewOpened: (name) => `Opened "${name}".`,
  viewSaved: (name) => `Saved "${name}".`,
  viewRenamed: (name) => `Renamed to "${name}".`,
  viewDeleted: "View deleted.",
  viewRefused: ({ name, reasons }) =>
    `Not opened: "${name}" asks for what this collection cannot show — ${reasons
      .map(composeClause)
      .join("; ")}. The query is unchanged.`,
  viewConflicted: ({ command, name }) => {
    switch (command) {
      case "save":
        return `Not saved: "${name}" was changed elsewhere. Overwrite it, save your changes as a new view, or discard them.`;
      case "save-as":
        return "Not saved: a different view is stored under the same identity. Try again.";
      default:
        return `${NOT_DONE[command]}: "${name}" was changed elsewhere. Its latest version is open; try again.`;
    }
  },
  viewMissing: (command) => `${NOT_DONE[command]}: the view no longer exists.`,
  viewUnreadable: ({ command, reason }) =>
    `${NOT_DONE[command]}: the stored view cannot be read (${composeClause(reason)}).`,
  viewFailed: ({ command, reason }) =>
    `${NOT_DONE[command]}: ${composeClause(reason)}.`,

  actionBar: "Selection actions",
  rowsSelected: (count) => `${formatCount(count)} selected`,
  clearSelection: (count) =>
    `Deselect ${formatCount(count)} ${choosePlural(count, "row", "rows")}`,

  chartPending: "Loading…",
  chartFailed: ({ reason }) =>
    composeStatus("This chart could not be loaded", reason),
  chartRefreshFailed: ({ reason }) =>
    composeStatus("This chart could not be refreshed", reason),
  facetCountsAbsent: "The source answered no counts for this field.",
  facetRangeAbsent: "The source answered no range for this field.",
  facetValuesNone: "No matching record holds a value.",
  barChartSummary: (label) =>
    `${label}: a bar chart of how many records hold each value`,
  rangeChartSummary: ({ label, min, max }) =>
    `${label}: a range chart from ${min} to ${max}`,
  chartTable: (label) => `${label}, as a table`,
  chartValue: "Value",
  chartCount: "Count",
  countUnknown: "Not counted",
  chartLowest: "Lowest",
  chartHighest: "Highest",

  renderer: "Show as",

  chartRenderer: "Chart",
  tableRenderer: "Table",
} satisfies DataViewsMessages) satisfies MessageRecord;
