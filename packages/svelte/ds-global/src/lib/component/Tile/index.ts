import { Content, Header } from "./common/index.js";
import { default as TileRoot } from "./Tile.svelte";

const Tile = TileRoot as typeof TileRoot & {
  /**
   * `Tile.Header` is the optional header row at the top of a Tile.
   *
   * @example
   * ```svelte
   * <Tile.Header><h5>Tile header</h5></Tile.Header>
   * ```
   */
  Header: typeof Header;
  /**
   * `Tile.Content` is the Tile's main content area.
   *
   * @example
   * ```svelte
   * <Tile.Content><p class="p">Tile content</p></Tile.Content>
   * ```
   */
  Content: typeof Content;
};

Tile.Header = Header;
Tile.Content = Content;

export type {
  ContentProps as TileContentProps,
  HeaderProps as TileHeaderProps,
} from "./common/index.js";
export type * from "./types.js";
export { Tile };
