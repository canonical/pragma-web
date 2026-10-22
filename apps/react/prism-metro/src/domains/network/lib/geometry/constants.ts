// The schematic map's drawing measures, in SVG user units of its viewBox.
// They size the drawing, not the page: the SVG scales to its region, so
// none of them is a CSS length.

/** User units per grid unit of a stop's diagram position. */
export const GRID_UNIT = 24;

/** The distance between the centres of two tracks drawn side by side. */
export const TRACK_SPACING = 6;

/** A track's stroke width; less than the spacing, so side-by-side tracks keep a hairline between them. */
export const STROKE_WIDTH = 5;

/** The radius of a plain station's dot, and the rounding of every mark. */
export const DOT_RADIUS = 4;

/** The half-height of an interchange's capsule, which reads larger than a dot. */
export const INTERCHANGE_RADIUS = 6;

/** The gap between a mark's edge and its station's name. */
export const LABEL_GAP = 6;

/** The space around the network in the viewBox, room for the outer names. */
export const MARGIN = 96;

/**
 * The directions a station's name may sit in, in the order they are tried:
 * east and west first, so most names read beside their mark, then north and
 * south, then the diagonals.
 */
export const LABEL_DIRECTIONS = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: -1 },
  { x: 0, y: 1 },
  { x: 1, y: -1 },
  { x: 1, y: 1 },
  { x: -1, y: -1 },
  { x: -1, y: 1 },
] as const;

/**
 * How close, as a cosine, a label direction may come to a track leaving the
 * station before it counts as blocked: anything within 22.5° of a track.
 */
export const LABEL_BLOCKED_COSINE = Math.cos(Math.PI / 8);
