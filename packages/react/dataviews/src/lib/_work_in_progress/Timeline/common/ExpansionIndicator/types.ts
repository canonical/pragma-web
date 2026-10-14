/**
 * Props of the strip standing for a collapsed page's hidden events.
 *
 * Exempt from the native-prop extension convention: an internal part drawn
 * from the page's expansion, not forwarding a caller's native props.
 */
export type ExpansionIndicatorProps = {
  readonly hiddenCount: number;
  /** How many events "show more" reveals; none offers no such command. */
  readonly step: number;
  readonly onShowMore: () => void;
  readonly onShowAll: () => void;
};
