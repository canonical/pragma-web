// The schematic map's drawing measures, in SVG user units of its viewBox.
// They size the drawing, not the page: the SVG scales to its region, so
// none of them is a CSS length.

/**
 * User units per grid unit of a stop's diagram position: the map's lattice,
 * a dot every 16 units, as the canvas draws it, on which every station,
 * line vertex and label anchor sits.
 */
export const GRID_UNIT = 16;

/** The distance between the centres of two tracks drawn side by side. */
export const TRACK_SPACING = 6;

/** A track's stroke width; less than the spacing, so side-by-side tracks keep a hairline between them. */
export const STROKE_WIDTH = 5;

/** The radius of a plain station's dot, and the rounding of every mark. */
export const DOT_RADIUS = 4;

/** The half-height of an interchange's capsule, which reads larger than a dot. */
export const INTERCHANGE_RADIUS = 6;

/** The width of a mark's outline: how far its fill sits inside its edge. */
export const MARK_INSET = 1.5;

/**
 * The least gap between a mark's edge and its station's name. Names snap
 * outward to the next lattice dot, so the gap stays small enough that the
 * next dot is the one beside the mark.
 */
export const LABEL_GAP = 2;

/**
 * A station name's font size. The canvas shows every name only from the
 * zoom of 12/14 up, so a 14-unit name never renders under 12 pixels.
 */
export const LABEL_SIZE = 14;

/**
 * A name's estimated width per character, as a fraction of its font size:
 * the drawing places names before any font has loaded, so it estimates
 * rather than measures.
 */
export const LABEL_CHARACTER_WIDTH = 0.55;

/**
 * The space around the drawing in the viewBox, beyond its outermost track,
 * mark or name.
 */
export const MARGIN = 24;

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
