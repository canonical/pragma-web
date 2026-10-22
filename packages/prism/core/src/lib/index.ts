/**
 * The provider-neutral core of a Prism documentation site.
 *
 * @module
 */

export type { EntityBinding, GraphQLExecute } from "./bindings/index.js";
export {
  assertBindings,
  assertBindingsLive,
  defineBinding,
} from "./bindings/index.js";
export type {
  Box,
  ChipLegendProps,
  ChipProps,
  Kind,
  Lifecycle,
} from "./Chip/index.js";
export { Chip, ChipLegend } from "./Chip/index.js";
export type { ClientOnlyProps } from "./ClientOnly/index.js";
export { ClientOnly } from "./ClientOnly/index.js";
export type { ErrorBoundaryProps } from "./ErrorBoundary/index.js";
export { ErrorBoundary } from "./ErrorBoundary/index.js";
export type {
  HomeNode,
  HomeResolver,
  Homes,
  HomesProviderProps,
} from "./homes/index.js";
export { HomesProvider, useHome } from "./homes/index.js";
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
export type { ThemeSelectorProps } from "./ThemeSelector/index.js";
export { ThemeSelector } from "./ThemeSelector/index.js";
export type {
  CanvasProps,
  CanvasSkipLinkProps,
  LensBreadcrumbsProps,
  LensContextProps,
  ModeStripProps,
  RailBrand,
  RailProps,
  RouterLinkProps,
} from "./ui/index.js";
export {
  Canvas,
  CanvasSkipLink,
  LensBreadcrumbs,
  ModeStrip,
  makeLensContext,
  Rail,
  RouterLink,
} from "./ui/index.js";
export type {
  QuadArc,
  RelaxOptions,
  WellBox,
  WellPoint,
} from "./WellGeometry/index.js";
export {
  buildQuadArc,
  buildSelfLoop,
  findEdgeEndpoint,
  relaxBoxes,
  settle,
} from "./WellGeometry/index.js";
