/**
 * The fleet domain's library: the pure measures of a train's side view and
 * its fit at the platforms, and the fleet's components.
 *
 * @module
 */

export { default as buildTrainGeometry } from "./buildTrainGeometry.js";
export * from "./FormationSideView/index.js";
export { default as findScaleLength } from "./findScaleLength.js";
export { default as formatLength } from "./formatLength.js";
export { default as measurePlatformFit } from "./measurePlatformFit.js";
export { default as orientCars } from "./orientCars.js";
