import type { RowChannels } from "@canonical/dataviews-core/bindings";

/** Props of a field's default content. */
export type FieldTextProps = {
  /** The channel of the one field shown. */
  readonly channel: RowChannels<object>["fields"][string];
};
