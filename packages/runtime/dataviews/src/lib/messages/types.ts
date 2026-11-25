/**
 * The words DataViews says, as one record an application may replace: every
 * status, summary, control name, announcement and hint a part renders or
 * announces, and the shapes its worded messages are handed.
 *
 * Together because a message and the facts it is worded from are read as
 * one contract: a translation writes every member against these shapes.
 */

import type {
  PredicateCondition,
  PredicateOperand,
  PredicateOperator,
  SortDirection,
} from "../query/index.js";
import type { Count } from "../result/index.js";
import type { ViewCommand } from "../views/index.js";

/**
 * One term of an ordering, as a message words it: its name and direction.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export type SortTermWords = {
  /** The name the term is shown by: its column's heading, or its field. */
  readonly name: string;
  readonly direction: SortDirection;
};

/**
 * A count a facet reports beside the value it counts: exact, or a lower
 * bound. A count of nothing is not worded, so the unknown kind is not here.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export type FacetCountWords = Exclude<Count, { readonly kind: "unknown" }>;

/**
 * What a collection's records are called, in the singular and the plural,
 * as a message counting them words them: "machine", "machines".
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export type RecordNoun = {
  /** One record: "machine". */
  readonly singular: string;
  /** Records in general, and a count other than one: "machines". */
  readonly plural: string;
  /**
   * The noun after a count, where a language takes more forms than the
   * singular and the plural; left out, the count chooses between those two.
   */
  readonly counted?: (count: number) => string;
  /** The noun's grammatical gender, where the words around it agree with it. */
  readonly gender?: string;
};

