/**
 * Homes: where each kind of graph node lives, so a mention of a node can
 * link to the page that owns it.
 *
 * @module
 */

export { default as useHome } from "./hooks/useHome.js";
export { default as HomesProvider } from "./Provider.js";
export type {
  HomeNode,
  HomeResolver,
  Homes,
  HomesProviderProps,
} from "./types.js";
