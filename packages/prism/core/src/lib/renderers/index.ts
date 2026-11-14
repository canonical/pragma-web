/**
 * Renderers: the ways a view can be rendered, declared per lens as plain
 * data over the site's defaults, with the view's grammar in the address.
 *
 * @module
 */

export { default as buildRendererSearch } from "./buildRendererSearch.js";
export {
  DEFAULT_FILTER_PLACEMENT,
  FILTER_PLACEMENTS,
  FILTER_SHEET,
  PAGE_RENDERER_NAMES,
  RENDERER_KINDS,
  RENDERER_LABEL_KEYS,
  VIEW_PARAMS,
} from "./constants.js";
export { usePageRenderers, useRenderers } from "./hooks/index.js";
export { default as RenderersProvider } from "./Provider.js";
export { default as readRenderer } from "./readRenderer.js";
export { default as resolveRenderers } from "./resolveRenderers.js";
export type {
  FilterPlacement,
  LensRenderers,
  ListRendererProps,
  PageRendererProps,
  Renderer,
  RendererDeclaration,
  RendererDefaults,
  RendererFacts,
  RendererKind,
  RenderersProviderProps,
  RenderersValue,
  ResolvedRenderers,
  ViewSearch,
  ViewSearchSchema,
} from "./types.js";
export { default as viewSearch } from "./viewSearch.js";
export { default as warmPageRenderer } from "./warmPageRenderer.js";
