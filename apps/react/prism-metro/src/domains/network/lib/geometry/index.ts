/**
 * The schematic map's geometry: pure functions from the network's lines,
 * routes and diagram positions to the tracks, marks and labels the map
 * draws, and the drawing measures the map renders them with.
 *
 * @module
 */

export { default as buildNetworkGeometry } from "./buildNetworkGeometry.js";
export { default as buildOctilinearPath } from "./buildOctilinearPath.js";
export {
  GRID_UNIT,
  LABEL_SIZE,
  LATTICE_DOT_RADIUS,
  MARK_INSET,
  STROKE_WIDTH,
} from "./constants.js";
export type {
  DiagramLine,
  DiagramRoute,
  DiagramStop,
  GridPoint,
  NetworkGeometry,
  StationMark,
  Track,
} from "./types.js";
