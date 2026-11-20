/**
 * Props of the reason a header control's last change was refused.
 *
 * Exempt from the native-prop extension convention: an internal part drawn
 * from the control's refusal, not forwarding a caller's native props.
 */
export type RefusalProps = {
  /** The id the control it explains is described by. */
  readonly id: string;
  /** Why the last change was refused, or null while nothing is. */
  readonly refusal: string | null;
};
