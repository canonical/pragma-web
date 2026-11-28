import type { Snippet } from "svelte";
import type { SvelteHTMLElements } from "svelte/elements";

type BaseProps = SvelteHTMLElements["div"];

/**
 * Props for the Tile component
 *
 * @implements ds:global.component.tile
 */
export interface TileProps extends BaseProps {
  /**
   * Tile.Header and Tile.Content elements, Header first. The Tile renders
   * them as given.
   */
  children: Snippet;
}
