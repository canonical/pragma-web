import type { DataViewsMessages, Selection } from "@canonical/dataviews-core";
import type { RowChannels } from "@canonical/dataviews-core/bindings";

/**
 * Props of one record's list item.
 *
 * Exempt from the native-prop extension convention: a tutorial example kept
 * to the props it teaches.
 */
export type RecordItemProps<TRow extends object> = {
  /** The row's channels, from the list's row scopes. */
  readonly channels: RowChannels<TRow>;
  /** The collection's selection, which the checkbox toggles. */
  readonly selection: Selection;
  /** The text the record is listed as, and its checkbox named by. */
  readonly nameRecord: (record: TRow) => string;
  /** Draw the record's checkbox. */
  readonly selectable: boolean;
  /** The words the checkbox is named in. */
  readonly messages: DataViewsMessages;
};
