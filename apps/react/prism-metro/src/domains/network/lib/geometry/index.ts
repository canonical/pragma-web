/**
 * The schematic map's geometry: pure functions from the network's lines,
 * routes and diagram positions to the tracks, marks and labels the map
 * draws, and the spacing of a line strip's stops.
 *
 * @module
 */

export { default as buildNetworkGeometry } from "./buildNetworkGeometry.js";
export { default as buildOctilinearPath } from "./buildOctilinearPath.js";
export { default as spaceStripStops } from "./spaceStripStops.js";
export type {
  DiagramLine,
  DiagramRoute,
  DiagramStop,
  GridPoint,
  NetworkGeometry,
  StationMark,
  StripSpacing,
  Track,
} from "./types.js";
