import type {
  DataViewsMessages,
  RowRecord,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { PlainListProps } from "../PlainList/index.js";

/**
 * Props of the tutorial's second renderer: the first one's, and the words
 * it says its status in.
 *
 * Exempt from the native-prop extension convention: a tutorial example kept
 * to the props it teaches.
 */
export type StatusListProps<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object = RowRecord,
> = PlainListProps<TFields, TRow> & {
  /** The words the list says, over English. */
  readonly messages?: Partial<DataViewsMessages>;
};
