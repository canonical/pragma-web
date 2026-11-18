/**
 * The graph layout engines beside `GraphCanvas`: the contract every kind
 * implements (`layout(nodes, edges, options)` to positions and routes) and
 * the layered engine on it, pure functions of their input, with the
 * geometry the lens draws by.
 *
 * `layoutLayered` is the layered kind on the contract (`GraphLayout`, its
 * nodes, edges, options and result); `placeEdgeLabels` places the relation labels of a laid-out graph; the
 * lengths, the font metrics and the geometry are shared by both, so a
 * caller's drawing lands on the same lattice the layout placed by. The
 * same input always gives the same output, byte for byte, so a server
 * render and the hydrated client agree. Only the contract and the names
 * the Definitions lens draws by are exported: the lattice and label
 * constants, the path and rectangle geometry its bridges, arrowheads and
 * phone arcs are drawn and measured with, and the invariant helpers; the
 * rest of the engine, the region layout's own entry and model included,
 * stays internal to this package.
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
export { default as layoutLayered } from "./layoutLayered.js";
export { default as placeEdgeLabels } from "./placeEdgeLabels.js";
export { requireAt, requireDefined, requireEntry } from "./require.js";
export type {
  FontFace,
  GraphLayout,
  GraphLayoutEdge,
  GraphLayoutNode,
  GraphLayoutOptions,
  GraphLayoutResult,
  LabelledBundle,
  LabelPlacement,
  LayeredBundle,
  LayeredEdges,
  LayeredNodes,
  PathCommand,
  Point,
  Rect,
} from "./types.js";
