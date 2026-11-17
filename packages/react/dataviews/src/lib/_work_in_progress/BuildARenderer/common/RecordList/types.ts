import type {
  DataViewsProvider,
  RowRecord,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { RecordListOwnProps } from "../ScopedRecordList/index.js";

/**
 * Props of the standalone list: the shared props, and its provider.
 *
 * Exempt from the native-prop extension convention: a tutorial example kept
 * to the props it teaches.
 */
export type RecordListProps<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object = RowRecord,
> = RecordListOwnProps<TRow> & {
  /** The provider owning the collection's query, rows and selection. */
  readonly provider: DataViewsProvider<TFields, TRow>;
};
