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
export type {
  Box,
  CanvasProps,
  CanvasSkipLinkProps,
  ChipLegendProps,
  ClientOnlyProps,
  DocumentLayoutProps,
  ErrorBoundaryProps,
  GraphBox,
  GraphCanvasProps,
  GraphFrameRequest,
  GraphTransform,
  GraphZoomBucket,
  Kind,
  LensBreadcrumbsProps,
  LensContextProps,
  Lifecycle,
  MentionChipProps,
  ModeStripProps,
  RailBrand,
  RailProps,
  RouterLinkProps,
  ThemeSelectorProps,
  WorkspaceLayoutProps,
} from "./ui/index.js";
export {
  CANVAS_PAGE_TILE_CLASS_NAME,
  Canvas,
  CanvasSkipLink,
  ChipLegend,
  ClientOnly,
  DocumentLayout,
  ErrorBoundary,
  GraphCanvas,
  LensBreadcrumbs,
  MentionChip,
  ModeStrip,
  makeLensContext,
  Rail,
  RouterLink,
  ThemeSelector,
  useGraphZoomBucket,
  WorkspaceLayout,
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
