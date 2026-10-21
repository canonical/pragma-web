/**
 * Shared pure geometry for the graph wells a lens renders: node boxes
 * settled apart, edges trimmed to their nodes, and labelled arcs.
 * Everything here is DETERMINISTIC — same input, byte-equal output —
 * because well positions are computed identically on the server and the
 * client. No randomness, no measurement, no environment reads.
 *
 * @module
 */

export { buildQuadArc } from "./buildQuadArc.js";
export { buildSelfLoop } from "./buildSelfLoop.js";
export { findEdgeEndpoint } from "./findEdgeEndpoint.js";
export { relaxBoxes } from "./relaxBoxes.js";
export { settle } from "./settle.js";
export type { QuadArc, RelaxOptions, WellBox } from "./types.js";
