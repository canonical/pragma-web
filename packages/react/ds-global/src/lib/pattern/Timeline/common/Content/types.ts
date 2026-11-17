import type { ComponentProps, ReactNode } from "react";

type OwnProps = {
  /**
   * Zero or more Timeline.Event elements. Typed as `ReactNode` so conditional
   * events (`{cond && <Timeline.Event />}`) and fragments are accepted.
   */
  children?: ReactNode;
};

/**
 * Props for the Timeline.Content subcomponent
 *
 * @implements ds:global.subcomponent.timeline-content
 *
 * Anatomy (from DSL):
 * - layout.type: stack
 * - layout.direction: vertical
 * - edges:
 *   - [0] timeline-event (cardinality: 0..*, slotName: default)
 */
export type ContentProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps>;
