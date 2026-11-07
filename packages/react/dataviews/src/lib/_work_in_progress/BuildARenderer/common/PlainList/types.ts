import type {
  DataViewsProvider,
  RowRecord,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";

/**
 * Props of the tutorial's first renderer: a provider, a name for the list,
 * and how to name one record.
 *
 * Exempt from the native-prop extension convention: a tutorial example kept
 * to the props it teaches.
 */
export type PlainListProps<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object = RowRecord,
> = {
  /** The provider owning the collection's query, rows and selection. */
  readonly provider: DataViewsProvider<TFields, TRow>;
  /** The list's accessible name. */
  readonly label: string;
  /** The text one record is listed as. */
  readonly nameRecord: (record: TRow) => string;
};
