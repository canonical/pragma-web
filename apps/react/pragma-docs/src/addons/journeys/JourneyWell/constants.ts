/** A node's width, in user units: the layout measures nothing. */
export const NODE_WIDTH = 176;

/** A node's height, in user units. */
export const NODE_HEIGHT = 44;

/** The gap between two columns of nodes, in user units. */
export const COLUMN_GAP = 72;

/** The gap between two rows of nodes, in user units. */
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

/** The class the layout gives an edge whose pairing's role is Primary. */
export const ROLE_PRIMARY_CLASS = "is-primary";

/** The class the layout gives an edge whose pairing's role is Secondary. */
export const ROLE_SECONDARY_CLASS = "is-secondary";

/** The prefix of the class the layout gives an edge for its pairing's arrival. */
export const ARRIVAL_CLASS_PREFIX = "arrival-";
