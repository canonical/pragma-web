/**
 * The provider-neutral core of a Prism documentation site.
 *
 * @module
 */

export type {
  CreateEnvironmentOptions,
  PreparedRelayData,
  PrepareRelayDataOptions,
} from "./relay/index.js";
export {
  createEnvironment,
  getPrefetchEnvironment,
  prefetchQuery,
  prepareRelayData,
  setPrefetchEnvironment,
} from "./relay/index.js";
export type { FacetBearer, RouteFacet, RouteMeta } from "./routeFacet/index.js";
export { collectFacet, defineFacet } from "./routeFacet/index.js";
export type { CollectedLens, LensEntry, LensTier } from "./routeLens/index.js";
export { collectLenses, routeLensFacet } from "./routeLens/index.js";
export { createStaticRouter } from "./router/index.js";
export type { ShortcutAllocation } from "./routeShortcut/index.js";
export { collectShortcuts, routeShortcutFacet } from "./routeShortcut/index.js";
