import type { ReactNode } from "react";
import type { UseDateTimeFormatsResult } from "../../hooks/index.js";
import type {
  TimelineDateTimePosition,
  TimelineItem,
  TimelineMarkerSize,
} from "../../types.js";

/**
 * Props of one event.
 *
 * Exempt from the native-prop extension convention: an internal part drawn
 * from the event it shows, not forwarding a caller's native props.
 */
export type EventProps = {
  readonly item: TimelineItem;
  readonly markerSize: TimelineMarkerSize;
  readonly dateTimePosition: TimelineDateTimePosition;
  /** The form every event's date is shown in, shared across the timeline. */
  readonly formats: UseDateTimeFormatsResult;
  /** Drawn first in the event's content: the record's selection checkbox. */
  readonly control?: ReactNode;
};