/**
 * Every user-facing string DataViews renders or announces, in English; a
 * root's `messages` replaces any part of it. A message of two or more
 * facts takes them as one named object, as does every message added since
 * the query bar's quick filters; an older message of one fact takes it as
 * is. Keys are noun phrases, exempt from the verb rule for functions
 * (canonical/pragma-core#127).
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export type DataViewsMessages = {
  // The table's status row.
  /** A first page is on its way. */
  readonly statusPending: string;
  /** No rows could be loaded, and why. */
  readonly statusFailed: (reason: string) => string;
  /**
   * A followed link's clause was refused, and nothing ran for it, and why:
   * every reason its clauses were refused for.
   */
  readonly statusRefused: (reason: string) => string;
  /** The rows shown could not be refreshed, and why. */
  readonly statusRefreshFailed: (reason: string) => string;
  /** The rows shown answer an earlier query, and why. */
  readonly statusStale: (reason: string) => string;
  /** The source refused to show the rows to whoever asked. */
  readonly statusNoAccess: string;
  /** The query matches no row. */
  readonly statusNoResults: string;
  /** The collection holds no row at all. */
  readonly statusNoData: string;

  // The table's selection and resize controls.
  /** The select-all checkbox, whose scope is the rows displayed. */
  readonly selectAllRows: string;
  /** One row's checkbox, by the row's name. */
  readonly selectRow: (name: string) => string;
  /** A resize handle's value: the column's width in pixels. */
  readonly columnWidth: (pixels: number) => string;
  /**
   * The hint a resize handle gives once a press has started placing its
   * column's edge, by the column's name: where to press next, and how to
   * cancel.
   */
  readonly columnEndPlacement: (name: string) => string;

  // The table's sort.
  /**
   * What a sorted heading states of its column: its direction, and its
   * precedence once the ordering has more than one term.
   */
  readonly sortPrecedence: (facts: {
    readonly direction: SortDirection;
    readonly position: number;
    readonly total: number;
  }) => string;
  /**
   * Why an activation of a heading changed no ordering: every reason the
   * source gave, as `filterRefused` takes them.
   */
  readonly sortRefused: (reasons: readonly string[]) => string;
  /** The ordering the reader now states, announced once it applies. */
  readonly sortApplied: (terms: readonly SortTermWords[]) => string;
  /** The source's own ordering, which orders the rows while the reader states none. */
  readonly sortDefaulted: (terms: readonly SortTermWords[]) => string;
  /** No ordering stands, and the source documents none. */
  readonly sortAbsent: string;

  // A column's header menu.
  /** The header menu's button and menu, by the column's name. */
  readonly columnOptions: (name: string) => string;
  readonly sortAscending: string;
  readonly sortDescending: string;
  readonly removeFromSort: string;
  readonly hideColumn: string;
  readonly moveColumnLeft: string;
  readonly moveColumnRight: string;

  // The table's settings menu.
  /** The settings menu's button and menu. */
  readonly tableSettings: string;
  readonly hideNamedColumn: (name: string) => string;
  readonly showNamedColumn: (name: string) => string;
  readonly moveNamedColumnLeft: (name: string) => string;
  readonly moveNamedColumnRight: (name: string) => string;
  /** A column that cannot be hidden, in place of its toggle and when asked to hide. */
  readonly columnAlwaysShown: (name: string) => string;
  readonly resetTableSettings: string;

  // What a change to the columns announces.
  readonly columnHidden: (name: string) => string;
  /** A column shown again, with its place among however many columns show. */
  readonly columnShown: (facts: {
    readonly name: string;
    readonly position: number;
    readonly total: number;
  }) => string;
  /** A column moved, with its place among however many columns show. */
  readonly columnMoved: (facts: {
    readonly name: string;
    readonly position: number;
    readonly total: number;
  }) => string;
  readonly tableSettingsReset: string;

  // The sort panel.
  /** The panel's name. */
  readonly sortPanel: string;
  /** One term of the reader's ordering, by the name its field is shown by. */
  readonly sortTerm: (facts: {
    readonly name: string;
    readonly direction: SortDirection;
  }) => string;
  readonly moveSortTermUp: string;
  readonly moveSortTermDown: string;
  readonly removeSortTerm: string;

  // The filters.
  /** The filters' name. */
  readonly filters: string;
  /** The disclosure holding the fields not shown by default. */
  readonly moreFilters: string;
  /** The submit control of the filters' form, before scripts run. */
  readonly submitFilters: string;
  /** A number or date field's lower bound, by the field's label. */
  readonly filterFrom: (label: string) => string;
  /** A number or date field's upper bound, by the field's label. */
  readonly filterTo: (label: string) => string;
  /** A number bound's name with the base unit its value is read in. */
  readonly filterInUnit: (facts: {
    readonly name: string;
    readonly symbol: string;
  }) => string;
  /** The least value a matching record holds, beside the lower bound. */
  readonly filterLowest: (value: string) => string;
  /** The greatest value a matching record holds, beside the upper bound. */
  readonly filterHighest: (value: string) => string;
  /** The control clearing one restriction, by the restriction's name. */
  readonly clearFilter: (name: string) => string;
  /**
   * A further restriction under one of a field's controls, shown read-only
   * after it: the control's phrase and the values the restriction holds.
   * What `clearFilter` names it by.
   */
  readonly filterAlso: (facts: {
    readonly phrase: string;
    readonly values: readonly string[];
  }) => string;
  /** The list of a followed link's clauses that were refused, as a place. */
  readonly linkRefusals: string;
  /** One refused clause of a followed link, by its name, and why. */
  readonly clauseRefused: (facts: {
    readonly name: string;
    readonly reason: string;
  }) => string;
  /** A refused grouping's name, where the link names no field to group by. */
  readonly grouping: string;
  /** The control moving a none-of set to any-of. */
  readonly matchAnyInstead: string;
  /** The control moving an any-of set to none-of. */
  readonly matchNoneInstead: string;
  /** How many matching records hold a value, beside it. */
  readonly facetCount: (count: FacetCountWords) => string;
  /** The control choosing how a text field's input matches, by its label. */
  readonly filterMatch: (label: string) => string;
  /** A presence field's choice restricting nothing. */
  readonly presenceAny: string;
  /** A presence field's choice of records that hold a value. */
  readonly presenceSet: string;
  /** A presence field's choice of records that hold none. */
  readonly presenceUnset: string;
  /**
   * An emptied input, which removes nothing; `retained` is whether any
   * restriction stands on the field at all.
   */
  readonly filterIncomplete: (retained: boolean) => string;
  /**
   * An edit that did not apply, every reason it was refused for — the
   * schema's one reason, or every reason the source gave — and whether the
   * restriction this edit would have replaced is still in force.
   */
  readonly filterRefused: (facts: {
    readonly reasons: readonly string[];
    readonly retained: boolean;
  }) => string;

  // The search.
  /** The search input's label. */
  readonly search: string;
  /** The search form's submit control, before scripts run. */
  readonly submitSearch: string;

  // An operator, wherever a clause shows it.
  /**
   * An operator as a chip shows it, by its operands: a symbol such as `:`
   * or `≥`, or words where it has no symbol. Symbols are not translated.
   */
  readonly operatorShown: (facts: {
    readonly operator: PredicateOperator;
    readonly operands: readonly PredicateOperand[];
  }) => string;
  /**
   * An operator in words, by its operands, after the field's label when
   * one is given: "status is any of", or "is any of" alone. "is" for one
   * value and "is any of" for several or none, "at least" for `≥`. The one
   * place an operator is worded, for Filters' controls and the query bar.
   */
  readonly operatorPhrase: (facts: {
    readonly operator: PredicateOperator;
    readonly operands: readonly PredicateOperand[];
    readonly label?: string;
  }) => string;

  // The query bar.
  /** The query bar's name, by what its collection's records are called. */
  readonly queryBar: (noun: RecordNoun) => string;
  /** The keys the query bar handles, as its toolbar's description. */
  readonly queryBarDescription: string;
  /** Shown in the query bar while nothing is typed and no clause applies. */
  readonly queryBarPlaceholder: string;
  /** The list of the clauses that apply. */
  readonly appliedFilters: string;
  /** The query bar's control clearing every clause and the search. */
  readonly clearFiltersAndSearch: string;
  /** Every clause and the search cleared, with the result count after it. */
  readonly queryCleared: (facts: {
    readonly count: Count;
    readonly noun: RecordNoun;
  }) => string;
  /**
   * One clause as it is spoken: its field's label and operator as one
   * phrase, from `operatorPhrase`, and the values it holds, none for
   * presence.
   */
  readonly queryClause: (facts: {
    readonly phrase: string;
    readonly values: readonly string[];
  }) => string;
  /** The Entry of one bound of a range chip, by the field's label. */
  readonly clauseBound: (facts: {
    readonly label: string;
    readonly bound: "lower" | "upper";
  }) => string;
  /**
   * A field's lower and upper bound read as one clause: each bound as
   * `queryClause` speaks it, the upper without the field's label.
   */
  readonly rangeClause: (facts: {
    readonly lower: string;
    readonly upper: string;
  }) => string;
  /** The search as a clause, by its text. */
  readonly searchClause: (text: string) => string;
  /** A clause's remove control, by the clause as spoken. */
  readonly removeClause: (clause: string) => string;
  /** How many clauses the unfocused field hides. */
  readonly hiddenChips: (count: number) => string;
  /** The suggestions while they load. */
  readonly loadingSuggestions: string;
  /** The suggestions when none matches what is typed. */
  readonly noSuggestions: string;
  /** The field part of a clause being built, while it is typed. */
  readonly clauseField: string;
  /** The operator part of a clause, by its field's label. */
  readonly clauseOperator: (label: string) => string;
  /** The value part of a clause, by its field's label. */
  readonly clauseValue: (label: string) => string;
  /** How many matching records hold a value, beside it as a hint. */
  readonly recordCount: (facts: {
    readonly count: FacetCountWords;
    readonly noun: RecordNoun;
  }) => string;
  /** A clause added, with the result count after it. */
  readonly clauseAdded: (facts: {
    readonly clause: string;
    readonly count: Count;
    readonly noun: RecordNoun;
  }) => string;
  /** A clause changed, with the result count after it. */
  readonly clauseChanged: (facts: {
    readonly clause: string;
    readonly count: Count;
    readonly noun: RecordNoun;
  }) => string;
  /**
   * The query bar's disclosure of the filters form before scripts run, by
   * how many filter chips the bar shows, a range counting once.
   */
  readonly filtersDisclosure: (facts: { readonly applied: number }) => string;
  /**
   * A warning that a field's clauses cannot all hold, so the query matches
   * nothing, by the field's label.
   */
  readonly queryContradiction: (facts: { readonly label: string }) => string;
  /** The action merging a field's clauses into what was likely meant. */
  readonly mergeClauses: (facts: { readonly label: string }) => string;
  /** A field's clauses merged, with the result count after it. */
  readonly clausesMerged: (facts: {
    readonly label: string;
    readonly count: Count;
    readonly noun: RecordNoun;
  }) => string;
  /** A clause removed, with the result count after it. */
  readonly clauseRemoved: (facts: {
    readonly clause: string;
    readonly count: Count;
    readonly noun: RecordNoun;
  }) => string;
  /** A typed `>` read as the bound it stops short of. */
  readonly readAsAtLeast: string;
  /** A typed `<` read as the bound it stops short of. */
  readonly readAsAtMost: string;
  /** A value picked among several, by the clause as it now reads. */
  readonly valuePicked: (clause: string) => string;
  /** The hint while a clause takes several values. */
  readonly multipleValuesHint: string;
  /** A date value's format, in words. */
  readonly dateFormat: string;
  /** A number value's format, by the units it may be typed in. */
  readonly numberFormat: (units: readonly string[]) => string;
  /** A typed value that cannot be read, and why. */
  readonly clauseInvalid: (reason: string) => string;
  /**
   * The decimal separator a reader types and reads numbers with in the
   * query bar's entries, beside `.`, which always reads: `,` in French.
   * Never a grouping separator.
   */
  readonly decimalSeparator: string;

  // The query bar's narrow form: its summary button and its sheet.
  /**
   * How many filter chips apply, a range counting once, which the summary
   * button's name gives after its visible label, `filters`: "2 applied".
   */
  readonly filtersApplied: (facts: { readonly applied: number }) => string;
  /** The narrow form's search-only entry, by what the records are called. */
  readonly searchEntry: (facts: { readonly noun: RecordNoun }) => string;
  /** Shown in the narrow form's search-only entry while nothing is typed. */
  readonly searchEntryPlaceholder: string;
  /** The sheet's title, by what the collection's records are called. */
  readonly filterSheet: (facts: { readonly noun: RecordNoun }) => string;
  /** The sheet's close button. */
  readonly closeFilters: string;
  /** The sheet's command that starts a filter, step by step. */
  readonly addFilter: string;
  /** The step of "Add filter" that lists the fields. */
  readonly chooseField: string;
  /** The step of "Add filter" that lists a field's operators, by its label. */
  readonly chooseOperator: (facts: { readonly label: string }) => string;
  /** The step of "Add filter" that lists a field's values, by its label. */
  readonly chooseValue: (facts: { readonly label: string }) => string;
  /** The command that adds the filter "Add filter" has built. */
  readonly addClause: string;
  /** The command that returns to the previous step of "Add filter". */
  readonly goBack: string;
  /** The sheet's command that clears every filter, the search kept. */
  readonly clearAllFilters: string;
  /** Every filter cleared, the search kept, with the result count after it. */
  readonly filtersCleared: (facts: {
    readonly count: Count;
    readonly noun: RecordNoun;
  }) => string;
  /**
   * A change made in the sheet's filters form, with the result count after
   * it.
   */
  readonly resultsUpdated: (facts: {
    readonly count: Count;
    readonly noun: RecordNoun;
  }) => string;
  /**
   * The sheet's button that closes it, by the live result count, as
   * exactly as the source counts it; no number while none is known.
   */
  readonly showResults: (facts: { readonly count: Count }) => string;
  /** A step of "Add filter" taken: what was chosen, then the next step's name. */
  readonly filterStepChosen: (facts: {
    readonly chosen: string;
    readonly step: string;
  }) => string;

  // The quick filters.
  /**
   * A quick filter's applied values, after its name: how many it holds,
   * and the condition they share, where they share one, as "none of 2"
   * says Exclusion.
   */
  readonly appliedCount: (facts: {
    readonly count: number;
    readonly condition?: PredicateCondition | undefined;
  }) => string;
  /** The quick filter's word that applies no restriction. */
  readonly allOptions: string;
  /** The search narrowing a quick filter's options, by the field's label. */
  readonly searchOptions: (facts: { readonly label: string }) => string;
  /** A quick filter with no option to show. */
  readonly optionsNone: string;
  /** A quick filter's options while they load. */
  readonly optionsPending: string;
  /** A quick filter's value its query excludes, as its word is named. */
  readonly optionExcluded: (facts: { readonly value: string }) => string;
  /** How many of a quick filter's options its search leaves. */
  readonly optionsShown: (facts: { readonly count: number }) => string;
  /** The submit of a quick filter's form before scripts run. */
  readonly submitQuickFilter: string;

  // The pagination bar.
  /** The bar's name. */
  readonly pagination: string;
  /** The page size select's label. */
  readonly rowsPerPage: string;
  readonly submitPageSize: string;
  /**
   * Which rows are on screen: the place of the first, how many show, and
   * how many the window pages over, as exactly as the source counts them.
   */
  readonly rowsShown: (facts: {
    readonly first: number;
    readonly shown: number;
    readonly total: Count;
  }) => string;
  /** The page select's name. */
  readonly page: string;
  /** How many pages there are, beside the page select. */
  readonly pageCount: (pages: number) => string;
  readonly submitPage: string;
  readonly goToFirstPage: string;
  readonly goToPreviousPage: string;
  readonly goToNextPage: string;
  readonly goToLastPage: string;

  // The saved views.
  /** The saved views' name. */
  readonly savedViews: string;
  /** What the saved views say without scripting. */
  readonly viewsUnscripted: string;
  /** The view select's label. */
  readonly view: string;
  /** The select's placeholder while no view is open. */
  readonly viewNone: string;
  /** The query has moved from the open view. */
  readonly viewModified: string;
  readonly saveView: string;
  /** Save, once a save found the view changed elsewhere. */
  readonly overwriteView: string;
  readonly revertView: string;
  /** Revert, once a save found the view changed elsewhere. */
  readonly discardViewChanges: string;
  readonly saveViewAs: string;
  readonly renameView: string;
  readonly deleteView: string;
  /** Ask the store for the views, or the arrangement, again. */
  readonly retryViews: string;
  /** The form naming a new view. */
  readonly saveAsForm: string;
  readonly submitSaveAs: string;
  /** The form renaming the open view, by its name. */
  readonly renameForm: (name: string) => string;
  readonly submitRename: string;
  /** The name input's label. */
  readonly viewName: string;
  readonly cancel: string;
  /** The question deleting a view asks first, by its name. */
  readonly deleteForm: (name: string) => string;
  readonly submitDelete: string;
  readonly viewsPending: string;
  /** The store could not list the views, and why. */
  readonly viewsUnavailable: (reason: string) => string;
  /** How many stored views cannot be read. */
  readonly viewsUnreadable: (count: number) => string;
  /** The arrangement is not being saved, and why. */
  readonly arrangementUnsaved: (reason: string) => string;
  /** A name the collection refused, and why. */
  readonly viewNameRefused: (reason: string) => string;
  /** A command in flight. */
  readonly viewPending: (command: ViewCommand) => string;
  readonly viewOpened: (name: string) => string;
  readonly viewSaved: (name: string) => string;
  readonly viewRenamed: (name: string) => string;
  readonly viewDeleted: string;
  /** A view asking for what the collection cannot show, and every reason. */
  readonly viewRefused: (facts: {
    readonly name: string;
    readonly reasons: readonly string[];
  }) => string;
  /**
   * A command that met a view changed elsewhere, by the stored view's name;
   * a wording for `save-as` need not use the name, since the view under that
   * identity is not the one the reader was saving.
   */
  readonly viewConflicted: (facts: {
    readonly command: ViewCommand;
    readonly name: string;
  }) => string;
  readonly viewMissing: (command: ViewCommand) => string;
  readonly viewUnreadable: (facts: {
    readonly command: ViewCommand;
    readonly reason: string;
  }) => string;
  readonly viewFailed: (facts: {
    readonly command: ViewCommand;
    readonly reason: string;
  }) => string;

  // The action bar.
  /** The action bar's name. */
  readonly selectionActions: string;
  /** How many rows are selected, across pages. */
  readonly rowsSelected: (count: number) => string;
  /** The button clearing the selection, by how many rows it clears. */
  readonly deselectRows: (count: number) => string;

  // The facet charts.
  /** The source answered a result, but counted nothing for the field drawn. */
  readonly facetCountsAbsent: string;
  /** The source answered a result, but measured no range for the field drawn. */
  readonly facetRangeAbsent: string;
  /** The field is counted or measured, and no matching record holds a value. */
  readonly facetValuesNone: string;
  /** What a bar chart is named as, by the caption it is drawn under. */
  readonly barChartSummary: (label: string) => string;
  /** What a range chart is named as: its caption, and the ends it spans. */
  readonly rangeChartSummary: (facts: {
    readonly label: string;
    readonly min: number;
    readonly max: number;
  }) => string;
  /** The caption of the table carrying a drawing's own numbers. */
  readonly chartTable: (label: string) => string;
  /** The heading of a bar table's value column. */
  readonly chartValue: string;
  /** The heading of a bar table's count column. */
  readonly chartCount: string;
  /** Stands where a value's count is, where the source counted nothing. */
  readonly countUnknown: string;
  /** The heading of a range table's lower end. */
  readonly chartLowest: string;
  /** The heading of a range table's upper end. */
  readonly chartHighest: string;

  // The renderer switch.
  /**
   * The switch's name, which also labels the choice it offers. The renderers
   * themselves are named by the application, as fields and options are.
   */
  readonly renderer: string;

  // The chart with its table.
  /** The name of the chart a switch offers beside its table. */
  readonly chartRenderer: string;
  /** The name of the table a switch offers beside its chart. */
  readonly tableRenderer: string;
};
