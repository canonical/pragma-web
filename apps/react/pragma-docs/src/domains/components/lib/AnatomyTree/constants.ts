/** A node's width, in SVG user units: room for a block's local name. */
export const NODE_WIDTH = 192;

/** A node's height, in SVG user units: two 24-unit lines. */
export const NODE_HEIGHT = 48;

/**
 * The space between two columns of depth, in SVG user units: a column's
 * pitch is the node's width and this gap, 240, fifteen lattice steps.
 */
export const COLUMN_GAP = 48;

/** The pitch between two leaves' rows, in SVG user units: four lattice steps. */
export const ROW_PITCH = 64;

/** The space around the tree, in SVG user units: one lattice step. */
export const MARGIN = 16;

/** The radius of one of the lattice's dots, in SVG user units. */
export const LATTICE_DOT_RADIUS = 1;

/**
 * The id of the lattice's dot pattern. It is a constant, not a `useId`
 * value: the server renders the whole document while the client hydrates
 * only `#root`, so a tree-position id would differ between the two. A
 * component page draws one anatomy tree, so one id serves every page.
 */
export const LATTICE_PATTERN_ID = "anatomy-tree-lattice";

/** The width of an edge's line, in SVG user units. */
export const EDGE_WIDTH = 1;

/** How many characters of a title a node holds, the ellipsis included. */
export const LABEL_CHARACTERS = 20;
