/**
 * Props of one event's date.
 *
 * Exempt from the native-prop extension convention: an internal part drawn
 * from the event's date, whose root is a `time` or, where toggling is
 * allowed, a `button`, neither forwarding a caller's native props.
 */
export type DateTimeProps = {
  /** The date as ISO 8601, for the `time` element's `datetime`. */
  readonly value: string;
  /** The date in the form every event shows. */
  readonly display: string;
  /** The date in the other form, shown as the tooltip. */
  readonly alternate: string;
  readonly tooltip: boolean;
  /** Draw the date as a button switching every event's form. */
  readonly toggleable: boolean;
  /** Whether the switch stands at the relative form. */
  readonly pressed: boolean;
  readonly onToggle: () => void;
};
