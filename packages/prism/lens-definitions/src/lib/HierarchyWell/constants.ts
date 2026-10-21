/**
 * The class hierarchy well's constants: the layout's geometry, which is
 * content-estimated and never measured so the server and the client lay the
 * graph out identically, and the class names the decorate pass paints the
 * graph with.
 */

/** The estimated width of one label character, in pixels. */
export const NODE_CHAR_WIDTH = 7.2;
/** The inline padding a node adds around its label, in pixels. */
export const NODE_PADDING = 30;
/** The narrowest a node is drawn, in pixels. */
export const NODE_MIN_WIDTH = 60;
/** The widest a node is drawn, in pixels; a longer label ellipsises. */
export const NODE_MAX_WIDTH = 210;
/** The height of every node, in pixels. */
export const NODE_HEIGHT = 32;
/** The ring spacing per depth step on the inline axis, in pixels. */
export const RING_X = 200;
/** The ring spacing per depth step on the block axis, in pixels: shallower
 * than the inline one, since labels are wider than they are tall. */
export const RING_Y = 105;
/** How many passes the collision relaxation runs. */
export const RELAX_ITERATIONS = 80;
/** The gap the relaxation keeps between two node boxes, in pixels. */
export const COLLISION_GAP = 14;
/** The gap between two ontology clusters, in pixels. */
export const CLUSTER_GAP = 120;
/** The padding around the whole graph, in pixels. */
export const CANVAS_PADDING = 48;
/** The cumulative cluster width past which clusters wrap into a new row. */
export const TARGET_ROW_WIDTH = 1700;
/** How far a semantic arc bows off the straight line, in pixels. */
export const EDGE_BOW = 34;
/** The graph width the initial camera aims to show whole, in pixels. */
export const FIT_VIEW_WIDTH = 1150;

/** The class on the node the URL selects. */
export const NODE_SELECTED_CLASS = "is-selected";
/** The class on a node outside the ego centre's neighbourhood. */
export const NODE_FADED_CLASS = "is-faded";
/** The class on an edge not incident to the ego centre. */
export const EDGE_FADED_CLASS = "is-faded";
/** The class on a node or edge the filter excludes: the graph hides where
 * the rail dims. */
export const HIDDEN_CLASS = "is-hidden";
