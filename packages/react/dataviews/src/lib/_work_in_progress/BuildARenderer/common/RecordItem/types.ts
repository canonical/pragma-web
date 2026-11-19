import type { DataViewsMessages, Selection } from "@canonical/dataviews-core";
import type { RowChannels } from "@canonical/dataviews-core/bindings";
import type { ComponentProps } from "react";

type OwnProps<TRow extends object> = {
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

/**
 * Props of one record's list item. Its root is an `li`, so it extends native
 * li props, less `children`, the record it lists.
 */
export type RecordItemProps<TRow extends object> = OwnProps<TRow> &
  Omit<ComponentProps<"li">, keyof OwnProps<TRow> | "children">;
