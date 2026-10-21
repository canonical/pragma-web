/**
 * The keyboard allocation: routes claim their own key, and anything that
 * displays or wires one reads it back from the route table.
 *
 * @module
 */

export { default as collectShortcuts } from "./collectShortcuts.js";
export { ROUTE_SHORTCUT_META_KEY } from "./constants.js";
export { default as routeShortcutFacet } from "./routeShortcutFacet.js";
export type { ShortcutAllocation } from "./types.js";
