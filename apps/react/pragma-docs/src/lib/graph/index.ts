/**
 * What the site's SVG drawings share: the dot lattice every box sits on,
 * and the cut that fits a label to its box without measuring text.
 *
 * NOT barrelled from `#lib/ui`: nothing here is a component. Import from
 * `#lib/graph`.
 *
 * @module
 */

export { LATTICE_PITCH } from "./constants.js";
export { default as snapToLattice } from "./snapToLattice.js";
export { default as truncateLabel } from "./truncateLabel.js";
