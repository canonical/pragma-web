import type {
  Collection,
  RowRecord,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { RecordListOwnProps } from "../ScopedRecordList/index.js";

/**
 * Props of the connected list: the shared props, and the collection the
 * enclosing root's provider was built over.
 *
 * Exempt from the native-prop extension convention: a tutorial example kept
 * to the props it teaches.
 */
export type ConnectedRecordListProps<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object = RowRecord,
> = RecordListOwnProps<TRow> & {
  /** The module-scope collection, as the witness `useDataViews` checks. */
  readonly collection: Collection<TFields, TRow>;
};
