/** The explicit node metrics: the layout measures nothing. */
export const NODE_WIDTH = 176;
export const NODE_HEIGHT = 44;

/** Gaps: between columns (x), between rows (y). */
export const COLUMN_GAP = 72;
export const ROW_GAP = 20;

/** The margin the graph's viewBox keeps around its nodes. */
export const VIEW_MARGIN = 24;

/**
 * How many characters of a label fit a node's width at the node's type
 * size: the server measures no text, so a longer label is cut there and
 * its full text rides in the node's title.
 */
export const LABEL_CHARACTERS = 24;

/** How far a surface node's type tag sits below the node's foot. */
export const TAG_OFFSET = 12;

/** The class names the layout emits on edges: the CSS contract. */
export const ROLE_PRIMARY_CLASS = "is-primary";
export const ROLE_SECONDARY_CLASS = "is-secondary";
export const ARRIVAL_CLASS_PREFIX = "arrival-";
