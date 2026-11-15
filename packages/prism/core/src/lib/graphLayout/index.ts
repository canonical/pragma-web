/**
 * The graph layout engines beside `GraphCanvas`: the contract every kind
 * implements (`layout(nodes, edges, options)` to positions and routes) and
 * the layered engine on it, pure functions of their input, with the
 * geometry the lens draws by.
 *
 * `layoutLayered` is the layered kind on the contract, over `layOutRegion`;
 * `placeEdgeLabels` places the relation labels of a laid-out graph; the
 * lengths, the font metrics and the geometry are shared by both, so a
 * caller's drawing lands on the same lattice the layout placed by. The
 * same input always gives the same output, byte for byte, so a server
 * render and the hydrated client agree. Only the names a caller needs are
 * exported; the rest of the engine stays internal to this package.
 *
 * @note Every export is pure. `requireAt`, `requireEntry` and
 *   `requireDefined` throw only when a caller breaks an invariant, never on
 *   a well-formed graph.
 *
 * @module
 */

export {
  ARC_BASE,
  ARC_NEST,
  BUS_OFFSET,
  COLLISION_MARGIN,
  DIRECTION_ARROWS,
  LABEL_HALO,
  LABEL_LINE_PITCH,
  LABEL_SIZE,
  LATTICE,
  REGION_LABEL_GAP,
  REGION_LABEL_ROW,
  REGION_LABEL_SIZE,
} from "./constants.js";
export {
  buildArrowhead,
  ceilTo,
  compareText,
  containsPoint,
  findCentredBaseline,
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
export { default as placeEdgeLabels } from "./placeEdgeLabels.js";
export { requireAt, requireDefined, requireEntry } from "./require.js";
export type {
  CrossPort,
  FontFace,
  GraphLayout,
  GraphLayoutEdge,
  GraphLayoutNode,
  GraphLayoutOptions,
  GraphLayoutResult,
  LabelledBundle,
  LabelledLayout,
  LabelPlacement,
  LayeredBundle,
  LayeredEdges,
  LayeredModel,
  LayeredNodes,
  PathCommand,
  Point,
  Rect,
  RegionLayout,
} from "./types.js";
