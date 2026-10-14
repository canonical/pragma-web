import type { Selection } from "@canonical/dataviews-core";
import type { UseDateTimeFormatsResult } from "../../hooks/index.js";
import type {
  TimelineDateTimePosition,
  TimelineExpansion,
  TimelineItem,
} from "../../types.js";
import type { SizedEvent } from "../../utils/index.js";

/** One event, with the name its selection checkbox is called by. */
export type NamedEvent = TimelineItem & { readonly name: string };

/**
 * Props of the page's list of events.
 *
 * Exempt from the native-prop extension convention: an internal part laying
 * out the page's events, not forwarding a caller's native props.
 */
export type EventListProps = {
  /** The page's events in display order, each with its marker's size. */
  readonly events: readonly SizedEvent<NamedEvent>[];
  readonly dateTimePosition: TimelineDateTimePosition;
  readonly formats: UseDateTimeFormatsResult;
  /** How the page collapses; `false` shows every event. */
  readonly expansion: TimelineExpansion | false;
  /** The selection each event's checkbox is backed by, or null where events are not selectable. */
  readonly selection: Selection | null;
};
