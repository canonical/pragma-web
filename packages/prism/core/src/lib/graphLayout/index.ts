/**
 * The graph layout engines beside `GraphCanvas`: the contract every kind
 * implements (`layout(nodes, edges, options)` to positions and routes,
 * `draw(result)` to SVG) and the layered engine, pure functions of their
 * input, with the geometry they share.
 *
 * @module
 */

export {
  ARC_BASE,
  ARC_NEST,
  BUS_OFFSET,
  LABEL_SIZE,
  LATTICE,
  REGION_LABEL_GAP,
  REGION_LABEL_SIZE,
} from "./constants.js";
export {
  buildArrowhead,
  ceilTo,
  compareText,
  containsPoint,
  findCentredBaseline,
  findPointOnPath,
  flattenPath,
  formatPathData,
  insetRect,
  intersectsRect,
  measurePathBounds,
  measureRegionLabelWidth,
  measureTextBox,
  measureTextWidth,
  orderBy,
  parsePathData,
  roundTo,
  samplePath,
  uniteRects,
} from "./geometry.js";
export { default as layOutRegion } from "./layOutRegion.js";
export { default as layoutLayered } from "./layoutLayered.js";
export { requireAt, requireDefined, requireEntry } from "./require.js";
export type {
  CrossPort,
  FontFace,
  GraphDraw,
  GraphLayout,
  LayeredBundle,
  LayeredEdges,
  LayeredModel,
  LayeredNode,
  LayeredNodes,
  LayeredOptions,
  LayeredRelation,
  PathCommand,
  Point,
  Rect,
  RegionEdge,
  RegionLayout,
  RegionNode,
} from "./types.js";
