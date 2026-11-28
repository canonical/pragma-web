import type { SvelteHTMLElements } from "svelte/elements";

/**
 * Props for the Card component. The Card has no DS-owned props of its own — it
 * is a plain `<div>` container — so it simply accepts every native `<div>`
 * attribute.
 *
 * @implements ds:global.component.card
 */
export type CardProps = SvelteHTMLElements["div"];
