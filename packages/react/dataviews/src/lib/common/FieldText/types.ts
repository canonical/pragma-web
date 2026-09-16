import type { RowChannels } from "@canonical/dataviews-core/bindings";

/**
 * Props of a field's default content.
 *
 * Exempt from the native-prop extension convention: it renders text alone,
 * with no element of its own to forward a caller's props to.
 */
export type FieldTextProps = {
  /** The channel of the one field shown. */
  readonly channel: RowChannels<object>["fields"][string];
};
