import { Content, Event } from "./common/index.js";
import { default as TimelineRoot } from "./Timeline.svelte";

const Timeline = TimelineRoot as typeof TimelineRoot & {
  /**
   * `Timeline.Content` holds the Timeline's events, in order.
   *
   * @example
   * ```svelte
   * <Timeline.Content>
   *   <Timeline.Event>Event</Timeline.Event>
   * </Timeline.Content>
   * ```
   */
  Content: typeof Content;
  /**
   * `Timeline.Event` is one event, with an optional actor and datetime.
   *
   * @example
   * ```svelte
   * <Timeline.Event actor="Jane" datetime="Today">Approved</Timeline.Event>
   * ```
   */
  Event: typeof Event;
};

Timeline.Content = Content;
Timeline.Event = Event;

export type {
  ContentProps as TimelineContentProps,
  EventProps as TimelineEventProps,
} from "./common/index.js";
export type * from "./types.js";
export { Timeline };
