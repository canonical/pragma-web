/**
 * The graph checks both sites' Definitions browser tests and the lens's
 * own server-render tests share: the canvas's served SVG measured with no
 * browser, what a site's graph serves of its weights and bridges, and a
 * bridge label's size on screen.
 *
 * @experimental Test infrastructure for prism's own packages and apps.
 *
 * @module
 */

export { DESIGN_CANVAS, MIN_FIT } from "../../src/lib/classGraph/constants.js";
export { SERVED_GRAPH_QUERY } from "./constants.js";
export { default as countServedNeighbourhood } from "./countServedNeighbourhood.js";
export { default as fetchServedGraph } from "./fetchServedGraph.js";
export { default as measureBridgeLabels } from "./measureBridgeLabels.js";
export { default as measureCanvasSvg } from "./measureCanvasSvg.js";
export { default as sliceCanvasSvg } from "./sliceCanvasSvg.js";
export type {
  BridgeLabelMeasure,
  CanvasMeasure,
  CanvasRelation,
  ServedGraph,
  ServedProperty,
  ServedWeights,
} from "./types.js";
export { default as weighServedRelations } from "./weighServedRelations.js";
