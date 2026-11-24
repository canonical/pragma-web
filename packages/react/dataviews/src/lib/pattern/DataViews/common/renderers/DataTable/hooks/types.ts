/**
 * Hook domain types for the DataTable domain. Each hook declares its props
 * and result types here.
 */

import type {
  DataViewsMessages,
  DataViewsProvider,
  Presentation,
  ResultWindow,
  RowRecord,
  SchemaFieldDefinition,
  Slice,
  SortDirection,
} from "@canonical/dataviews-core";
import type {
  ColumnLayout,
  GridInteraction,
} from "@canonical/dataviews-core/bindings";
import type { ReactNode, RefObject } from "react";
import type { AnnouncerTopic } from "../../../../../../common/index.js";
import type {
  AnyDataTableColumn,
  ColumnChange,
  ColumnSetting,
  DataTableColumn,
  SettingsDestinations,
  SortPrecedence,
} from "../common/index.js";

/**
 * What the column management hook reads: the provider, where the table keeps
 * its arrangement, the declared columns, the header row, and the words and
 * announcer.
 */
export type UseColumnManagementProps<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object = RowRecord,
> = readonly [
  provider: DataViewsProvider<TFields, TRow>,
  arrangement: UseTableArrangementResult,
  columns: readonly AnyDataTableColumn[],
  headerRow: RefObject<HTMLTableRowElement | null>,
  messages: DataViewsMessages,
  announce: (message: ReactNode, topic?: AnnouncerTopic) => void,
];

/** The table's column management, as its menus read it. */
export type UseColumnManagementResult = {
  /** Every declared column in the arrangement's order, with the changes it takes. */
  readonly settings: readonly ColumnSetting[];
  /** Whether a reset would change the viewer's own layer. */
  readonly resettable: boolean;
  /**
   * Why no column can change yet — the view a link opened is still being
   * listed — or null.
   */
  readonly reason: string | null;
  /**
   * The changes one declared column takes once `reason` is null, one object
   * per column while those changes hold; throws for a column the table does
   * not declare.
   */
  readonly readOffers: (columnId: string) => ColumnSetting["offers"];
  /** Apply one change to one column; one identity for every column. */
  readonly changeColumn: (columnId: string, change: ColumnChange) => void;
  /** Return to the arrangement beneath the viewer's own changes. */
  readonly resetColumns: () => void;
  /**
   * Where every change and the reset lead without scripting, spelled over
   * one reading of the query, or null without a location.
   */
  readonly listDestinations: () => SettingsDestinations | null;
};

/**
 * What one table's geometry is resolved from: its column layout, its grid
 * interaction, and the shown columns' ids.
 */
export type UseTableGeometryProps = readonly [
  layout: ColumnLayout,
  interaction: GridInteraction,
  columnIds: readonly string[],
];

/** One table's resolved geometry. */
export type UseTableGeometryResult = {
  /**
   * Attaches the container whose inline size the solver resolves against,
   * returning the detach when there is an observer to disconnect. A React 19
   * ref callback that returns a cleanup is never called with `null`, so the
   * node is always a real one.
   */
  readonly attach: (node: HTMLTableElement) => (() => void) | undefined;
  /**
   * Attaches a cell one of the stylesheet's own tracks sizes — the
   * selection column's, the settings cell's — whose width the columns
   * leave; the cleanup gives it back.
   */
  readonly reserve: (cell: HTMLTableCellElement) => () => void;
  /**
   * The shared track list every row of this table consumes; undefined with
   * no columns, where there is no track to publish.
   */
  readonly template: string | undefined;
  /** The resolved widths, positionally aligned with the column ids. */
  readonly widths: readonly number[];
};

/**
 * What the arrangement hook takes: the table's name, the presentation, then
 * the declared columns.
 */
export type UseColumnArrangementProps<TRow extends object = RowRecord> =
  readonly [
    table: string,
    presentation: Presentation,
    columns: readonly DataTableColumn<TRow>[],
  ];

/** The columns a table renders, in the arrangement's order, the hidden ones left out. */
export type UseColumnArrangementResult<TRow extends object = RowRecord> =
  readonly DataTableColumn<TRow>[];

/**
 * What the header row's sort hook reads: the provider, the columns shown,
 * the applied query's slice and window, and the words and announcer an
 * activation's outcome is said through.
 */
export type UseHeaderSortProps<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object = RowRecord,
> = readonly [
  provider: DataViewsProvider<TFields, TRow>,
  columns: readonly AnyDataTableColumn[],
  slice: Slice,
  window: ResultWindow,
  messages: DataViewsMessages,
  announce: (message: ReactNode, topic?: AnnouncerTopic) => void,
];

/** What the header row's sort hook gives each header. */
export type UseHeaderSortResult = {
  /** Where each field stands in the ordering in force, by field. */
  readonly precedences: ReadonlyMap<string, SortPrecedence>;
  /** The one column that carries `aria-sort`, or null when none shows the first term. */
  readonly primaryColumnId: string | null;
  /** The fields the reader's own ordering names, which a column's menu can remove. */
  readonly stated: ReadonlySet<string>;
  /** Why the last activation of a column changed nothing, worded, or null. */
  readonly readReason: (columnId: string) => string | null;
  /**
   * Where a plain activation of a column leads without scripting, as
   * `?query`, or null for a column not shown.
   */
  readonly spellDestination: (columnId: string) => string | null;
  /**
   * Activate a column's sort, as a further term when `additive`. Each action
   * takes the column's id alone and reads its field from the columns shown.
   */
  readonly sortColumn: (columnId: string, additive: boolean) => void;
  /** Sort by a column in a direction, from its menu. */
  readonly placeColumn: (columnId: string, direction: SortDirection) => void;
  /** Take a column out of the reader's ordering, from its menu. */
  readonly removeFromSort: (columnId: string) => void;
  /** Let a refusal's reason go. */
  readonly clearRefusal: () => void;
};

/**
 * What the tab stop hook reads: the provider, the header row whose table is
 * read once committed, the columns shown, whether a column's header draws a
 * sort, and whether the table has settings.
 */
export type UseTabStopProps<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object = RowRecord,
> = readonly [
  provider: DataViewsProvider<TFields, TRow>,
  headerRow: RefObject<HTMLTableRowElement | null>,
  columns: readonly AnyDataTableColumn[],
  isSortable: (column: AnyDataTableColumn) => boolean,
  arranged: boolean,
];

/** The table's tab index: 0 where Tab reaches nothing inside, else -1. */
export type UseTabStopResult = 0 | -1;

/**
 * What the arrangement hook reads: the provider, whether the table has
 * settings, and its id.
 */
export type UseTableArrangementProps = readonly [
  provider: Pick<DataViewsProvider<never, never>, "presentation">,
  hasSettings: boolean,
  options?: {
    /** The table's id. */
    readonly id?: string | undefined;
  },
];

/** Where a table keeps its arrangement. */
export type UseTableArrangementResult = {
  /** The name the table's keys are spelled under. */
  readonly table: string;
  /** The presentation they are read from and written to. */
  readonly presentation: Presentation;
  /** Whether that is the provider's, which saved views and links carry. */
  readonly shared: boolean;
};
