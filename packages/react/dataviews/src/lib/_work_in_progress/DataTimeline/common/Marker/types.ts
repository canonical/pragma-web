import type { TimelineMarker, TimelineMarkerSize } from "../../types.js";

/**
 * Props of one event's marker.
 *
 * Exempt from the native-prop extension convention: an internal part drawn
 * from the event it marks, not forwarding a caller's native props.
 */
export type MarkerProps = {
  readonly size: TimelineMarkerSize;
  readonly marker?: TimelineMarker | undefined;
  /** Where the marker links to; a small marker, or one without a `label`, links nowhere. */
  readonly href?: string | undefined;
  /** The link's accessible name. */
  readonly label?: string | undefined;
  /** Another link to `href` stands beside the marker, so this one is taken out of the reading and tab order. */
  readonly redundant?: boolean | undefined;
};
