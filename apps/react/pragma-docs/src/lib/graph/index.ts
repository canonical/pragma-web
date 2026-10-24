/**
 * What the site's SVG drawings share: the dot lattice every box sits on,
 * the cut that fits a label to its box without measuring text, and the
 * envelope every rail glyph is drawn in.
 *
 * NOT barrelled from `#lib/ui`: nothing here is a component. Import from
 * `#lib/graph`.
 *
 * @module
 */

export { default as buildGlyphProps } from "./buildGlyphProps.js";
export { LATTICE_PITCH } from "./constants.js";
export { default as snapToLattice } from "./snapToLattice.js";
export { default as truncateLabel } from "./truncateLabel.js";
