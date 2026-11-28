import type { Snippet } from "svelte";
import type { SvelteHTMLElements } from "svelte/elements";

type BaseProps = SvelteHTMLElements["div"];

/**
 * Props for Tile.Header
 *
 * @implements ds:global.subcomponent.tile-header
 */
export interface HeaderProps extends BaseProps {
  /** Header content */
  children: Snippet;
}
