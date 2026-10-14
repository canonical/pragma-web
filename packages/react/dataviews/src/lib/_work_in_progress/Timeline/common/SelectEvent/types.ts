import type { Selection } from "@canonical/dataviews-core";

/**
 * Props of one event's selection checkbox.
 *
 * Exempt from the native-prop extension convention: an internal part drawn
 * from the record's membership of the selection, not forwarding a caller's
 * native props.
 */
export type SelectEventProps = {
  readonly selection: Selection;
  /** The record's identity. */
  readonly rowId: string;
  /** The record's name, which the checkbox is named by. */
  readonly name: string;
};
