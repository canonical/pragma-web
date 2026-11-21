import type { Count, Selection } from "@canonical/dataviews-core";
import type { ReactNode } from "react";
import type { UseDateTimeFormatsResult } from "../../hooks/index.js";
import type {
  TimelineDateTimePosition,
  TimelineExpansion,
  TimelineItem,
  TimelineRenderContext,
  TimelineSortOrder,
} from "../../types.js";
import type { SizedEvent } from "../../utils/index.js";

/** One event, with the name its selection checkbox is called by. */
export type NamedEvent = TimelineItem & { readonly name: string };

/**
 * Props of the timeline's list of events.
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
  /** Draws each event in full, or null to draw the event part. */
  readonly renderItem:
    | ((item: TimelineItem, context: TimelineRenderContext) => ReactNode)
    | null;
  readonly order: TimelineSortOrder | null;
  readonly isFiltered: boolean;
  /**
   * How many events the collection holds, as exactly as the source counts
   * them: the page's own count where nothing lies past it, so an unknown
   * count says more exist.
   */
  readonly total: Count;
  /**
   * Asks the collection for the next step of events past the page, or null
   * where the page holds the last of them.
   */
  readonly requestMore: (() => void) | null;
  /** Where asking for more leads before scripts take over, or null where there is no location. */
  readonly moreHref: string | null;
};
