import type { SvelteHTMLElements } from "svelte/elements";

/**
 * Props for Card.Image. No DS-owned props — it renders a plain `<img>` root, so
 * it accepts every native `<img>` attribute.
 *
 * @implements ds:global.subcomponent.card-image
 */
export type ImageProps = SvelteHTMLElements["img"];
