import type { Snippet } from "svelte";
import type { SvelteHTMLElements } from "svelte/elements";

type BaseProps = SvelteHTMLElements["div"];

/**
 * Props for Tile.Content
 *
 * @implements ds:global.subcomponent.tile-content
 */
export interface ContentProps extends BaseProps {
  /** Content to display in the tile body */
  children: Snippet;
}
