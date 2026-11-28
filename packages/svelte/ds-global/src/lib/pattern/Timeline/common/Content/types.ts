import type { SvelteHTMLElements } from "svelte/elements";

/**
 * Props for the Timeline.Content subcomponent. Its `children` are zero or
 * more Timeline.Event elements.
 *
 * @implements ds:global.subcomponent.timeline-content
 */
export type ContentProps = SvelteHTMLElements["div"];
