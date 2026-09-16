import type { RowChannels } from "@canonical/dataviews-core/bindings";

/** Props of a cell's default content. */
export type FieldTextProps = {
  /** The channel of the one field the cell shows. */
  readonly channel: RowChannels<object>["fields"][string];
};
