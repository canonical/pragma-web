import type {
  DataViewsMessages,
  DataViewsProvider,
  RowRecord,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";

/**
 * What the list reads and commands: the members a provider and the root's
 * `useDataViews` scope both carry. A provider is one; so is the scope.
 */
export type RecordListScope<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object = RowRecord,
> = Pick<
  DataViewsProvider<TFields, TRow>,
  "state" | "rows" | "selection" | "capabilities" | "setSort"
>;

/** The field a list offers to sort by, and the name of its sort controls. */
export type RecordListSort = {
  readonly field: string;
  readonly label: string;
};

/**
 * Props the standalone list and its connected twin share.
 *
 * Exempt from the native-prop extension convention: a tutorial example kept
 * to the props it teaches.
 */
export type RecordListOwnProps<TRow extends object = RowRecord> = {
  /** The list's accessible name. */
  readonly label: string;
  /** The text one record is listed as, and its checkbox named by. */
  readonly nameRecord: (record: TRow) => string;
  /** Draw a checkbox on each record, backed by the collection's selection. */
  readonly selectable?: boolean;
  /**
   * Offer to sort by one field. Left out, or naming a field the source cannot
   * sort by, the list offers no sort.
   */
  readonly sortBy?: RecordListSort;
  /** The words the list says, over English. */
  readonly messages?: Partial<DataViewsMessages>;
};

/** Props of the list body: the shared props, and the scope it reads. */
export type ScopedRecordListProps<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object = RowRecord,
> = RecordListOwnProps<TRow> & {
  readonly scope: RecordListScope<TFields, TRow>;
};
