/** A hop's width, in SVG user units: the layout measures nothing. */
export const NODE_WIDTH = 176;

/** A hop's height, in SVG user units: two of the node's 24-unit lines. */
export const NODE_HEIGHT = 48;

/**
 * The distance between two columns' left edges, in user units: a hop's
 * width and a 64-unit gap, so every column starts on the lattice.
 */
export const COLUMN_PITCH = 240;

/**
 * The distance between two rows, in user units: a hop's height and a
 * 16-unit gap, four lattice steps.
 */
export const ROW_PITCH = 64;

/** The margin the graph's viewBox keeps around its hops, one lattice step. */
export const VIEW_MARGIN = 16;

/**
 * How many characters of a label fit a hop's width at the node's type
 * size: the server measures no text, so a longer label is cut and its full
 * text rides in the hop's title.
 */
export const LABEL_CHARACTERS = 20;

/** How far the selected hop's ring stands off its box, in user units. */
export const RING_OFFSET = 4;

/** The ring's corner radius: the node's own, grown by the offset. */
export const RING_RADIUS = 8;

/** An edge's stroke width, in user units. */
export const EDGE_WIDTH = 1;

/** A primary pairing's edge, drawn heavier than the rest. */
export const PRIMARY_EDGE_WIDTH = 2;

/** The dash a secondary pairing's edge is drawn with. */
export const SECONDARY_EDGE_DASH = "4 4";

/** The class the layout gives an edge whose pairing's role is Primary. */
export const ROLE_PRIMARY_CLASS = "is-primary";

/** The class the layout gives an edge whose pairing's role is Secondary. */
export const ROLE_SECONDARY_CLASS = "is-secondary";

/** The prefix of the class the layout gives an edge for its pairing's arrival. */
export const ARRIVAL_CLASS_PREFIX = "arrival-";
