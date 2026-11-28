import type { ModifierFamily } from "@canonical/ds-types";
import type { Snippet } from "svelte";
import type { SvelteHTMLElements } from "svelte/elements";

type BaseProps = SvelteHTMLElements["div"];

/**
 * Props for the Timeline.Event subcomponent
 *
 * @implements ds:global.subcomponent.timeline-event
 */
export interface EventProps extends BaseProps {
  /** Actor/user who performed the action. */
  actor?: Snippet | string;
  /** Date/time of the event. */
  datetime?: Snippet | string;
  /** Event content/description. */
  children: Snippet;
  /** Visual criticality modifier for the event. */
  criticality?: ModifierFamily<"criticality">;
}
